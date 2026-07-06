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
import { ResourceService } from '../../../core/application/resources/resources.service';
import { RequestedService } from '../../../frameworks/secondary/services/requestedService.entity';
import { ServiceItem } from '../../../frameworks/secondary/services/serviceItem.entity';
import { ServiceOrder } from '../../../frameworks/secondary/services/serviceOrder.entity';
import {
  RequestedServicesStatus,
  ServiceOrderStatus,
} from '../../../common/enums/services/services.enum';
import { RequestedServiceService } from '../../../core/application/services/requestedService.service';
import { ServicesService } from '../../../core/application/services/services.service';
import { StockService } from '../../../core/application/stock/stock.service';

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
const mockResource = { cost: 50, id: 1, name: 'Resource A' };
const mockStock = { amount: 20, resource_id: 1, stock_id: 1 };
const mockService = { cost: 100, id: 1, name: 'Service A' };
const mockResourceByService = {
  id: 1,
  min_quantity: 2,
  resource: mockResource,
  service: mockService,
};
const makeRequestedService = (
  status: RequestedServicesStatus,
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
      status: ServiceOrderStatus.PENDENTE,
      user: { id: 5 },
      vehicle_arrived_at: new Date(),
    },
    status,
    ...overrides,
  }) as any;

describe('RequestedServiceService', () => {
  let service: RequestedServiceService;
  let requestedServiceRepo: any;
  let serviceItemRepo: any;
  let resourceService: any;
  let servicesService: any;
  let stockService: any;
  let manager: any;
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
          provide: getRepositoryToken(ServiceItem),
          useFactory: makeRepository,
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
          provide: StockService,
          useValue: {
            listStockByResourceId: jest.fn(),
            listStockByStockId: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<RequestedServiceService>(RequestedServiceService);
    requestedServiceRepo = module.get(getRepositoryToken(RequestedService));
    serviceItemRepo = module.get(getRepositoryToken(ServiceItem));
    resourceService = module.get(ResourceService);
    servicesService = module.get(ServicesService);
    stockService = module.get(StockService);
  });
  afterEach(async () => jest.clearAllMocks());
  describe('createRequestedServiceOrder', () => {
    it('should create requested services and update budget for each service', async () => {
      resourceService.listResourcesOfAService.mockResolvedValue([
        mockResourceByService,
      ]);
      servicesService.listOneService.mockResolvedValue(mockService);
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
          status: RequestedServicesStatus.RECEBIDA,
        }),
      );
      expect(manager.save).toHaveBeenCalled();
    });
    it('should throw BadRequestException when stock is not found for a resource', async () => {
      resourceService.listResourcesOfAService.mockResolvedValue([
        mockResourceByService,
      ]);
      servicesService.listOneService.mockResolvedValue(mockService);
      resourceService.listOneResource.mockResolvedValue(mockResource);
      stockService.listStockByResourceId.mockResolvedValue(null);
      manager.create.mockReturnValue({ id: 1 });
      manager.save.mockResolvedValue({ id: 1 });
      await expect(
        service.createRequestedServiceOrder(manager, 1, [{ id: 1 }] as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
  describe('getServiceItemsByRequestedServiceId', () => {
    it('should return service items using own repository', async () => {
      const items = [{ amount: 2, id: 1 }];
      serviceItemRepo.find.mockResolvedValue(items);
      const result = await service.getServiceItemsByRequestedServiceId(1);
      expect(serviceItemRepo.find).toHaveBeenCalledWith({
        relations: ['stock', 'requestedService'],
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
      const rs = makeRequestedService(RequestedServicesStatus.RECEBIDA);
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
  describe('getRequestedServices', () => {
    it('should return requested services filtered by status', async () => {
      const rs = [makeRequestedService(RequestedServicesStatus.RECEBIDA)];
      requestedServiceRepo.find.mockResolvedValue(rs as never);
      const result = await service.getRequestedServices(
        RequestedServicesStatus.RECEBIDA,
      );
      expect(requestedServiceRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: RequestedServicesStatus.RECEBIDA },
        }),
      );
      expect(result).toEqual(rs);
    });
    it('should return all requested services when no status is provided', async () => {
      requestedServiceRepo.find.mockResolvedValue([] as never);
      await service.getRequestedServices();
      expect(requestedServiceRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: undefined } }),
      );
    });
  });
  describe('getOnGoingRequestedServices', () => {
    const makeQueryBuilder = (result: RequestedService[]) => {
      const queryBuilder: any = {
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(result as never),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      return queryBuilder;
    };

    it('should return ongoing requested services ordered by status priority', async () => {
      const rs = [
        makeRequestedService(RequestedServicesStatus.EM_EXECUCAO),
        makeRequestedService(RequestedServicesStatus.RECEBIDA),
      ];
      const queryBuilder = makeQueryBuilder(rs);
      requestedServiceRepo.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);

      const result = await service.getOnGoingRequestedServices();

      expect(requestedServiceRepo.createQueryBuilder).toHaveBeenCalledWith(
        'requestedService',
      );
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'requestedService.service',
        'service',
      );
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'requestedService.serviceOrder',
        'serviceOrder',
      );
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'requestedService.serviceItem',
        'serviceItem',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'requestedService.status not in (:...statuses)',
        {
          statuses: [
            RequestedServicesStatus.FINALIZADA,
            RequestedServicesStatus.CANCELADO,
            RequestedServicesStatus.ENTREGUE,
          ],
        },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        expect.stringContaining('CASE "requestedService"."status"'),
        'ASC',
      );
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith(
        '"requestedService"."id"',
        'ASC',
      );
      expect(result).toEqual(rs);
    });

    it('should return empty array when there are no ongoing requested services', async () => {
      const queryBuilder = makeQueryBuilder([]);
      requestedServiceRepo.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);

      const result = await service.getOnGoingRequestedServices();

      expect(result).toEqual([]);
    });
  });
  describe('getEmployeeRequestedServices', () => {
    it('should return requested services for an employee', async () => {
      const rs = [makeRequestedService(RequestedServicesStatus.EM_DIAGNOSTICO)];
      requestedServiceRepo.find.mockResolvedValue(rs as never);
      const result = await service.getEmployeeRequestedServices(10);
      expect(requestedServiceRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { employee: { id: 10 } } }),
      );
      expect(result).toEqual(rs);
    });
  });
  describe('assignRequestedServiceToEmployee', () => {
    it('should assign employee and update status to EM_DIAGNOSTICO', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.RECEBIDA, {
        employee: null as any,
      });
      requestedServiceRepo.findOne.mockResolvedValue(rs as never);
      requestedServiceRepo.update.mockResolvedValue({ affected: 1 } as never);
      await service.assignRequestedServiceToEmployee(10, 1);
      expect(requestedServiceRepo.update).toHaveBeenCalledWith(
        { id: 1 },
        {
          employee: { id: 10 },
          status: RequestedServicesStatus.EM_DIAGNOSTICO,
        },
      );
    });
    it('should throw BadRequestException when service is already assigned', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.RECEBIDA);
      requestedServiceRepo.findOne.mockResolvedValue(rs as never);
      await expect(
        service.assignRequestedServiceToEmployee(10, 1),
      ).rejects.toThrow(
        new BadRequestException('Requested Service already assigned'),
      );
    });
    it('should throw BadRequestException when status is not RECEBIDA', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.EM_DIAGNOSTICO, {
        employee: null as any,
      });
      requestedServiceRepo.findOne.mockResolvedValue(rs as never);
      await expect(
        service.assignRequestedServiceToEmployee(10, 1),
      ).rejects.toThrow(BadRequestException);
    });
    it('should throw BadRequestException when vehicle has not arrived', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.RECEBIDA, {
        employee: null as any,
        serviceOrder: {
          id: 1,
          requestedServices: [],
          status: ServiceOrderStatus.PENDENTE,
          user: { id: 5 },
          vehicle_arrived_at: null,
        } as any,
      });
      requestedServiceRepo.findOne.mockResolvedValue(rs as never);
      await expect(
        service.assignRequestedServiceToEmployee(10, 1),
      ).rejects.toThrow(new BadRequestException('Vehicle have not arrived'));
    });
  });
  describe('reviewRequestedService', () => {
    it('should update status to AGUARDANDO_APROVACAO', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.EM_DIAGNOSTICO);
      const repoMock = {
        findOne: jest.fn().mockResolvedValue(rs as never),
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      manager.getRepository.mockReturnValue(repoMock);
      await service.reviewRequestedService(10, 1);
      expect(repoMock.update).toHaveBeenCalledWith(
        { id: 1 },
        { status: RequestedServicesStatus.AGUARDANDO_APROVACAO },
      );
    });
    it('should throw BadRequestException when employee is not the assigned one', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.EM_DIAGNOSTICO, {
        employee: { id: 99 } as any,
      });
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.reviewRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw BadRequestException when status is not EM_DIAGNOSTICO', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.RECEBIDA);
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.reviewRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('listUserAwaitingApprovalRequestedServices', () => {
    it('should return awaiting approval services for a client', async () => {
      const rs = [
        makeRequestedService(RequestedServicesStatus.AGUARDANDO_APROVACAO),
      ];
      requestedServiceRepo.find.mockResolvedValue(rs as never);
      const result = await service.listUserAwaitingApprovalRequestedServices(5);
      expect(requestedServiceRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            serviceOrder: { user: { id: 5 } },
            status: RequestedServicesStatus.AGUARDANDO_APROVACAO,
          },
        }),
      );
      expect(result).toEqual(rs);
    });
  });
  describe('approveRequestedService', () => {
    it('should approve service and update service order to APROVADO when PENDENTE', async () => {
      const rs = makeRequestedService(
        RequestedServicesStatus.AGUARDANDO_APROVACAO,
      );
      const requestedServiceRepoMock = {
        findOne: jest.fn().mockResolvedValue(rs as never),
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      const serviceOrderRepoMock = {
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      manager.getRepository
        .mockReturnValueOnce(requestedServiceRepoMock)
        .mockReturnValueOnce(requestedServiceRepoMock)
        .mockReturnValueOnce(serviceOrderRepoMock);
      await service.approveRequestedService(5, 1);
      expect(requestedServiceRepoMock.update).toHaveBeenCalledWith(
        { id: 1 },
        { status: RequestedServicesStatus.APROVADO },
      );
      expect(serviceOrderRepoMock.update).toHaveBeenCalledWith(
        { id: 1 },
        { status: ServiceOrderStatus.APROVADO },
      );
    });
    it('should throw BadRequestException when client does not own the service order', async () => {
      const rs = makeRequestedService(
        RequestedServicesStatus.AGUARDANDO_APROVACAO,
      );
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.approveRequestedService(99, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw BadRequestException when status is not AGUARDANDO_APROVACAO', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.RECEBIDA);
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.approveRequestedService(5, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('cancelRequestedService', () => {
    it('should cancel the service and update service order when all services are cancelled', async () => {
      const rs = makeRequestedService(
        RequestedServicesStatus.AGUARDANDO_APROVACAO,
        {
          serviceOrder: {
            id: 1,
            requestedServices: [
              { status: RequestedServicesStatus.AGUARDANDO_APROVACAO },
            ],
            status: ServiceOrderStatus.PENDENTE,
            user: { id: 5 },
            vehicle_arrived_at: new Date(),
          } as any,
        },
      );
      const requestedServiceRepoMock = {
        findOne: jest.fn().mockResolvedValue(rs as never),
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      const serviceOrderRepoMock = {
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      manager.getRepository
        .mockReturnValueOnce(requestedServiceRepoMock)
        .mockReturnValueOnce(requestedServiceRepoMock)
        .mockReturnValueOnce(serviceOrderRepoMock);
      await service.cancelRequestedService(5, 1);
      expect(requestedServiceRepoMock.update).toHaveBeenCalledWith(
        { id: 1 },
        { status: RequestedServicesStatus.CANCELADO },
      );
    });
    it('should throw BadRequestException when client does not own the service order', async () => {
      const rs = makeRequestedService(
        RequestedServicesStatus.AGUARDANDO_APROVACAO,
      );
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.cancelRequestedService(99, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('startRequestedService', () => {
    it('should start the service and decrement stock', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.APROVADO, {
        serviceItem: [
          { amount: 2, id: 1, stock: { amount: 10, id: 1 } },
        ] as any,
      });
      const repoMock = {
        findOne: jest.fn().mockResolvedValue(rs as never),
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      manager.getRepository.mockReturnValue(repoMock);
      manager.decrement.mockResolvedValue(undefined);
      await service.startRequestedService(10, 1);
      expect(manager.decrement).toHaveBeenCalledWith(
        expect.anything(),
        { id: 1 },
        'amount',
        2,
      );
      expect(repoMock.update).toHaveBeenCalledWith(
        { id: 1 },
        expect.objectContaining({
          status: RequestedServicesStatus.EM_EXECUCAO,
        }),
      );
    });
    it('should throw BadRequestException when stock is insufficient', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.APROVADO, {
        serviceItem: [
          { amount: 10, id: 1, stock: { amount: 2, id: 1 } },
        ] as any,
      });
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.startRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.decrement).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException when employee is not assigned', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.APROVADO, {
        employee: { id: 99 } as any,
      });
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.startRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw BadRequestException when status is not APROVADO', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.RECEBIDA);
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.startRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('finishRequestedService', () => {
    it('should finish the service and update status to FINALIZADA', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.EM_EXECUCAO);
      const repoMock = {
        findOne: jest.fn().mockResolvedValue(rs as never),
        update: jest.fn().mockResolvedValue({ affected: 1 } as never),
      };
      manager.getRepository.mockReturnValue(repoMock);
      await service.finishRequestedService(10, 1);
      expect(repoMock.update).toHaveBeenCalledWith(
        { id: 1 },
        expect.objectContaining({ status: RequestedServicesStatus.FINALIZADA }),
      );
    });
    it('should throw BadRequestException when employee is not the assigned one', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.EM_EXECUCAO, {
        employee: { id: 99 } as any,
      });
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.finishRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw BadRequestException when status is not EM_EXECUCAO', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.APROVADO);
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);
      await expect(service.finishRequestedService(10, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('getAverageServiceDuration', () => {
    it('should return average duration and total services analyzed', async () => {
      const started_at = new Date('2024-01-01T08:00:00Z');
      const finished_at = new Date('2024-01-01T10:00:00Z');
      requestedServiceRepo.find.mockResolvedValue([
        { finished_at, started_at },
        { finished_at, started_at },
      ] as never);
      const result = await service.getAverageServiceDuration(1);
      expect(result.averageDurationInHours).toBe(2);
      expect(result.totalServicesAnalyzed).toBe(2);
    });
    it('should return 0 hours when no services are found', async () => {
      requestedServiceRepo.find.mockResolvedValue([] as never);
      const result = await service.getAverageServiceDuration();
      expect(result.averageDurationInHours).toBe(0);
      expect(result.totalServicesAnalyzed).toBe(0);
    });
  });
  describe('calculateRequestedServiceCost', () => {
    it('should calculate cost correctly', async () => {
      resourceService.listResourcesOfAService.mockResolvedValue([mockResourceByService]);
      servicesService.listOneService.mockResolvedValue(mockService);
      resourceService.listOneResource.mockResolvedValue(mockResource);

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
      const rs = makeRequestedService(RequestedServicesStatus.EM_DIAGNOSTICO);

      stockService.listStockByStockId.mockResolvedValue(mockStock);
      servicesService.listOneService.mockResolvedValue(mockService);
      stockService.listStockByStockId.mockResolvedValue(mockStock);
      resourceService.listOneResource.mockResolvedValue(mockResource);

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
          stock: { id: mockServiceItemDTO.stock_id },
        },
        ['stock.id', 'requestedService.id'],
      );
    });

    it('should throw BadRequestException when stock is not found', async () => {
      stockService.listStockByStockId.mockResolvedValue(null);

      await expect(
        service.upsertItemOnRequestedService(mockServiceItemDTO as any, 10),
      ).rejects.toThrow(new BadRequestException('Estoque não identificado.'));
    });

    it('should throw BadRequestException when employee is not the assigned one', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.EM_DIAGNOSTICO, {
        employee: { id: 99 } as any,
      });
      stockService.listStockByStockId.mockResolvedValue(mockStock);
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);

      await expect(
        service.upsertItemOnRequestedService(mockServiceItemDTO as any, 10),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when status is not EM_DIAGNOSTICO', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.RECEBIDA);
      stockService.listStockByStockId.mockResolvedValue(mockStock);
      const repoMock = { findOne: jest.fn().mockResolvedValue(rs as never) };
      manager.getRepository.mockReturnValue(repoMock);

      await expect(
        service.upsertItemOnRequestedService(mockServiceItemDTO as any, 10),
      ).rejects.toThrow(BadRequestException);
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
          status: ServiceOrderStatus.PENDENTE,
          user: { id: 5 },
          vehicle_arrived_at: new Date(),
        },
        status: RequestedServicesStatus.EM_DIAGNOSTICO,
      },
      stock: { id: 1 },
    };

    it('should delete the item and update cost successfully', async () => {
      servicesService.listOneService.mockResolvedValue(mockService);
      stockService.listStockByStockId.mockResolvedValue(mockStock);
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
        new BadRequestException('Item não encontrado na ordem de serviço fornecida.'),
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
        new BadRequestException('Item não encontrado na ordem de serviço fornecida.'),
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

    it('should throw BadRequestException when status is not EM_DIAGNOSTICO', async () => {
      const itemWithWrongStatus = {
        ...mockItem,
        requestedService: {
          ...mockItem.requestedService,
          status: RequestedServicesStatus.RECEBIDA,
        },
      };
      const serviceItemRepoMock = {
        findOne: jest.fn().mockResolvedValue(itemWithWrongStatus as never),
      };
      manager.getRepository.mockReturnValue(serviceItemRepoMock);

      await expect(
        service.deleteRequestedServiceItem(1, 1, 10),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateRequestedService (clientId branch)', () => {
    it('should throw BadRequestException when clientId does not match service order user', async () => {
      const rs = makeRequestedService(RequestedServicesStatus.AGUARDANDO_APROVACAO, {
        serviceOrder: {
          id: 1,
          requestedServices: [],
          status: ServiceOrderStatus.PENDENTE,
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
