import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'Paracetamol 500mg, Amoxicillin 1g' })
  @IsString()
  @IsNotEmpty()
  medications: string;

  @ApiPropertyOptional({ example: '1 pill morning and evening for 5 days.' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({ example: 'uuid-of-the-appointment' })
  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({ example: 'uuid-of-the-patient' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'uuid-of-the-practitioner' })
  @IsUUID()
  @IsNotEmpty()
  practitionerId: string;
}
