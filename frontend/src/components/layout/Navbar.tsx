import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { getStoredUser, clearAuth } from '../../lib/auth';

export const Navbar = () => {
    const navigate = useNavigate();
    const user = getStoredUser();

    const handleLogout = () => {
        clearAuth();
        navigate('/');
        window.location.reload();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="MoCA Logo"
                                className="w-8 h-8 rounded-lg object-contain"
                                onError={(e) => {
                                    // Fallback text if image missing (until user uploads)
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('fallback-logo');
                                }}
                            />
                            <span className="text-xl font-bold text-brand-900 tracking-tight">MoCA Platform</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <a href="/#about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                            Acerca del test
                        </a>
                        <a href="/#faq" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                            Preguntas frecuentes
                        </a>
                        <div className="h-4 w-px bg-brand-200 mx-2"></div>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                                    Dashboard
                                </Link>
                                <span className="text-sm text-slate-600 truncate max-w-[140px]" title={user.email}>{user.name}</span>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    Cerrar sesión
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                                    Registro
                                </Link>
                                <Button variant="ghost" size="sm" href="/login">
                                    Acceso Profesional
                                </Button>
                            </>
                        )}
                        <Button variant="primary" size="sm" href={user ? "/dashboard" : "/tests/demo/visuospatial"}>
                            Iniciar Evaluación
                        </Button>
                    </div>

                    {/* Mobile menu button placeholder */}
                    <div className="md:hidden">
                        <button className="text-slate-500 hover:text-brand-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
