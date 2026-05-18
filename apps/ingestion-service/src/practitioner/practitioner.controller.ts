import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PractitionerService } from './practitioner.service';
import { CreatePractitionerDto } from './create-practitioner.dto';
import { UpdatePractitionerDto } from './update-practitioner.dto';

@ApiTags('practitioners')
@ApiBearerAuth()
@Controller('practitioners')
export class PractitionerController {
  constructor(private readonly practitionerService: PractitionerService) {}

  @ApiOperation({ summary: 'Create a practitioner' })
  @ApiCreatedResponse({ description: 'Practitioner created successfully.' })
  @Post()
  async create(@Body() createPractitionerDto: CreatePractitionerDto) {
    return this.practitionerService.create(createPractitionerDto);
  }

  @ApiOperation({ summary: 'List all practitioners' })
  @ApiOkResponse({ description: 'List of practitioners successfully retrieved.' })
  @Get()
  async findAll() {
    return this.practitionerService.findAll();
  }

  @ApiOperation({ summary: 'Get a practitioner by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.practitionerService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a practitioner' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePractitionerDto: UpdatePractitionerDto,
  ) {
    return this.practitionerService.update(id, updatePractitionerDto);
  }

  @ApiOperation({ summary: 'Delete a practitioner' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.practitionerService.remove(id);
  }
}
