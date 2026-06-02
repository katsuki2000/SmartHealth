import { Controller, Post, Body } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Orchestrator')
@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Post('emergency')
  @ApiOperation({ summary: 'Trigger the emergency admission workflow' })
  @ApiResponse({ status: 202, description: 'Workflow started successfully.' })
  async triggerEmergency(@Body() body: any) {
    return this.orchestratorService.startEmergencyWorkflow(body);
  }
}
