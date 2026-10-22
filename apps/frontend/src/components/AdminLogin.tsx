import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button, errorText, Field, inputClass, Wordmark } from "./ui/shared";
import { Link, useLocation } from "wouter";
import { FormEvent, useEffect, useState } from "react";
import { useAdminLogin } from "@workspace/api-client-react";
import { TOKEN_KEY } from "@/App";

function AdminLogin() {
    const [, setLocation] = useLocation();
    const login = useAdminLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    useEffect(() => { if (localStorage.getItem(TOKEN_KEY)) setLocation('/admin'); }, [setLocation]);
    const submit = async (e: FormEvent) => {
        e.preventDefault(); setError('');
        try { const result = await login.mutateAsync({ data: { email, password } }); localStorage.setItem(TOKEN_KEY, result.token); setLocation('/admin'); }
        catch (err) { setError(errorText(err)); }
    };
    return <div className="grid min-h-[100dvh] bg-[#e9eee7] md:grid-cols-[1fr_.9fr]">
        <section className="relative hidden overflow-hidden bg-[#243a34] p-12 text-white md:flex md:flex-col md:justify-between lg:p-16">
            <div className="absolute inset-0 quiet-grid opacity-[.08]" />
            <div className="relative">
                <Wordmark inverse />
                <div className="mt-[16vh] max-w-lg">
                    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a8cfad]">Brightcore hiring workspace</p>
                    <h1 className="mt-5 text-5xl font-extrabold leading-[1.06] tracking-[-.05em]">Good decisions start with a clearer view.</h1>
                    <p className="mt-5 max-w-md text-base leading-7 text-white/65">A calmer place to manage open roles, meet candidates, and move every application forward.</p>
                </div>
            </div>
            <div className="relative flex items-center gap-3 text-xs text-white/55">
                <ShieldCheck className="h-4 w-4 text-[#a8cfad]" />Private workspace for hiring teams</div>
            <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full border border-white/10" />
            <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full border border-white/10" />
        </section>
        <main className="flex items-center justify-center px-5 py-12">
            <div className="w-full max-w-[430px]">
                <div className="mb-10 md:hidden">
                    <Wordmark />
                </div>
                <div className="mb-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <LockKeyhole className="h-5 w-5" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-[.17em] text-primary">Hiring workspace</p>
                    <h2 className="mt-2 text-3xl font-extrabold">Welcome back</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Sign in to continue managing your team’s hiring.</p>
                </div>
                <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <Field label="Work email">
                        <input data-testid="input-login-email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="name@company.com" />
                    </Field>
                    <Field label="Password">
                        <input data-testid="input-login-password" required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Enter your password" />
                    </Field>{error && <div role="alert" data-testid="text-login-error" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-destructive">{error}</div>}
                    <Button type="submit" disabled={login.isPending} className="w-full" data-testid="button-login">{login.isPending ? 'Signing in…' : 'Sign in'}{!login.isPending && <ArrowRight className="h-4 w-4" />}</Button>
                </form>
                <p className="mt-5 text-center text-xs text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Return to careers site</Link>
                </p>
            </div>
        </main>
    </div>;
}
export default AdminLogin