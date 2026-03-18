import { IsNumber, IsString } from "class-validator";

export class ResourceDTO {
    @IsString() name: string;
    @IsString() type: string;
    @IsNumber() cost: number;
    @IsString() unit: string;
}