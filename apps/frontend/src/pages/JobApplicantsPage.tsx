import { getGetJobQueryKey, getListAdminApplicationsQueryKey, getListApplicationsQueryKey, useGetJob, useListAdminApplications, useListApplications } from "@workspace/api-client-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button, cx, dateLabel, EmptyState, ErrorState, inputClass, LoadingBlock, PageTitle, StatusPill, titleCase } from "../components/ui/shared";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useRouteParams } from "@/lib/utils";

function JobApplicantsPage() {
  const [, setLocation] = useLocation();

  const { params } = useRouteParams();
  const id = Number(params.id);
  const jobQ = useGetJob(id, { query: { queryKey: getGetJobQueryKey(id), enabled: Number.isFinite(id) } });
  const [status, setStatus] = useState<'' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('');
  const paramsQuery = useMemo(() => ({ jobId: id, status: status || undefined }), [id, status]);
  const allApplications = useListApplications(id, { query: { queryKey: getListApplicationsQueryKey(id), enabled: Number.isFinite(id) && !status } });
  const filteredApplications = useListAdminApplications(paramsQuery, { query: { queryKey: getListAdminApplicationsQueryKey(paramsQuery), enabled: Number.isFinite(id) && !!status } });
  const q = status ? filteredApplications : allApplications;
  const filtered = q.data || [];
  return (<AdminLayout current="applications">
    <button onClick={() => setLocation('/admin')} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
      <ArrowLeft className="h-4 w-4" />All postings</button>
    <PageTitle eyebrow="Candidate pipeline"
      title={jobQ.data?.title || 'Candidates'} description={`${jobQ.data?.location || 'Role'} · ${filtered.length} ${filtered.length === 1 ? 'application' : 'applications'}`}
      action={<label className="relative">
        <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
          aria-label="Filter candidates by status" data-testid="select-candidate-status"
          className={cx(inputClass, 'min-w-44 pl-9 pr-8')}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </label>} />
    {q.isLoading ? <LoadingBlock label="Loading candidate applications" /> :
      q.isError ? <ErrorState error={q.error} retry={() => q.refetch()} /> :
        filtered.length ?
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-[1fr_auto] border-b border-border px-5 py-3 text-[10px] font-bold 
            uppercase tracking-wider text-muted-foreground sm:grid-cols-[1fr_180px_130px]">
              <span>Candidate</span>
              <span className="hidden sm:block">Applied</span>
              <span>Status</span></div>{filtered.map((app) => <Link href={`/admin/applications/${app.id}`} key={app.id} data-testid={`row-applicant-${app.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-5 
              py-4 last:border-0 transition hover:bg-muted/35 sm:grid-cols-[1fr_180px_130px]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e7eee4]
                   text-xs font-bold text-primary">
                    {app.fullName.split(/\s+/).map((name) => name[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold">{app.fullName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{app.email}</span>
                  </div>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">{dateLabel(app.createdAt)}</span>
                <StatusPill status={app.status} /></Link>)}</div> :
          <EmptyState title={status ? `No ${titleCase(status).toLowerCase()} candidates` :
            'No applications yet'} text={status ? 'Try another status filter to see other candidates.' :
              'Applications will appear here as soon as candidates apply.'}
            action={status ? <Button variant="outline" onClick={() => setStatus('')}>
              Show all candidates</Button> : undefined} />}
  </AdminLayout>);
}

export default JobApplicantsPage