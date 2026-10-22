import { type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import HomePage from './pages/HomePage';
import ApplyPage from './pages/ApplyPage';
import JobDetailsPage from './components/app/JobDetails';
import AdminLogin from './components/AdminLogin';
import JobEditor from './components/app/JobEditor';
import JobApplicantsPage from './pages/JobApplicantsPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import OverviewPage from './pages/OverviewPage';
import AdminJobs from './pages/AdminJobs';
import { useAuthRedirect } from './lib/utils';

export const TOKEN_KEY = 'brightcore_admin_token';
setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));

function isUnauthorized(error: unknown) {
  const e = error as { status?: number; response?: { status?: number } } | null;
  return e?.status === 401 || e?.response?.status === 401;
}
function handleUnauthorized(error: unknown) {
  if (isUnauthorized(error)) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('brightcore:unauthorized'));
  }
}
const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleUnauthorized }),
  mutationCache: new MutationCache({ onError: handleUnauthorized }),
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function RouteBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function Router() {
  return <RouteBoundary>
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/jobs/:id/apply" component={ApplyPage} />
      <Route path="/jobs/:id" component={JobDetailsPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/jobs/new" component={() => <JobEditor />} />
      <Route path="/admin/jobs/:id/edit" component={() => <JobEditor editing />} />
      <Route path="/admin/jobs/:id/applications" component={JobApplicantsPage} />
      <Route path="/admin/applications/:id" component={CandidateDetailPage} />
      <Route path="/admin/overview" component={OverviewPage} />
      <Route path="/admin" component={AdminJobs} />
      <Route component={NotFound} />
    </Switch>
  </RouteBoundary>;
}
function AuthEvents() {
  useAuthRedirect();
  return null;
}
function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AuthEvents />
        <Router />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>;
}
export default App;
