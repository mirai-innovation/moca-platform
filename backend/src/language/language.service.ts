import { Injectable } from '@nestjs/common';

export interface LanguageModuleSubmission {
    testId: string;
    sentence1?: string;    // transcript de la repetición de la frase 1
    sentence2?: string;    // transcript de la repetición de la frase 2
    fluencyWords?: string; // transcript de la fluidez verbal (letra P)
}

export interface LanguageModuleResult {
    score: number;
    maxScore: number;
    details: {
        sentence1: { score: number; similarity: number };
        sentence2: { score: number; similarity: number };
        fluency: { score: number; validWords: string[]; count: number };
    };
}

@Injectable()
export class LanguageService {
    private readonly SENTENCE_1 = 'El gato se esconde bajo el sofá cuando los perros entran en la sala';
    private readonly SENTENCE_2 = 'Espero que él le entregue el mensaje una vez que ella se lo pida';
    // Umbral de similitud para dar por válida la repetición (tolerante al ruido del reconocimiento de voz).
    private readonly SENTENCE_THRESHOLD = 0.85;
    // Umbral clínico estándar del MoCA para fluidez verbal.
    private readonly FLUENCY_MIN_WORDS = 11;

    /** Normaliza: minúsculas, sin acentos, sin puntuación, espacios colapsados. */
    private normalize(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // quita acentos (marcas diacriticas combinantes)
            .replace(/[^a-z0-9ñ\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /** Similitud a nivel de tokens: proporción de palabras esperadas presentes, en orden aproximado. */
    private tokenSimilarity(expected: string, got: string): number {
        const exp = this.normalize(expected).split(' ').filter(Boolean);
        const gotTokens = new Set(this.normalize(got).split(' ').filter(Boolean));
        if (exp.length === 0) return 0;
        let matched = 0;
        for (const w of exp) if (gotTokens.has(w)) matched++;
        return matched / exp.length;
    }

    evaluate(submission: LanguageModuleSubmission): LanguageModuleResult {
        // 1) Repetición de frases (1 punto cada una)
        const sim1 = this.tokenSimilarity(this.SENTENCE_1, submission.sentence1 || '');
        const sim2 = this.tokenSimilarity(this.SENTENCE_2, submission.sentence2 || '');
        const s1Score = sim1 >= this.SENTENCE_THRESHOLD ? 1 : 0;
        const s2Score = sim2 >= this.SENTENCE_THRESHOLD ? 1 : 0;

        // 2) Fluidez verbal (1 punto): >= 11 palabras distintas que empiezan por P
        const raw = this.normalize(submission.fluencyWords || '')
            .split(' ')
            .filter((w) => w.length >= 2 && w.startsWith('p'));
        // Elimina duplicados y variantes triviales (misma raíz de 4+ letras)
        const seen = new Set<string>();
        const validWords: string[] = [];
        for (const w of raw) {
            const root = w.slice(0, 4);
            if (!seen.has(root)) {
                seen.add(root);
                validWords.push(w);
            }
        }
        const fluencyScore = validWords.length >= this.FLUENCY_MIN_WORDS ? 1 : 0;

        const score = s1Score + s2Score + fluencyScore;

        return {
            score,
            maxScore: 3,
            details: {
                sentence1: { score: s1Score, similarity: Number(sim1.toFixed(2)) },
                sentence2: { score: s2Score, similarity: Number(sim2.toFixed(2)) },
                fluency: { score: fluencyScore, validWords, count: validWords.length },
            },
        };
    }
}
