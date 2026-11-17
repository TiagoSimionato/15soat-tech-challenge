import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RequestedServicesStatus } from '../../common/enums/services/services.enum';
import { HttpClient } from './http.client';

type StatusRequest = {
  requested_service_number?: number;
  service_order_number?: number;
  status?: RequestedServicesStatus;
};

@Injectable()
export class StatusClient extends HttpClient {
  protected serviceUrl: string = `${process.env.STATUS_SERVICE_URL}`;

  constructor(http: HttpService) { super(http); }

  async setStatus(body: StatusRequest) {
    try {
      const { data } = await super.post(`/status`, body);
      return data;
    }
    catch {
      throw new HttpException('Upstream service unavailable', HttpStatus.BAD_GATEWAY);
    }
  }
}
