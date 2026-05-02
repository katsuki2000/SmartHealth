import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePractitionerDto {
  @ApiProperty({ example: 'Marc' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'Cardiologist' })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiPropertyOptional({ example: 'marc.dupont@hopital.fr' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+33123456789' })
  @IsString()
  @IsOptional()
  phone?: string;
}
