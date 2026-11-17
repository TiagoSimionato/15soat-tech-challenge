import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { RequestedServicesStatus } from '../../../common/enums/services/services.enum';
import { ResourceResponse } from '../../../frameworks/primary/dto/resources/resource.model';
import { ServiceItemDTO } from '../../../frameworks/primary/dto/services/serviceItem.model';
import { PartServiceDTO, ServiceOrderServiceDTO } from '../../../frameworks/primary/dto/services/serviceOrder.model';
import { StockResourceResponse } from '../../../frameworks/primary/dto/stock/stock.model';
import { PartsByService } from '../../../frameworks/secondary/parts/partsByService.entity';
import { ResourcesByService } from '../../../frameworks/secondary/resources/resourcesByService.entity';
import { RequestedService } from '../../../frameworks/secondary/services/requestedService.entity';
import { RequestedServicePart } from '../../../frameworks/secondary/services/requestedServicePart.entity';
import { ServiceItem } from '../../../frameworks/secondary/services/serviceItem.entity';
import { ServiceOrder } from '../../../frameworks/secondary/services/serviceOrder.entity';
import { Services } from '../../../frameworks/secondary/services/services.entity';
import { StatusClient } from '../../../modules/httpClient/status.client';
import { StockServiceClient } from '../../../modules/httpClient/stock.client';
import { PartsService } from '../parts/parts.service';
import { ResourceService } from '../resources/resources.service';
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
    @InjectRepository(RequestedServicePart)
    @InjectRepository(ServiceItem)
    private readonly serviceItemRepository: Repository<ServiceItem>,
    private readonly resourceService: ResourceService,
    private readonly servicesService: ServicesService,
    private readonly partsService: PartsService,
    private readonly stockServiceClient: StockServiceClient,
    private readonly statusClient: StatusClient,
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
      });

      const requestedServiceId: number = (await manager.save(dbReqServiceOrder)).id;

      if (arrServices[i].parts) {
        await this.createRequestedServiceParts(manager, requestedServiceId, arrServices[i].id, arrServices[i].parts);
      }

      await this.createServiceItems(manager, requestedServiceId, arrServices[i].id);
      await this.updateServiceOrderBudget(serviceOrderId, manager);
    }
  }

  private async calculateRequestedServiceCost(serviceId: number, manager?: EntityManager): Promise<number> {
    const serviceResources: ResourcesByService[] = await this.resourceService.listResourcesOfAService(serviceId, manager);
    const service: null | Services = await this.servicesService.listOneService(serviceId, manager);
    const serviceCost: number = service ? service.cost : 0;
    let totalCost: number = Number(serviceCost);
    const resources = await this.stockServiceClient.listResources();

    for (const i in serviceResources) {
      const resource: ResourceResponse | undefined = resources.find(it => it.id === serviceResources[i].resource_id);
      totalCost += resource ? Number(resource.cost) * Number(serviceResources[i].min_quantity) : 0;
    }
    return totalCost;
  }

  private async createServiceItems(manager: EntityManager, requestedServiceId: number, serviceId: number) {
    const resourcesByService: ResourcesByService[] = await this.resourceService.listResourcesOfAService(serviceId, manager);

    for (const i in resourcesByService) {
      const stock: StockResourceResponse | undefined = await this.stockServiceClient.listStockByResourceId(resourcesByService[i].resource_id);

      if (!stock) {
        throw new BadRequestException(
          `Stock not found for resource ${resourcesByService[i].resource_id}`,
        );
      }

      const dbServiceItem = manager.create(ServiceItem, {
        amount: resourcesByService[i].min_quantity,
        requestedService: {
          id: requestedServiceId,
        },
        stock_id: stock.stock_id,
      });

      await manager.save(dbServiceItem);
    }
  }

  private async createRequestedServiceParts(manager: EntityManager, requestedServiceId: number, serviceId: number, parts: PartServiceDTO[]) {
    const formattedParts = [...new Map(parts.map(part => [part.id, part])).values()];

    for (const part of formattedParts) {
      const partsByService: null | PartsByService = await this.partsService.listOnePartByService(serviceId, part.id, manager);

      if (!partsByService) {
        throw new BadRequestException(`Part not found for service ${serviceId} and part ${part.id}`);
      }

      const dbRequestedServicePart = manager.create(RequestedServicePart, {
        part: {
          id: part.id,
        },
        requestedService: {
          id: requestedServiceId,
        },
      });

      await manager.save(dbRequestedServicePart);
    }
  }

  async getServiceItemsByRequestedServiceId(requestedServiceId: number, manager?: EntityManager): Promise<ServiceItem[]> {
    const repo = manager ? manager.getRepository(ServiceItem) : this.serviceItemRepository;
    return await repo.find({
      relations: ['requestedService'],
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
      relations: ['employee', 'serviceItem', 'service', 'serviceOrder', 'serviceOrder.user', 'serviceOrder.requestedServices'],
      where: { id },
    });

    if (!requestedService)
      throw new BadRequestException('Requested Service not found');

    return requestedService;
  }

  async getEmployeeRequestedServices(employeeId?: number): Promise<RequestedService[]> {
    return await this.requestedServiceRepository.find({ relations: ['service', 'serviceOrder', 'serviceItem'], where: { employee: { id: employeeId } } });
  }

  private async updateRequestedServiceCost(requestedServiceId: number, manager: EntityManager) {
    const repo = manager ? manager.getRepository(RequestedService) : this.requestedServiceRepository;
    const itemsOfRequestedService: ServiceItem[] = await this.getServiceItemsByRequestedServiceId(requestedServiceId, manager);
    const requestedService: RequestedService = await this.getRequestedService(requestedServiceId, manager);
    const service: null | Services = requestedService ? await this.servicesService.listOneService(requestedService.service.id, manager) : null;
    const serviceCost: number = service ? service.cost : 0;
    let totalCost: number = Number(serviceCost);
    const resources: null | ResourceResponse[] = await this.stockServiceClient.listResources();

    for (const i in itemsOfRequestedService) {
      const item = itemsOfRequestedService[i];
      const stock: null | StockResourceResponse = await this.stockServiceClient.getStockByStockId(item.stock_id);
      const resource: ResourceResponse | undefined = stock ? resources.find(it => it.id === stock.resource_id) : undefined;
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
      const stock: null | StockResourceResponse = await this.stockServiceClient.getStockByStockId(serviceItem.stock_id);

      if (!stock) {
        throw new BadRequestException(
          'Stock not found.',
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
        stock_id: serviceItem.stock_id,
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
          'Item not found in the provided service order.',
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

    await this.requestedServiceRepository.update({ id: requestedServiceId }, { employee: { id: employeeId } });

    await this.statusClient.setStatus({
      requested_service_number: requestedServiceId,
      service_order_number: requestedService.serviceOrder.id,
      status: RequestedServicesStatus.EM_DIAGNOSTICO,
    });
  }

  async reviewRequestedService(employeeId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const requestedService = await this.getRequestedService(requestedServiceId, manager);

      this.validateRequestedService(requestedService, { employeeId });

      await this.statusClient.setStatus({
        requested_service_number: requestedServiceId,
        service_order_number: requestedService.serviceOrder.id,
        status: RequestedServicesStatus.AGUARDANDO_APROVACAO,
      });
    });
  }

  async approveRequestedService(clientId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const requestedService = await this.getRequestedService(requestedServiceId, manager);

      this.validateRequestedService(requestedService, { clientId });

      this.statusClient.setStatus({
        requested_service_number: requestedServiceId,
        service_order_number: requestedService.serviceOrder.id,
        status: RequestedServicesStatus.APROVADO,
      });
    });
  }

  async cancelRequestedService(clientId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const requestedService = await this.getRequestedService(requestedServiceId, manager);

      this.validateRequestedService(requestedService, { clientId });

      this.statusClient.setStatus({
        requested_service_number: requestedServiceId,
        service_order_number: requestedService.serviceOrder.id,
        status: RequestedServicesStatus.CANCELADO,
      });
    });
  }

  async startRequestedService(employeeId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const requestedService = await this.getRequestedService(requestedServiceId, manager);
      const stocks = await this.stockServiceClient.listStock();

      this.validateRequestedService(requestedService, { employeeId });

      if (requestedService.serviceItem) {
        for (const item of requestedService.serviceItem) {
          const stock = stocks.find(it => it.stock_id === item.stock_id);
          if (!stock || Number(stock.stock_amount) < Number(item.amount)) {
            throw new BadRequestException(`Not enough stock. Needed: ${item.amount}, Available: ${stock?.stock_amount || 0}`);
          }
        }

        for (const item of requestedService.serviceItem) {
          const stock = stocks.find(it => it.stock_id === item.stock_id);
          if (stock) {
            const newStockAmount = stock?.stock_amount - item.amount;
            await this.stockServiceClient.updateStock(stock?.stock_id, newStockAmount);
          }
        }
      }

      const repo = manager.getRepository(RequestedService);
      await repo.update({ id: requestedServiceId }, { started_at: new Date() });

      this.statusClient.setStatus({
        requested_service_number: requestedServiceId,
        service_order_number: requestedService.serviceOrder.id,
        status: RequestedServicesStatus.EM_EXECUCAO,
      });
    });
  }

  async finishRequestedService(employeeId: number, requestedServiceId: number) {
    return this.dataSource.transaction(async (manager) => {
      const requestedService = await this.getRequestedService(requestedServiceId, manager);

      this.validateRequestedService(requestedService, { employeeId });

      const repo = manager.getRepository(RequestedService);
      await repo.update({ id: requestedServiceId }, { finished_at: new Date() });

      this.statusClient.setStatus({
        requested_service_number: requestedServiceId,
        service_order_number: requestedService.serviceOrder.id,
        status: RequestedServicesStatus.FINALIZADA,
      });
    });
  }

  private validateRequestedService(requestedService: RequestedService, validations: RequestedServiceValidations) {
    if (validations.employeeId && requestedService.employee?.id !== validations.employeeId)
      throw new BadRequestException('Only the assigned employee can modify this service');
    if (validations.clientId && requestedService.serviceOrder.user.id !== validations.clientId)
      throw new BadRequestException('Requested Service not found');
    if (validations.vehicleArrived && !requestedService.serviceOrder.vehicle_arrived_at)
      throw new BadRequestException('Vehicle have not arrived');
  }
}
