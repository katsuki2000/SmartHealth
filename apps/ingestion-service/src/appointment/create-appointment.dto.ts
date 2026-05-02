import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2026-05-01T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  dateTime: string;

  @ApiPropertyOptional({ example: 'Consultation générale' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: 'SCHEDULED', enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] })
  @IsIn(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'uuid-of-the-patient' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'uuid-of-the-practitioner' })
  @IsUUID()
  @IsNotEmpty()
  practitionerId: string;
}
