import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, ClipboardList, BarChart3 } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      path: '/work-orders',
      label: 'Work Orders',
      icon: ClipboardList,
    },
  ];

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}