import type { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { isCNPJ, isCPF } from 'brazilian-values';
import { SignUpRequest } from '../auth/requests/signUp';
import { User } from './entities/users.entity';
import { LegalNature } from './enums/legalNature';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string) {
    return this.usersRepository.findOneBy({ username });
  }

  async create(signUpRequest: SignUpRequest) {
    if (signUpRequest.legalNature === LegalNature.PF && !isCPF(signUpRequest.document)) {
      throw new BadRequestException('document is not a valid CPF');
    }
    if (signUpRequest.legalNature === LegalNature.PJ && !isCNPJ(signUpRequest.document)) {
      throw new BadRequestException('document is not a valid CNPJ');
    }

    const newUser = new User();
    newUser.name = signUpRequest.name;
    newUser.username = signUpRequest.username;
    newUser.password = await bcrypt.hash(signUpRequest.password, 10);
    newUser.document = signUpRequest.document;
    newUser.legalNature = signUpRequest.legalNature;
    this.usersRepository.save(newUser);
  }
}
