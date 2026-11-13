import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

type TokenResponse = {
  accessToken: string;
  expiresIn: number;
};

@Injectable()
export abstract class HttpClient {
  protected readonly logger = new Logger(this.constructor.name);

  private readonly clientId: string = `${process.env.CLIENT_ID}`;
  private readonly clientSecret: string = `${process.env.CLIENT_SECRET}`;
  protected readonly authorizationServerUrl: string = `${process.env.AUTHORIZATION_SERVER_URL}/auth/token`;

  protected abstract readonly serviceUrl: string;

  private cachedToken: null | string = null;
  private tokenExpiry: number = 0;

  constructor(protected readonly httpService: HttpService) {}

  protected async getBearerToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiry - 30_000) {
      return this.cachedToken;
    }

    this.logger.debug('Fetching new access token from', this.authorizationServerUrl);

    const credentials = `${this.clientId}:${this.clientSecret}`;
    const encriptedCredentials = btoa(credentials);

    const response = await firstValueFrom(
      this.httpService.post<TokenResponse>(
        this.authorizationServerUrl,
        {},
        { headers: { 'Authorization': `Basic ${encriptedCredentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );

    const { accessToken, expiresIn } = response.data;
    this.cachedToken = accessToken;
    this.tokenExpiry = Date.now() + expiresIn * 1000;

    this.logger.debug(`Token acquired, expires in ${expiresIn}s`);
    return accessToken;
  }

  protected async authenticatedRequest<T = any>(
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const token = await this.getBearerToken();

    return firstValueFrom(
      this.httpService.request<T>({
        baseURL: this.serviceUrl,
        timeout: 3000,
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }

  protected get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.authenticatedRequest<T>({ ...config, method: 'GET', url });
  }

  protected post<T = any>(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.authenticatedRequest<T>({ ...config, data: body, method: 'POST', url });
  }

  protected put<T = any>(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.authenticatedRequest<T>({ ...config, data: body, method: 'PUT', url });
  }

  protected delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.authenticatedRequest<T>({ ...config, method: 'DELETE', url });
  }
}
