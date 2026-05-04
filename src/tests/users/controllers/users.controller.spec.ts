import type { DeleteResult, UpdateResult } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SignUpRequest } from '../../../modules/auth/requests/signUp.model';
import { UsersController } from '../../../modules/users/controllers/users.controller';
import { LegalNature } from '../../../modules/users/enums/legalNature';
import { UserResponseDTO } from '../../../modules/users/models/user.model';
import { UserService } from '../../../modules/users/services/users.service';

describe('usersController', () => {
  let controller: UsersController;

  const mockUserService = {
    deleteUser: jest.fn<(document: string) => Promise<DeleteResult>>(),
    listOneUser: jest.fn<(document: string) => Promise<null | UserResponseDTO>>(),
    listUsers: jest.fn<() => Promise<UserResponseDTO[]>>(),
    updateUser: jest.fn<(document: string, user: SignUpRequest) => Promise<UpdateResult>>(),
  };

  const mockUserResponseDTO = new UserResponseDTO({
    document: '12345678901',
    id: 1,
    legalNature: LegalNature.PF,
    name: 'John Doe',
    username: 'johndoe',
  });

  const mockUpdateResult = {
    affected: 1,
    generatedMaps: [],
    raw: {},
  };

  const mockDeleteResult = {
    affected: 1,
    raw: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listAllUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUserResponseDTO];
      mockUserService.listUsers.mockResolvedValue(mockUsers);

      const result = await controller.listAllUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserService.listUsers).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users exist', async () => {
      mockUserService.listUsers.mockResolvedValue([]);

      const result = await controller.listAllUsers();

      expect(result).toEqual([]);
      expect(mockUserService.listUsers).toHaveBeenCalledTimes(1);
    });

    it('should return multiple users', async () => {
      const mockUsers = [
        mockUserResponseDTO,
        new UserResponseDTO({
          document: '98765432109',
          id: 2,
          legalNature: LegalNature.PF,
          name: 'Jane Doe',
          username: 'janedoe',
        }),
      ];
      mockUserService.listUsers.mockResolvedValue(mockUsers);

      const result = await controller.listAllUsers();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('listOneUser', () => {
    it('should return a user when found', async () => {
      const document = '12345678901';
      mockUserService.listOneUser.mockResolvedValue(mockUserResponseDTO);

      const result = await controller.listOneUser(document);

      expect(result).toEqual(mockUserResponseDTO);
      expect(mockUserService.listOneUser).toHaveBeenCalledWith(document);
      expect(mockUserService.listOneUser).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const document = '12345678901';
      mockUserService.listOneUser.mockResolvedValue(null);

      await expect(controller.listOneUser(document)).rejects.toThrow(NotFoundException);
      expect(mockUserService.listOneUser).toHaveBeenCalledWith(document);
    });

    it('should accept different document formats', async () => {
      const document = '98765432109';
      const user = new UserResponseDTO({
        document,
        id: 2,
        legalNature: LegalNature.PF,
        name: 'Jane Doe',
        username: 'janedoe',
      });
      mockUserService.listOneUser.mockResolvedValue(user);

      const result = await controller.listOneUser(document);

      expect(result.document).toBe(document);
      expect(mockUserService.listOneUser).toHaveBeenCalledWith(document);
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const document = '12345678901';
      const updateRequest: SignUpRequest = {
        document: '12345678901',
        legalNature: LegalNature.PF,
        name: 'John Updated',
        password: 'newpassword123',
        username: 'johnupdated',
      };
      mockUserService.updateUser.mockResolvedValue(mockUpdateResult);

      await controller.updateUser(document, updateRequest);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(document, updateRequest);
      expect(mockUserService.updateUser).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const document = '12345678901';
      const updateRequest: SignUpRequest = {
        document: '12345678901',
        legalNature: LegalNature.PF,
        name: 'John Updated',
        password: 'newpassword123',
        username: 'johnupdated',
      };
      mockUserService.updateUser.mockResolvedValue({
        affected: 0,
        generatedMaps: [],
        raw: undefined,
      });

      await expect(controller.updateUser(document, updateRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserService.updateUser).toHaveBeenCalledWith(document, updateRequest);
    });

    it('should call service with correct parameters', async () => {
      const document = '98765432109';
      const updateRequest: SignUpRequest = {
        document: '98765432109',
        legalNature: LegalNature.PJ,
        name: 'Jane Doe',
        password: 'securepassword',
        username: 'janedoe',
      };
      mockUserService.updateUser.mockResolvedValue(mockUpdateResult);

      await controller.updateUser(document, updateRequest);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(document, updateRequest);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const document = '12345678901';
      mockUserService.deleteUser.mockResolvedValue(mockDeleteResult);

      await controller.deleteUser(document);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(document);
      expect(mockUserService.deleteUser).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const document = '12345678901';
      mockUserService.deleteUser.mockResolvedValue({
        affected: 0,
        raw: undefined,
      });

      await expect(controller.deleteUser(document)).rejects.toThrow(NotFoundException);
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(document);
    });

    it('should accept different document formats', async () => {
      const document = '98765432109';
      mockUserService.deleteUser.mockResolvedValue(mockDeleteResult);

      await controller.deleteUser(document);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(document);
    });
  });

  describe('Controller instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(controller.listAllUsers).toBeDefined();
      expect(controller.listOneUser).toBeDefined();
      expect(controller.updateUser).toBeDefined();
      expect(controller.deleteUser).toBeDefined();
    });
  });
});
