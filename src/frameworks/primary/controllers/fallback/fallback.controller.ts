import type { Request } from 'express';
import { All, Controller, NotFoundException, Req } from '@nestjs/common';

@Controller()
export class FallbackController {
  @All('*')
  catchAll(@Req() request: Request) {
    throw new NotFoundException(`Cannot ${request.method} ${request.url}`);
  }
}
