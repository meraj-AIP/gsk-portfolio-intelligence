import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { theme } from '@/theme';
import { ReviewProvider } from '@/app/context/ReviewContext';
import { BriefingTrayProvider } from '@/app/context/BriefingTrayContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ErrorBoundary } from './ErrorBoundary';

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <QueryClientProvider client={client}>
          <HashRouter>
            <AuthProvider>
              <ReviewProvider>
                <BriefingTrayProvider>{children}</BriefingTrayProvider>
              </ReviewProvider>
            </AuthProvider>
          </HashRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
