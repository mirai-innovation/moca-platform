import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

interface Study {
  _id: string;
  name: string;
  sequence: string[];
}

const ACTIVITY_LABELS: Record<string, string> = {
  MOCKA: 'MOCKA',
  VENDING: 'Vending Machine',
  RELAJACION: 'Relajación',
};

export default function StudiesList() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadStudies = () => {
    apiClient()
      .get<Study[]>('/studies')
      .then((res) => setStudies(res.data))
      .catch(() => setError('Error al cargar los estudios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudies();
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar el estudio "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(id);
    apiClient()
      .delete(`/studies/${id}`)
      .then(() => loadStudies())
      .catch(() => {
        setError('Error al eliminar el estudio');
        setDeletingId(null);
      })
      .finally(() => setDeletingId(null));
  };

  if (loading) return <div className="text-slate-600">Cargando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Panel de control', to: '/dashboard' },
          { label: 'Estudios' },
        ]}
        className="mb-2"
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estudios</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Cada estudio define el orden de las sesiones (MOCKA, Vending Machine, Relajación). Asígnalo al crear o editar un paciente.
          </p>
        </div>
        <Button href="/dashboard/studies/new">Crear estudio</Button>
      </div>

      <Card>
        {studies.length === 0 ? (
          <p className="text-slate-500 py-8 text-center">No hay estudios. Crea uno para definir secuencias de sesiones (MOCKA, Vending Machine, Relajación).</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {studies.map((s) => (
              <li key={s._id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-sm text-slate-500">
                    Secuencia: {s.sequence.map((a) => ACTIVITY_LABELS[a] || a).join(' → ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to={`/dashboard/studies/${s._id}/edit`} className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(s._id, s.name)}
                    disabled={deletingId === s._id}
                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === s._id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
