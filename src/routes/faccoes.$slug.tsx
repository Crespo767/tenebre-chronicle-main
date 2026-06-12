import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageContainer, ImageFrame } from "../components/ui-chrome";
import { factions } from "../data/factions";

export const Route = createFileRoute("/faccoes/$slug")({
  loader: ({ params }) => {
    const faction = factions.find((f) => f.slug === params.slug);
    if (!faction) throw notFound();
    return { faction };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.faction.name} — Tenebre` },
          { name: "description", content: loaderData.faction.summary },
          { property: "og:title", content: `${loaderData.faction.name} — Tenebre` },
          { property: "og:description", content: loaderData.faction.summary },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <PageContainer><p className="text-muted-foreground">Facção não encontrada.</p></PageContainer>
  ),
  errorComponent: ({ error }) => (
    <PageContainer><p className="text-muted-foreground">Erro: {error.message}</p></PageContainer>
  ),
  component: FactionDetail,
});

function FactionDetail() {
  const { faction } = Route.useLoaderData();
  return (
    <PageContainer>
      <Link to="/faccoes" className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-[var(--gold)]">
        ← Facções
      </Link>
      <article className="mt-6 max-w-3xl">
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">{faction.name}</h1>
        <div className="gold-rule mt-5 w-32" />
        {faction.image && (
          <div className="mt-6">
            <ImageFrame src={faction.image} alt={faction.name} ratio="16/9" />
          </div>
        )}
        <p className="mt-6 leading-relaxed text-foreground/90">{faction.summary}</p>
        {faction.details && <p className="mt-4 leading-relaxed text-foreground/85">{faction.details}</p>}
      </article>
    </PageContainer>
  );
}
