import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';

const nav = [
  { to: '/dashboard', end: true, label: 'Resumen' },
  { to: '/dashboard/studies', end: false, label: 'Estudios' },
  { to: '/dashboard/patients', end: false, label: 'Pacientes' },
  { to: '/dashboard/evaluations', end: false, label: 'Evaluaciones' },
];

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <aside className="w-56 bg-white border-r border-slate-200 shrink-0 hidden md:block">
          <nav className="p-4 space-y-1">
            {nav.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-100 text-brand-800' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
