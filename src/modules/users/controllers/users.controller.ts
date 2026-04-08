import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Put } from '@nestjs/common';
import { RequireRoles } from 'src/modules/auth/decorators/role.decorator';
import { Roles } from 'src/modules/auth/enums/roles.enum';
import { SignUpRequest } from '../../auth/requests/signUp';
import { UserService } from '../services/users.service';

@RequireRoles([Roles.ADMIN])
@Controller('users')
export class UsersController {
  constructor(
    @Inject()
    private userService: UserService,
  ) {}

  @Get()
  async listAllUsers() {
    return await this.userService.listUsers();
  }

  @Get(':document')
  async listOneUser(@Param() { document }) {
    const user = await this.userService.listOneUser(document);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Put(':document')
  async updateUser(@Param() { document }, @Body() request: SignUpRequest) {
    const updateResult = await this.userService.updateUser(document, request);
    if (updateResult.affected === 0) {
      throw new NotFoundException();
    }
  }

  @Delete(':document')
  async deleteUser(@Param() { document }) {
    const deleteResult = await this.userService.deleteUser(document);
    if (deleteResult.affected === 0) {
      throw new NotFoundException();
    }
  }
}
