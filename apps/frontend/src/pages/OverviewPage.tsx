import AdminLayout from "@/components/AdminLayout";
import { cx, EmptyState, ErrorState, LoadingBlock, PageTitle } from "@/components/ui/shared";
import { getGetAdminOverviewQueryKey, useGetAdminOverview } from "@workspace/api-client-react";
import { ArrowRight, BriefcaseBusiness, Check, Clock3, LucideIcon, Users, X } from "lucide-react";
import { Link } from "wouter";

function OverviewPage() {
    const q = useGetAdminOverview({ query: { queryKey: getGetAdminOverviewQueryKey() } });
    const overview = q.data;
    const metrics: Array<{ label: string; value: number; Icon: LucideIcon; color: string; bg: string }> = overview ? [
        { label: 'All applications', value: overview.totalApplications, Icon: Users, color: 'text-primary', bg: 'bg-secondary' },
        { label: 'Awaiting review', value: overview.pending, Icon: Clock3, color: 'text-[#9b7023]', bg: 'bg-[#f7f0dd]' },
        { label: 'Accepted', value: overview.accepted, Icon: Check, color: 'text-primary', bg: 'bg-secondary' },
        { label: 'Declined', value: overview.rejected, Icon: X, color: 'text-rose-700', bg: 'bg-rose-50' },
        { label: 'Open roles', value: overview.openJobs, Icon: BriefcaseBusiness, color: 'text-[#426c91]', bg: 'bg-[#eaf0f4]' },
    ] : [];
    return (<AdminLayout current="overview">
        <PageTitle eyebrow="Hiring at a glance" title="Overview" description="A clear view of open opportunities and the people moving through your process." />{q.isLoading ? <LoadingBlock /> : q.isError ? <ErrorState error={q.error} retry={() => q.refetch()} /> : overview ? <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{metrics.map(({ label, value, Icon, color, bg }) => <div key={label} data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <span className={cx('flex h-9 w-9 items-center justify-center rounded-xl', bg, color)}>
                    <Icon className="h-4 w-4" />
                </span>
                <p className="mt-4 text-2xl font-extrabold">{value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
            </div>)}</div>
            <section className="mt-7 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="font-bold">Applications by opportunity</h2>
                        <p className="mt-1 text-xs text-muted-foreground">Progress across every role</p>
                    </div>
                    <Link href="/admin" className="text-xs font-bold text-primary hover:underline">Manage jobs <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                    </Link>
                </div>{overview.perJob.length ? <div className="divide-y divide-border">{overview.perJob.map((job) => {
                    const denominator = Math.max(job.total, 1); return <div key={job.jobId} data-testid={`overview-job-${job.jobId}`} className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_95px_1.2fr] sm:items-center">
                        <div className="min-w-0">
                            <Link href={`/admin/jobs/${job.jobId}/applications`} className="truncate text-sm font-bold hover:text-primary">{job.title}</Link>
                            <p className="mt-1 text-xs text-muted-foreground">{job.total} {job.total === 1 ? 'application' : 'applications'}</p>
                        </div>
                        <span className="text-sm font-bold">{job.pending} <span className="text-xs font-medium text-muted-foreground">pending</span>
                        </span>
                        <div>
                            <div className="mb-2 flex justify-between text-[10px] font-semibold text-muted-foreground">
                                <span>Application progress</span>
                                <span>{job.total ? Math.round((job.accepted / denominator) * 100) : 0}% accepted</span>
                            </div>
                            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                                <span className="bg-primary transition-all" style={{ width: `${job.accepted / denominator * 100}%` }} />
                                <span className="bg-rose-300 transition-all" style={{ width: `${job.rejected / denominator * 100}%` }} />
                                <span className="bg-amber-300 transition-all" style={{ width: `${job.pending / denominator * 100}%` }} />
                            </div>
                        </div>
                    </div>;
                })}</div> : <div className="p-5">
                    <EmptyState title="Nothing to report just yet" text="Once applicants begin coming in, the pipeline will appear here." action={<Link href="/admin" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">View job postings <ArrowRight className="h-4 w-4" />
                    </Link>} />
                </div>}</section>
        </> : null}</AdminLayout>);
}
export default OverviewPage