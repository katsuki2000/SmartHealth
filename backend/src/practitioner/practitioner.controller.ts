import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { PractitionerService } from './practitioner.service';
import { CreatePractitionerDto } from './create-practitioner.dto';
import { UpdatePractitionerDto } from './update-practitioner.dto';

@ApiTags('practitioners')
@Controller('practitioners')
export class PractitionerController {
  constructor(private readonly practitionerService: PractitionerService) {}

  @ApiOperation({ summary: 'Créer un praticien' })
  @ApiCreatedResponse({ description: 'Le praticien a été créé avec succès.' })
  @Post()
  async create(@Body() createPractitionerDto: CreatePractitionerDto) {
    return this.practitionerService.create(createPractitionerDto);
  }

  @ApiOperation({ summary: 'Lister tous les praticiens' })
  @ApiOkResponse({ description: 'Liste des praticiens récupérée avec succès.' })
  @Get()
  async findAll() {
    return this.practitionerService.findAll();
  }

  @ApiOperation({ summary: 'Récupérer un praticien par son ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.practitionerService.findOne(id);
  }

  @ApiOperation({ summary: 'Mettre à jour un praticien' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePractitionerDto: UpdatePractitionerDto,
  ) {
    return this.practitionerService.update(id, updatePractitionerDto);
  }

  @ApiOperation({ summary: 'Supprimer un praticien' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.practitionerService.remove(id);
  }
}
