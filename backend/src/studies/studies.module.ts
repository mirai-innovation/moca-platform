import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Study, StudySchema } from './schemas/study.schema';
import { StudiesService } from './studies.service';
import { StudiesController } from './studies.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Study.name, schema: StudySchema }]),
  ],
  controllers: [StudiesController],
  providers: [StudiesService],
  exports: [StudiesService],
})
export class StudiesModule {}
