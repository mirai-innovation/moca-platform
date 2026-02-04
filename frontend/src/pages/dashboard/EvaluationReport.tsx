import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Evaluation {
  _id: string;
  testId: string;
  patientId: string;
  status: string;
  visuospatial: number;
  naming: number;
  attention: number;
  language: number;
  abstraction: number;
  delayedRecall: number;
  orientation: number;
  total: number;
  educationAdjust: boolean;
  completedAt?: string;
}

function getVerdict(score: number) {
  if (score >= 26) return { label: 'Sin alteración de las funciones cognitivas', color: 'text-green-600', bg: 'bg-green-100' };
  if (score >= 20 && score <= 23) return { label: 'Deterioro cognitivo leve', color: 'text-amber-600', bg: 'bg-amber-100' };
  if (score < 10) return { label: 'Deterioro cognitivo', color: 'text-red-600', bg: 'bg-red-100' };
  return { label: 'Puntaje fuera de rango específico (Evaluar clínicamente)', color: 'text-slate-600', bg: 'bg-slate-100' };
}

export default function EvaluationReport() {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!evaluationId) return;
    apiClient()
      .get<Evaluation>(`/evaluations/${evaluationId}`)
      .then((res) => setEvaluation(res.data))
      .catch(() => setError('Error al cargar el reporte'))
      .finally(() => setLoading(false));
  }, [evaluationId]);

  if (loading) return <div className="text-slate-600">Cargando...</div>;
  if (error || !evaluation) return <div className="text-red-600">{error || 'Reporte no encontrado'}</div>;
  if (evaluation.status !== 'completed') {
    return (
      <div>
        <p className="text-slate-600">Esta evaluación no está completada.</p>
        <Link to={`/tests/${evaluation.testId}/report`} className="text-brand-600 mt-2 inline-block">Ir al test</Link>
      </div>
    );
  }

  const verdict = getVerdict(evaluation.total);
  const rows = [
    { label: '1. Visoespacial / Ejecutiva', max: 5, score: evaluation.visuospatial },
    { label: '2. Identificación', max: 3, score: evaluation.naming },
    { label: '3. Memoria (Aprendizaje)', max: '--', score: '--' },
    { label: '4. Atención', max: 6, score: evaluation.attention },
    { label: '5. Lenguaje', max: 3, score: evaluation.language },
    { label: '6. Abstracción', max: 2, score: evaluation.abstraction },
    { label: '7. Recuerdo Diferido', max: 5, score: evaluation.delayedRecall },
    { label: '8. Orientación', max: 6, score: evaluation.orientation },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/dashboard/evaluations" className="text-sm text-slate-500 hover:text-brand-600 mb-2 inline-block">
            ← Volver a evaluaciones
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Reporte MoCA</h1>
          {evaluation.completedAt && (
            <p className="text-slate-500 text-sm mt-1">
              Completada el {new Date(evaluation.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={() => window.print()}>Imprimir</Button>
      </div>

      <Card className="p-8">
        <h2 className="text-xl font-semibold mb-6">Resumen de Puntuación</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-6 py-3">Módulo</th>
                <th className="px-6 py-3">Puntaje Máx</th>
                <th className="px-6 py-3">Puntaje Obtenido</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b">
                  <td className="px-6 py-4 font-medium">{r.label}</td>
                  <td className="px-6 py-4">{r.max}</td>
                  <td className="px-6 py-4">{typeof r.score === 'number' ? r.score : r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {evaluation.educationAdjust && (
          <p className="mt-4 text-slate-600 text-sm">Ajuste por estudios ≤ 12 años: +1 punto</p>
        )}
        <div className={`mt-8 p-8 rounded-xl text-center border-2 ${verdict.bg} ${verdict.color} border-current`}>
          <h3 className="text-2xl font-bold uppercase mb-2">Puntuación Total</h3>
          <div className="text-6xl font-black mb-4">
            {evaluation.total} <span className="text-3xl font-medium">/ 30</span>
          </div>
          <div className="text-xl font-semibold border-t border-current pt-4 inline-block px-12">
            {verdict.label}
          </div>
        </div>
        <div className="mt-6">
          <Link to={`/dashboard/patients/${evaluation.patientId}`}>
            <Button variant="outline">Ver paciente</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
