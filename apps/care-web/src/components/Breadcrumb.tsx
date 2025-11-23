import { Link } from '@tanstack/react-router';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-[#9c7a4f]">
        <li>
          <Link to="/" className="hover:text-[#c28a3a]">
            首页
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <span className="mx-2">/</span>
            {item.href ? (
              <Link to={item.href} className="hover:text-[#c28a3a]">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#7b6243]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}