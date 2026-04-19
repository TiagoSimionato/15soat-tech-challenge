import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource } from 'src/modules/resources/entities/resources.entity';
import { ResourcesByService } from 'src/modules/resources/entities/resourcesByService.entity';
import { ResourceService } from 'src/modules/resources/services/resources.service';
import { Stock } from 'src/modules/stock/entities/stock.entity';
import { StockResponse } from 'src/modules/stock/models/stock.model';
import { StockService } from 'src/modules/stock/services/stock.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { RequestedService } from '../entities/requestedService.entity';
import { ServiceItem } from '../entities/serviceItem.entity';
import { ServiceOrder } from '../entities/serviceOrder.entity';
import { Services } from '../entities/services.entity';
import { RequestedServicesStatus } from '../enums/services.types';
import { ServiceItemDTO } from '../models/serviceItem.model';
import { ServiceOrderServiceDTO } from '../models/serviceOrder.model';
import { ServicesService } from './services.service';

@Injectable()
export class RequestedServiceService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(RequestedService)
    private readonly requestedServiceRepository: Repository<RequestedService>,
    @InjectRepository(ServiceItem)
    private readonly serviceItemRepository: Repository<ServiceItem>,
    private readonly resourceService: ResourceService,
    private readonly servicesService: ServicesService,
    private readonly stockService: StockService,
  ) { }

  async createRequestedServiceOrder(manager: EntityManager, serviceOrderId: number, arrServices: ServiceOrderServiceDTO[]) {
    for (const i in arrServices) {
      const cost: number = await this.calculateRequestedServiceCost(arrServices[i].id, manager);
      const dbReqServiceOrder = manager.create(RequestedService, {
        cost,
        service: {
          id: arrServices[i].id,
        },
        serviceOrder: {
          id: serviceOrderId,
        },
        status: RequestedServicesStatus.RECEBIDA,
      });

      const requestedServiceId: number = (await manager.save(dbReqServiceOrder)).id;
      await this.createServiceItems(manager, requestedServiceId, arrServices[i].id);
      await this.updateServiceOrderBudget(serviceOrderId, manager);
    }
  }

  private async calculateRequestedServiceCost(serviceId: number, manager?: EntityManager): Promise<number> {
    const resources: ResourcesByService[] = await this.resourceService.listResourcesOfAService(serviceId, manager);
    const service: null | Services = await this.servicesService.listOneService(serviceId, manager);
    const serviceCost: number = service ? service.cost : 0;
    let totalCost: number = Number(serviceCost);

    for (const i in resources) {
      const resource: null | Resource = await this.resourceService.listOneResource(resources[i].resource.id, manager);
      totalCost += resource ? Number(resource.cost) * Number(resources[i].min_quantity) : 0;
    }
    return totalCost;
  }

  private async createServiceItems(manager: EntityManager, requestedServiceId: number, serviceId: number) {
    const resourcesByService: ResourcesByService[] = await this.resourceService.listResourcesOfAService(serviceId, manager);

    for (const i in resourcesByService) {
      const stock: null | StockResponse = await this.stockService.listStockByResourceId(resourcesByService[i].resource.id, manager);

      if (!stock) {
        throw new BadRequestException(
          `Estoque não encontrado para o recurso ${resourcesByService[i].resource.id}`,
        );
      }

      const dbServiceItem = manager.create(ServiceItem, {
        amount: resourcesByService[i].min_quantity,
        requestedService: {
          id: requestedServiceId,
        },
        stock: {
          id: stock.stock_id,
        },
      });

      await manager.save(dbServiceItem);
    }
  }

  async getServiceItemsByRequestedServiceId(requestedServiceId: number, manager?: EntityManager): Promise<ServiceItem[]> {
    const repo = manager ? manager.getRepository(ServiceItem) : this.serviceItemRepository;
    return await repo.find({
      relations: ['stock', 'requestedService'],
      where: {
        requestedService: {
          id: requestedServiceId,
        },
      },
    });
  }

  async getRequestedServiceDetail(id: number, manager?: EntityManager): Promise<null | RequestedService> {
    const repo = manager ? manager.getRepository(RequestedService) : this.requestedServiceRepository;
    return await repo.findOne({ relations: ['service', 'serviceOrder', 'serviceItem', 'employee'], where: { id } });
  }

  async getRequestedServices(status?: RequestedServicesStatus): Promise<RequestedService[]> {
    return await this.requestedServiceRepository.find({ relations: ['service', 'serviceOrder', 'serviceItem', 'employee'], where: { status } });
  }

  async getEmployeeRequestedServices(employeeId?: number): Promise<RequestedService[]> {
    return await this.requestedServiceRepository.find({ relations: ['service', 'serviceOrder', 'serviceItem'], where: { employee: { id: employeeId } } });
  }

  private async updateRequestedServiceCost(requestedServiceId: number, manager: EntityManager) {
    const repo = manager ? manager.getRepository(RequestedService) : this.requestedServiceRepository;
    const itemsOfRequestedService: ServiceItem[] = await this.getServiceItemsByRequestedServiceId(requestedServiceId, manager);
    const requestedService: null | RequestedService = await this.getRequestedServiceDetail(requestedServiceId, manager);
    const service: null | Services = requestedService ? await this.servicesService.listOneService(requestedService.service.id, manager) : null;
    const serviceCost: number = service ? service.cost : 0;
    let totalCost: number = Number(serviceCost);

    for (const i in itemsOfRequestedService) {
      const item = itemsOfRequestedService[i];
      const stock: null | StockResponse = await this.stockService.listStockByStockId(item.stock.id, manager);
      const resource: null | Resource = stock ? await this.resourceService.listOneResource(stock.resource_id, manager) : null;
      totalCost += resource ? Number(resource.cost) * Number(item.amount) : 0;
    }

    await repo.update({ id: requestedServiceId }, { cost: totalCost });
    if (requestedService?.serviceOrder.id)
      await this.updateServiceOrderBudget(requestedService.serviceOrder.id, manager);
  }

  private async updateServiceOrderBudget(serviceOrderId: number, manager: EntityManager) {
    const repo = manager.getRepository(ServiceOrder);
    const updatedServiceOrder = await repo.findOne({
      relations: ['requestedService'],
      where: { id: serviceOrderId },
    });
    if (updatedServiceOrder) {
      const serviceOrderBudget = updatedServiceOrder.requestedService.reduce((acc, requestedService) => requestedService.cost + acc, 0);
      updatedServiceOrder.budget = serviceOrderBudget;
      await repo.save(updatedServiceOrder);
    }
  }

  async upsertItemOnRequestedService(serviceItem: ServiceItemDTO, employeeId: number) {
    return this.dataSource.transaction(async (manager) => {
      const stock: null | StockResponse = await this.stockService.listStockByStockId(serviceItem.stock_id, manager);

      if (!stock) {
        throw new BadRequestException(
          'Estoque não identificado.',
        );
      }

      const requestedService: null | RequestedService = await this.getRequestedServiceDetail(serviceItem.requested_service_id, manager);

      if (!requestedService) {
        throw new BadRequestException(
          'Ordem de serviço não identificada.',
        );
      }

      if (requestedService.employee?.id !== employeeId) {
        throw new BadRequestException(
          'Apenas o funcionário atribuído a este serviço pode modificá-lo.',
        );
      }

      const repo = manager.getRepository(ServiceItem);
      await repo.upsert({
        amount: serviceItem.amount,
        requestedService: {
          id: serviceItem.requested_service_id,
        },
        stock: {
          id: serviceItem.stock_id,
        },
      }, ['stock.id', 'requestedService.id']);

      await this.updateRequestedServiceCost(serviceItem.requested_service_id, manager);
    });
  }

  async deleteRequestedServiceItem(requestedServiceId: number, serviceItemId: number, employeeId: number) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ServiceItem);
      const item = await repo.findOne({
        relations: ['requestedService', 'requestedService.employee'],
        where: { id: serviceItemId },
      });

      if (!item || Number(item.requestedService.id) !== Number(requestedServiceId)) {
        throw new BadRequestException(
          'Item não encontrado na ordem de serviço fornecida.',
        );
      }

      if (item.requestedService.employee?.id !== employeeId) {
        throw new BadRequestException(
          'Apenas o funcionário atribuído a este serviço pode removê-lo.',
        );
      }

      await repo.remove(item);
      await this.updateRequestedServiceCost(
        requestedServiceId,
        manager,
      );
    });
  }

  async assignRequestedServiceToEmployee(employeeId: number, requestedServiceId: number) {
    const requestedService = await this.requestedServiceRepository.findOne({ relations: ['employee', 'serviceItem', 'serviceItem.stock'], where: { id: requestedServiceId } });

    if (!requestedService)
      throw new BadRequestException('Requested Service not found');
    if (requestedService.employee)
      throw new BadRequestException('Requested Service already assigned');
    if (requestedService.status !== RequestedServicesStatus.RECEBIDA)
      throw new BadRequestException('Requested Service already started');

    await this.requestedServiceRepository.update({ id: requestedServiceId }, { employee: { id: employeeId }, started_at: undefined, status: RequestedServicesStatus.EM_DIAGNOSTICO });
  }

  async reviewRequestedService(employeeId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RequestedService);
      const requestedService = await repo.findOne({ relations: ['employee', 'serviceItem', 'serviceItem.stock'], where: { id: requestedServiceId } });

      if (!requestedService)
        throw new BadRequestException('Requested Service not found');
      if (requestedService.employee?.id !== employeeId) {
        throw new BadRequestException(
          'Apenas o funcionário atribuído a este serviço pode analisá-lo.',
        );
      }
      if (requestedService.status !== RequestedServicesStatus.EM_DIAGNOSTICO)
        throw new BadRequestException('Resquested Service is not under evaluation');

      if (requestedService.serviceItem) {
        for (const item of requestedService.serviceItem) {
          if (!item.stock || Number(item.stock.amount) < Number(item.amount)) {
            throw new BadRequestException(`Not enough stock. Needed: ${item.amount}, Available: ${item.stock?.amount || 0}`);
          }
        }

        for (const item of requestedService.serviceItem) {
          await manager.decrement(Stock, { id: item.stock.id }, 'amount', item.amount);
        }
      }

      await repo.update({ id: requestedServiceId }, { status: RequestedServicesStatus.AGUARDANDO_APROVACAO });
    });
  }

  async listUserAwaitingApprovalRequestedServices(clientId: number) {
    return await this.requestedServiceRepository.find({
      relations: ['service', 'serviceItem'],
      where: { serviceOrder: { user: { id: clientId } }, status: RequestedServicesStatus.AGUARDANDO_APROVACAO },
    });
  }

  async approveRequestedService(clientId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RequestedService);
      const requestedService = await repo.findOne({ relations: ['serviceOrder.user'], where: { id: requestedServiceId, serviceOrder: { user: { id: clientId } } } });

      if (!requestedService)
        throw new BadRequestException('Requested Service not found');
      if (requestedService.status !== RequestedServicesStatus.AGUARDANDO_APROVACAO)
        throw new BadRequestException('Resquested Service is not waiting approval');

      await repo.update({ id: requestedServiceId }, { status: RequestedServicesStatus.APPROVED });
    });
  }

  async startRequestedService(employeeId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RequestedService);
      const requestedService = await repo.findOne({ relations: ['employee', 'serviceItem', 'serviceItem.stock'], where: { id: requestedServiceId } });

      if (!requestedService)
        throw new BadRequestException('Requested Service not found');
      if (requestedService.employee?.id !== employeeId) {
        throw new BadRequestException(
          'Apenas o funcionário atribuído a este serviço pode começá-lo.',
        );
      }
      if (requestedService.status !== RequestedServicesStatus.APPROVED)
        throw new BadRequestException('Resquested Service is not approved');

      await repo.update({ id: requestedServiceId }, { started_at: new Date(), status: RequestedServicesStatus.EM_EXECUCAO });
    });
  }
}
