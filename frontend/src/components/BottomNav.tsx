import { Home, Target, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth.context';

export function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  // Don't show nav on auth page or when not authenticated
  if (!isAuthenticated || location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/20 z-50">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center justify-center p-2 transition-colors duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}