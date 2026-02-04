import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StudiesService } from './studies.service';
import { CreateStudyDto } from './dto/create-study.dto';
import { UpdateStudyDto } from './dto/update-study.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('studies')
@UseGuards(JwtAuthGuard)
export class StudiesController {
  constructor(private readonly studiesService: StudiesService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateStudyDto,
  ) {
    return this.studiesService.create(user.userId, dto.name, dto.sequence);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.studiesService.findAllByProfessional(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.studiesService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateStudyDto,
  ) {
    return this.studiesService.update(id, user.userId, dto.name, dto.sequence);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.studiesService.remove(id, user.userId);
  }
}
