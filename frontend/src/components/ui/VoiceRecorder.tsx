import { useRef, useState } from 'react';
import { Button } from './Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface VoiceRecorderProps {
    /** Se llama con el texto transcrito de cada grabación (para acumular). */
    onResult: (text: string) => void;
    disabled?: boolean;
    /** Texto del botón cuando está inactivo. */
    idleLabel?: string;
    className?: string;
    /** Notifica cuando empieza/termina la grabación (p. ej. para un cronómetro). */
    onRecordingChange?: (recording: boolean) => void;
}

interface TranscriptBoxProps {
    transcript: string;
    onClear: () => void;
    placeholder?: string;
    mono?: boolean;
}

/** Recuadro que muestra el texto acumulado con opción de borrar para rehacer. */
export function TranscriptBox({ transcript, onClear, placeholder = 'Su respuesta aparecerá aquí...', mono = false }: TranscriptBoxProps) {
    return (
        <div>
            <div className={`p-4 bg-slate-100 rounded-lg min-h-[60px] text-left ${mono ? 'text-lg font-mono' : ''}`}>
                {transcript || <span className="text-slate-400 italic">{placeholder}</span>}
            </div>
            {transcript && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-2 text-xs text-slate-500 hover:text-red-600 underline"
                >
                    Borrar y volver a grabar
                </button>
            )}
        </div>
    );
}

/** Elige un mimeType soportado por el navegador y su extensión de archivo. */
function pickMimeType(): { mimeType: string; ext: string } {
    const candidates: { mimeType: string; ext: string }[] = [
        { mimeType: 'audio/webm', ext: 'webm' },
        { mimeType: 'audio/mp4', ext: 'mp4' },
        { mimeType: 'audio/ogg', ext: 'ogg' },
    ];
    for (const c of candidates) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c.mimeType)) return c;
    }
    return { mimeType: '', ext: 'webm' };
}

/**
 * Botón de grabación de voz que transcribe con Whisper (backend /transcribe).
 * A diferencia del reconocimiento nativo del navegador, aquí se grada el audio,
 * se envía al terminar, y el texto resultante se ENTREGA al padre para acumularlo
 * (no se borra lo anterior).
 */
export function VoiceRecorder({ onResult, disabled, idleLabel = '🎙️ Grabar respuesta', className = '', onRecordingChange }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const extRef = useRef('webm');

    const startRecording = async () => {
        setError('');
        setIsStarting(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const { mimeType, ext } = pickMimeType();
            extRef.current = ext;
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
                stream.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
                void uploadAndTranscribe(blob);
            };

            // Warm-up: el micrófono tarda ~300-400ms en estabilizarse tras getUserMedia.
            // Esperamos a que el stream esté vivo ANTES de indicar "Grabando", así el
            // usuario no habla en el hueco inicial y no se pierden las primeras palabras.
            await new Promise((r) => setTimeout(r, 400));

            // Si el usuario canceló durante el warm-up, aborta.
            if (!streamRef.current) { setIsStarting(false); return; }

            recorder.start(250); // timeslice: emite chunks periódicamente (captura más fiable desde el inicio)
            mediaRecorderRef.current = recorder;
            setIsStarting(false);
            setIsRecording(true);
            onRecordingChange?.(true);
        } catch (err) {
            console.error('getUserMedia error', err);
            setError('No se pudo acceder al micrófono. Revisa los permisos (y que estés en HTTPS).');
            setIsStarting(false);
        }
    };

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') recorder.stop();
        setIsRecording(false);
        onRecordingChange?.(false);
    };

    const uploadAndTranscribe = async (blob: Blob) => {
        setIsTranscribing(true);
        setError('');
        try {
            const form = new FormData();
            form.append('audio', blob, `audio.${extRef.current}`);
            form.append('language', 'es');
            const res = await fetch(`${API_URL}/transcribe`, { method: 'POST', body: form });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const text = (data?.text || '').trim();
            if (text) onResult(text);
        } catch (err) {
            console.error('transcribe error', err);
            setError('No se pudo transcribir el audio. Intenta de nuevo.');
        } finally {
            setIsTranscribing(false);
        }
    };

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled || isTranscribing || isStarting}
                variant={isRecording ? 'destructive' : 'secondary'}
            >
                {isTranscribing
                    ? '⏳ Transcribiendo…'
                    : isStarting
                        ? '🎤 Preparando micrófono…'
                        : isRecording
                            ? '⏹️ Detener y transcribir'
                            : idleLabel}
            </Button>
            {isRecording && (
                <p className="text-xs text-green-600 font-medium">● Grabando — ya puede hablar</p>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}
