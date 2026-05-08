import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UseGuards } from '@nestjs/common';

/**
 * AnalyticsController
 * 
 * Expose les statistiques calculées par le moteur Big Data (PySpark).
 * Route publique pour simplifier l'intégration avec le dashboard MFE.
 */
@ApiTags('Analytics')
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Récupérer les statistiques calculées par PySpark' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques analytiques issues du moteur PySpark.',
  })
  async getAnalytics() {
    return this.analyticsService.getAnalyticsSummary();
  }

  @Get('charts')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Données pour les graphiques (FHIR JSONB)' })
  @ApiResponse({
    status: 200,
    description: 'Distributions et top pathologies extraites du JSONB FHIR.',
  })
  async getChartsData() {
    return this.analyticsService.getChartsData();
  }

  @Get('live')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Statistiques en temps réel (requêtes directes PostgreSQL)' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques calculées en direct depuis les tables relationnelles.',
  })
  async getLiveAnalytics() {
    return this.analyticsService.getLiveStats();
  }
}
