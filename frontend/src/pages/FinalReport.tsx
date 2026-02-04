import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { apiClient } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

// Verdict thresholds
// ≥ 26: Normal
// 20-23: Mild Cognitive Impairment (DCL)
// < 10: Cognitive Impairment
// Note: Ranges like 24-25 or 10-19 are not explicitly labeled in the brief snippet provided 
// but usually fall into "Mild" or borderline. For this strict rubric:
// We will follow the text exactly:
// >= 26: Sin alteración
// 20-23: Deterioro cognitivo leve
// < 10: Deterioro cognitivo
// Gaps (24-25, 10-19) - We will label them "Indeterminado / Revisar Clínica" or loosely map to closest severity for the demo, 
// OR just leave them as "Puntaje: X" without specific label if outside standard ranges.
// However, standard MoCA usually says <26 is abnormal. 
// Let's implement a safe check.

const FinalReport: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    // State for scores (default 0 or null if not found)
    const [visuospatialScore, setVisuospatialScore] = useState(0);
    const [namingScore, setNamingScore] = useState(0);
    const [memoryScore, setMemoryScore] = useState(0); // Usually 0 points for learning phase
    const [attentionScore, setAttentionScore] = useState(0); // Manual
    const [languageScore, setLanguageScore] = useState(0); // Manual
    const [abstractionScore, setAbstractionScore] = useState(0);
    const [delayedRecallScore, setDelayedRecallScore] = useState(0);
    const [orientationScore, setOrientationScore] = useState(0);

    // Education correction
    const [educationAdjust, setEducationAdjust] = useState(false); // <= 12 years

    // Tracked evaluation (from dashboard): can save to backend
    const [trackedEvaluation, setTrackedEvaluation] = useState<{ testId: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveDone, setSaveDone] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        // We expect keys like `moca_${testId}_${moduleName}` or a single JSON object
        // Strategies:
        // 1. Visuospatial: saved 'visuospatial_score'
        // 2. Naming: saved 'naming_score'
        // 3. Abstraction: saved 'abstraction_score'
        // 4. DelayedRecall: saved 'recall_score'
        // 5. Orientation: saved 'orientation_score'

        // Since we haven't implemented the saving part in other files yet, this will just load 0s for now.
        // We will implement the saving logic next.

        const loadScore = (key: string) => {
            const val = localStorage.getItem(`moca_${testId}_${key}`);
            return val ? parseInt(val, 10) : 0;
        };

        setVisuospatialScore(loadScore('visuospatial'));
        setNamingScore(loadScore('naming'));
        setAbstractionScore(loadScore('abstraction'));
        setDelayedRecallScore(loadScore('delayed_recall'));
        setOrientationScore(loadScore('orientation'));
        // Attention & Language are manual input here, init with 0
    }, [testId]);

    // If user is logged in, check if this testId is a tracked evaluation (from dashboard)
    useEffect(() => {
        if (!testId || !isAuthenticated()) return;
        apiClient()
            .get(`/evaluations/by-test/${testId}`)
            .then((res) => {
                if (res.data?.status === 'in_progress') setTrackedEvaluation({ testId });
            })
            .catch(() => {});
    }, [testId]);

    // Calculate Total
    const baseTotal = visuospatialScore + namingScore + memoryScore + attentionScore + languageScore + abstractionScore + delayedRecallScore + orientationScore;
    const finalTotal = Math.min(30, baseTotal + (educationAdjust ? 1 : 0)); // Max 30

    // Verdict Logic
    const getVerdict = (score: number) => {
        if (score >= 26) return { label: "Sin alteración de las funciones cognitivas", color: "text-green-600", bg: "bg-green-100" };
        if (score >= 20 && score <= 23) return { label: "Deterioro cognitivo leve", color: "text-amber-600", bg: "bg-amber-100" };
        if (score < 10) return { label: "Deterioro cognitivo", color: "text-red-600", bg: "bg-red-100" };
        // Fallback for gaps (10-19, 24-25)
        return { label: "Puntaje fuera de rango específico (Evaluar clínicamente)", color: "text-slate-600", bg: "bg-slate-100" };
    };

    const verdict = getVerdict(finalTotal);

    const handleSaveReport = () => {
        if (!trackedEvaluation?.testId) return;
        setSaving(true);
        apiClient()
            .post('/evaluations/complete-by-test', {
                testId: trackedEvaluation.testId,
                visuospatial: visuospatialScore,
                naming: namingScore,
                attention: attentionScore,
                language: languageScore,
                abstraction: abstractionScore,
                delayedRecall: delayedRecallScore,
                orientation: orientationScore,
                educationAdjust,
            })
            .then(() => {
                setSaveDone(true);
                setTrackedEvaluation(null);
            })
            .catch(() => setSaving(false))
            .finally(() => setSaving(false));
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-slate-900 text-center">Reporte Final MoCA</h1>

                <Card className="p-8">
                    <h2 className="text-xl font-semibold mb-6">Resumen de Puntuación</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Módulo</th>
                                    <th className="px-6 py-3">Puntaje Máx</th>
                                    <th className="px-6 py-3">Puntaje Obtenido</th>
                                    <th className="px-6 py-3">Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">1. Visoespacial / Ejecutiva</td>
                                    <td className="px-6 py-4">5</td>
                                    <td className="px-6 py-4">{visuospatialScore}</td>
                                    <td className="px-6 py-4 text-slate-500">Automático (IA)</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">2. Identificación</td>
                                    <td className="px-6 py-4">3</td>
                                    <td className="px-6 py-4">{namingScore}</td>
                                    <td className="px-6 py-4 text-slate-500">Automático</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">3. Memoria (Aprendizaje)</td>
                                    <td className="px-6 py-4">--</td>
                                    <td className="px-6 py-4">--</td>
                                    <td className="px-6 py-4 text-slate-500">Sin puntaje</td>
                                </tr>
                                <tr className="border-b bg-yellow-50">
                                    <td className="px-6 py-4 font-medium">4. Atención</td>
                                    <td className="px-6 py-4">6</td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            max={6}
                                            min={0}
                                            value={attentionScore}
                                            onChange={(e) => setAttentionScore(parseInt(e.target.value) || 0)}
                                            className="w-16 p-1 border rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-amber-700 font-medium">Ingreso Manual</td>
                                </tr>
                                <tr className="border-b bg-yellow-50">
                                    <td className="px-6 py-4 font-medium">5. Lenguaje</td>
                                    <td className="px-6 py-4">3</td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            max={3}
                                            min={0}
                                            value={languageScore}
                                            onChange={(e) => setLanguageScore(parseInt(e.target.value) || 0)}
                                            className="w-16 p-1 border rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-amber-700 font-medium">Ingreso Manual</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">6. Abstracción</td>
                                    <td className="px-6 py-4">2</td>
                                    <td className="px-6 py-4">{abstractionScore}</td>
                                    <td className="px-6 py-4 text-slate-500">Automático (IA)</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">7. Recuerdo Diferido</td>
                                    <td className="px-6 py-4">5</td>
                                    <td className="px-6 py-4">{delayedRecallScore}</td>
                                    <td className="px-6 py-4 text-slate-500">Automático</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">8. Orientación</td>
                                    <td className="px-6 py-4">6</td>
                                    <td className="px-6 py-4">{orientationScore}</td>
                                    <td className="px-6 py-4 text-slate-500">Híbrido (Auto/Manual)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 p-6 bg-slate-50 rounded-lg space-y-4">
                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                id="edu"
                                className="w-5 h-5"
                                checked={educationAdjust}
                                onChange={(e) => setEducationAdjust(e.target.checked)}
                            />
                            <label htmlFor="edu" className="font-medium text-lg">
                                El paciente tiene ≤ 12 años de estudios (+1 punto)
                            </label>
                        </div>
                    </div>

                    <div className={`mt-8 p-8 rounded-xl text-center border-2 ${verdict.bg} ${verdict.color} border-current`}>
                        <h3 className="text-2xl font-bold uppercase mb-2">Puntuación Total</h3>
                        <div className="text-6xl font-black mb-4">{finalTotal} <span className="text-3xl font-medium">/ 30</span></div>
                        <div className="text-xl font-semibold border-t border-current pt-4 inline-block px-12">
                            {verdict.label}
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        {trackedEvaluation && !saveDone && (
                            <Button onClick={handleSaveReport} disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar reporte en el dashboard'}
                            </Button>
                        )}
                        {saveDone && <span className="text-green-600 font-medium">Reporte guardado correctamente.</span>}
                        <Button onClick={() => window.print()} variant="outline">Imprimir Reporte</Button>
                        <Button onClick={() => navigate('/dashboard')} variant="primary">Ir al Dashboard</Button>
                        <Button onClick={() => navigate('/')} variant="outline">Volver al Inicio</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default FinalReport;
