import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

interface Patient {
  _id: string;
  name: string;
}

interface Evaluation {
  _id: string;
  patientId: string;
  testId: string;
  status: string;
  total: number;
  completedAt?: string;
  createdAt: string;
}

export default function EvaluationsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const api = apiClient();
    Promise.all([api.get<Patient[]>('/patients'), api.get<Evaluation[]>('/evaluations')])
      .then(([pRes, eRes]) => {
        setPatients(pRes.data);
        setEvaluations(eRes.data);
      })
      .catch(() => setError('Error al cargar los datos'))
      .finally(() => setLoading(false));
  }, []);

  const patientMap = Object.fromEntries(patients.map((p) => [p._id, p.name]));
  const completed = evaluations.filter((e) => e.status === 'completed').sort((a, b) => {
    const da = a.completedAt || a.createdAt;
    const db = b.completedAt || b.createdAt;
    return db.localeCompare(da);
  });

  if (loading) return <div className="text-slate-600">Cargando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Panel de control', to: '/dashboard' },
          { label: 'Evaluaciones' },
        ]}
        className="mb-2"
      />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Evaluaciones</h1>
        <p className="text-slate-600 text-sm mt-1 max-w-xl">
          Listado de evaluaciones MoCA completadas. Haz clic en «Ver reporte» para ver el detalle de cada una.
        </p>
      </div>

      <Card>
        {completed.length === 0 ? (
          <p className="text-slate-500 py-8 text-center">No hay evaluaciones completadas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-3 pr-4 font-medium">Paciente</th>
                  <th className="pb-3 pr-4 font-medium">Puntuación</th>
                  <th className="pb-3 pr-4 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((e) => (
                  <tr key={e._id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">{patientMap[e.patientId] ?? '—'}</td>
                    <td className="py-3 pr-4">{e.total}/30</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/dashboard/evaluations/${e._id}`}
                        className="text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Ver reporte
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
