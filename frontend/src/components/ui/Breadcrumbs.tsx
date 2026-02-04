import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Navegación" className={`text-sm text-slate-500 ${className}`}>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2 text-slate-400">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
