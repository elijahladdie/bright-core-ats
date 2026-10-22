import AdminLayout from "@/components/AdminLayout";
import { Button, dateLabel, EmptyState, ErrorState, errorText, IconButton, LoadingBlock, PageTitle, StatusPill } from "@/components/ui/shared";
import { useQueryClient } from "@tanstack/react-query";
import { getListAdminJobsQueryKey, getListJobsQueryKey, useCloseJob, useListAdminJobs } from "@workspace/api-client-react";
import { BriefcaseBusiness, Pencil, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

function AdminJobs() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const q = useListAdminJobs({ query: { queryKey: getListAdminJobsQueryKey() } });
  const close = useCloseJob();
  const [message, setMessage] = useState('');
  const jobs = q.data || [];
  const closeJob = async (id: number) => {
    if (!window.confirm('Close this job? Candidates will no longer be able to apply.')) return;
    try { await close.mutateAsync({ id }); await qc.invalidateQueries({ queryKey: getListAdminJobsQueryKey() }); await qc.invalidateQueries({ queryKey: getListJobsQueryKey() }); setMessage('Job closed.'); }
    catch (err) { setMessage(errorText(err)); }
  };
  return <AdminLayout current="jobs">
    <PageTitle eyebrow="Hiring workspace" title="Job postings" description="Create thoughtful opportunities and keep an eye on every candidate journey." action={
      <Button onClick={() => setLocation('/admin/jobs/new')} data-testid="button-create-job">
        <Plus className="h-4 w-4" />Create job</Button>} />{message && <div role="status" className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">{message}<button onClick={() => setMessage('')} aria-label="Dismiss notification">
          <X className="h-4 w-4" />
        </button>
        </div>}{q.isLoading ? <LoadingBlock /> : q.isError ? <ErrorState error={q.error} retry={() => q.refetch()} /> : jobs.length ? <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">All postings</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">{jobs.length}</span>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">Sorted by recently created</span>
          </div>
          <div className="divide-y divide-border">{jobs.map((job) => <div key={job.id} data-testid={`row-admin-job-${job.id}`} className="grid gap-3 px-5 py-5 transition hover:bg-muted/30 sm:grid-cols-[1fr_155px_90px_auto] sm:items-center">
            <div className="min-w-0">
              <Link href={`/admin/jobs/${job.id}/applications`} className="truncate font-bold text-foreground transition hover:text-primary">{job.title}</Link>
              <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                <span>{job.location}</span>
                <span>{job.employmentType}</span>
                <span>Closes {dateLabel(job.closingDate)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{job.applicationCount}</span> applicants</div>
            <StatusPill status={job.status} />
            <div className="flex gap-2">
              <Link href={`/admin/jobs/${job.id}/applications`} className="rounded-lg px-2.5 py-2 text-xs font-semibold text-primary hover:bg-secondary" data-testid={`link-applications-${job.id}`}>Candidates</Link>
              <IconButton label={`Edit ${job.title}`} className="h-9 w-9" onClick={() => setLocation(`/admin/jobs/${job.id}/edit`)} data-testid={`button-edit-job-${job.id}`}>
                <Pencil className="h-4 w-4" />
              </IconButton>{job.status === 'OPEN' && <IconButton label={`Close ${job.title}`} className="h-9 w-9" disabled={close.isPending} onClick={() => closeJob(job.id)} data-testid={`button-close-job-${job.id}`}>
                <X className="h-4 w-4" />
              </IconButton>}</div>
          </div>)}</div>
        </div> : <EmptyState title="No jobs posted yet" text="Your next great hire starts with a clear, thoughtful job description." action={<Button onClick={() => setLocation('/admin/jobs/new')}>
          <Plus className="h-4 w-4" />Create your first job</Button>} />}</AdminLayout>;
}

export default AdminJobs