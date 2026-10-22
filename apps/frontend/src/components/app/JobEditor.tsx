import { ArrowLeft, ArrowRight, Key } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Button, cx, ErrorState, errorText, Field, inputClass, LoadingBlock, PageTitle } from "../ui/shared";
import { getGetJobQueryKey, getListAdminJobsQueryKey, getListJobsQueryKey, JobInput, useCreateJob, useGetJob, useUpdateJob } from "@workspace/api-client-react";
import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { blankJob, useRouteParams } from "@/lib/utils";
import { useLocation } from "wouter";

function JobEditor({ editing = false }: { editing?: boolean }) {
    const [, setLocation] = useLocation();

    const { params } = useRouteParams();
    const id = Number(params.id);

    const qc = useQueryClient();
    const jobQuery = useGetJob(id, { query: { queryKey: getGetJobQueryKey(id), enabled: editing && Number.isFinite(id) } });
    const create = useCreateJob();
    const updateJob = useUpdateJob();
    const [form, setForm] = useState<JobInput>(blankJob);
    const [error, setError] = useState('');
    useEffect(() => {
        if (editing && jobQuery.data) setForm({ title: jobQuery.data.title, location: jobQuery.data.location, employmentType: jobQuery.data.employmentType, closingDate: jobQuery.data.closingDate.slice(0, 10), summary: jobQuery.data.summary, description: jobQuery.data.description, responsibilities: jobQuery.data.responsibilities, requirements: jobQuery.data.requirements });
    }, [editing, jobQuery.data]);
    const setter = (key: keyof JobInput, value: string) => setForm((old) => ({ ...old, [key]: value }));
    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editing) {
                await updateJob.mutateAsync({ id, data: form });
                await qc.invalidateQueries({ queryKey: getGetJobQueryKey(id) });
                await qc.invalidateQueries({ queryKey: getListAdminJobsQueryKey() });
                await qc.invalidateQueries({ queryKey: getListJobsQueryKey() });
                setLocation('/admin');
            }
            else {
                await create.mutateAsync({ data: form });
                await qc.invalidateQueries({ queryKey: getListAdminJobsQueryKey() });
                await qc.invalidateQueries({ queryKey: getListJobsQueryKey() });
                setLocation('/admin');
            }
        } catch (err) {
            setError(errorText(err));

        }
    };
    if (editing && jobQuery.isLoading) return <AdminLayout>
        <LoadingBlock />
    </AdminLayout>;
    if (editing && jobQuery.isError) return <AdminLayout>
        <ErrorState error={jobQuery.error} retry={() => jobQuery.refetch()} />
    </AdminLayout>;
    return <AdminLayout current="jobs">
        <button onClick={() => setLocation('/admin')} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />Job postings</button>
        <PageTitle eyebrow={editing ? 'Update opportunity' : 'New opportunity'} title={editing ? 'Edit job posting' : 'Create a job posting'} description="Give candidates the context they need to decide if this role is right for them." />
        <form onSubmit={submit} className="max-w-4xl space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Job title *">
                    <input required minLength={3} data-testid="input-job-title" className={inputClass} value={form.title} onChange={(e) => setter('title', e.target.value)} placeholder="e.g. Senior Product Designer" />
                </Field>
                <Field label="Location *">
                    <input required minLength={2} data-testid="input-job-location" className={inputClass} value={form.location} onChange={(e) => setter('location', e.target.value)} placeholder="City, region or Remote" />
                </Field>
                <Field label="Employment type *">
                    <select data-testid="select-job-type" className={inputClass} value={form.employmentType} onChange={(e) => setter('employmentType', e.target.value)}>{['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map((type) => <option key={type}>{type}</option>)}</select>
                </Field>
                <Field label="Application closing date *">
                    <input required type="date" data-testid="input-closing-date" className={inputClass} value={form.closingDate} onChange={(e) => setter('closingDate', e.target.value)} />
                </Field>
            </div>
            <Field label="Short summary *" hint="A concise introduction candidates will see in search results.">
                <textarea required minLength={10} data-testid="input-job-summary" rows={3} className={cx(inputClass, 'resize-y')} value={form.summary} onChange={(e) => setter('summary', e.target.value)} placeholder="What makes this opportunity meaningful?" />
            </Field>{([['description', 'About the role'], ['responsibilities', 'What you’ll do'], ['requirements', 'What you’ll bring']] as Array<[keyof JobInput, string]>).map(([key, label]) => <Field key={key} label={`${label} *`}>
                <textarea required minLength={10} data-testid={`input-job-${Key}`} rows={5} className={cx(inputClass, 'resize-y')} value={form[key]} onChange={(e) => setter(key, e.target.value)} placeholder={`Share the ${label.toLowerCase()} in clear, welcoming language…`} />
            </Field>)}{error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-destructive">{error}</div>}<div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setLocation('/admin')} data-testid="button-cancel-job">Cancel</Button>
                <Button type="submit" disabled={create.isPending || updateJob.isPending} data-testid="button-save-job">{create.isPending || updateJob.isPending ? 'Saving…' : editing ? 'Save changes' : 'Publish job'}{!(create.isPending || updateJob.isPending) && <ArrowRight className="h-4 w-4" />}</Button>
            </div>
        </form>
    </AdminLayout>;
}
export default JobEditor