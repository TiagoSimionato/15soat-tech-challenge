import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Resource } from '../../resources/entities/resources.entity';
import { ResourcesByService } from '../../resources/entities/resourcesByService.entity';
import { Stock } from '../../stock/entities/stock.entity';
import { RequestedService } from '../entities/requestedService.entity';
import { ServiceItem } from '../entities/serviceItem.entity';
import { ServiceOrder } from '../entities/serviceOrder.entity';
import { Services } from '../entities/services.entity';
import { RequestedServicesStatus, ServiceOrderStatus } from '../enums/services.types';
import { ServiceOrderDTO, ServiceOrderServiceDTO } from '../models/serviceOrder.model';

@Injectable()
export class ServiceOrderService {
  constructor(
    private readonly dataSource: DataSource,
  ) { }

  async createServiceOrder(serviceOrder: ServiceOrderDTO) {
    return this.dataSource.transaction(async (manager) => {
      const dbServiceOrder = manager.create(ServiceOrder, {
        budget: 0,
        cost: 0,
        status: ServiceOrderStatus.PENDING,
        user: {
          id: serviceOrder.user_id,
        },
        vehicle: {
          id: serviceOrder.vehicle_id,
        },
      });

      const serviceOrderId: number = (await manager.save(dbServiceOrder)).id;
      await this.createRequestedServiceOrder(manager, serviceOrderId, serviceOrder.services);
    });
  }

  private async createRequestedServiceOrder(manager: EntityManager, serviceOrderId: number, arrServices: ServiceOrderServiceDTO[]) {
    for (const i in arrServices) {
      const cost: number = await this.calculateRequestedServiceCost(manager, arrServices[i].id);
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
    }
  }

  private async getResourcesByServiceId(manager: EntityManager, serviceId: number): Promise<ResourcesByService[]> {
    return await manager.find(ResourcesByService, {
      relations: ['resource'],
      where: {
        service: {
          id: serviceId,
        },
      },
    });
  }

  private async getStockByResourceId(manager: EntityManager, resourceId: number): Promise<null | Stock> {
    return await manager.findOneBy(Stock, {
      resource: {
        id: resourceId,
      },
    });
  }

  private async createServiceItems(manager: EntityManager, requestedServiceId: number, serviceId: number) {
    const resourcesByService: ResourcesByService[] = await this.getResourcesByServiceId(manager, serviceId);

    for (const i in resourcesByService) {
      const stock: null | Stock = await this.getStockByResourceId(manager, resourcesByService[i].resource.id);

      if (!stock) {
        throw new Error(
          `Estoque não encontrado para o recurso ${resourcesByService[i].resource.id}`,
        );
      }

      const dbServiceItem = manager.create(ServiceItem, {
        amount: resourcesByService[i].min_quantity,
        requestedService: {
          id: requestedServiceId,
        },
        stock: {
          id: stock.id,
        },
      });

      await manager.save(dbServiceItem);
    }
  }

  private async getResourceDetail(manager: EntityManager, resourceId: number): Promise<null | Resource> {
    return await manager.findOneBy(Resource, {
      id: resourceId,
    });
  }

  private async getServiceDetail(manager: EntityManager, serviceId: number): Promise<null | Services> {
    return await manager.findOneBy(Services, {
      id: serviceId,
    });
  }

  private async calculateRequestedServiceCost(manager: EntityManager, serviceId: number): Promise<number> {
    const resources: ResourcesByService[] = await this.getResourcesByServiceId(manager, serviceId);
    const service: null | Services = await this.getServiceDetail(manager, serviceId);
    const serviceCost: number = service ? service.cost : 0;
    let totalCost: number = Number(serviceCost);

    for (const i in resources) {
      const resource: null | Resource = await this.getResourceDetail(manager, resources[i].resource.id);
      totalCost += resource ? Number(resource.cost) * Number(resources[i].min_quantity) : 0;
    }
    return totalCost;
  }
}
