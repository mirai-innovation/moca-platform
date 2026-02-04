import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

interface Patient {
  _id: string;
  name: string;
  identifier?: string;
  createdAt: string;
}

interface Evaluation {
  _id: string;
  patientId: string;
  status: string;
  total: number;
  completedAt?: string;
}

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = () => {
    const api = apiClient();
    Promise.all([api.get<Patient[]>('/patients'), api.get<Evaluation[]>('/evaluations')])
      .then(([pRes, eRes]) => {
        setPatients(pRes.data);
        setEvaluations(eRes.data);
      })
      .catch(() => setError('Error al cargar los datos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar al paciente "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(id);
    apiClient()
      .delete(`/patients/${id}`)
      .then(() => loadData())
      .catch(() => {
        setError('Error al eliminar el paciente');
        setDeletingId(null);
      })
      .finally(() => setDeletingId(null));
  };

  const evalCountByPatient: Record<string, number> = {};
  const lastEvalByPatient: Record<string, { total: number; date: string }> = {};
  evaluations.filter((e) => e.status === 'completed').forEach((e) => {
    evalCountByPatient[e.patientId] = (evalCountByPatient[e.patientId] || 0) + 1;
    const existing = lastEvalByPatient[e.patientId];
    const date = e.completedAt || e._id;
    if (!existing || date > existing.date) lastEvalByPatient[e.patientId] = { total: e.total, date };
  });

  if (loading) return <div className="text-slate-600">Cargando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Panel de control', to: '/dashboard' },
          { label: 'Pacientes' },
        ]}
        className="mb-2"
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Gestiona los pacientes y asígnales un estudio. Desde la ficha de cada paciente puedes programar sesiones e iniciar evaluaciones MoCA.
          </p>
        </div>
        <Button href="/dashboard/patients/new">Añadir paciente</Button>
      </div>

      <Card>
        {patients.length === 0 ? (
          <p className="text-slate-500 py-8 text-center">No hay pacientes. Añade el primero.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="pb-3 pr-4 font-medium">Nombre</th>
                  <th className="pb-3 pr-4 font-medium">Identificador</th>
                  <th className="pb-3 pr-4 font-medium">Evaluaciones</th>
                  <th className="pb-3 pr-4 font-medium">Última puntuación</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">{p.name}</td>
                    <td className="py-3 pr-4 text-slate-600">{p.identifier || '—'}</td>
                    <td className="py-3 pr-4">{evalCountByPatient[p._id] ?? 0}</td>
                    <td className="py-3 pr-4">
                      {lastEvalByPatient[p._id] ? `${lastEvalByPatient[p._id].total}/30` : '—'}
                    </td>
                    <td className="py-3 flex items-center gap-3">
                      <Link
                        to={`/dashboard/patients/${p._id}`}
                        className="text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Ver
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={deletingId === p._id}
                        className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                      >
                        {deletingId === p._id ? 'Eliminando...' : 'Eliminar'}
                      </button>
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
