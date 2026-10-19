import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { ErrorBoundary } from '@/app/providers/ErrorBoundary';
import { LoadingState } from '@/shared/components/StatePanels';
import { FindingPanel } from '@/features/findings/FindingPanel';
import { EvidenceDialog } from '@/features/evidence/EvidenceDialog';
import { AskPanel } from '@/features/ask/AskPanel';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignInPage } from '@/features/auth/SignInPage';
import { useAuth } from '@/features/auth/AuthContext';
import { landingPath } from '@/shared/lib/permissions';
import { QueryRedirect, ReleaseRedirect } from './redirects';

const PortfolioPage = lazy(() => import('@/features/portfolio/PortfolioPage').then((m) => ({ default: m.PortfolioPage })));
const ComparePage = lazy(() => import('@/features/directory/ComparePage').then((m) => ({ default: m.ComparePage })));
const ThisWeekPage = lazy(() => import('@/features/week/ThisWeekPage').then((m) => ({ default: m.ThisWeekPage })));
const DirectoryPage = lazy(() => import('@/features/directory/DirectoryPage').then((m) => ({ default: m.DirectoryPage })));
const ProgrammePage = lazy(() => import('@/features/directory/ProgrammePage').then((m) => ({ default: m.ProgrammePage })));
const ProjectPage = lazy(() => import('@/features/directory/ProjectPage').then((m) => ({ default: m.ProjectPage })));
const DecisionsPage = lazy(() => import('@/features/decisions/DecisionsPage').then((m) => ({ default: m.DecisionsPage })));
const BriefingPage = lazy(() => import('@/features/briefing/BriefingPage').then((m) => ({ default: m.BriefingPage })));
const SourcesPage = lazy(() => import('@/features/admin/SourcesPage').then((m) => ({ default: m.SourcesPage })));
const DefinitionsPage = lazy(() => import('@/features/admin/DefinitionsPage').then((m) => ({ default: m.DefinitionsPage })));

export function AppRouter() {
  const { user } = useAuth();
  if (!user) {
    return (
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="*" element={<RequireAuth><span /></RequireAuth>} />
      </Routes>
    );
  }
  return (
    <AppShell panels={<><FindingPanel /><EvidenceDialog /><AskPanel /></>}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingState rows={6} />}>
          <Routes>
            <Route path="/" element={<Navigate to={landingPath(user)} replace />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/dependencies" element={<QueryRedirect to="/portfolio" set={{ tab: 'constraints' }} />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/this-week" element={<ThisWeekPage />} />
            <Route path="/releases" element={<QueryRedirect to="/this-week" set={{ tab: 'releases' }} />} />
            <Route path="/releases/:id" element={<ReleaseRedirect />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/programmes/:id" element={<ProgrammePage />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/decisions" element={<DecisionsPage />} />
            <Route path="/briefing" element={<BriefingPage />} />
            <Route path="/ask" element={<QueryRedirect to="/portfolio" rename={{ about: 'ask' }} />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/definitions" element={<DefinitionsPage />} />
            <Route path="/audit" element={<QueryRedirect to="/sources" set={{ tab: 'audit' }} />} />
            <Route path="*" element={<Navigate to="/portfolio" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}
