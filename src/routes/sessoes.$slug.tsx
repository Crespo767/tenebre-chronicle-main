import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "../components/ui-chrome";
import { getCampaignContent } from "../lib/api/campaign.functions";

export const Route = createFileRoute("/sessoes/$slug")({
  loader: () => getCampaignContent(),
  head: () => ({
    meta: [
      { title: "Registro de sessão — Tenebre" },
      { name: "description", content: "Registro de sessão da campanha Tenebre." },
    ],
  }),
  component: SessionDetail,
});

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-[var(--gold)]">{title}</h2>
      <div className="gold-rule mt-2 w-16" />
      <ul className="mt-3 list-inside list-['—_'] space-y-1.5 text-foreground/90">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </section>
  );
}

function SessionDetail() {
  const { slug } = Route.useParams();
  const { sessions } = Route.useLoaderData();
  const session = sessions.find((s) => s.slug === slug);

  if (!session) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">Sessão não encontrada.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link
        to="/sessoes"
        className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-[var(--gold)]"
      >
        ← Sessões
      </Link>
      <article className="mt-6">
        <p className="font-display text-sm tracking-[0.3em] text-[var(--gold)]/80">
          SESSÃO {String(session.number).padStart(2, "0")} · {session.date}
        </p>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">{session.title}</h1>
        <div className="gold-rule mt-5 w-32" />
        <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
          Presentes: {session.present.join(", ")}
        </p>

        <section className="mt-8">
          <h2 className="font-display text-xl text-[var(--gold)]">Resumo</h2>
          <div className="gold-rule mt-2 w-16" />
          <p className="mt-3 leading-relaxed text-foreground/90">{session.summary}</p>
        </section>

        <Block title="Acontecimentos" items={session.events} />
        <Block title="NPCs encontrados" items={session.npcs} />
        <Block title="Locais visitados" items={session.locations} />
        <Block title="Consequências" items={session.consequences} />
        <Block title="Ganchos pendentes" items={session.hooks} />
      </article>
    </PageContainer>
  );
}
