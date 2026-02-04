import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.create(
      user.userId,
      dto.patientId,
      dto.studyId,
      dto.sessionIndex,
      dto.scheduledAt,
    );
  }

  @Get('patient/:patientId')
  findByPatient(
    @CurrentUser() user: { userId: string },
    @Param('patientId') patientId: string,
  ) {
    return this.sessionsService.findByPatient(patientId, user.userId);
  }

  @Get('next-index/:patientId')
  getNextIndex(
    @CurrentUser() user: { userId: string },
    @Param('patientId') patientId: string,
  ) {
    return this.sessionsService.getNextSessionIndexForPatient(patientId, user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.sessionsService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(id, user.userId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.sessionsService.remove(id, user.userId);
  }
}
