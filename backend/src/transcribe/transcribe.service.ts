import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { toFile } from 'openai';

export interface UploadedAudio {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

@Injectable()
export class TranscribeService {
    private openai: OpenAI;
    private readonly model: string;

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({ apiKey: this.configService.get<string>('OPENAI_API_KEY') });
        // Modelo de transcripción (barato y actual). Configurable por si se quiere whisper-1.
        this.model = this.configService.get<string>('TRANSCRIBE_MODEL') || 'gpt-4o-mini-transcribe';
    }

    async transcribe(file: UploadedAudio, language = 'es'): Promise<{ text: string }> {
        if (!file || !file.buffer || file.buffer.length === 0) {
            throw new BadRequestException('No se recibió audio.');
        }
        try {
            const uploadable = await toFile(file.buffer, file.originalname || 'audio.webm', {
                type: file.mimetype || 'audio/webm',
            });
            const result = await this.openai.audio.transcriptions.create({
                file: uploadable,
                model: this.model,
                language, // pista de idioma para mejor precisión
            });
            return { text: (result.text || '').trim() };
        } catch (error) {
            console.error('Transcription error:', error);
            throw new InternalServerErrorException('No se pudo transcribir el audio.');
        }
    }
}
