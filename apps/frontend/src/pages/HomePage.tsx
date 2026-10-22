import { JobCard } from "@/components/app/JobCard";
import { Button, cx, EmptyState, ErrorState, inputClass, LoadingBlock, PublicShell } from "@/components/ui/shared";
import { getHealthCheckQueryKey, getListJobsQueryKey, useHealthCheck, useListJobs } from "@workspace/api-client-react";
import { ArrowRight, BriefcaseBusiness, Check, ChevronDown, ChevronLeft, ChevronRight, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

function HomePage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ search: search.trim() || undefined, type: type || undefined, page, limit: 6 }), [search, type, page]);
  const query = useListJobs(params, { query: { queryKey: getListJobsQueryKey(params) } });
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60_000 } });
  const results = query.data?.items ?? [];
  const pages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.limit)) : 1;

  return <PublicShell>
    <main className="page-enter">
      <section className="relative overflow-hidden border-b border-border bg-[#e8eee5]">
        <div className="absolute inset-0 quiet-grid opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-14 md:grid-cols-[1.12fr_.88fr] md:items-center md:pb-20 md:pt-20 lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/65 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className={cx('h-1.5 w-1.5 rounded-full', health.isError ? 'bg-amber-500' : 'bg-emerald-500')} />People-first hiring, always</div>
            <h1 className="max-w-2xl text-[2.7rem] font-extrabold leading-[1.02] tracking-[-.06em] text-[#20352f] sm:text-6xl lg:text-[4.5rem]">Work should feel like <span className="text-primary">a good fit.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#53645c] sm:text-lg">Find thoughtful teams, honest opportunities, and a clearer path to your next chapter.</p>
            <a href="#openings" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:-translate-y-0.5">Explore open roles <ArrowRight className="h-4 w-4" />
            </a>
            <div className="mt-8 flex items-center gap-3 text-xs font-medium text-[#64766d]">
              <ShieldCheck className="h-4 w-4 text-primary" />Transparent opportunities. Respectful process.</div>
          </div>
          <div className="relative mx-auto flex w-full max-w-[430px] justify-center py-3">
            <div className="relative aspect-[1.04] w-full overflow-hidden rounded-[2.2rem] border border-white/75 bg-[#dce8d9] shadow-[0_30px_70px_-38px_rgba(38,77,59,.4)]">
              <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border-[1px] border-primary/20" />
              <div className="absolute -right-4 -top-8 h-40 w-40 rounded-full border border-primary/15" />
              <div className="absolute bottom-0 left-0 right-0 h-[48%] bg-[#c9d9c7]" />
              <div className="absolute bottom-0 left-[-8%] h-[44%] w-[58%] rounded-t-[55%] bg-[#7f9c86]" />
              <div className="absolute bottom-[-10%] right-[2%] h-[61%] w-[53%] rounded-t-[48%] bg-[#294e40]" />
              <div className="absolute bottom-[30%] left-[17%] h-14 w-14 rounded-full bg-[#f2d9b6]" />
              <div className="absolute bottom-[13%] left-[12%] h-[27%] w-[37%] -rotate-6 rounded-t-[45%] bg-[#e7eee2]" />
              <div className="absolute bottom-[48%] right-[30%] h-16 w-16 rounded-full bg-[#edc9a4]" />
              <div className="absolute bottom-[8%] right-[18%] h-[37%] w-[38%] rotate-6 rounded-t-[48%] bg-[#e6ba73]" />
              <div className="absolute left-[8%] top-[8%] rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-md">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Good work starts here</span>
                <span className="mt-1 block text-sm font-bold text-foreground">Find your place to grow</span>
              </div>
              <div className="absolute bottom-[7%] left-[7%] rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg">
                <span className="block text-[10px] font-semibold text-muted-foreground">A better match</span>
                <span className="mt-0.5 flex items-center gap-1 text-xs font-bold text-primary">
                  <Check className="h-3.5 w-3.5" /> Starts with clarity</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="openings" className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-primary">Make your next move</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Open roles</h2>
            <p className="mt-2 text-sm text-muted-foreground">Find the work, team, and rhythm that feel right for you.</p>
          </div>
          <span className="text-sm text-muted-foreground">{query.data ? `${query.data.total} opportunities` : 'Thoughtful opportunities'}</span>
        </div>
        <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:grid-cols-[1fr_230px]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input data-testid="input-job-search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title or keyword" className={cx(inputClass, 'border-0 bg-transparent pl-10')} aria-label="Search open jobs" />
          </div>
          <div className="relative border-t border-border sm:border-l sm:border-t-0">
            <BriefcaseBusiness className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select data-testid="select-employment-type" aria-label="Filter by employment type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={cx(inputClass, 'appearance-none border-0 bg-transparent pl-10 pr-8')}>
              <option value="">All employment types</option>{['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map((t) => <option key={t} value={t}>{t}</option>)}</select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        {query.isLoading ? <LoadingBlock label="Loading open jobs" /> : query.isError ? <ErrorState error={query.error} retry={() => query.refetch()} /> : results.length ? <>
          <div data-testid="list-open-jobs" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.map((job) => <JobCard key={job.id} job={job} />)}</div>
          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)} data-testid="button-previous-page">
                <ChevronLeft className="h-4 w-4" /> Previous</Button>
              <Button variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)} data-testid="button-next-page">Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </> : <EmptyState title={search || type ? 'No roles match that search' : 'No open roles right now'} text={search || type ? 'Try a different keyword or remove a filter to see more opportunities.' : 'New opportunities are added as teams grow. Check back soon.'} action={(search || type) ? <Button variant="outline" onClick={() => { setSearch(''); setType(''); setPage(1); }}>Clear filters</Button> : undefined} />}</section>
      <section id="how-it-works" className="border-y border-border bg-[#f1f0e8]">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 py-12 sm:grid-cols-[.8fr_1.2fr] sm:items-center sm:py-14 lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">A more thoughtful process</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">Clear from first click to next step.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">{[['01', 'Explore openly', 'Every listing gives you the details to make a confident choice.'], ['02', 'Apply with ease', 'Share your experience without the guesswork.'], ['03', 'Hear back clearly', 'Your application stays in view with a respectful process.']].map(([n, title, copy]) => <div key={n} className="border-l-2 border-primary/35 pl-4">
            <span className="font-mono text-xs font-bold text-primary">{n}</span>
            <h3 className="mt-2 text-sm font-bold">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy}</p>
          </div>)}</div>
        </div>
      </section>
    </main>
  </PublicShell>;
}
export default HomePage;