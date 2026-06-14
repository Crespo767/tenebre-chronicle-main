import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer, ImageFrame, StatusBadge } from "../components/ui-chrome";
import { useCampaignContent } from "../lib/campaign-content";

export const Route = createFileRoute("/personagens/$slug")({
  head: () => ({
    meta: [
      { title: "Personagem — Tenebre" },
      { name: "description", content: "Ficha narrativa de personagem da campanha Tenebre." },
    ],
  }),
  component: CharacterDetail,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-[var(--gold)]">{title}</h2>
      <div className="gold-rule mt-2 w-16" />
      <div className="mt-3 leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function CharacterDetail() {
  const { slug } = Route.useParams();
  const { characters } = useCampaignContent();
  const c = characters.find((character) => character.slug === slug);

  if (!c) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">Personagem não encontrado.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link
        to="/personagens"
        className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-[var(--gold)]"
      >
        ← Personagens
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <div>
          <ImageFrame src={c.image} alt={c.name} ratio="3/4" priority />
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-muted-foreground">
              <span className="text-foreground">Ocupação:</span> {c.role}
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground">Povo:</span> {c.people}
            </p>
            {c.player && (
              <p className="text-muted-foreground">
                <span className="text-foreground">Jogador(a):</span> {c.player}
              </p>
            )}
            <div className="pt-2">
              <StatusBadge tone={c.status.toLowerCase().includes("viv") ? "ok" : "danger"}>
                {c.status}
              </StatusBadge>
            </div>
          </div>
        </div>

        <article className="min-w-0">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">{c.name}</h1>
          {c.subtitle && (
            <p className="mt-2 font-display italic text-muted-foreground">{c.subtitle}</p>
          )}
          <div className="gold-rule mt-4 w-32" />
          <blockquote className="mt-5 border-l-2 border-[var(--gold)]/50 pl-4 font-display italic text-foreground/85">
            “{c.quote}”
          </blockquote>

          <Section title="Aparência">
            <p>{c.appearance}</p>
          </Section>
          <Section title="Objetivo pessoal">
            <p>{c.goal}</p>
          </Section>
          <Section title="Histórico">
            <p>{c.history}</p>
          </Section>
          {c.bonds && (
            <Section title="Vínculos">
              <p>{c.bonds}</p>
            </Section>
          )}
          {c.items && c.items.length > 0 && (
            <Section title="Itens importantes">
              <ul className="list-inside list-['—_'] space-y-1">
                {c.items.map((it: string) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </Section>
          )}
          {c.evolution && (
            <Section title="Notas de evolução">
              <p>{c.evolution}</p>
            </Section>
          )}
          {c.relations && (
            <Section title="Relações com NPCs">
              <p>{c.relations}</p>
            </Section>
          )}
        </article>
      </div>
    </PageContainer>
  );
}
