import { Controller, Post, Body } from '@nestjs/common';
import { LanguageService } from './language.service';
import type { LanguageModuleSubmission } from './language.service';

@Controller('language')
export class LanguageController {
    constructor(private readonly service: LanguageService) { }

    @Post('submit')
    submit(@Body() submission: LanguageModuleSubmission) {
        return this.service.evaluate(submission);
    }
}
