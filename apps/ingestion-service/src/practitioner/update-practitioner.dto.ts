import { PartialType } from '@nestjs/swagger';
import { CreatePractitionerDto } from './create-practitioner.dto';

export class UpdatePractitionerDto extends PartialType(CreatePractitionerDto) {}
