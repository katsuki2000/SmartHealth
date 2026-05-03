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

  // Champs pour le profil Practitioner (Requis si role=DOCTOR, mais optionnels au niveau du DTO pour rester générique)
  @ApiProperty({ required: false, example: 'Jean' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, example: 'Rakoto' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, example: 'Cardiologue' })
  @IsOptional()
  @IsString()
  specialty?: string;
}
