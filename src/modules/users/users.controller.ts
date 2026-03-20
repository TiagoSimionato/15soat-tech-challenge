import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Put } from '@nestjs/common';
import { SignUpRequest } from '../auth/requests/signUp';
import { UserService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    @Inject()
    private userService: UserService,
  ) {}

  @Get('/list')
  async listAllUsers() {
    return await this.userService.listUsers();
  }

  @Get('/list/:id')
  async listOneUser(@Param() { id }) {
    const user = await this.userService.listOneUser(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Put('/update/:id')
  async updateUser(@Param() { id }, @Body() request: SignUpRequest) {
    const updateResult = await this.userService.updateUser(id, request);
    if (updateResult.affected === 0) {
      throw new NotFoundException();
    }
  }

  @Delete('/remove/:id')
  async deleteUser(@Param() { id }) {
    const deleteResult = await this.userService.deleteUser(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException();
    }
  }
}
