import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Put } from '@nestjs/common';
import { RequireRoles } from '../../decorators/auth/role.decorator';
import { Roles } from '../../../../common/enums/auth/roles.enum';
import { SignUpRequest } from '../../dto/auth/signUp.model';
import { UserService } from '../../../../core/application/users/users.service';

@RequireRoles([Roles.ADMIN])
@Controller('users')
export class UsersController {
  constructor(
    @Inject()
    private readonly userService: UserService,
  ) {}

  @Get()
  async listAllUsers() {
    return await this.userService.listUsers();
  }

  @Get(':document')
  async listOneUser(@Param('document') document: string) {
    const user = await this.userService.listOneUser(document);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Put(':document')
  async updateUser(@Param('document') document: string, @Body() request: SignUpRequest) {
    const updateResult = await this.userService.updateUser(document, request);
    if (updateResult.affected === 0) {
      throw new NotFoundException();
    }
  }

  @Delete(':document')
  async deleteUser(@Param('document') document: string) {
    const deleteResult = await this.userService.deleteUser(document);
    if (deleteResult.affected === 0) {
      throw new NotFoundException();
    }
  }
}
