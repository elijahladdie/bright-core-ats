import { useAuthRedirect } from "@/lib/utils";
import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LoadingBlock, Wordmark } from "./ui/shared";
import { ArrowUpRight, BriefcaseBusiness, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { cx } from "class-variance-authority";
import { TOKEN_KEY } from "@/App";

function AdminLayout({ children, current = 'jobs' }: { children: ReactNode; current?: string }) {
    const [location, setLocation] = useLocation();
    const token = useAuthRedirect();
    useEffect(() => { if (!token) setLocation('/admin/login'); }, [token, setLocation]);
    if (!token) return <div className="min-h-[100dvh] bg-background">
        <div className="mx-auto max-w-3xl px-5 py-20">
            <LoadingBlock label="Returning to sign in" />
        </div>
    </div>;
    const nav = [{ href: '/admin/overview', label: 'Overview', icon: LayoutDashboard, id: 'overview' }, { href: '/admin', label: 'Job postings', icon: BriefcaseBusiness, id: 'jobs' }];
    return <div className="min-h-[100dvh] bg-[#f6f6f1] text-foreground md:flex">
        <aside className="hidden w-[248px] shrink-0 flex-col bg-[#243a34] px-4 py-6 text-white md:flex">
            <div className="px-3">
                <Wordmark inverse />
            </div>
            <div className="mt-11 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/45">Workspace</div>
            <nav className="mt-3 space-y-1">{nav.map(({ href, label, icon: Icon, id }) => <Link key={id} href={href} data-testid={`link-admin-${id}`} className={cx('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition', current === id ? 'bg-white/12 text-white' : 'text-white/65 hover:bg-white/8 hover:text-white')}>
                <Icon className="h-4 w-4" />{label}</Link>)}</nav>
            <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3d6255]">
                    <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-bold">Fair hiring, in focus.</p>
                <p className="mt-1 text-xs leading-5 text-white/55">Keep every candidate journey clear and considered.</p>
            </div>
            <button data-testid="button-logout" onClick={() => { localStorage.removeItem(TOKEN_KEY); setLocation('/admin/login'); }} className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 transition hover:bg-white/8 hover:text-white">
                <LogOut className="h-4 w-4" />Sign out</button>
        </aside>
        <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-10 flex h-[65px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur lg:px-9">
                <div className="flex items-center gap-3">
                    <div className="md:hidden">
                        <Wordmark />
                    </div>
                    <div className="hidden text-xs text-muted-foreground md:block">Hiring workspace <span className="mx-2 text-border">/</span>
                        <span className="font-semibold text-foreground">{current === 'overview' ? 'Overview' : current === 'applications' ? 'Candidates' : 'Job postings'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/" data-testid="link-view-careers" className="hidden text-xs font-semibold text-muted-foreground transition hover:text-primary sm:block">View careers site <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
                    </Link>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7eee4] text-xs font-bold text-primary">BC</span>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-5 py-7 sm:py-9 lg:px-9">
                <div className="mb-5 flex gap-2 overflow-x-auto md:hidden">{nav.map(({ href, label, icon: Icon, id }) => <Link key={id} href={href} className={cx('flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold', current === id ? 'bg-primary text-white' : 'bg-card text-muted-foreground')}>
                    <Icon className="h-4 w-4" />{label}</Link>)}</div>{children}</main>
        </div>
    </div>;
}
export default AdminLayout