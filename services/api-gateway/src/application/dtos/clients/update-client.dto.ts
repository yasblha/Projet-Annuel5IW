import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { IsUUID } from 'class-validator';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsUUID()
  id: string;
}
