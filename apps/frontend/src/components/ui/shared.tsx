import { type ReactNode, useState } from 'react';
import { Link } from 'wouter';
import {
   ArrowRight,
  CircleAlert,Menu, Sparkles, X,
} from 'lucide-react';

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
export const dateLabel = (date?: string) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not specified';
export const titleCase = (value?: string) => value ? value.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase()) : '';
export const errorText = (error: unknown) => {
  const e = error as { message?: string; data?: { error?: string } } | null;
  return e?.data?.error || e?.message || 'Something went wrong. Please try again.';
};

export function Button({ children, variant = 'primary', className = '', ...props }: {
  children: ReactNode; variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'soft'; className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:bg-[hsl(158_44%_30%)] shadow-sm',
    outline: 'border border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/50',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    danger: 'bg-destructive text-destructive-foreground hover:opacity-90',
    soft: 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
  };
  return <button {...props} className={cx('focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-55', styles[variant], className)}>{children}</button>;
}
export function IconButton({ label, children, ...props }: { label: string; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button aria-label={label} title={label} {...props} className={cx('focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50', props.className)}>{children}</button>;
}
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold text-foreground">{label}</span>{children}{error ? <span className="block text-xs text-destructive">{error}</span> : hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}</label>;
}
export const inputClass = 'focus-ring w-full rounded-xl border border-input bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition focus:border-primary';
export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: 'bg-emerald-50 text-emerald-800 ring-emerald-700/10',
    CLOSED: 'bg-slate-100 text-slate-600 ring-slate-600/10',
    PENDING: 'bg-amber-50 text-amber-800 ring-amber-700/10',
    ACCEPTED: 'bg-emerald-50 text-emerald-800 ring-emerald-700/10',
    REJECTED: 'bg-rose-50 text-rose-800 ring-rose-700/10',
  };
  return <span data-testid={`status-${status.toLowerCase()}`} className={cx('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ring-1 ring-inset', styles[status] || 'bg-muted text-muted-foreground')}>{titleCase(status)}</span>;
}
export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p><h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-[2.35rem]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{action}</div>;
}
export function LoadingBlock({ label = 'Loading your workspace' }: { label?: string }) {
  return <div role="status" className="space-y-4"><span className="sr-only">{label}</span><div className="h-5 w-36 animate-pulse rounded bg-muted" /><div className="space-y-3 rounded-2xl border border-border bg-card p-5">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/80" />)}</div></div>;
}
export function ErrorState({ error, retry }: { error: unknown; retry: () => void }) {
  return <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center"><CircleAlert className="mx-auto mb-3 h-6 w-6 text-destructive" /><h3 className="font-bold text-foreground">We couldn’t load this just now</h3><p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">{errorText(error)}</p><Button variant="outline" className="mt-4" onClick={retry} data-testid="button-retry">Try again</Button></div>;
}
export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center"><span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Sparkles className="h-5 w-5" /></span><h3 className="font-bold text-foreground">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{text}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className="inline-flex items-center gap-2.5" data-testid="link-brand-home"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><span className="block h-3 w-3 rotate-45 rounded-[3px] border-[2px] border-current" /></span><span className={cx('font-extrabold tracking-[-.045em]', inverse ? 'text-white' : 'text-foreground')}>brightcore<span className="text-primary">.</span></span></Link>;
}
export function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="relative z-10 border-b border-border/75 bg-background/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Wordmark /><div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground sm:flex"><a href="#openings" className="transition hover:text-foreground">Open roles</a><a href="#how-it-works" className="transition hover:text-foreground">Our approach</a></div><div className="hidden items-center gap-3 sm:flex"><Link href="/admin/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground" data-testid="link-team-login">For hiring teams</Link><a href="#openings" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[hsl(158_44%_30%)]">Find your next role <ArrowRight className="ml-1 inline h-4 w-4" /></a></div><IconButton label="Open navigation" className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">{menuOpen ? <X /> : <Menu />}</IconButton></div>{menuOpen && <div className="absolute left-0 right-0 top-full border-b border-border bg-background px-5 py-4 shadow-lg sm:hidden"><a onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium" href="#openings">Open roles</a><Link href="/admin/login" className="block py-2 text-sm font-medium text-muted-foreground">Hiring team sign in</Link></div>}</header>;
}
export function PublicShell({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] bg-background text-foreground"><PublicNav />{children}<footer className="border-t border-border bg-[#f4f2eb]"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><Wordmark /><p>A more human way to find work that matters.</p><span>© {new Date().getFullYear()} Brightcore</span></div></footer></div>;
}
export function TextSection({ title, content }: { title: string; content: string }) {
  return <section><h2 className="text-xl font-extrabold">{title}</h2><div className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{content}</div></section>;
}
export function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold text-foreground">{value}</dd></div>;
}