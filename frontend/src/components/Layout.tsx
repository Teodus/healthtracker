import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-inter antialiased">
      <main className="relative">
        {children}
      </main>
      <Toaster />
    </div>
  );
}