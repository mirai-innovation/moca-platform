import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { EvaluationsService, CompleteEvaluationDto } from './evaluations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() body: { patientId: string },
  ) {
    return this.evaluationsService.create(user.userId, body.patientId);
  }

  @Post('complete-by-test')
  completeByTest(
    @CurrentUser() user: { userId: string },
    @Body() body: { testId: string } & CompleteEvaluationDto,
  ) {
    const { testId, ...dto } = body;
    return this.evaluationsService.completeByTestId(user.userId, testId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { userId: string },
    @Query('patientId') patientId?: string,
  ) {
    return this.evaluationsService.findAllByProfessional(user.userId, patientId);
  }

  @Get('by-test/:testId')
  async findByTestId(
    @CurrentUser() user: { userId: string },
    @Param('testId') testId: string,
  ) {
    const evalDoc = await this.evaluationsService.findByTestId(testId, user.userId);
    if (!evalDoc) throw new NotFoundException('Evaluación no encontrada.');
    return evalDoc;
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.evaluationsService.findOne(id, user.userId);
  }

  @Patch(':id/education-adjust')
  setEducationAdjust(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: { educationAdjust: boolean },
  ) {
    return this.evaluationsService.setEducationAdjust(id, user.userId, !!body.educationAdjust);
  }
}
