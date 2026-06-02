import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * AnalyticsController
 *
 * Exposes analytical statistics computed by the Big Data engine (PySpark).
 * ADMIN sees global platform analytics, DOCTOR sees their own patient metrics.
 */
@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get analytics summary computed by PySpark (ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Analytical statistics aggregated and summarized by PySpark.',
  })
  async getAnalytics() {
    return this.analyticsService.getAnalyticsSummary();
  }

  @Get('charts')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get chart data extracted from FHIR JSONB (ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Demographic and pathological distributions extracted from FHIR JSONB.',
  })
  async getChartsData() {
    return this.analyticsService.getChartsData();
  }

  @Get('live')
  @ApiOperation({
    summary: 'Get real-time operational statistics',
    description: 'ADMIN sees global stats. DOCTOR sees only their assigned patients.',
  })
  @ApiResponse({
    status: 200,
    description: 'Operational metrics computed from relational tables in real time.',
  })
  async getLiveAnalytics(@CurrentUser() user: any) {
    return this.analyticsService.getLiveStats(user.userId, user.role);
  }
}
