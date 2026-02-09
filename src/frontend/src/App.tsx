import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from './pages/DashboardPage';
import HookTemplateLibraryPage from './pages/HookTemplateLibraryPage';
import AppLayout from './components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type View = 'dashboard' | 'hooks';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppLayout currentView={currentView} onNavigate={setCurrentView}>
          {currentView === 'dashboard' ? (
            <DashboardPage />
          ) : (
            <HookTemplateLibraryPage />
          )}
        </AppLayout>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
