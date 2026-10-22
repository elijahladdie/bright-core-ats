import { useRouteParams } from "@/lib/utils";
import { getGetJobQueryKey, useGetJob } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { dateLabel, Detail, ErrorState, LoadingBlock, PublicShell, TextSection } from "../ui/shared";
import { ArrowLeft, ArrowRight, Clock3, MapPin } from "lucide-react";

function JobDetailsPage() {
    const [, setLocation] = useLocation();

    const { params } = useRouteParams();
    const id = Number(params.id);
    const q = useGetJob(id, { query: { queryKey: getGetJobQueryKey(id), enabled: Number.isFinite(id) } });
    if (q.isLoading) return <PublicShell>
        <main className="mx-auto max-w-5xl px-5 py-14">
            <LoadingBlock />
        </main>
    </PublicShell>;
    if (q.isError || !q.data) return <PublicShell>
        <main className="mx-auto max-w-5xl px-5 py-14">
            <ErrorState error={q.error} retry={() => q.refetch()} />
        </main>
    </PublicShell>;
    const job = q.data;
    return <PublicShell>
        <main className="page-enter mx-auto max-w-5xl px-5 py-9 sm:py-14">
            <button onClick={() => setLocation('/')} className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary" data-testid="button-back-jobs">
                <ArrowLeft className="h-4 w-4" /> All opportunities</button>
            <section className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm">
                <div className="bg-[#e7eee4] px-6 py-8 sm:px-10 sm:py-10">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary">
                        <span>Brightcore opportunity</span>
                        <span className="text-primary/40">/</span>
                        <span>{job.employmentType}</span>
                    </div>
                    <h1 data-testid="text-job-title" className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{job.title}</h1>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#55675d]">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />{job.location}</span>
                        <span className="flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4" />Apply by {dateLabel(job.closingDate)}</span>
                    </div>
                    <p className="mt-6 max-w-3xl text-base leading-7 text-[#50635a]">{job.summary}</p>
                    <Link href={`/jobs/${job.id}/apply`} data-testid="button-apply-job" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5">Apply for this role <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid gap-10 px-6 py-8 sm:grid-cols-[1fr_260px] sm:px-10 sm:py-10">
                    <div className="space-y-8">
                        <TextSection title="About the role" content={job.description} />
                        <TextSection title="What you’ll do" content={job.responsibilities} />
                        <TextSection title="What you’ll bring" content={job.requirements} />
                    </div>
                    <aside className="h-fit rounded-2xl border border-border bg-background p-5">
                        <h2 className="font-bold">The details</h2>
                        <dl className="mt-4 space-y-4 text-sm">
                            <Detail label="Location" value={job.location} />
                            <Detail label="Employment" value={job.employmentType} />
                            <Detail label="Apply by" value={dateLabel(job.closingDate)} />
                        </dl>
                        <Link href={`/jobs/${job.id}/apply`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90">Start application <ArrowRight className="h-4 w-4" />
                        </Link>
                        <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">Your application is shared only with the hiring team.</p>
                    </aside>
                </div>
            </section>
        </main>
    </PublicShell>;
}

export default JobDetailsPage