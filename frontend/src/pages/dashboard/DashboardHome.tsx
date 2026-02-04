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
  professionalId: string;
}

interface Study {
  _id: string;
  name: string;
  sequence: string[];
}

interface Evaluation {
  _id: string;
  testId: string;
  patientId: string;
  status: string;
  total: number;
  completedAt?: string;
  createdAt: string;
}

export default function DashboardHome() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const api = apiClient();
    Promise.all([
      api.get<Patient[]>('/patients'),
      api.get<Study[]>('/studies'),
      api.get<Evaluation[]>('/evaluations'),
    ])
      .then(([pRes, sRes, eRes]) => {
        setPatients(pRes.data);
        setStudies(sRes.data);
        setEvaluations(eRes.data);
      })
      .catch(() => setError('Error al cargar los datos'))
      .finally(() => setLoading(false));
  }, []);

  const patientMap = Object.fromEntries(patients.map((p) => [p._id, p.name]));
  const completed = evaluations.filter((e) => e.status === 'completed');
  const recent = completed.slice(0, 6);

  if (loading) return <div className="text-slate-600">Cargando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-10">
      <Breadcrumbs items={[{ label: 'Panel de control' }]} className="mb-2" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de control</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Primero crea un <strong>estudio</strong> (orden de sesiones: MOCKA, Vending, Relajación). Luego añade <strong>pacientes</strong> y asígnales ese estudio. Desde cada paciente puedes programar sesiones con fecha y hora, y crear evaluaciones MoCA. Aquí tienes el resumen y los accesos rápidos.
        </p>
      </div>

      {/* Acciones principales */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Acciones principales</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col hover:border-brand-300 transition-colors">
            <div className="flex-1">
              <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Crear estudio</h3>
              <p className="text-sm text-slate-500 mt-1">Define la secuencia de sesiones (MOCKA, Vending, Relajación).</p>
            </div>
            <Button href="/dashboard/studies/new" className="mt-4 w-full" size="sm">
              Crear estudio
            </Button>
          </Card>

          <Card className="flex flex-col hover:border-brand-300 transition-colors">
            <div className="flex-1">
              <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Crear paciente</h3>
              <p className="text-sm text-slate-500 mt-1">Registra un nuevo paciente y asígnale un estudio.</p>
            </div>
            <Button href="/dashboard/patients/new" className="mt-4 w-full" size="sm">
              Crear paciente
            </Button>
          </Card>

          <Card className="flex flex-col hover:border-brand-300 transition-colors">
            <div className="flex-1">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Ver pacientes</h3>
              <p className="text-sm text-slate-500 mt-1">Lista de pacientes, sesiones y evaluaciones.</p>
            </div>
            <Button href="/dashboard/patients" variant="outline" className="mt-4 w-full" size="sm">
              Ir a pacientes
            </Button>
          </Card>

          <Card className="flex flex-col hover:border-brand-300 transition-colors">
            <div className="flex-1">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Ver estudios</h3>
              <p className="text-sm text-slate-500 mt-1">Gestiona y edita tus estudios creados.</p>
            </div>
            <Button href="/dashboard/studies" variant="outline" className="mt-4 w-full" size="sm">
              Ir a estudios
            </Button>
          </Card>
        </div>
      </section>

      {/* Resumen numérico */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Resumen</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Estudios</p>
              <p className="text-2xl font-bold text-slate-900">{studies.length}</p>
            </div>
            <Link to="/dashboard/studies" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Ver</Link>
          </Card>
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pacientes</p>
              <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
            </div>
            <Link to="/dashboard/patients" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Ver</Link>
          </Card>
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Evaluaciones</p>
              <p className="text-2xl font-bold text-slate-900">{completed.length}</p>
            </div>
            <Link to="/dashboard/evaluations" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Ver</Link>
          </Card>
        </div>
      </section>

      {/* Evaluaciones recientes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Últimas evaluaciones</h2>
          <Link to="/dashboard/evaluations" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Ver todas
          </Link>
        </div>
        <Card>
          {recent.length === 0 ? (
            <p className="text-slate-500 py-4">Aún no hay evaluaciones completadas.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((e) => (
                <li key={e._id} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-slate-800">{patientMap[e.patientId] ?? 'Paciente'}</span>
                  <span className="text-slate-600">{e.total}/30</span>
                  <Link
                    to={`/dashboard/evaluations/${e._id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Ver reporte
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
