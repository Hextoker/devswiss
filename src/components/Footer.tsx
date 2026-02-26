import { Command, Github } from "lucide-react";

const GITHUB_URL = "https://github.com/Hextoker/devswiss";

export function Footer() {
  return (
    <footer className="relative mt-24" id="system">
      <div className="absolute -top-0.5 left-0 h-1 w-16 bg-[#00FF41]" />
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 px-6 py-6 backdrop-blur-xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              System Version: 2.4.0-STABLE
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              BUILD: 2026.02.18_CYBER_HUD
            </p>
            <p className="text-xs text-zinc-400">
              All tools process data locally. Verify the source code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#00FF41]">
              CONNECTED // ENCRYPTION: AES-256-BIT
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <a
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-300 transition-colors hover:text-emerald-500"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-emerald-500" />
              Open Source &amp; Privacy-First
            </a>
            <p className="group cursor-default text-xs font-bold uppercase tracking-widest">
              © <span className="transition-colors group-hover:text-[#BC00FF]">DEVSWISS_CORE</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
        <Command className="h-3.5 w-3.5" /> Ctrl + K for command palette
      </div>
    </footer>
  );
}
