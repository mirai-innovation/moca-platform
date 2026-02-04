import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Navbar } from '../components/layout/Navbar';
import { setAuth, isAuthenticated } from '../lib/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post<{ token: string; userId: string; name: string; email: string; role: string }>(
        `${API_URL}/auth/login`,
        { email, password }
      );
      setAuth(data.token, { userId: data.userId, name: data.name, email: data.email, role: data.role });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : 'Error al iniciar sesión. Comprueba tu correo y contraseña.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso Profesional</h1>
          <p className="text-slate-600 mb-6">Inicia sesión con tu correo y contraseña.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </Button>
          </form>
          <p className="mt-6 text-center text-slate-600 text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Regístrate
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
