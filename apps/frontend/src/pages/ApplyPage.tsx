import { Button, cx, ErrorState, errorText, Field, inputClass, LoadingBlock, PublicShell } from "@/components/ui/shared";
import { useRouteParams } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getGetJobQueryKey, getListJobsQueryKey, useApplyToJob, useGetJob, useRequestCvUploadUrl } from "@workspace/api-client-react";
import { ArrowLeft, ArrowRight, Check, FileText, MapPin } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";

function ApplyPage() {
  const { params } = useRouteParams();
  const id = Number(params.id);
  const jobQuery = useGetJob(id, { query: { queryKey: getGetJobQueryKey(id), enabled: Number.isFinite(id) } });
  const queryClient = useQueryClient();
  const apply = useApplyToJob();
  const getUpload = useRequestCvUploadUrl();
  const [file, setFile] = useState<File | null>(null);
  const [values, setValues] = useState({ fullName: '', email: '', phone: '', coverNote: '' });
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const pending = apply.isPending || getUpload.isPending;
  const update = (key: keyof typeof values, value: string) => setValues((old) => ({ ...old, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setFormError('');
    if (!file) { setFormError('Please attach your CV as a PDF.'); return; }
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) { setFormError('Your CV must be a PDF file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setFormError('Your PDF must be 5 MB or smaller.'); return; }
    try {
      const uploaded = await getUpload.mutateAsync({ data: { name: file.name, size: file.size, contentType: 'application/pdf' } });
      const response = await fetch(uploaded.uploadURL, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: file });
      if (!response.ok) throw new Error('Your CV could not be uploaded. Please try again.');
      await apply.mutateAsync({ id, data: { ...values, cvObjectPath: uploaded.objectPath, cvOriginalName: file.name } });
      await queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      setSubmitted(true);
    } catch (error) { setFormError(errorText(error)); }
  };
  if (jobQuery.isLoading) return <PublicShell>
    <main className="mx-auto max-w-4xl px-5 py-14">
      <LoadingBlock />
    </main>
  </PublicShell>;
  if (jobQuery.isError || !jobQuery.data) return <PublicShell>
    <main className="mx-auto max-w-4xl px-5 py-14">
      <ErrorState error={jobQuery.error} retry={() => jobQuery.refetch()} />
    </main>
  </PublicShell>;
  if (submitted) return <PublicShell>
    <main className="page-enter mx-auto max-w-2xl px-5 py-16">
      <div className="rounded-[1.7rem] border border-border bg-card p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Check className="h-7 w-7" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-primary">Application received</p>
        <h1 className="mt-2 text-3xl font-extrabold">You’re on your way.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Thanks for applying to {jobQuery.data.title}. Your details are safely with the hiring team, and your next step will be shared as soon as possible.</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Back to open roles <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  </PublicShell>;
  return <PublicShell>
    <main className="page-enter mx-auto max-w-5xl px-5 py-8 sm:py-12">
      <Link href={`/jobs/${id}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />Back to role</Link>
      <div className="grid gap-6 lg:grid-cols-[.78fr_1.22fr]">
        <aside className="h-fit rounded-2xl bg-[#e8eee5] p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Your next chapter</p>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight">{jobQuery.data.title}</h1>
          <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />{jobQuery.data.location}</div>
          <div className="mt-7 border-t border-primary/15 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">A clear, thoughtful process</p>
            <p className="mt-2 text-sm leading-6 text-[#53645c]">Share the essentials. Your information is reviewed only by the hiring team for this opportunity.</p>
          </div>
        </aside>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.17em] text-primary">Application</p>
          <h2 className="mt-2 text-2xl font-extrabold">Tell us about yourself</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fields marked required help the team get to know you.</p>
          <form className="mt-7 space-y-5" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name *">
                <input data-testid="input-full-name" required minLength={2} value={values.fullName} onChange={(e) => update('fullName', e.target.value)} className={inputClass} placeholder="Your name" />
              </Field>
              <Field label="Email address *">
                <input data-testid="input-applicant-email" required type="email" value={values.email} onChange={(e) => update('email', e.target.value)} className={inputClass} placeholder="you@example.com" />
              </Field>
            </div>
            <Field label="Phone number *">
              <input data-testid="input-phone" required minLength={7} value={values.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} placeholder="+1 (555) 000-0000" />
            </Field>
            <Field label="A note for the team" hint="What makes this role feel right for you?">
              <textarea data-testid="input-cover-note" maxLength={5000} rows={5} value={values.coverNote} onChange={(e) => update('coverNote', e.target.value)} className={cx(inputClass, 'resize-y')} placeholder="A few words about your experience and what you’re looking for…" />
            </Field>
            <Field label="Your CV *" hint="PDF only, up to 5 MB. Your CV stays private to the hiring team.">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/35 bg-secondary/30 p-4 transition hover:border-primary hover:bg-secondary/50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{file?.name || 'Choose a PDF to upload'}</span>
                  <span className="block text-xs text-muted-foreground">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Browse files from your device'}</span>
                </span>
                <span className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold">Browse</span>
                <input data-testid="input-cv-upload" type="file" accept=".pdf,application/pdf" className="sr-only" onChange={(e) => { const selected = e.target.files?.[0] || null; setFile(selected); setFormError(''); }} />
              </label>
            </Field>{formError && <div role="alert" data-testid="text-application-error" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-destructive">{formError}</div>}<Button type="submit" disabled={pending} className="w-full sm:w-auto" data-testid="button-submit-application">{pending ? 'Submitting application…' : 'Submit application'}{!pending && <ArrowRight className="h-4 w-4" />}</Button>
            <p className="text-xs text-muted-foreground">By submitting, you agree to share these details with the team hiring for this role.</p>
          </form>
        </section>
      </div>
    </main>
  </PublicShell>;
}
export default ApplyPage