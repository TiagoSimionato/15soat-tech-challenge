import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../frameworks/primary/controllers/auth/auth.controller';
import { SignInRequest } from '../../../frameworks/primary/dto/auth/signIn.model';
import { SignUpRequest } from '../../../frameworks/primary/dto/auth/signUp.model';
import { AuthService } from '../../../core/application/auth/auth.service';
import { LegalNature } from '../../../common/enums/users/legalNature.enum';

const mockSignInRequest: SignInRequest = {
  password: 'password123',
  username: 'johndoe',
};

const mockSignUpRequest: SignUpRequest = {
  document: '12345678901',
  legalNature: LegalNature.PF,
  name: 'John Doe',
  password: 'password123',
  username: 'johndoe',
};

const mockAuthService = () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return the token when credentials are valid', async () => {
      const mockToken = { access_token: 'jwt-token' };
      service.signIn.mockResolvedValue(mockToken);

      const result = await controller.signIn(mockSignInRequest);

      expect(service.signIn).toHaveBeenCalledWith(
        mockSignInRequest.username,
        mockSignInRequest.password,
      );
      expect(service.signIn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockToken);
    });

    it('should propagate errors thrown by the service', async () => {
      service.signIn.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.signIn(mockSignInRequest)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('signUp', () => {
    it('should call signUp service with the full request', async () => {
      service.signUp.mockResolvedValue(undefined);

      await controller.signUp(mockSignUpRequest);

      expect(service.signUp).toHaveBeenCalledWith(mockSignUpRequest);
      expect(service.signUp).toHaveBeenCalledTimes(1);
    });

    it('should return undefined after successful sign up', async () => {
      service.signUp.mockResolvedValue(undefined);

      const result = await controller.signUp(mockSignUpRequest);

      expect(result).toBeUndefined();
    });

    it('should propagate errors thrown by the service', async () => {
      service.signUp.mockRejectedValue(new Error('User already exists'));

      await expect(controller.signUp(mockSignUpRequest)).rejects.toThrow(
        'User already exists',
      );
    });
  });
});
