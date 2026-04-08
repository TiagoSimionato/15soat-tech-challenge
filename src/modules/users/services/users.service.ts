import type { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { isCNPJ, isCPF } from 'brazilian-values';
import { SignUpRequest } from '../../auth/requests/signUp';
import { User } from '../entities/users.entity';
import { LegalNature } from '../enums/legalNature';
import { UserResponseDTO } from '../models/UserResponseDTO';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<null | User> {
    return await this.usersRepository.findOne({ relations: ['roles'], where: { username } });
  }

  async create(signUpRequest: SignUpRequest) {
    if (signUpRequest.legalNature === LegalNature.PF && !isCPF(signUpRequest.document)) {
      throw new BadRequestException('document is not a valid CPF');
    }
    if (signUpRequest.legalNature === LegalNature.PJ && !isCNPJ(signUpRequest.document)) {
      throw new BadRequestException('document is not a valid CNPJ');
    }

    const newUser = this.usersRepository.create({
      document: signUpRequest.document,
      legalNature: signUpRequest.legalNature,
      name: signUpRequest.name,
      password: await this.encryptPassword(signUpRequest.password),
      username: signUpRequest.username,
    });
    await this.usersRepository.save(newUser);
  }

  async listUsers(): Promise<UserResponseDTO[]> {
    return (await this.usersRepository.find()).map(user => new UserResponseDTO({ ...user }));
  }

  async listOneUser(document: string): Promise<null | UserResponseDTO> {
    const userEntity = await this.usersRepository.findOneBy({ document });
    if (!userEntity)
      return null;

    return new UserResponseDTO({ ...userEntity });
  }

  async updateUser(document: string, user: SignUpRequest): Promise<UpdateResult> {
    user.password = await this.encryptPassword(user.password);
    return await this.usersRepository.update({ document }, user);
  }

  async deleteUser(document: string): Promise<DeleteResult> {
    return await this.usersRepository.delete({ document });
  }

  private async encryptPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
