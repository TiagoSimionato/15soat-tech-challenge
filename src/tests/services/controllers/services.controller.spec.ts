import type { DeleteResult, UpdateResult } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ServicesService } from '../../../core/application/services/services.service';
import { ServicesController } from '../../../frameworks/primary/controllers/services/services.controller';
import { ServicesDTO } from '../../../frameworks/primary/dto/services/services.model';
import { Services } from '../../../frameworks/secondary/services/services.entity';

describe('servicesController', () => {
  let controller: ServicesController;

  const mockServicesService = {
    createService: jest.fn<(services: ServicesDTO) => Promise<void>>(),
    deleteService: jest.fn<(id: number) => Promise<DeleteResult>>(),
    listOneService: jest.fn<(id: number) => Promise<null | Services>>(),
    listServices: jest.fn<() => Promise<Services[]>>(),
    updateService: jest.fn<(id: number, services: ServicesDTO) => Promise<UpdateResult>>(),
  };

  const mockServicesEntity: Services = {
    cost: 100,
    id: 1,
    name: 'Service A',
    requestedService: [] as any,
    resources: [],
  };

  const mockServicesDTO: ServicesDTO = {
    cost: 100,
    name: 'Service A',
  };

  const mockUpdateResult = {
    affected: 1,
    generatedMaps: [],
    raw: {},
  };

  const mockDeleteResult = {
    affected: 1,
    raw: {},
  };

  const mockResponse = {
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createService', () => {
    it('should create a service and return 201', async () => {
      mockServicesService.createService.mockResolvedValue(undefined);

      await controller.createService(mockServicesDTO, mockResponse);

      expect(mockServicesService.createService).toHaveBeenCalledWith(mockServicesDTO);
      expect(mockServicesService.createService).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Serviço criado com sucesso.' });
    });
  });

  describe('listAllServices', () => {
    it('should return all services with 200 status', async () => {
      const mockServices = [mockServicesEntity];
      mockServicesService.listServices.mockResolvedValue(mockServices);

      await controller.listAllServices(mockResponse);

      expect(mockServicesService.listServices).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockServices);
    });

    it('should return empty array when no services exist', async () => {
      mockServicesService.listServices.mockResolvedValue([]);

      await controller.listAllServices(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith([]);
    });

    it('should return multiple services', async () => {
      const mockServices = [
        mockServicesEntity,
        { cost: 200, id: 2, name: 'Service B', requestedService: [], resources: [] },
      ];
      mockServicesService.listServices.mockResolvedValue(mockServices as never);

      await controller.listAllServices(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockServices);
    });
  });

  describe('listOneService', () => {
    it('should return a service when found', async () => {
      mockServicesService.listOneService.mockResolvedValue(mockServicesEntity);

      await controller.listOneService(1, mockResponse);

      expect(mockServicesService.listOneService).toHaveBeenCalledWith(1);
      expect(mockServicesService.listOneService).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockServicesEntity);
    });

    it('should return 404 when service is not found', async () => {
      mockServicesService.listOneService.mockResolvedValue(null);

      await controller.listOneService(99, mockResponse);

      expect(mockServicesService.listOneService).toHaveBeenCalledWith(99);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Serviço não foi encontrado.' });
    });

    it('should accept different service IDs', async () => {
      const service = { cost: 200, id: 2, name: 'Service B', requestedService: [], resources: [] };
      mockServicesService.listOneService.mockResolvedValue(service as never);

      await controller.listOneService(2, mockResponse);

      expect(mockServicesService.listOneService).toHaveBeenCalledWith(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(service);
    });
  });

  describe('updateService', () => {
    it('should update a service and return 201', async () => {
      mockServicesService.updateService.mockResolvedValue(mockUpdateResult);

      await controller.updateService(1, mockServicesDTO, mockResponse);

      expect(mockServicesService.updateService).toHaveBeenCalledWith(1, mockServicesDTO);
      expect(mockServicesService.updateService).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Serviço atualizado com sucesso.' });
    });

    it('should return 404 when service does not exist', async () => {
      mockServicesService.updateService.mockResolvedValue({
        affected: 0,
        generatedMaps: [],
        raw: {},
      });

      await controller.updateService(99, mockServicesDTO, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Serviço não foi encontrado.' });
    });

    it('should call service with correct parameters', async () => {
      const updatedDTO: ServicesDTO = {
        cost: 150,
        name: 'Service A Updated',
      };
      mockServicesService.updateService.mockResolvedValue(mockUpdateResult);

      await controller.updateService(1, updatedDTO, mockResponse);

      expect(mockServicesService.updateService).toHaveBeenCalledWith(1, updatedDTO);
    });
  });

  describe('deleteService', () => {
    it('should delete a service and return 200', async () => {
      mockServicesService.deleteService.mockResolvedValue(mockDeleteResult);

      await controller.deleteService(1, mockResponse);

      expect(mockServicesService.deleteService).toHaveBeenCalledWith(1);
      expect(mockServicesService.deleteService).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Serviço deletado com sucesso.' });
    });

    it('should return 404 when service does not exist', async () => {
      mockServicesService.deleteService.mockResolvedValue({
        affected: 0,
        raw: {},
      });

      await controller.deleteService(99, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Serviço não foi encontrado.' });
    });

    it('should accept different service IDs', async () => {
      mockServicesService.deleteService.mockResolvedValue(mockDeleteResult);

      await controller.deleteService(2, mockResponse);

      expect(mockServicesService.deleteService).toHaveBeenCalledWith(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Serviço deletado com sucesso.' });
    });
  });

  describe('Controller instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(controller.createService).toBeDefined();
      expect(controller.listAllServices).toBeDefined();
      expect(controller.listOneService).toBeDefined();
      expect(controller.updateService).toBeDefined();
      expect(controller.deleteService).toBeDefined();
    });
  });
});
