import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SignUpRequest } from '../../../modules/auth/requests/signUp.model';
import { User } from '../../../modules/users/entities/users.entity';
import { LegalNature } from '../../../modules/users/enums/legalNature';
import { UserResponseDTO } from '../../../modules/users/models/user.model';
import { UserService } from '../../../modules/users/services/users.service';

const mockUserEntity = new UserResponseDTO({
  document: '12345678901',
  id: 1,
  legalNature: LegalNature.PF,
  name: 'John Doe',
  username: 'johndoe',
});

const mockUserArray = [mockUserEntity];

const mockRepository = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashedpassword' as never),
}));

describe('userService', () => {
  let service: UserService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should return an array of UserResponseDTO', async () => {
      repository.find.mockResolvedValue(mockUserArray);
      const result = await service.listUsers();
      expect(result).toEqual([new UserResponseDTO(mockUserEntity)]);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('listOneUser', () => {
    it('should return a UserResponseDTO when found', async () => {
      repository.findOneBy.mockResolvedValue(mockUserEntity);
      const result = await service.listOneUser('12345678901');
      expect(result).toEqual(new UserResponseDTO(mockUserEntity));
      expect(repository.findOneBy).toHaveBeenCalledWith({ document: '12345678901' });
    });

    it('should return null when not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      const result = await service.listOneUser('notfound');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user with valid CPF', async () => {
      const signUpRequest: SignUpRequest = {
        document: '96795570061',
        legalNature: LegalNature.PF,
        name: 'John Doe',
        password: 'password',
        username: 'johndoe',
      };
      repository.create.mockReturnValue({ ...signUpRequest, password: 'hashedpassword' });
      repository.save.mockResolvedValue({ ...signUpRequest, id: 1, password: 'hashedpassword' });

      await service.create(signUpRequest);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid CPF', async () => {
      const signUpRequest: SignUpRequest = {
        document: 'invalidcpf',
        legalNature: LegalNature.PF,
        name: 'John Doe',
        password: 'password',
        username: 'johndoe',
      };
      await expect(service.create(signUpRequest)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      repository.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });
      const signUpRequest: SignUpRequest = {
        document: '12345678901',
        legalNature: LegalNature.PF,
        name: 'John Doe',
        password: 'password',
        username: 'johndoe',
      };
      const result = await service.updateUser('12345678901', signUpRequest);
      expect(result).toEqual({ affected: 1, generatedMaps: [], raw: {} });
      expect(repository.update).toHaveBeenCalledWith({ document: '12345678901' }, signUpRequest);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });
      const result = await service.deleteUser('12345678901');
      expect(result).toEqual({ affected: 1, raw: {} });
      expect(repository.delete).toHaveBeenCalledWith({ document: '12345678901' });
    });
  });
});
