import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

const nav = [
  { to: "/", label: "Início" },
  { to: "/sessoes", label: "Sessões" },
  { to: "/personagens", label: "Personagens" },
  { to: "/mundo", label: "Mundo" },
  { to: "/npcs", label: "NPCs" },
  { to: "/faccoes", label: "Facções" },
  { to: "/rumores", label: "Rumores" },
  { to: "/arquivo", label: "Arquivo" },
  { to: "/notas", label: "Notas" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-3 min-w-0">
          <span aria-hidden className="inline-block h-7 w-7 shrink-0 rounded-full border border-[var(--gold)]/60 bg-[radial-gradient(circle,_var(--gold)_0%,_transparent_65%)] opacity-80" />
          <span className="font-display text-xl tracking-[0.18em] text-[var(--gold)] truncate">
            TENEBRE
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`rounded px-3 py-1.5 text-sm tracking-wide transition-colors hover:text-[var(--gold)] ${
                      active ? "text-[var(--gold)]" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-border text-foreground lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav aria-label="Navegação móvel" className="border-t border-border/70 lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`block rounded px-3 py-3 text-base transition-colors hover:bg-accent/40 ${
                      active ? "text-[var(--gold)]" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
        <p className="font-display text-base tracking-[0.2em] text-[var(--gold)]">TENEBRE</p>
        <p className="mt-1">Uma campanha de Symbaroum</p>
        <div className="gold-rule mx-auto my-5 w-32" />
        <p className="italic">Que a Luz permaneça. Mesmo entre cinzas.</p>
      </div>
    </footer>
  );
}
