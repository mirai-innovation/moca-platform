import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranscribeService } from './transcribe.service';
import type { UploadedAudio } from './transcribe.service';

@Controller('transcribe')
export class TranscribeController {
    constructor(private readonly service: TranscribeService) { }

    @Post()
    @UseInterceptors(FileInterceptor('audio'))
    transcribe(
        @UploadedFile() file: UploadedAudio,
        @Body('language') language?: string,
    ) {
        return this.service.transcribe(file, language || 'es');
    }
}
