import { Controller, Post, Body } from '@nestjs/common';
import { AttentionService } from './attention.service';
import type { AttentionModuleSubmission } from './attention.service';

@Controller('attention')
export class AttentionController {
    constructor(private readonly service: AttentionService) { }

    @Post('submit')
    submit(@Body() submission: AttentionModuleSubmission) {
        return this.service.evaluate(submission);
    }
}
