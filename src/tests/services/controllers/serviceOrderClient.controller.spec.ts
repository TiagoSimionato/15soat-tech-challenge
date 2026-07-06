import type { Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestedServicesStatus, ServiceOrderStatus } from '../../../common/enums/services/services.enum';
import { LegalNature } from '../../../common/enums/users/legalNature.enum';
import { RequestedServiceService } from '../../../core/application/services/requestedService.service';
import { ServiceOrderService } from '../../../core/application/services/serviceOrder.service';
import { ServiceOrderClientController } from '../../../frameworks/primary/controllers/services/serviceOrderClient.controller';
import { ServiceOrderDTO } from '../../../frameworks/primary/dto/services/serviceOrder.model';
import { RequestedService } from '../../../frameworks/secondary/services/requestedService.entity';
import { ServiceItem } from '../../../frameworks/secondary/services/serviceItem.entity';
import { ServiceOrder } from '../../../frameworks/secondary/services/serviceOrder.entity';

describe('serviceOrderClientController', () => {
  let controller: ServiceOrderClientController;

  const mockServiceOrderService = {
    createServiceOrder: jest.fn<(order: ServiceOrderDTO) => Promise<void>>(),
    getOrderDetail: jest.fn<(serviceOrderId: number) => Promise<ServiceOrder>>(),
  };

  const mockRequestedServiceService = {
    approveRequestedService: jest.fn<(clientId: number, requestedServiceId: number) => Promise<void>>(),
    cancelRequestedService: jest.fn<(clientId: number, requestedServiceId: number) => Promise<void>>(),
    getRequestedService: jest.fn<(requestedServiceId: number) => Promise<RequestedService>>(),
    getServiceItemsByRequestedServiceId: jest.fn<(requestedServiceId: number) => Promise<null | ServiceItem[]>>(),
    listUserAwaitingApprovalRequestedServices: jest.fn<(clientId: number) => Promise<RequestedService[]>>(),
  };

  const mockServiceOrder: ServiceOrderDTO = {
    services: [] as any,
    userDocument: '123456789',
    vehicle_id: 1,
  };

  const mockRequestedService: RequestedService = {
    cost: 0,
    employee: {} as any,
    finished_at: new Date('2027-01-01T00:00:00Z'),
    id: 1,
    service: {} as any,
    serviceItem: [] as any,
    serviceOrder: {
      budget: 0,
      cost: 0,
      id: 1,
      requestedServices: [] as any,
      status: ServiceOrderStatus.PENDENTE,
      user: {
        document: '12345678901',
        id: 1,
        legalNature: LegalNature.PF,
        name: 'John Doe',
        username: 'johndoe',
      } as any,
      vehicle: { id: 1 } as any,
      vehicle_arrived_at: new Date(),
      vehicle_delivered_at: new Date('2027-01-01T00:00:00Z'),
    },
    started_at: new Date(),
    status: RequestedServicesStatus.RECEBIDA,
  };

  const mockServiceItem: ServiceItem = {
    amount: 2,
    id: 1,
    requestedService: mockRequestedService,
    stock: {} as any,
  };

  const mockResponse = {
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrderClientController],
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

    controller = module.get<ServiceOrderClientController>(ServiceOrderClientController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createServiceOrder', () => {
    it('should create a service order and return 201', async () => {
      mockServiceOrderService.createServiceOrder.mockResolvedValue(undefined);

      await controller.createServiceOrder(mockServiceOrder, mockResponse);

      expect(mockServiceOrderService.createServiceOrder).toHaveBeenCalledWith(mockServiceOrder);
      expect(mockServiceOrderService.createServiceOrder).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Ordem de serviço criada com sucesso.' });
    });
  });

  describe('getAwaitingApprovalRequestedServices', () => {
    it('should return awaiting approval requested services', async () => {
      const clientId = 1;
      const mockServices = [mockRequestedService];
      mockRequestedServiceService.listUserAwaitingApprovalRequestedServices.mockResolvedValue(mockServices);

      const result = await controller.getAwaitingApprovalRequestedServices(clientId);

      expect(mockRequestedServiceService.listUserAwaitingApprovalRequestedServices).toHaveBeenCalledWith(clientId);
      expect(result).toEqual(mockServices);
    });

    it('should return empty array when no services awaiting approval', async () => {
      const clientId = 99;
      mockRequestedServiceService.listUserAwaitingApprovalRequestedServices.mockResolvedValue([]);

      const result = await controller.getAwaitingApprovalRequestedServices(clientId);

      expect(result).toEqual([]);
    });

    it('should return multiple awaiting approval services', async () => {
      const clientId = 1;
      const mockServices = [
        mockRequestedService,
        { ...mockRequestedService, id: 2 },
      ];
      mockRequestedServiceService.listUserAwaitingApprovalRequestedServices.mockResolvedValue(mockServices as any);

      const result = await controller.getAwaitingApprovalRequestedServices(clientId);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockServices);
    });
  });

  describe('getRequestedServiceDetail', () => {
    it('should return requested service detail', async () => {
      const requestedServiceId = 1;
      mockRequestedServiceService.getRequestedService.mockResolvedValue(mockRequestedService);

      await controller.getRequestedServiceDetail(requestedServiceId, mockResponse);

      expect(mockRequestedServiceService.getRequestedService).toHaveBeenCalledWith(requestedServiceId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockRequestedService);
    });

    it('should accept different requested service IDs', async () => {
      const requestedServiceId = 5;
      mockRequestedServiceService.getRequestedService.mockResolvedValue(mockRequestedService);

      await controller.getRequestedServiceDetail(requestedServiceId, mockResponse);

      expect(mockRequestedServiceService.getRequestedService).toHaveBeenCalledWith(requestedServiceId);
    });
  });

  describe('getServiceItemsByRequestedServiceId', () => {
    it('should return service items with 200 status', async () => {
      const requestedServiceId = 1;
      const mockItems = [mockServiceItem];
      mockRequestedServiceService.getServiceItemsByRequestedServiceId.mockResolvedValue(mockItems);

      await controller.getServiceItemsByRequestedServiceId(requestedServiceId, mockResponse);

      expect(mockRequestedServiceService.getServiceItemsByRequestedServiceId).toHaveBeenCalledWith(
        requestedServiceId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockItems);
    });

    it('should return null when no items exist', async () => {
      const requestedServiceId = 1;
      mockRequestedServiceService.getServiceItemsByRequestedServiceId.mockResolvedValue(null);

      await controller.getServiceItemsByRequestedServiceId(requestedServiceId, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(null);
    });

    it('should return multiple service items', async () => {
      const requestedServiceId = 1;
      const mockItems = [
        mockServiceItem,
        { ...mockServiceItem, id: 2, quantity: 3 },
      ];
      mockRequestedServiceService.getServiceItemsByRequestedServiceId.mockResolvedValue(mockItems as any);

      await controller.getServiceItemsByRequestedServiceId(requestedServiceId, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockItems);
    });
  });

  describe('getOrderDetail', () => {
    it('should return order detail', async () => {
      const serviceOrderId = 1;
      mockServiceOrderService.getOrderDetail.mockResolvedValue(mockServiceOrder as any);

      await controller.getOrderDetail(serviceOrderId, mockResponse);

      expect(mockServiceOrderService.getOrderDetail).toHaveBeenCalledWith(serviceOrderId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockServiceOrder);
    });

    it('should accept different service order IDs', async () => {
      const serviceOrderId = 10;
      mockServiceOrderService.getOrderDetail.mockResolvedValue(1 as any);

      await controller.getOrderDetail(serviceOrderId, mockResponse);

      expect(mockServiceOrderService.getOrderDetail).toHaveBeenCalledWith(serviceOrderId);
    });
  });

  describe('approveRequestedService', () => {
    it('should approve requested service', async () => {
      const requestedServiceId = 1;
      const clientId = 1;
      mockRequestedServiceService.approveRequestedService.mockResolvedValue(undefined);

      await controller.approveRequestedService(requestedServiceId, clientId);

      expect(mockRequestedServiceService.approveRequestedService).toHaveBeenCalledWith(clientId, requestedServiceId);
    });

    it('should accept different service and client IDs', async () => {
      const requestedServiceId = 5;
      const clientId = 3;
      mockRequestedServiceService.approveRequestedService.mockResolvedValue(undefined);

      await controller.approveRequestedService(requestedServiceId, clientId);

      expect(mockRequestedServiceService.approveRequestedService).toHaveBeenCalledWith(clientId, requestedServiceId);
    });
  });

  describe('cancelRequestedService', () => {
    it('should cancel requested service', async () => {
      const requestedServiceId = 1;
      const clientId = 1;
      mockRequestedServiceService.cancelRequestedService.mockResolvedValue(undefined);

      await controller.cancelRequestedService(requestedServiceId, clientId);

      expect(mockRequestedServiceService.cancelRequestedService).toHaveBeenCalledWith(clientId, requestedServiceId);
    });

    it('should accept different service and client IDs', async () => {
      const requestedServiceId = 5;
      const clientId = 3;
      mockRequestedServiceService.cancelRequestedService.mockResolvedValue(undefined);

      await controller.cancelRequestedService(requestedServiceId, clientId);

      expect(mockRequestedServiceService.cancelRequestedService).toHaveBeenCalledWith(clientId, requestedServiceId);
    });
  });

  describe('Controller instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(controller.createServiceOrder).toBeDefined();
      expect(controller.getAwaitingApprovalRequestedServices).toBeDefined();
      expect(controller.getRequestedServiceDetail).toBeDefined();
      expect(controller.getServiceItemsByRequestedServiceId).toBeDefined();
      expect(controller.getOrderDetail).toBeDefined();
      expect(controller.approveRequestedService).toBeDefined();
      expect(controller.cancelRequestedService).toBeDefined();
    });
  });
});
