import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RequestedServicesStatus, ServiceOrderStatus } from '../../../common/enums/services/services.enum';
import { RequestedServiceService } from '../../../core/application/services/requestedService.service';
import { ServiceOrderService } from '../../../core/application/services/serviceOrder.service';
import { ServiceOrderDTO } from '../../../frameworks/primary/dto/services/serviceOrder.model';
import { ServiceOrder } from '../../../frameworks/secondary/services/serviceOrder.entity';
import { User } from '../../../frameworks/secondary/users/users.entity';
import { StatusClient } from '../../../modules/httpClient/status.client';
jest.mock('@nestjs/axios', () => ({ HttpService: class { } }));

const mockUser: User = {
  document: '12345678901',
  id: 1,
  name: 'John Doe',
} as any;

const mockServiceOrderDTO: ServiceOrderDTO = {
  services: [{}, {} as any],
  userDocument: '12345678901',
  vehicle_id: 1,
};

const mockServiceOrder: ServiceOrder = {
  budget: 0,
  cost: 0,
  id: 1,
  requestedServices: [],
  user: mockUser,
  vehicle: { id: 1 } as any,
  vehicle_arrived_at: null,
  vehicle_delivered_at: null,
} as any;

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockManager = () => {
  const manager: any = {
    create: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  return manager;
};

const mockDataSource = (manager: any) => ({
  transaction: jest.fn().mockImplementation((cb: any) => cb(manager)),
});

const mockRequestedServiceService = () => ({
  createRequestedServiceOrder: jest.fn(),
});

// O StatusClient só expõe setStatus (o status agora vive em um serviço próprio)
const mockStatusClient = () => ({
  setStatus: jest.fn<(payload: unknown) => Promise<void>>().mockResolvedValue(undefined),
});

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;
  let repository: any;
  let dataSource: any;
  let requestedServices: any;
  let statusClient: any;
  let manager: any;

  beforeEach(async () => {
    manager = mockManager();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderService,
        {
          provide: getRepositoryToken(ServiceOrder),
          useFactory: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource(manager),
        },
        {
          provide: RequestedServiceService,
          useFactory: mockRequestedServiceService,
        },
        {
          provide: StatusClient,
          useFactory: mockStatusClient,
        },
      ],
    }).compile();

    service = module.get<ServiceOrderService>(ServiceOrderService);
    repository = module.get(getRepositoryToken(ServiceOrder));
    dataSource = module.get(DataSource);
    requestedServices = module.get(RequestedServiceService);
    statusClient = module.get(StatusClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createServiceOrder', () => {
    it('should create a service order within a transaction and set status RECEBIDA', async () => {
      manager.findOne.mockResolvedValue(mockUser);
      manager.create.mockReturnValue({ ...mockServiceOrder });
      manager.save.mockResolvedValue({ ...mockServiceOrder, id: 1 });
      requestedServices.createRequestedServiceOrder.mockResolvedValue(undefined);

      const result = await service.createServiceOrder(mockServiceOrderDTO);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.findOne).toHaveBeenCalledWith(User, {
        where: { document: mockServiceOrderDTO.userDocument },
      });
      expect(manager.create).toHaveBeenCalledWith(ServiceOrder, {
        budget: 0,
        cost: 0,
        status: ServiceOrderStatus.PENDENTE,
        user: { id: mockUser.id },
        vehicle: { id: mockServiceOrderDTO.vehicle_id },
      });
      expect(manager.save).toHaveBeenCalledTimes(1);
      expect(requestedServices.createRequestedServiceOrder).toHaveBeenCalledWith(
        manager,
        1,
        mockServiceOrderDTO.services,
      );
      expect(statusClient.setStatus).toHaveBeenCalledTimes(1);
      expect(statusClient.setStatus).toHaveBeenCalledWith({
        service_order_number: 1,
        status: RequestedServicesStatus.RECEBIDA,
      });
      expect(result).toBe(1);
    });

    it('should throw BadRequestException when user is not found', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.createServiceOrder(mockServiceOrderDTO)).rejects.toThrow(
        new BadRequestException('No user with provided document'),
      );
      expect(manager.create).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
      expect(requestedServices.createRequestedServiceOrder).not.toHaveBeenCalled();
      expect(statusClient.setStatus).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown inside the transaction without setting status', async () => {
      manager.findOne.mockResolvedValue(mockUser);
      manager.create.mockReturnValue(mockServiceOrder);
      manager.save.mockRejectedValue(new Error('DB error'));

      await expect(service.createServiceOrder(mockServiceOrderDTO)).rejects.toThrow('DB error');
      expect(statusClient.setStatus).not.toHaveBeenCalled();
    });

    it('should propagate the error when the status service fails', async () => {
      manager.findOne.mockResolvedValue(mockUser);
      manager.create.mockReturnValue({ ...mockServiceOrder });
      manager.save.mockResolvedValue({ ...mockServiceOrder, id: 1 });
      requestedServices.createRequestedServiceOrder.mockResolvedValue(undefined);
      statusClient.setStatus.mockRejectedValue(new Error('status service down'));

      await expect(service.createServiceOrder(mockServiceOrderDTO)).rejects.toThrow(
        'status service down',
      );
    });
  });

  describe('getOrders', () => {
    it('should return all service orders with relations', async () => {
      repository.find.mockResolvedValue([mockServiceOrder] as never);

      const result = await service.getOrders();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['vehicle', 'user', 'requestedServices'],
      });
      expect(result).toEqual([mockServiceOrder]);
    });

    it('should return empty array when no orders exist', async () => {
      repository.find.mockResolvedValue([] as never);

      const result = await service.getOrders();

      expect(result).toEqual([]);
    });

    it('should propagate errors thrown by find', async () => {
      repository.find.mockRejectedValue(new Error('DB error') as never);

      await expect(service.getOrders()).rejects.toThrow('DB error');
    });
  });

  describe('getClientOrders', () => {
    it('should return the orders of the client with relations', async () => {
      repository.find.mockResolvedValue([mockServiceOrder] as never);

      const result = await service.getClientOrders(1);

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['vehicle', 'user', 'requestedServices'],
        where: { user: { id: 1 } },
      });
      expect(result).toEqual([mockServiceOrder]);
    });
  });

  describe('getOrderDetail', () => {
    it('should return a service order when found', async () => {
      repository.findOne.mockResolvedValue(mockServiceOrder as never);

      const result = await service.getOrderDetail(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        relations: ['vehicle', 'user', 'requestedServices'],
        where: { id: 1 },
      });
      expect(result).toEqual(mockServiceOrder);
    });

    it('should throw NotFoundException when service order is not found', async () => {
      repository.findOne.mockResolvedValue(null as never);

      await expect(service.getOrderDetail(99)).rejects.toThrow(
        new NotFoundException('Service Order not found'),
      );
    });

    it('should propagate errors thrown by findOne', async () => {
      repository.findOne.mockRejectedValue(new Error('DB error') as never);

      await expect(service.getOrderDetail(1)).rejects.toThrow('DB error');
    });
  });

  describe('setVehicleArrived', () => {
    it('should set vehicle_arrived_at and save the service order', async () => {
      const arrivedAt = '2024-01-01T10:00:00Z';
      repository.findOne.mockResolvedValue({ ...mockServiceOrder } as never);
      repository.save.mockResolvedValue(undefined as never);

      await service.setVehicleArrived(1, arrivedAt);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ vehicle_arrived_at: new Date(arrivedAt) }),
      );
    });

    it('should throw NotFoundException when service order is not found', async () => {
      repository.findOne.mockResolvedValue(null as never);

      await expect(service.setVehicleArrived(99, '2024-01-01T10:00:00Z')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by save', async () => {
      repository.findOne.mockResolvedValue({ ...mockServiceOrder } as never);
      repository.save.mockRejectedValue(new Error('DB error') as never);

      await expect(service.setVehicleArrived(1, '2024-01-01T10:00:00Z')).rejects.toThrow('DB error');
    });
  });

  describe('deliverServiceOrder', () => {
    const deliveredAt = '2024-01-02T10:00:00Z';

    it('should set status ENTREGUE and save vehicle_delivered_at', async () => {
      repository.findOne.mockResolvedValue({ ...mockServiceOrder } as never);
      repository.save.mockResolvedValue(undefined as never);

      await service.deliverServiceOrder(1, deliveredAt);

      expect(statusClient.setStatus).toHaveBeenCalledTimes(1);
      expect(statusClient.setStatus).toHaveBeenCalledWith({
        service_order_number: 1,
        status: RequestedServicesStatus.ENTREGUE,
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ vehicle_delivered_at: new Date(deliveredAt) }),
      );
    });

    it('should throw BadRequestException when the status service rejects the delivery', async () => {
      statusClient.setStatus.mockRejectedValue(new Error('Service order cannot be delivered.'));

      await expect(service.deliverServiceOrder(1, deliveredAt)).rejects.toThrow(
        new BadRequestException('Service order cannot be delivered'),
      );
      expect(repository.findOne).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    // Comportamento atual: o try/catch converte QUALQUER erro em BadRequestException,
    // inclusive o NotFoundException vindo de getOrderDetail.
    it('should throw BadRequestException when service order is not found', async () => {
      repository.findOne.mockResolvedValue(null as never);

      await expect(service.deliverServiceOrder(99, deliveredAt)).rejects.toThrow(
        new BadRequestException('Service order cannot be delivered'),
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});