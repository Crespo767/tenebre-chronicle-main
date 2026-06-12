import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard } from "../components/ui-chrome";
import { factions } from "../data/factions";

export const Route = createFileRoute("/faccoes")({
  head: () => ({
    meta: [
      { title: "Facções — Tenebre" },
      { name: "description", content: "Casas, ordens e pactos que moldam a campanha Tenebre." },
      { property: "og:title", content: "Facções — Tenebre" },
      { property: "og:description", content: "Casas, ordens e pactos da crônica." },
    ],
  }),
  component: FactionsPage,
});

function FactionsPage() {
  const highlight = factions.find((f) => f.highlight);
  const rest = factions.filter((f) => !f.highlight);
  return (
    <PageContainer>
      <SectionTitle eyebrow="Lealdades" title="Facções" subtitle="Não há neutralidade verdadeira em Ambria." />

      {highlight && (
        <Link to="/faccoes/$slug" params={{ slug: highlight.slug }} className="block">
          <ChronicleCard as="article" className="mb-8 border-[var(--gold)]/40 bg-[linear-gradient(180deg,_oklch(0.22_0.020_95_/_0.9),_oklch(0.18_0.014_95_/_0.85))]">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)]">Casa em destaque</p>
            <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">{highlight.name}</h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-foreground/90">{highlight.summary}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[var(--gold)]/80">Saber mais →</p>
          </ChronicleCard>
        </Link>
      )}

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((f) => (
          <li key={f.slug}>
            <Link to="/faccoes/$slug" params={{ slug: f.slug }} className="block">
              <ChronicleCard as="article" className="h-full">
                <h3 className="font-display text-xl text-foreground">{f.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[var(--gold)]/80">Saber mais →</p>
              </ChronicleCard>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
