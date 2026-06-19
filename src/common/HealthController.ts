import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../modules/auth/decorators/public';

@Controller({ path: 'health' })
export class HealthController {
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get()
  async getHealth() {
    return {
      status: 'Healty',
    };
  }
}
