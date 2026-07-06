import type { Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestedServicesStatus, ServiceOrderStatus } from '../../../common/enums/services/services.enum';
import { RequestedServiceService } from '../../../core/application/services/requestedService.service';
import { ServiceOrderService } from '../../../core/application/services/serviceOrder.service';
import { ServiceOrderEmployeeController } from '../../../frameworks/primary/controllers/services/serviceOrderEmployee.controller';
import { ServiceItemDTO } from '../../../frameworks/primary/dto/services/serviceItem.model';
import { DeliverServiceOrderDTO, VehicleArrivedDTO } from '../../../frameworks/primary/dto/services/serviceOrder.model';
import { RequestedService } from '../../../frameworks/secondary/services/requestedService.entity';
import { ServiceOrder } from '../../../frameworks/secondary/services/serviceOrder.entity';

describe('serviceOrderEmployeeController', () => {
  let controller: ServiceOrderEmployeeController;

  const mockServiceOrderService = {
    deliverServiceOrder: jest.fn<(id: number, deliveredAt: string) => Promise<void>>(),
    getOrders: jest.fn<() => Promise<null | ServiceOrder[]>>(),
    setVehicleArrived: jest.fn<(id: number, arrivedAt: string) => Promise<void>>(),
  };

  const mockRequestedServiceService = {
    assignRequestedServiceToEmployee: jest.fn<(employeeId: number, requestedServiceId: number) => Promise<void>>(),
    deleteRequestedServiceItem: jest.fn<(requestedServiceId: number, serviceItemId: number, employeeId: number) => Promise<void>>(),
    finishRequestedService: jest.fn<(employeeId: number, requestedServiceId: number) => Promise<void>>(),
    getAverageServiceDuration: jest.fn<(serviceId?: number) => Promise<any>>(),
    getEmployeeRequestedServices: jest.fn<(employeeId: number) => Promise<RequestedService[]>>(),
    getOnGoingRequestedServices: jest.fn<() => Promise<RequestedService[]>>(),
    getRequestedServices: jest.fn<(status: RequestedServicesStatus) => Promise<RequestedService[]>>(),
    reviewRequestedService: jest.fn<(employeeId: number, requestedServiceId: number) => Promise<void>>(),
    startRequestedService: jest.fn<(employeeId: number, requestedServiceId: number) => Promise<void>>(),
    upsertItemOnRequestedService: jest.fn<(item: ServiceItemDTO, employeeId: number) => Promise<void>>(),
  };

  const mockServiceOrder: ServiceOrder = {
    budget: 0,
    cost: 0,
    id: 1,
    requestedServices: [],
    status: ServiceOrderStatus.PENDENTE,
    user: {} as any,
    vehicle: [] as any,
    vehicle_arrived_at: new Date(),
    vehicle_delivered_at: new Date('2027-01-01T00:00:00Z'),
  };

  const mockRequestedService: RequestedService = {
    cost: 0,
    employee: {} as any,
    finished_at: new Date('2027-01-01T00:00:00Z'),
    id: 1,
    service: {} as any,
    serviceItem: [] as any,
    serviceOrder: mockServiceOrder,
    started_at: new Date(),
    status: RequestedServicesStatus.RECEBIDA,
  };

  const mockResponse = {
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrderEmployeeController],
      providers: [
        {
          provide: ServiceOrderService,
          useValue: mockServiceOrderService,
        },
        {
          provide: RequestedServiceService,
          useValue: mockRequestedServiceService,
        },
      ],
    }).compile();

    controller = module.get<ServiceOrderEmployeeController>(ServiceOrderEmployeeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should return all service orders with 200 status', async () => {
      const mockOrders = [mockServiceOrder];
      mockServiceOrderService.getOrders.mockResolvedValue(mockOrders);

      await controller.getOrders(mockResponse);

      expect(mockServiceOrderService.getOrders).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockOrders);
    });

    it('should return null when no orders exist', async () => {
      mockServiceOrderService.getOrders.mockResolvedValue(null);

      await controller.getOrders(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(null);
    });
  });

  describe('upsertItemOnRequestedService', () => {
    it('should upsert an item and return 201', async () => {
      const serviceItemDTO: ServiceItemDTO = {
        amount: 2,
        requested_service_id: 1,
        stock_id: 1,
      };
      const employeeId = 1;
      mockRequestedServiceService.upsertItemOnRequestedService.mockResolvedValue(undefined);

      await controller.upsertItemOnRequestedService(serviceItemDTO, mockResponse, employeeId);

      expect(mockRequestedServiceService.upsertItemOnRequestedService).toHaveBeenCalledWith(serviceItemDTO, employeeId);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Item vínculado ao serviço com sucesso.' });
    });
  });

  describe('getOnGoingRequestedServices', () => {
    it('should return ongoing requested services', async () => {
      const mockServices = [mockRequestedService];
      mockRequestedServiceService.getOnGoingRequestedServices.mockResolvedValue(mockServices);

      const result = await controller.getOnGoingRequestedServices();

      expect(mockRequestedServiceService.getOnGoingRequestedServices).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockServices);
    });

    it('should return empty array when no ongoing services exist', async () => {
      mockRequestedServiceService.getOnGoingRequestedServices.mockResolvedValue([]);

      const result = await controller.getOnGoingRequestedServices();

      expect(result).toEqual([]);
    });
  });

  describe('getReceivedRequestedService', () => {
    it('should return received requested services', async () => {
      const mockServices = [mockRequestedService];
      mockRequestedServiceService.getRequestedServices.mockResolvedValue(mockServices);

      const result = await controller.getReceivedRequestedService();

      expect(mockRequestedServiceService.getRequestedServices).toHaveBeenCalledWith(RequestedServicesStatus.RECEBIDA);
      expect(result).toEqual(mockServices);
    });

    it('should return empty array when no services exist', async () => {
      mockRequestedServiceService.getRequestedServices.mockResolvedValue([]);

      const result = await controller.getReceivedRequestedService();

      expect(result).toEqual([]);
    });
  });

  describe('getAverageDuration', () => {
    it('should return average duration without serviceId', async () => {
      const averageData = { averageDuration: 120 };
      mockRequestedServiceService.getAverageServiceDuration.mockResolvedValue(averageData);

      const result = await controller.getAverageDuration(undefined);

      expect(mockRequestedServiceService.getAverageServiceDuration).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(averageData);
    });

    it('should return average duration with serviceId', async () => {
      const averageData = { averageDuration: 150 };
      mockRequestedServiceService.getAverageServiceDuration.mockResolvedValue(averageData);

      const result = await controller.getAverageDuration('1');

      expect(mockRequestedServiceService.getAverageServiceDuration).toHaveBeenCalledWith(1);
      expect(result).toEqual(averageData);
    });

    it('should handle invalid serviceId string', async () => {
      const averageData = { averageDuration: 120 };
      mockRequestedServiceService.getAverageServiceDuration.mockResolvedValue(averageData);

      const result = await controller.getAverageDuration('invalid');

      expect(result).toEqual(averageData);
    });
  });

  describe('getEmployeeRequestedService', () => {
    it('should return employee requested services', async () => {
      const employeeId = 1;
      const mockServices = [mockRequestedService];
      mockRequestedServiceService.getEmployeeRequestedServices.mockResolvedValue(mockServices);

      const result = await controller.getEmployeeRequestedService(employeeId);

      expect(mockRequestedServiceService.getEmployeeRequestedServices).toHaveBeenCalledWith(employeeId);
      expect(result).toEqual(mockServices);
    });

    it('should return empty array when employee has no services', async () => {
      const employeeId = 99;
      mockRequestedServiceService.getEmployeeRequestedServices.mockResolvedValue([]);

      const result = await controller.getEmployeeRequestedService(employeeId);

      expect(result).toEqual([]);
    });
  });

  describe('deleteRequestedServiceItem', () => {
    it('should delete an item and return 200', async () => {
      const requestedServiceId = 1;
      const serviceItemId = 1;
      const employeeId = 1;
      mockRequestedServiceService.deleteRequestedServiceItem.mockResolvedValue(undefined);

      await controller.deleteRequestedServiceItem(requestedServiceId, serviceItemId, mockResponse, employeeId);

      expect(mockRequestedServiceService.deleteRequestedServiceItem).toHaveBeenCalledWith(
        requestedServiceId,
        serviceItemId,
        employeeId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Item deletado com sucesso.' });
    });
  });

  describe('assignRequestedServiceToEmployee', () => {
    it('should assign requested service to employee', async () => {
      const requestedServiceId = 1;
      const employeeId = 1;
      mockRequestedServiceService.assignRequestedServiceToEmployee.mockResolvedValue(undefined);

      await controller.assignRequestedServiceToEmployee(requestedServiceId, employeeId);

      expect(mockRequestedServiceService.assignRequestedServiceToEmployee).toHaveBeenCalledWith(
        employeeId,
        requestedServiceId,
      );
    });
  });

  describe('reviewRequestedService', () => {
    it('should review requested service', async () => {
      const requestedServiceId = 1;
      const employeeId = 1;
      mockRequestedServiceService.reviewRequestedService.mockResolvedValue(undefined);

      await controller.reviewRequestedService(requestedServiceId, employeeId);

      expect(mockRequestedServiceService.reviewRequestedService).toHaveBeenCalledWith(employeeId, requestedServiceId);
    });
  });

  describe('startRequestedService', () => {
    it('should start requested service', async () => {
      const requestedServiceId = 1;
      const employeeId = 1;
      mockRequestedServiceService.startRequestedService.mockResolvedValue(undefined);

      await controller.startRequestedService(requestedServiceId, employeeId);

      expect(mockRequestedServiceService.startRequestedService).toHaveBeenCalledWith(employeeId, requestedServiceId);
    });
  });

  describe('finishRequestedService', () => {
    it('should finish requested service', async () => {
      const requestedServiceId = 1;
      const employeeId = 1;
      mockRequestedServiceService.finishRequestedService.mockResolvedValue(undefined);

      await controller.finishRequestedService(requestedServiceId, employeeId);

      expect(mockRequestedServiceService.finishRequestedService).toHaveBeenCalledWith(
        employeeId,
        requestedServiceId,
      );
    });
  });

  describe('deliverRequestedService', () => {
    it('should deliver requested service', async () => {
      const id = 1;
      const deliverDto: DeliverServiceOrderDTO = {
        vehicle_delivered_at: '2024-01-01T10:00:00Z',
      };
      mockServiceOrderService.deliverServiceOrder.mockResolvedValue(undefined);

      await controller.deliverRequestedService(id, deliverDto);

      expect(mockServiceOrderService.deliverServiceOrder).toHaveBeenCalledWith(id, deliverDto.vehicle_delivered_at);
    });
  });

  describe('setVehicleArrived', () => {
    it('should set vehicle as arrived', async () => {
      const id = 1;
      const arrivedDto: VehicleArrivedDTO = {
        vehicle_arrived_at: '2024-01-01T09:00:00Z',
      };
      mockServiceOrderService.setVehicleArrived.mockResolvedValue(undefined);

      await controller.setVehicleArrived(id, arrivedDto);

      expect(mockServiceOrderService.setVehicleArrived).toHaveBeenCalledWith(id, arrivedDto.vehicle_arrived_at);
    });
  });

  describe('Controller instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(controller.getOrders).toBeDefined();
      expect(controller.upsertItemOnRequestedService).toBeDefined();
      expect(controller.getReceivedRequestedService).toBeDefined();
      expect(controller.getAverageDuration).toBeDefined();
      expect(controller.getEmployeeRequestedService).toBeDefined();
      expect(controller.getOnGoingRequestedServices).toBeDefined();
      expect(controller.deleteRequestedServiceItem).toBeDefined();
      expect(controller.assignRequestedServiceToEmployee).toBeDefined();
      expect(controller.reviewRequestedService).toBeDefined();
      expect(controller.startRequestedService).toBeDefined();
      expect(controller.finishRequestedService).toBeDefined();
      expect(controller.deliverRequestedService).toBeDefined();
      expect(controller.setVehicleArrived).toBeDefined();
    });
  });
});
