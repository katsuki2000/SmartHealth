import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'doctor@smarthealth.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'DOCTOR',
    description: 'Rôle du nouveau compte (DOCTOR ou ADMIN)',
    enum: ['DOCTOR', 'ADMIN'],
    required: false,
    default: 'DOCTOR',
  })
  @IsOptional()
  @IsIn(['DOCTOR', 'ADMIN'])
  role?: string;
}
