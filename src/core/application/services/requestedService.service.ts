import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Not, Repository } from 'typeorm';
import { Resource } from '../../../frameworks/secondary/resources/resources.entity';
import { ResourcesByService } from '../../../frameworks/secondary/resources/resourcesByService.entity';
import { ResourceService } from '../resources/resources.service';
import { Stock } from '../../../frameworks/secondary/stock/stock.entity';
import { StockResponse } from '../../../frameworks/primary/dto/stock/stock.model';
import { StockService } from '../stock/stock.service';
import { RequestedService } from '../../../frameworks/secondary/services/requestedService.entity';
import { ServiceItem } from '../../../frameworks/secondary/services/serviceItem.entity';
import { ServiceOrder } from '../../../frameworks/secondary/services/serviceOrder.entity';
import { Services } from '../../../frameworks/secondary/services/services.entity';
import { RequestedServicesStatus, ServiceOrderStatus } from '../../../common/enums/services/services.enum';
import { ServiceItemDTO } from '../../../frameworks/primary/dto/services/serviceItem.model';
import { ServiceOrderServiceDTO } from '../../../frameworks/primary/dto/services/serviceOrder.model';
import { ServicesService } from '../services/services.service';

type RequestedServiceValidations = {
  clientId?: number;
  employeeId?: number;
  status?: RequestedServicesStatus;
  vehicleArrived?: boolean;
};

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

  async getRequestedService(id: number, manager?: EntityManager): Promise<RequestedService> {
    const repo = manager?.getRepository(RequestedService) ?? this.requestedServiceRepository;
    const requestedService = await repo.findOne({
      relations: ['employee', 'serviceItem', 'serviceItem.stock', 'service', 'serviceOrder', 'serviceOrder.user', 'serviceOrder.requestedServices'],
      where: { id },
    });

    if (!requestedService)
      throw new BadRequestException('Requested Service not found');

    return requestedService;
  }

  async getRequestedServices(status?: RequestedServicesStatus): Promise<RequestedService[]> {
    return await this.requestedServiceRepository.find({ relations: ['service', 'serviceOrder', 'serviceItem', 'employee'], where: { status } });
  }

  async getEmployeeRequestedServices(employeeId?: number): Promise<RequestedService[]> {
    return await this.requestedServiceRepository.find({ relations: ['service', 'serviceOrder', 'serviceItem'], where: { employee: { id: employeeId } } });
  }

  async getOnGoingRequestedServices(): Promise<RequestedService[]> {
    return await this.requestedServiceRepository
      .createQueryBuilder('requestedService')
      .leftJoinAndSelect('requestedService.service', 'service')
      .leftJoinAndSelect('requestedService.serviceOrder', 'serviceOrder')
      .leftJoinAndSelect('requestedService.serviceItem', 'serviceItem')
      .where('requestedService.status not in (:...statuses)', {
        statuses: [
          RequestedServicesStatus.FINALIZADA,
          RequestedServicesStatus.CANCELADO,
          RequestedServicesStatus.ENTREGUE,
        ],
      })
      .orderBy(
        `CASE "requestedService"."status"
          WHEN 'EM EXECUÇÃO' THEN 1
          WHEN 'APROVADO' THEN 2
          WHEN 'AGUARDANDO APROVAÇÃO' THEN 3
          WHEN 'EM DIAGNÓSTICO' THEN 4
          WHEN 'RECEBIDA' THEN 5
        ELSE 6
        END`,
        'ASC',
      )
      .addOrderBy('"requestedService"."id"', 'ASC')
      .getMany();
  }

  private async updateRequestedServiceCost(requestedServiceId: number, manager: EntityManager) {
    const repo = manager ? manager.getRepository(RequestedService) : this.requestedServiceRepository;
    const itemsOfRequestedService: ServiceItem[] = await this.getServiceItemsByRequestedServiceId(requestedServiceId, manager);
    const requestedService: RequestedService = await this.getRequestedService(requestedServiceId, manager);
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
      relations: ['requestedServices'],
      where: { id: serviceOrderId },
    });
    if (updatedServiceOrder) {
      const serviceOrderBudget = updatedServiceOrder.requestedServices.reduce((acc, requestedService) => requestedService.cost + acc, 0);
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

      const requestedService: RequestedService = await this.getRequestedService(serviceItem.requested_service_id, manager);

      this.validateRequestedService(requestedService, { employeeId, status: RequestedServicesStatus.EM_DIAGNOSTICO });

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
      this.validateRequestedService(item.requestedService, { employeeId, status: RequestedServicesStatus.EM_DIAGNOSTICO });

      await repo.remove(item);
      await this.updateRequestedServiceCost(
        requestedServiceId,
        manager,
      );
    });
  }

  async assignRequestedServiceToEmployee(employeeId: number, requestedServiceId: number) {
    const requestedService = await this.getRequestedService(requestedServiceId);

    this.validateRequestedService(requestedService, {
      status: RequestedServicesStatus.RECEBIDA,
      vehicleArrived: true,
    });
    if (requestedService.employee)
      throw new BadRequestException('Requested Service already assigned');

    await this.requestedServiceRepository.update({ id: requestedServiceId }, { employee: { id: employeeId }, status: RequestedServicesStatus.EM_DIAGNOSTICO });
  }

  async reviewRequestedService(employeeId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const requestedService = await this.getRequestedService(requestedServiceId, manager);

      this.validateRequestedService(requestedService, { employeeId, status: RequestedServicesStatus.EM_DIAGNOSTICO });

      const repo = manager.getRepository(RequestedService);
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
      const requestedService = await this.getRequestedService(requestedServiceId, manager);

      this.validateRequestedService(requestedService, { clientId, status: RequestedServicesStatus.AGUARDANDO_APROVACAO });

      const requestedServiceRepo = manager.getRepository(RequestedService);
      await requestedServiceRepo.update({ id: requestedServiceId }, {
        status: RequestedServicesStatus.APROVADO,
      });

      const updateServiceOrderStatus = requestedService.serviceOrder.status === ServiceOrderStatus.PENDENTE;
      if (updateServiceOrderStatus) {
        const serviceOrderRepo = manager.getRepository(ServiceOrder);
        await serviceOrderRepo.update({ id: requestedService.serviceOrder.id }, {
          status: ServiceOrderStatus.APROVADO,
        });
      }
    });
  }

  async cancelRequestedService(clientId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const requestedService = await this.getRequestedService(requestedServiceId, manager);

      this.validateRequestedService(requestedService, { clientId, status: RequestedServicesStatus.AGUARDANDO_APROVACAO });

      const requestedServiceRepo = manager.getRepository(RequestedService);
      await requestedServiceRepo.update({ id: requestedServiceId }, { status: RequestedServicesStatus.CANCELADO });

      const updateServiceOrderStatus = requestedService.serviceOrder.requestedServices.every(it => it.status === RequestedServicesStatus.CANCELADO);
      if (updateServiceOrderStatus) {
        const serviceOrderRepo = manager.getRepository(ServiceOrder);
        await serviceOrderRepo.update({ id: requestedService.serviceOrder.id }, {
          status: ServiceOrderStatus.APROVADO,
        });
      }
    });
  }

  async startRequestedService(employeeId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const requestedService = await this.getRequestedService(requestedServiceId, manager);

      this.validateRequestedService(requestedService, { employeeId, status: RequestedServicesStatus.APROVADO });
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

      const repo = manager.getRepository(RequestedService);
      await repo.update({ id: requestedServiceId }, { started_at: new Date(), status: RequestedServicesStatus.EM_EXECUCAO });
    });
  }

  async finishRequestedService(employeeId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const requestedService = await this.getRequestedService(requestedServiceId, manager);

      this.validateRequestedService(requestedService, { employeeId, status: RequestedServicesStatus.EM_EXECUCAO });

      const repo = manager.getRepository(RequestedService);
      await repo.update({ id: requestedServiceId }, { finished_at: new Date(), status: RequestedServicesStatus.FINALIZADA });
    });
  }

  async getAverageServiceDuration(serviceId?: number) {
    const requestedServices = await this.requestedServiceRepository.find({
      where: [{
        finished_at: Not(IsNull()),
        service: { id: serviceId },
        started_at: Not(IsNull()),
        status: RequestedServicesStatus.FINALIZADA,
      }, {
        finished_at: Not(IsNull()),
        service: { id: serviceId },
        started_at: Not(IsNull()),
        status: RequestedServicesStatus.ENTREGUE,
      }],
    });

    const totalDurationMs = requestedServices.reduce(
      (acc, rs) => acc + (rs.finished_at.getTime() - rs.started_at.getTime()),
      0,
    );
    const averageDurationInHours = (totalDurationMs / requestedServices.length / 1000 / 60 / 60) || 0;

    return {
      averageDurationInHours,
      totalServicesAnalyzed: requestedServices.length,
    };
  }

  private validateRequestedService(requestedService: RequestedService, validations: RequestedServiceValidations) {
    if (validations.employeeId && requestedService.employee?.id !== validations.employeeId)
      throw new BadRequestException('Apenas o funcionário atribuído a este serviço pode alterá-lo');
    if (validations.clientId && requestedService.serviceOrder.user.id !== validations.clientId)
      throw new BadRequestException('Requested Service not found');
    if (validations.status && validations.status !== requestedService.status)
      throw new BadRequestException(`Requested Service has status ${requestedService.status} but needed status ${validations.status}`);
    if (validations.vehicleArrived && !requestedService.serviceOrder.vehicle_arrived_at)
      throw new BadRequestException('Vehicle have not arrived');
  }
}
