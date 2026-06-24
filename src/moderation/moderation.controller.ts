import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import type { AuthenticatedUser } from 'src/auth/authTypes';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ModerationService } from './moderation.service';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post()
  async createReport(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReportDto,
  ) {
    return this.moderationService.create(user.id, dto);
  }

  @Get()
  @Roles('moderator', 'admin')
  async getReports() {
    return this.moderationService.findAll();
  }

  @Patch(':id')
  @Roles('moderator', 'admin')
  async updateReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.moderationService.update(id, dto);
  }
}
