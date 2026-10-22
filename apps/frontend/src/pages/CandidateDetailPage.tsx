import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
    getListApplicationsQueryKey, getListAdminApplicationsQueryKey,
    getGetApplicationQueryKey, useGetApplication, getGetApplicationCvQueryKey,
    useGetApplicationCv, useUpdateApplicationStatus, getGetAdminOverviewQueryKey
} from '@workspace/api-client-react';
import type { ApplicationDecisionStatus } from '@workspace/api-client-react';
import {
    ArrowLeft, Check, Download, FileText, X,
} from 'lucide-react';
import { Button, cx, dateLabel, Detail, ErrorState, errorText, inputClass, LoadingBlock, PageTitle, StatusPill } from '../components/ui/shared';
import AdminLayout from '@/components/AdminLayout';
import { useRouteParams } from '@/lib/utils';

function CandidateDetailPage() {
    const [, setLocation] = useLocation();
    const { params } = useRouteParams();
    const id = Number(params.id);
    const qc = useQueryClient();
    const q = useGetApplication(id, { query: { queryKey: getGetApplicationQueryKey(id), enabled: Number.isFinite(id) } });
    const cv = useGetApplicationCv(id, { query: { queryKey: getGetApplicationCvQueryKey(id), enabled: false } });
    const update = useUpdateApplicationStatus();
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    useEffect(() => { if (q.data?.note) setNote(q.data.note); }, [q.data?.id, q.data?.note]);
    const decide = async (status: ApplicationDecisionStatus) => {
        setError('');
        try {
            await update.mutateAsync({ id, data: { status, note } });
            await qc.invalidateQueries({ queryKey: getGetApplicationQueryKey(id) });
            await qc.invalidateQueries({ queryKey: getListAdminApplicationsQueryKey() });
            await qc.invalidateQueries({ queryKey: getListApplicationsQueryKey(q.data?.jobId || 0) });
            await qc.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() });
        }
        catch (err) { setError(errorText(err)); }
    };
    const downloadCv = async () => {
        try {
            const result = await cv.refetch();
            if (!result.data) throw new Error('The CV could not be downloaded. Please try again.');
            const blob = result.data;
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = q.data?.cvOriginalName || 'candidate-cv.pdf'; a.click(); URL.revokeObjectURL(url);
        } catch (err) { setError(errorText(err)); }
    };
    if (q.isLoading) return <AdminLayout current="applications"><LoadingBlock /></AdminLayout>;
    if (q.isError || !q.data) return <AdminLayout current="applications"><ErrorState error={q.error} retry={() => q.refetch()} /></AdminLayout>;
    const candidate = q.data;
    const isAccepted = candidate.status === "ACCEPTED";
    return (
        <AdminLayout current="applications">
            <button onClick={() => setLocation(`/admin/jobs/${candidate.jobId}/applications`)} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" />Back to candidates</button>
            <PageTitle eyebrow={candidate.jobTitle} title={candidate.fullName} description={`Application received ${dateLabel(candidate.createdAt)}`} action={<StatusPill status={candidate.status} />} />
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-5">
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold">Candidate details</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Personal details shared with the hiring team.</p>
                            </div>
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7eee4] text-sm font-bold text-primary">{candidate.fullName.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()}</span>
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2"><Detail label="Email address" value={candidate.email} />
                            <Detail label="Phone number" value={candidate.phone} /><Detail label="Applied for" value={candidate.jobTitle} />
                            <Detail label="Application date" value={dateLabel(candidate.createdAt)} /></div></section>
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-lg font-bold">Candidate’s note</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Why this role is a fit for them.</p>
                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-foreground">{candidate.coverNote || 'No cover note was included with this application.'}</p></section>
                    <section className="rounded-2xl border border-border bg-card p-6"><h2 className="text-lg font-bold">Hiring team note</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Add a private note to keep the decision context clear.</p>
                        <textarea data-testid="input-decision-note" rows={4} maxLength={3000} value={note} onChange={(e) => setNote(e.target.value)} className={cx(inputClass, 'mt-4 resize-y')} placeholder="Add context for your decision…" />
                        <p className="mt-1 text-right text-[11px] text-muted-foreground">{note.length}/3000</p>
                    </section>
                </div>
                <aside className="h-fit space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="font-bold">Application CV</h2>
                        <p className="mt-1 text-xs text-muted-foreground">PDF shared by the candidate.</p>
                        <div className="mt-4 flex items-center gap-3 rounded-xl bg-background p-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                                <FileText className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold">{candidate.cvOriginalName}</span>
                        </div>
                        <Button variant="outline" className="mt-3 w-full" onClick={downloadCv} data-testid="button-download-cv">
                            <Download className="h-4 w-4" />Download CV</Button>
                    </div>



                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="font-bold">Move application forward</h2>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {isAccepted
                                ? "This candidate has been accepted. The application is now read-only."
                                : "Save the note with your decision so the team has the full context."}
                        </p>

                        {error && (
                            <p role="alert" className="mt-3 text-xs text-destructive">
                                {error}
                            </p>
                        )}

                        <div className="mt-4 space-y-2">
                            <Button
                                disabled={update.isPending || isAccepted}
                                onClick={() => decide("ACCEPTED")}
                                className="w-full"
                                data-testid="button-accept-application"
                            >
                                <Check className="h-4 w-4" />
                                {isAccepted
                                    ? "Candidate accepted"
                                    : update.isPending
                                        ? "Saving…"
                                        : "Accept candidate"}
                            </Button>

                            <Button
                                disabled={update.isPending || isAccepted}
                                variant="outline"
                                onClick={() => decide("REJECTED")}
                                className="w-full text-destructive hover:border-destructive/40"
                                data-testid="button-reject-application"
                            >
                                <X className="h-4 w-4" />
                                Decline candidate
                            </Button>
                        </div>
                    </div>

                </aside>
            </div>
        </AdminLayout>
    );
}

export default CandidateDetailPage