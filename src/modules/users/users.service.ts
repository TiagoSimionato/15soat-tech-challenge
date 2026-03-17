import type { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/users.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string) {
    return this.usersRepository.findOneBy({ username });
  }

  async create({ name, password, username }: { name: string; password: string; username: string }) {
    const newUser = new User();
    newUser.name = name;
    newUser.username = username;
    newUser.password = await bcrypt.hash(password, 10);
    this.usersRepository.save(newUser);
  }
}
