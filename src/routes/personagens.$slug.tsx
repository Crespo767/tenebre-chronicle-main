import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer, ImageFrame } from "../components/ui-chrome";
import { getCampaignContent } from "../lib/api/campaign.functions";

export const Route = createFileRoute("/personagens/$slug")({
  loader: () => getCampaignContent(),
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

function isDeadStatus(status: string) {
  const normalized = status.toLowerCase();
  return (
    normalized.includes("mort") || normalized.includes("falec") || normalized.includes("morreu")
  );
}

function CharacterDetail() {
  const { slug } = Route.useParams();
  const { characters } = Route.useLoaderData();
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
          <ImageFrame
            src={c.image}
            alt={c.name}
            ratio="3/4"
            priority
            grayscale={isDeadStatus(c.status)}
          />
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-muted-foreground">
              <span className="text-foreground">Ocupação:</span> {c.role}
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground">Raça:</span> {c.people}
            </p>
            {c.shadow && (
              <p className="text-muted-foreground">
                <span className="text-foreground">Sombra:</span> {c.shadow}
              </p>
            )}
            {c.player && (
              <p className="text-muted-foreground">
                <span className="text-foreground">Jogador(a):</span> {c.player}
              </p>
            )}
          </div>
        </div>

        <article className="min-w-0">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">{c.name}</h1>
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
        </article>
      </div>
    </PageContainer>
  );
}
