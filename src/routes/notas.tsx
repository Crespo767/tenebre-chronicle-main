import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard } from "../components/ui-chrome";
import { getCampaignContent } from "../lib/api/campaign.functions";

export const Route = createFileRoute("/notas")({
  loader: () => getCampaignContent(),
  head: () => ({
    meta: [
      { title: "Notas do Mestre — Tenebre" },
      { name: "description", content: "Avisos públicos do mestre da campanha Tenebre." },
      { property: "og:title", content: "Notas do Mestre — Tenebre" },
      { property: "og:description", content: "Avisos públicos do mestre." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { masterNotes } = Route.useLoaderData();

  return (
    <PageContainer>
      <SectionTitle
        eyebrow="Voz do Mestre"
        title="Notas do Mestre"
        subtitle="Avisos públicos para a mesa. O que está aqui pode ser lido por todos os jogadores."
      />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {masterNotes.map((n) => (
          <li key={n.title}>
            <ChronicleCard as="article" className="h-full">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl text-[var(--gold)]">{n.title}</h2>
                <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
                  {n.date}
                </span>
              </div>
              <p className="mt-3 leading-relaxed text-foreground/90">{n.body}</p>
            </ChronicleCard>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
