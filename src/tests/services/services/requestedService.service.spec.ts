import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RequestedServicesStatus } from '../../../common/enums/services/services.enum';
import { PartsService } from '../../../core/application/parts/parts.service';
import { ResourceService } from '../../../core/application/resources/resources.service';
import { RequestedServiceService } from '../../../core/application/services/requestedService.service';
import { ServicesService } from '../../../core/application/services/services.service';
import { RequestedService } from '../../../frameworks/secondary/services/requestedService.entity';
import { RequestedServicePart } from '../../../frameworks/secondary/services/requestedServicePart.entity';
import { ServiceItem } from '../../../frameworks/secondary/services/serviceItem.entity';
import { ServiceOrder } from '../../../frameworks/secondary/services/serviceOrder.entity';
import { StatusClient } from '../../../modules/httpClient/status.client';
import { StockServiceClient } from '../../../modules/httpClient/stock.client';

jest.mock('@nestjs/axios', () => ({ HttpService: class { } }));

const makeManager = () => ({
  create: jest.fn(),
  decrement: jest.fn(),
  findOne: jest.fn(),
  getRepository: jest
    .fn()
    .mockReturnValue({
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    }),
  save: jest.fn(),
});
const makeDataSource = (manager: any) => ({
  transaction: jest.fn().mockImplementation((cb: any) => cb(manager)),
});
const makeRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});
const makeClient = () => ({
  getStockByStockId: jest.fn(),
  listResources: jest.fn(),
  listStock: jest.fn(),
  listStockByResourceId: jest.fn(),
  updateStock: jest.fn(),
});
// O StatusClient só expõe setStatus (o status agora vive em um serviço próprio)
const makeStatusClient = () => ({
  setStatus: jest.fn<(payload: unknown) => Promise<void>>().mockResolvedValue(undefined),
});
const mockResource = { cost: 50, id: 1, name: 'Resource A' };
const mockStock = { amount: 20, resource_id: 1, stock_id: 1 };
const mockService = { cost: 100, id: 1, name: 'Service A' };
const mockResourceByService = {
  id: 1,
  min_quantity: 2,
  resource: mockResource,
  resource_id: 1,
  service: mockService,
};
const makeRequestedService = (
  overrides: Partial<RequestedService> = {},
): RequestedService =>
  ({
    cost: 200,
    employee: { id: 10 },
    id: 1,
    service: mockService,
    serviceItem: [],
    serviceOrder: {
      id: 1,
      requestedServices: [],
      user: { id: 5 },
      vehicle_arrived_at: new Date(),
    },
    ...overrides,
  }) as any;

describe('RequestedServiceService', () => {
  let service: RequestedServiceService;
  let requestedServiceRepo: any;
  let serviceItemRepo: any;
  let resourceService: any;
  let servicesService: any;
  let stockService: any;
  let statusService: any;
  let partsService: any;
  let manager: any;

  const expectStatusSet = (
    requestedServiceId: number,
    serviceOrderId: number,
    status: RequestedServicesStatus,
  ) => {
    expect(statusService.setStatus).toHaveBeenCalledTimes(1);
    expect(statusService.setStatus).toHaveBeenCalledWith({
      requested_service_number: requestedServiceId,
      service_order_number: serviceOrderId,
      status,
    });
  };

  beforeEach(async () => {
    manager = makeManager();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestedServiceService,
        { provide: DataSource, useValue: makeDataSource(manager) },
        {
          provide: getRepositoryToken(RequestedService),
          useFactory: makeRepository,
        },
        {
          provide: getRepositoryToken(RequestedServicePart),
          useFactory: makeRepository,
        },
        {
          provide: StockServiceClient,
          useFactory: makeClient,
        },
        {
          provide: StatusClient,
          useFactory: makeStatusClient,
        },
        {
          provide: ResourceService,
          useValue: {
            listOneResource: jest.fn(),
            listResourcesOfAService: jest.fn(),
          },
        },
        { provide: ServicesService, useValue: { listOneService: jest.fn() } },
        {
          provide: PartsService,
          useValue: {
            listOnePartByService: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<RequestedServiceService>(RequestedServiceService);
    requestedServiceRepo = module.get(getRepositoryToken(RequestedService));
    serviceItemRepo = module.get(getRepositoryToken(RequestedServicePart));
    resourceService = module.get(ResourceService);
    servicesService = module.get(ServicesService);
    stockService = module.get(StockServiceClient);
    statusService = module.get(StatusClient);
    partsService = module.get(PartsService);
  });
  afterEach(async () => jest.clearAllMocks());
  describe('createRequestedServiceOrder', () => {
    it('should create requested services and update budget for each service', async () => {
      resourceService.listResourcesOfAService.mockResolvedValue([mockResourceByService]);
      servicesService.listOneService.mockResolvedValue(mockService);
      stockService.listResources.mockResolvedValue([mockResource]);
      resourceService.listOneResource.mockResolvedValue(mockResource);
      stockService.listStockByResourceId.mockResolvedValue(mockStock);
      manager.create.mockReturnValue({ id: 1 });
      manager.save.mockResolvedValue({ id: 1 });
      const repoMock = { findOne: jest.fn(), save: jest.fn() };
      repoMock.findOne.mockResolvedValue({
        id: 1,
        requestedServices: [{ cost: 200 }],
      } as never);
      repoMock.save.mockResolvedValue(undefined as never);
      manager.getRepository.mockReturnValue(repoMock);
      await service.createRequestedServiceOrder(manager, 1, [{ id: 1 }] as any);
      expect(manager.create).toHaveBeenCalledWith(
        RequestedService,
        expect.objectContaining({
          service: { id: 1 },
          serviceOrder: { id: 1 },
        }),
      );
      expect(manager.save).toHaveBeenCalled();
    });
    it('should throw BadRequestException when stock is not found for a resource', async () => {
      resourceService.listResourcesOfAService.mockResolvedValue([mockResourceByService]);
      servicesService.listOneService.mockResolvedValue(mockService);
      stockService.listResources.mockResolvedValue([mockResource]);
      resourceService.listOneResource.mockResolvedValue(mockResource);
      stockService.listStockByResourceId.mockResolvedValue(null);
      manager.create.mockReturnValue({ id: 1 });
      manager.save.mockResolvedValue({ id: 1 });

      await expect(
        service.createRequestedServiceOrder(manager, 1, [{ id: 1 }] as any),
      ).rejects.toThrow(BadRequestException);
    });
    it('should create requested service parts when parts are provided', async () => {
      resourceService.listResourcesOfAService.mockResolvedValue([mockResourceByService]);
      servicesService.listOneService.mockResolvedValue(mockService);
      resourceService.listOneResource.mockResolvedValue(mockResource);
      stockService.listResources.mockResolvedValue([mockResource]);
      stockService.listStockByResourceId.mockResolvedValue(mockStock);
      partsService.listOnePartByService.mockResolvedValue({
        id: 1,
        part: { id: 1 },
        service: mockService,
      } as never);
      manager.create.mockReturnValue({ id: 1 });
      manager.save.mockResolvedValue({ id: 1 });
      const repoMock = { findOne: jest.fn(), save: jest.fn() };
      repoMock.findOne.mockResolvedValue({
        id: 1,
        requestedServices: [{ cost: 200 }],
      } as never);
      repoMock.save.mockResolvedValue(undefined as never);
      manager.getRepository.mockReturnValue(repoMock);

      await service.createRequestedServiceOrder(manager, 1, [
        { id: 1, parts: [{ id: 1 }] },
      ] as any);

      expect(partsService.listOnePartByService).toHaveBeenCalledWith(
        1,
        1,
        manager,
      );
      expect(manager.create).toHaveBeenCalledWith(
        RequestedServicePart,
        expect.objectContaining({
          part: { id: 1 },
        }),
      );
    });
    it('should throw BadRequestException when a part is not found for the service', async () => {
      resourceService.listResourcesOfAService.mockResolvedValue([mockResourceByService]);
      servicesService.listOneService.mockResolvedValue(mockService);
      resourceService.listOneResource.mockResolvedValue(mockResource);
      stockService.listResources.mockResolvedValue([mockResource]);
      stockService.listStockByResourceId.mockResolvedValue(mockStock);
      partsService.listOnePartByService.mockResolvedValue(null);
      manager.create.mockReturnValue({ id: 1 });
      manager.save.mockResolvedValue({ id: 1 });

      await expect(
        service.createRequestedServiceOrder(manager, 1, [
          { id: 1, parts: [{ id: 1 }] },
        ] as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
  describe('getServiceItemsByRequestedServiceId', () => {
    it('should return service items using own repository', async () => {
      const items = [{ amount: 2, id: 1 }];
      serviceItemRepo.find.mockResolvedValue(items);
      const result = await service.getServiceItemsByRequestedServiceId(1);
      expect(serviceItemRepo.find).toHaveBeenCalledWith({
        relations: ['requestedService'],
        where: { requestedService: { id: 1 } },
      });
      expect(result).toEqual(items);
    });
    it('should use EntityManager repository when manager is provided', async () => {
      const items = [{ amount: 2, id: 1 }];
      const repoMock = { find: jest.fn().mockResolvedValue(items as never) };
      manager.getRepository.mockReturnValue(repoMock);
      const result = await service.getServiceItemsByRequestedServiceId(
        1,
        manager,
      );
      expect(manager.getRepository).toHaveBeenCalledWith(ServiceItem);
      expect(result).toEqual(items);
      expect(serviceItemRepo.find).not.toHaveBeenCalled();
    });
  });
  describe('getRequestedService', () => {
    it('should return a requested service when found', async () => {
      const rs = makeRequestedService();
      requestedServiceRepo.findOne.mockResolvedValue(rs as never);
      const result = await service.getRequestedService(1);
      expect(result).toEqual(rs);
    });
    it('should throw BadRequestException when not found', async () => {
      requestedServiceRepo.findOne.mockResolvedValue(null as never);
      await expect(service.getRequestedService(99)).rejects.toThrow(
        new BadRequestException('Requested Service not found'),
      );
    });
  });

  describe('getEmployeeRequestedServices', () => {
    it('should return requested services for an employee', async () => {
      const rs = [makeRequestedService()];
      requestedServiceRepo.find.mockResolvedValue(rs as never);
      const result = await service.getEmployeeRequestedServices(10);
      expect(requestedServiceRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { employee: { id: 10 } } }),
      );
      expect(result).toEqual(rs);
    });
  });
  describe('assignRequestedServiceToEmployee', () => {
    it('should assign employee and set status EM_DIAGNOSTICO', async () => {
      const rs = makeRequestedService({
        employee: null as any,
      });
      requestedServiceRepo.findOne.mockResolvedValue(rs as never);
      requestedServiceRepo.update.mockResolvedValue({ affected: 1 } as never);

      await service.assignRequestedServiceToEmployee(10, 1);

      expect(requestedServiceRepo.update).toHaveBeenCalledWith(
        { id: 1 },
        {
          employee: { id: 10 },
        },
      );
      expectStatusSet(1, 1, RequestedServicesStatus.EM_DIAGNOSTICO);
    });
    it('should throw BadRequestException when service is already assigned', async () => {
      const rs = makeRequestedService();
      requestedServiceRepo.findOne.mockResolvedValue(rs as never);

      await expect(
        service.assignRequestedServiceToEmployee(10, 1),
      ).rejects.toThrow(
        new BadRequestException('Requested Service already assigned'),
      );
      expect(requestedServiceRepo.update).not.toHaveBeenCalled();
      expect(statusService.setStatus).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException when vehicle has not arrived', async () => {
      const rs = makeRequestedService({
        employee: null as any,
        serviceOrder: {
          id: 1,
          requestedServices: [],
          user: { id: 5 },
          vehicle_arrived_at: null,
        } as any,
      });
      requestedServiceRepo.findOne.mockResolvedValue(rs as never);

      await expect(
        service.assignRequestedServiceToEmployee(10, 1),
      ).rejects.toThrow(new BadRequestException('Vehicle have not arrived'));
      expect(requestedServiceRepo.update).not.toHaveBeenCalled();
      expect(statusService.setStatus).not.toHaveBeenCalled();
    });
    it('should propagate the error when the status service fails', async () => {
      const rs = makeRequestedService({
        employee: null as any,
      });
      requestedServiceRepo.findOne.mockResolvedValue(rs as never);
      requestedServiceRepo.update.mockResolvedValue({ affected: 1 } as never);
      statusService.setStatus.mockRejectedValue(new Error('status service down'));

      await expect(
        service.assignRequestedServiceToEmployee(10, 1),
      ).rejects.toThrow('status service down');
    });
  });
  describe('reviewRequestedService', () => {
    it('should set status AGUARDANDO_APROVACAO when employee is the assigned one', async () => {
      const rs = makeRequestedService();
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);

      await service.reviewRequestedService(10, 1);

      expectStatusSet(1, 1, RequestedServicesStatus.AGUARDANDO_APROVACAO);
    });
    it('should throw BadRequestException when employee is not the assigned one', async () => {
      const rs = makeRequestedService({
        employee: { id: 99 } as any,
      });
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.reviewRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(statusService.setStatus).not.toHaveBeenCalled();
    });
  });

  describe('approveRequestedService', () => {
    it('should set status APROVADO when the client owns the service order', async () => {
      const rs = makeRequestedService();
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);

      await service.approveRequestedService(5, 1);

      expectStatusSet(1, 1, RequestedServicesStatus.APROVADO);
    });
    it('should throw BadRequestException when client does not own the service order', async () => {
      const rs = makeRequestedService();
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.approveRequestedService(99, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(statusService.setStatus).not.toHaveBeenCalled();
    });
  });
  describe('cancelRequestedService', () => {
    it('should set status CANCELADO when the client owns the service order', async () => {
      const rs = makeRequestedService();
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);

      await service.cancelRequestedService(5, 1);

      expectStatusSet(1, 1, RequestedServicesStatus.CANCELADO);
    });
    it('should throw BadRequestException when client does not own the service order', async () => {
      const rs = makeRequestedService();
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.cancelRequestedService(99, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(statusService.setStatus).not.toHaveBeenCalled();
    });
  });
  describe('startRequestedService', () => {
    it('should start the service, decrement stock and set status EM_EXECUCAO', async () => {
      const rs = makeRequestedService({
        serviceItem: [
          { amount: 2, id: 1, stock: { amount: 10, id: 1 }, stock_id: 1 },
        ] as any,
      });
      const repoMock = {
        findOne: jest.fn().mockResolvedValue(rs as never),
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      manager.getRepository.mockReturnValue(repoMock);

      stockService.listStock.mockResolvedValue([
        { stock_amount: 10, stock_id: 1 },
      ]);
      stockService.updateStock.mockResolvedValue(undefined);

      await service.startRequestedService(10, 1);

      expect(stockService.updateStock).toHaveBeenCalledWith(
        1,
        8,
      );
      expect(repoMock.update).toHaveBeenCalledWith(
        { id: 1 },
        { started_at: expect.any(Date) },
      );
      expectStatusSet(1, 1, RequestedServicesStatus.EM_EXECUCAO);
    });
    it('should throw BadRequestException when stock is insufficient', async () => {
      const rs = makeRequestedService({
        serviceItem: [
          { amount: 10, id: 1, stock: { amount: 2, id: 1 }, stock_id: 1 },
        ] as any,
      });
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);

      stockService.listStock.mockResolvedValue([
        { stock_amount: 2, stock_id: 1 },
      ]);

      await expect(service.startRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(stockService.updateStock).not.toHaveBeenCalled();
      expect(statusService.setStatus).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException when employee is not assigned', async () => {
      const rs = makeRequestedService({
        employee: { id: 99 } as any,
      });
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.startRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(statusService.setStatus).not.toHaveBeenCalled();
    });
  });
  describe('finishRequestedService', () => {
    it('should finish the service and set status FINALIZADA', async () => {
      const rs = makeRequestedService();
      const repoMock = {
        findOne: jest.fn().mockResolvedValue(rs as never),
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      manager.getRepository.mockReturnValue(repoMock);

      await service.finishRequestedService(10, 1);

      expect(repoMock.update).toHaveBeenCalledWith(
        { id: 1 },
        { finished_at: expect.any(Date) },
      );
      expectStatusSet(1, 1, RequestedServicesStatus.FINALIZADA);
    });
    it('should throw BadRequestException when employee is not the assigned one', async () => {
      const rs = makeRequestedService({
        employee: { id: 99 } as any,
      });
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.finishRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(statusService.setStatus).not.toHaveBeenCalled();
    });
  });

  describe('calculateRequestedServiceCost', () => {
    it('should calculate cost correctly', async () => {
      resourceService.listResourcesOfAService.mockResolvedValue([mockResourceByService]);
      servicesService.listOneService.mockResolvedValue(mockService);
      stockService.listResources.mockResolvedValue([mockResource]);

      const result = await (service as any).calculateRequestedServiceCost(1, manager);

      expect(result).toBe(200);
    });
  });

  describe('upsertItemOnRequestedService', () => {
    const mockServiceItemDTO = {
      amount: 3,
      requested_service_id: 1,
      stock_id: 1,
    };

    it('should upsert item and update cost successfully', async () => {
      const rs = makeRequestedService();

      servicesService.listOneService.mockResolvedValue(mockService);
      resourceService.listOneResource.mockResolvedValue(mockResource);
      stockService.getStockByStockId.mockResolvedValue(mockStock);
      stockService.listResources.mockResolvedValue([mockResource]);

      const serviceItemRepoMock = {
        find: jest.fn().mockResolvedValue([] as never),
        upsert: jest.fn().mockResolvedValue(undefined as never),
      };
      const requestedServiceRepoMock = {
        findOne: jest.fn().mockResolvedValue(rs as never),
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      const serviceOrderRepoMock = {
        findOne: jest.fn().mockResolvedValue({
          budget: 0,
          id: 1,
          requestedServices: [{ cost: 200 }],
        } as never),
        save: jest.fn().mockResolvedValue(undefined as never),
      };

      manager.getRepository.mockImplementation((entity: any) => {
        if (entity === ServiceItem)
          return serviceItemRepoMock;
        if (entity === RequestedService)
          return requestedServiceRepoMock;
        if (entity === ServiceOrder)
          return serviceOrderRepoMock;
        return {};
      });

      await service.upsertItemOnRequestedService(mockServiceItemDTO as any, 10);

      expect(serviceItemRepoMock.upsert).toHaveBeenCalledWith(
        {
          amount: mockServiceItemDTO.amount,
          requestedService: { id: mockServiceItemDTO.requested_service_id },
          stock_id: mockServiceItemDTO.stock_id,
        },
        ['stock.id', 'requestedService.id'],
      );
    });

    it('should throw BadRequestException when stock is not found', async () => {
      stockService.getStockByStockId.mockResolvedValue(null);

      await expect(
        service.upsertItemOnRequestedService(mockServiceItemDTO as any, 10),
      ).rejects.toThrow(new BadRequestException('Stock not found.'));
    });

    it('should throw BadRequestException when employee is not the assigned one', async () => {
      const rs = makeRequestedService({
        employee: { id: 99 } as any,
      });
      // Sem este mock o teste falharia por "Stock not found.", e não pelo funcionário
      stockService.getStockByStockId.mockResolvedValue(mockStock);
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);

      await expect(
        service.upsertItemOnRequestedService(mockServiceItemDTO as any, 10),
      ).rejects.toThrow(
        new BadRequestException('Only the assigned employee can modify this service'),
      );
    });
  });

  describe('deleteRequestedServiceItem', () => {
    const mockItem = {
      amount: 2,
      id: 1,
      requestedService: {
        employee: { id: 10 },
        id: 1,
        service: mockService,
        serviceItem: [],
        serviceOrder: {
          id: 1,
          requestedServices: [],
          user: { id: 5 },
          vehicle_arrived_at: new Date(),
        },
      },
      stock: { id: 1 },
    };

    it('should delete the item and update cost successfully', async () => {
      servicesService.listOneService.mockResolvedValue(mockService);
      resourceService.listOneResource.mockResolvedValue(mockResource);

      const serviceItemRepoMock = {
        find: jest.fn().mockResolvedValue([] as never),
        findOne: jest.fn().mockResolvedValue(mockItem as never),
        remove: jest.fn().mockResolvedValue(undefined as never),
      };
      const requestedServiceRepoMock = {
        findOne: jest.fn().mockResolvedValue(mockItem.requestedService as never),
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      const serviceOrderRepoMock = {
        findOne: jest.fn().mockResolvedValue({
          budget: 0,
          id: 1,
          requestedServices: [{ cost: 200 }],
        } as never),
        save: jest.fn().mockResolvedValue(undefined as never),
      };

      manager.getRepository.mockImplementation((entity: any) => {
        if (entity === ServiceItem)
          return serviceItemRepoMock;
        if (entity === RequestedService)
          return requestedServiceRepoMock;
        if (entity === ServiceOrder)
          return serviceOrderRepoMock;
        return {};
      });

      await service.deleteRequestedServiceItem(1, 1, 10);

      expect(serviceItemRepoMock.remove).toHaveBeenCalledWith(mockItem);
    });

    it('should throw BadRequestException when item is not found', async () => {
      const serviceItemRepoMock = {
        findOne: jest.fn().mockResolvedValue(null as never),
      };
      manager.getRepository.mockReturnValue(serviceItemRepoMock);

      await expect(
        service.deleteRequestedServiceItem(1, 99, 10),
      ).rejects.toThrow(
        new BadRequestException('Item not found in the provided service order.'),
      );
    });

    it('should throw BadRequestException when item does not belong to the requested service', async () => {
      const wrongItem = { ...mockItem, requestedService: { ...mockItem.requestedService, id: 99 } };
      const serviceItemRepoMock = {
        findOne: jest.fn().mockResolvedValue(wrongItem as never),
      };
      manager.getRepository.mockReturnValue(serviceItemRepoMock);

      await expect(
        service.deleteRequestedServiceItem(1, 1, 10),
      ).rejects.toThrow(
        new BadRequestException('Item not found in the provided service order.'),
      );
    });

    it('should throw BadRequestException when employee is not the assigned one', async () => {
      const itemWithWrongEmployee = {
        ...mockItem,
        requestedService: { ...mockItem.requestedService, employee: { id: 99 } },
      };
      const serviceItemRepoMock = {
        findOne: jest.fn().mockResolvedValue(itemWithWrongEmployee as never),
      };
      manager.getRepository.mockReturnValue(serviceItemRepoMock);

      await expect(
        service.deleteRequestedServiceItem(1, 1, 10),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateRequestedService (clientId branch)', () => {
    it('should throw BadRequestException when clientId does not match service order user', async () => {
      const rs = makeRequestedService({
        serviceOrder: {
          id: 1,
          requestedServices: [],
          user: { id: 5 },
          vehicle_arrived_at: new Date(),
        } as any,
      });
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);

      // clientId 99 !== user.id 5
      await expect(service.approveRequestedService(99, 1)).rejects.toThrow(
        new BadRequestException('Requested Service not found'),
      );
    });
  });
});
