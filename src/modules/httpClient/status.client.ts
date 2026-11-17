import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RequestedServicesStatus } from '../../common/enums/services/services.enum';

export const STATUS_QUEUE_CLIENT = 'STATUS_QUEUE_CLIENT';
export const STATUS_EVENT_PATTERN = 'requested-service.status';

export type SetStatusPayload = {
  requested_service_number?: number;
  service_order_number: number;
  status: RequestedServicesStatus;
};

@Injectable()
export class StatusClient {
  constructor(@Inject(STATUS_QUEUE_CLIENT) private readonly client: ClientProxy) { }

  async setStatus(payload: SetStatusPayload): Promise<void> {
    await lastValueFrom(this.client.emit(STATUS_EVENT_PATTERN, payload));
  }
}