import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageContainer } from "../components/ui-chrome";
import { lore } from "../data/lore";

export const Route = createFileRoute("/mundo/$slug")({
  loader: ({ params }) => {
    const entry = lore.find((l) => l.slug === params.slug);
    if (!entry) throw notFound();
    return { entry };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.entry.title} — Mundo de Tenebre` },
          { name: "description", content: loaderData.entry.summary },
          { property: "og:title", content: `${loaderData.entry.title} — Mundo de Tenebre` },
          { property: "og:description", content: loaderData.entry.summary },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <PageContainer><p className="text-muted-foreground">Entrada não encontrada.</p></PageContainer>
  ),
  errorComponent: ({ error }) => (
    <PageContainer><p className="text-muted-foreground">Erro: {error.message}</p></PageContainer>
  ),
  component: LoreDetail,
});

function LoreDetail() {
  const { entry } = Route.useLoaderData();
  return (
    <PageContainer>
      <Link to="/mundo" className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-[var(--gold)]">
        ← Mundo
      </Link>
      <article className="mt-6 max-w-3xl">
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">{entry.title}</h1>
        <div className="gold-rule mt-5 w-32" />
        <p className="mt-4 font-display text-xl italic text-muted-foreground">{entry.summary}</p>
        <p className="mt-6 leading-relaxed text-foreground/90">{entry.body}</p>
      </article>
    </PageContainer>
  );
}
