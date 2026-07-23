import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { apiClient } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

/**
 * Pantalla final del test para el PACIENTE.
 *
 * A diferencia de la versión anterior, aquí NO se muestra ningún puntaje ni veredicto:
 * la evaluación (todos los módulos) se envía en silencio al backend y los resultados
 * quedan disponibles SOLO en el dashboard del profesional. El paciente únicamente ve
 * una confirmación de que la evaluación se completó.
 */
const FinalReport: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'saving' | 'saved' | 'done' | 'error'>('saving');
    const submittedRef = useRef(false);

    useEffect(() => {
        if (!testId || submittedRef.current) return;
        submittedRef.current = true;

        const loadScore = (key: string) => {
            const val = localStorage.getItem(`moca_${testId}_${key}`);
            return val ? parseInt(val, 10) : 0;
        };

        const payload = {
            testId,
            visuospatial: loadScore('visuospatial'),
            naming: loadScore('naming'),
            attention: loadScore('attention'),
            language: loadScore('language'),
            abstraction: loadScore('abstraction'),
            delayedRecall: loadScore('delayed_recall'),
            orientation: loadScore('orientation'),
            educationAdjust: false, // el profesional lo ajusta luego en el dashboard
        };

        // Si no hay sesión (modo demo sin login), no hay evaluación que guardar en el dashboard.
        if (!isAuthenticated()) {
            setStatus('done');
            return;
        }

        // Solo enviar si esta evaluación está registrada y en curso.
        apiClient()
            .get(`/evaluations/by-test/${testId}`)
            .then((res) => {
                if (res.data?.status === 'in_progress') {
                    return apiClient()
                        .post('/evaluations/complete-by-test', payload)
                        .then(() => setStatus('saved'));
                }
                // Ya estaba completada o no aplica: solo confirmar.
                setStatus('done');
            })
            .catch(() => {
                // Sin evaluación asociada (o error): igual mostramos confirmación al paciente.
                setStatus('done');
            });

        // Limpieza de los puntajes locales una vez usados
        return () => {
            ['visuospatial', 'naming', 'attention', 'language', 'abstraction', 'delayed_recall', 'orientation'].forEach(
                (k) => localStorage.removeItem(`moca_${testId}_${k}`),
            );
        };
    }, [testId]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-lg w-full">
                <Card className="p-10 text-center">
                    {status === 'saving' ? (
                        <>
                            <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Guardando evaluación…</h1>
                            <p className="text-slate-600">Un momento, por favor.</p>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-3">¡Evaluación completada!</h1>
                            <p className="text-slate-600 mb-8">
                                Gracias por completar la evaluación. Sus respuestas han sido registradas y serán revisadas
                                por el profesional de salud.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                {isAuthenticated() && (
                                    <Button onClick={() => navigate('/dashboard')} variant="primary">
                                        Ir al Dashboard
                                    </Button>
                                )}
                                <Button onClick={() => navigate('/')} variant="outline">
                                    Volver al Inicio
                                </Button>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default FinalReport;
