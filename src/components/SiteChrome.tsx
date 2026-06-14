import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/", label: "Início" },
  { to: "/sessoes", label: "Sessões" },
  { to: "/personagens", label: "Personagens" },
  { to: "/npcs", label: "NPCs" },
  { to: "/arquivo", label: "Arquivo" },
  { to: "/notas", label: "Notas" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 shadow-[0_8px_30px_oklch(0.08_0.01_95_/_0.25)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="inline-block h-8 w-8 shrink-0 rounded-full border border-[var(--gold)]/60 bg-[radial-gradient(circle,_var(--gold)_0%,_transparent_65%)] opacity-80 shadow-[0_0_18px_oklch(0.72_0.12_80_/_0.18)]"
          />
          <span className="truncate font-display text-xl tracking-[0.18em] text-[var(--gold)]">
            TENEBRE
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center rounded border border-border/60 bg-background/45 p-1">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`inline-flex h-9 items-center rounded px-3 text-sm tracking-wide transition-colors hover:text-[var(--gold)] ${
                      active ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-muted-foreground"
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
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-border text-foreground transition-colors hover:border-[var(--gold)]/50 hover:text-[var(--gold)] md:hidden"
        >
          <span className="sr-only">Menu</span>
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Navegação móvel" className="border-t border-border/70 md:hidden">
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-2 px-4 py-3 sm:px-6">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex h-11 items-center justify-center rounded border text-sm transition-colors ${
                      active
                        ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)]"
                        : "border-border/70 text-foreground hover:border-[var(--gold)]/40"
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
