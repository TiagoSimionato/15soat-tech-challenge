import { Controller, Inject } from '@nestjs/common';
import { UserService } from './users.service';

@Controller({ path: 'users' })
export class UsersController {
  constructor(
    @Inject()
    private userService: UserService,
  ) {}
}
