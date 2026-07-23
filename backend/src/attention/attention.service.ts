import { Injectable } from '@nestjs/common';

export interface AttentionModuleSubmission {
    testId: string;
    digitsForward?: string;   // transcript de la serie directa
    digitsBackward?: string;  // transcript de la serie inversa
    letterErrors?: number;    // errores en la detección de la letra A
    serial7?: string;         // transcript de la resta serie de 7
}

export interface AttentionModuleResult {
    score: number;
    maxScore: number;
    details: {
        digitsForward: { score: number; expected: number[]; got: number[] };
        digitsBackward: { score: number; expected: number[]; got: number[] };
        letters: { score: number; errors: number };
        serial7: { score: number; correct: number[]; got: number[] };
    };
}

@Injectable()
export class AttentionService {
    private readonly DIGITS_FORWARD = [2, 1, 8, 5, 4];
    private readonly DIGITS_BACKWARD_SPOKEN = [7, 4, 2]; // se leen así; el paciente debe repetir al revés
    private readonly SERIAL7_CHAIN = [93, 86, 79, 72, 65]; // 100 - 7 sucesivo

    /** Extrae los números presentes en un texto (incluye dígitos escritos y numéricos simples). */
    private extractNumbers(text?: string): number[] {
        if (!text) return [];
        const wordToNum: Record<string, string> = {
            cero: '0', uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4',
            cinco: '5', seis: '6', siete: '7', ocho: '8', nueve: '9', diez: '10',
        };
        // Reemplaza palabras-número por su cifra para poder capturarlas
        const normalized = text
            .toLowerCase()
            .replace(/[a-záéíóúñ]+/g, (w) => (wordToNum[w] !== undefined ? ` ${wordToNum[w]} ` : ' '));
        const matches = normalized.match(/\d+/g);
        return matches ? matches.map((n) => parseInt(n, 10)) : [];
    }

    /** Extrae la secuencia de dígitos individuales (0-9) que dijo el paciente. */
    private extractDigits(text?: string): number[] {
        if (!text) return [];
        const wordToDigit: Record<string, number> = {
            cero: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4,
            cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
        };
        const tokens = text.toLowerCase().split(/[^a-záéíóúñ0-9]+/).filter(Boolean);
        const digits: number[] = [];
        for (const t of tokens) {
            if (/^\d$/.test(t)) digits.push(parseInt(t, 10));
            else if (/^\d+$/.test(t)) t.split('').forEach((d) => digits.push(parseInt(d, 10)));
            else if (wordToDigit[t] !== undefined) digits.push(wordToDigit[t]);
        }
        return digits;
    }

    private arraysEqual(a: number[], b: number[]): boolean {
        return a.length === b.length && a.every((v, i) => v === b[i]);
    }

    evaluate(submission: AttentionModuleSubmission): AttentionModuleResult {
        // 1) Dígitos directos (1 punto): repetir 2-1-8-5-4 exactamente
        const gotForward = this.extractDigits(submission.digitsForward);
        const forwardScore = this.arraysEqual(gotForward, this.DIGITS_FORWARD) ? 1 : 0;

        // 2) Dígitos inversos (1 punto): el paciente debe decir 7-4-2 al revés => 2-4-7
        const expectedBackward = [...this.DIGITS_BACKWARD_SPOKEN].reverse(); // [2,4,7]
        const gotBackward = this.extractDigits(submission.digitsBackward);
        const backwardScore = this.arraysEqual(gotBackward, expectedBackward) ? 1 : 0;

        // 3) Detección de letras (1 punto): 0 o 1 error
        const errors = typeof submission.letterErrors === 'number' ? submission.letterErrors : 99;
        const lettersScore = errors <= 1 ? 1 : 0;

        // 4) Resta serie de 7 (3 puntos): 4-5 correctas=3, 2-3=2, 1=1, 0=0
        const gotSerial = this.extractNumbers(submission.serial7).filter((n) => n < 100 && n >= 0);
        // Cuenta cuántos de los primeros 5 números coinciden con la cadena esperada (posición a posición,
        // con tolerancia: se evalúa cada número contra la cadena canónica 93,86,79,72,65).
        const correctSerial: number[] = [];
        for (let i = 0; i < this.SERIAL7_CHAIN.length; i++) {
            if (gotSerial[i] === this.SERIAL7_CHAIN[i]) correctSerial.push(this.SERIAL7_CHAIN[i]);
        }
        const nCorrect = correctSerial.length;
        let serialScore = 0;
        if (nCorrect >= 4) serialScore = 3;
        else if (nCorrect >= 2) serialScore = 2;
        else if (nCorrect === 1) serialScore = 1;

        const score = forwardScore + backwardScore + lettersScore + serialScore;

        return {
            score,
            maxScore: 6,
            details: {
                digitsForward: { score: forwardScore, expected: this.DIGITS_FORWARD, got: gotForward },
                digitsBackward: { score: backwardScore, expected: expectedBackward, got: gotBackward },
                letters: { score: lettersScore, errors },
                serial7: { score: serialScore, correct: correctSerial, got: gotSerial.slice(0, 5) },
            },
        };
    }
}
