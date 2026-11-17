import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RequestedServicesStatus } from '../../common/enums/services/services.enum';
import { STATUS_EVENT_PATTERN } from '../../infrastructure/rabbitmq.config';

export const STATUS_QUEUE_CLIENT = 'STATUS_QUEUE_CLIENT';

export type SetStatusPayload = {
  requested_service_number?: number;
  service_order_number: number;
  status: RequestedServicesStatus;
};

@Injectable()
export class StatusClient {
  constructor(@Inject(STATUS_QUEUE_CLIENT) private readonly client: ClientProxy) { }

  async setStatus(payload: SetStatusPayload): Promise<void> {
    const record = new RmqRecordBuilder(payload)
      .setOptions({
        headers: { 'x-saga-id': String(payload.service_order_number) },
        messageId: randomUUID(),
        persistent: true,
      })
      .build();

    await lastValueFrom(this.client.emit(STATUS_EVENT_PATTERN, record));
  }
}