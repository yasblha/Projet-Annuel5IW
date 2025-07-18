import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  bodyMd: string;

  @IsString()
  @IsNotEmpty()
  periodicity: string = 'MENSUEL';

  @IsNumber()
  @IsNotEmpty()
  price: number;
}
