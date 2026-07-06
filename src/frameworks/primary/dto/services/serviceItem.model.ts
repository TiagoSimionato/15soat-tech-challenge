import { IsInt, IsNotEmpty } from 'class-validator';

export class ServiceItemDTO {
  @IsNotEmpty() @IsInt() stock_id: number;
  @IsNotEmpty() @IsInt() requested_service_id: number;
  @IsNotEmpty() @IsInt() amount: number;
}
