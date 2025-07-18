import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateV2Dto {
  @ApiProperty({ description: 'Nom du template de contrat' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Contenu du template en format Markdown' })
  @IsString()
  @IsNotEmpty()
  bodyMd: string;

  @ApiProperty({ description: 'Périodicité du contrat', example: 'MENSUEL', default: 'MENSUEL' })
  @IsString()
  @IsNotEmpty()
  periodicity: string = 'MENSUEL';

  @ApiProperty({ description: 'Prix du contrat', example: 29.99 })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
