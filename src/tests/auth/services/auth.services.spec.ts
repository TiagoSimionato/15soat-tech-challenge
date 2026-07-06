import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { SignUpRequest } from '../../../frameworks/primary/dto/auth/signUp.model';
import { AuthService } from '../../../core/application/auth/auth.service';
import { LegalNature } from '../../../common/enums/users/legalNature.enum';
import { UserService } from '../../../core/application/users/users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const mockUser = {
  id: 1,
  password: 'hashedpassword',
  roles: [{ authority: 'USER' }],
  username: 'johndoe',
};

const mockSignUpRequest: SignUpRequest = {
  document: '12345678901',
  legalNature: LegalNature.PF,
  name: 'John Doe',
  password: 'password123',
  username: 'johndoe',
};

const mockUserService = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userService: any;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useFactory: mockUserService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return an access token when credentials are valid', async () => {
      userService.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.MockedFunction<any>).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.signIn('johndoe', 'password123');

      expect(userService.findOne).toHaveBeenCalledWith('johndoe');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        roles: ['USER'],
        sub: mockUser.id,
        username: mockUser.username,
      });
      expect(result).toEqual({ accessToken: 'jwt-token' });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      userService.findOne.mockResolvedValue(null);
      (mockedBcrypt.compare as jest.MockedFunction<any>).mockResolvedValue(false);

      await expect(service.signIn('unknown', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      userService.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.MockedFunction<any>).mockResolvedValue(false);

      await expect(service.signIn('johndoe', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should use empty string for bcrypt.compare when user is not found', async () => {
      userService.findOne.mockResolvedValue(null);
      (mockedBcrypt.compare as jest.MockedFunction<any>).mockResolvedValue(false);

      await expect(service.signIn('unknown', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', '');
    });

    it('should map roles correctly in the JWT payload', async () => {
      const userWithMultipleRoles = {
        ...mockUser,
        roles: [{ authority: 'USER' }, { authority: 'ADMIN' }],
      };
      userService.findOne.mockResolvedValue(userWithMultipleRoles);
      (mockedBcrypt.compare as jest.MockedFunction<any>).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      await service.signIn('johndoe', 'password123');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ roles: ['USER', 'ADMIN'] }),
      );
    });

    it('should propagate errors thrown by userService.findOne', async () => {
      userService.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.signIn('johndoe', 'password123')).rejects.toThrow('DB error');
    });
  });

  describe('signUp', () => {
    it('should call userService.create with the sign up request', async () => {
      userService.create.mockResolvedValue(undefined);

      await service.signUp(mockSignUpRequest);

      expect(userService.create).toHaveBeenCalledWith(mockSignUpRequest);
      expect(userService.create).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors thrown by userService.create', async () => {
      userService.create.mockRejectedValue(new Error('User already exists'));

      await expect(service.signUp(mockSignUpRequest)).rejects.toThrow(
        'User already exists',
      );
    });
  });
});
