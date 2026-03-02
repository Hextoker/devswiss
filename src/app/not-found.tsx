import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_45%),radial-gradient(circle_at_bottom,rgba(5,150,105,0.18),transparent_40%)]" />
            <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute right-[-10%] top-1/2 h-72 w-72 rounded-full bg-emerald-400/10 blur-[140px]" />

            <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
                <div className="w-full max-w-2xl rounded-3xl border border-emerald-400/20 bg-white/5 p-8 shadow-[0_20px_80px_-30px_rgba(16,185,129,0.4)] backdrop-blur-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.5em] text-emerald-200/70">
                        DevSwiss
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                        404: Esta herramienta se movio o no existe
                    </h1>
                    <p className="mt-3 text-sm text-emerald-100/80 sm:text-base">
                        Vuelve al dashboard para recuperar contexto o abre el buscador rapido
                        con Ctrl + K para ubicar la herramienta correcta.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/70 hover:bg-emerald-400/20"
                        >
                            Volver al Home
                        </Link>
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            Respuesta inmediata · 100ms UX
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
