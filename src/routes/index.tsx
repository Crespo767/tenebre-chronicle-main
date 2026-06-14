import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard } from "../components/ui-chrome";
import { masterNotes } from "../data/masterNotes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tenebre — Uma campanha de Symbaroum" },
      {
        name: "description",
        content:
          "A wiki viva da campanha Tenebre. Sessões, personagens, NPCs, arquivo e notas do mestre.",
      },
      { property: "og:title", content: "Tenebre — Uma campanha de Symbaroum" },
      {
        property: "og:description",
        content: "Registros, personagens e notas da campanha Tenebre.",
      },
    ],
  }),
  component: HomePage,
});

const quickLinks = [
  { to: "/sessoes", title: "Sessões", desc: "Registros das noites de mesa." },
  { to: "/personagens", title: "Personagens", desc: "Quem ainda caminha com a caravana." },
  { to: "/npcs", title: "NPCs", desc: "Rostos cruzados pelo caminho." },
  { to: "/arquivo", title: "Arquivo", desc: "Cartas, mapas e handouts da campanha." },
  { to: "/notas", title: "Notas do Mestre", desc: "Avisos públicos da crônica." },
] as const;

function HomePage() {
  return (
    <>
      <section
        aria-label="Apresentação"
        className="relative isolate overflow-hidden border-b border-border/60"
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 20%, oklch(0.30 0.04 140 / 0.55), transparent 60%), radial-gradient(ellipse at 80% 80%, oklch(0.25 0.06 55 / 0.5), transparent 65%), linear-gradient(180deg, oklch(0.12 0.012 95) 0%, oklch(0.18 0.012 95) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,_oklch(0.6_0.10_80_/_0.18),_transparent_55%)]"
        />

        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 md:py-36">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--gold)]/80">
            Crônica de Campanha
          </p>
          <h1 className="mt-5 font-display text-6xl leading-none tracking-tight text-[var(--gold)] sm:text-7xl md:text-8xl">
            Tenebre
          </h1>
          <p className="mt-4 font-display text-lg italic text-muted-foreground sm:text-xl">
            Uma campanha de Symbaroum
          </p>
          <div className="gold-rule mx-auto mt-8 w-48" />
          <blockquote className="mx-auto mt-8 max-w-2xl font-display text-xl text-foreground/90 sm:text-2xl">
            “Cada sessão deixa marcas. Algumas viram registro. Outras continuam esperando no
            escuro.”
          </blockquote>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Esta wiki reúne registros da campanha, personagens, sessões, documentos e notas
            importantes da mesa. Nem tudo aqui é seguro. E algumas coisas talvez nunca devessem ter
            sido escritas.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/sessoes"
              className="inline-flex items-center justify-center rounded border border-[var(--gold)]/60 bg-[var(--gold)]/10 px-5 py-2.5 text-sm tracking-wide text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/20"
            >
              Ler as sessões
            </Link>
            <Link
              to="/personagens"
              className="inline-flex items-center justify-center rounded border border-border px-5 py-2.5 text-sm tracking-wide text-foreground transition-colors hover:border-[var(--gold)]/40"
            >
              Ver personagens
            </Link>
          </div>
        </div>
      </section>

      <PageContainer>
        <SectionTitle
          eyebrow="A Crônica"
          title="Acesso rápido"
          subtitle="Os fios principais da campanha, organizados."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {quickLinks.map((q) => (
            <Link key={q.to} to={q.to} className="block focus:outline-none">
              <ChronicleCard className="h-full">
                <h3 className="font-display text-2xl text-foreground">{q.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{q.desc}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[var(--gold)]/80">
                  Acessar →
                </p>
              </ChronicleCard>
            </Link>
          ))}
        </div>

        <div className="mt-16">
          <SectionTitle
            eyebrow="Avisos da Mesa"
            title="Notas do Mestre"
            subtitle="Avisos curtos para os jogadores."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {masterNotes.slice(0, 4).map((n) => (
              <ChronicleCard key={n.title} as="article">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl text-[var(--gold)]">{n.title}</h3>
                  <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
                    {n.date}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{n.body}</p>
              </ChronicleCard>
            ))}
          </div>
        </div>

        <p className="ornament mt-20 text-center font-display text-lg italic text-[var(--gold)]/90">
          Que a Luz permaneça. Mesmo entre cinzas.
        </p>
      </PageContainer>
    </>
  );
}
