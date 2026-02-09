import { SiFacebook } from 'react-icons/si';
import { Heart, LayoutDashboard, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'hooks';
  onNavigate: (view: 'dashboard' | 'hooks') => void;
}

export default function AppLayout({ children, currentView, onNavigate }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <SiFacebook className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Business Marketing Tracker</h1>
                <p className="text-xs text-muted-foreground">Facebook Outreach Manager</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex gap-2">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="flex-1 sm:flex-none"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={currentView === 'hooks' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('hooks')}
                className="flex-1 sm:flex-none"
              >
                <BookText className="mr-2 h-4 w-4" />
                Hook Library
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026. Built with <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
