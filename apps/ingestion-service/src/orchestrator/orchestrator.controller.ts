import { Controller, Post, Body } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Orchestrator')
@Controller('api/v1/orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Post('emergency')
  @ApiOperation({ summary: 'Déclencher le workflow d\'admission d\'urgence' })
  @ApiResponse({ status: 202, description: 'Workflow démarré avec succès.' })
  async triggerEmergency(@Body() body: any) {
    return this.orchestratorService.startEmergencyWorkflow(body);
  }
}
