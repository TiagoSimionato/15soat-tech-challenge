import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

type TokenResponse = {
  access_token: string;
  expires_in: number;
};

@Injectable()
export abstract class HttpClient {
  protected readonly logger = new Logger(this.constructor.name);

  private readonly clientId: string = process.env.CLIENT_ID ?? '';
  private readonly clientSecret: string = process.env.CLIENT_SECRET ?? '';
  protected readonly authorizationServerUrl: string = process.env.AUTHORIZATION_SERVER_URL ?? '';

  protected abstract readonly serviceUrl: string;

  private cachedToken: null | string = null;
  private tokenExpiry: number = 0;

  constructor(protected readonly httpService: HttpService) {}

  protected async getBearerToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiry - 30_000) {
      return this.cachedToken;
    }

    this.logger.debug('Fetching new access token from', this.authorizationServerUrl);

    const response = await firstValueFrom(
      this.httpService.post<TokenResponse>(
        this.authorizationServerUrl,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );

    const { access_token, expires_in } = response.data;
    this.cachedToken = access_token;
    this.tokenExpiry = Date.now() + expires_in * 1000;

    this.logger.debug(`Token acquired, expires in ${expires_in}s`);
    return access_token;
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
