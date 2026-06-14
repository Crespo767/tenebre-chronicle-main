import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard, StatusBadge } from "../components/ui-chrome";
import { getCampaignContent } from "../lib/api/campaign.functions";

export const Route = createFileRoute("/npcs")({
  loader: () => getCampaignContent(),
  head: () => ({
    meta: [
      { title: "NPCs — Tenebre" },
      { name: "description", content: "Rostos cruzados na caravana e nas estradas." },
      { property: "og:title", content: "NPCs — Tenebre" },
      { property: "og:description", content: "Aliados, suspeitos e inimigos da crônica." },
    ],
  }),
  component: NpcsPage,
});

function tone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("desaparec") || s.includes("desconhec")) return "warn" as const;
  if (s.includes("morto") || s.includes("morta")) return "danger" as const;
  return "ok" as const;
}

function NpcsPage() {
  const { npcs } = Route.useLoaderData();

  return (
    <PageContainer>
      <SectionTitle
        eyebrow="Coadjuvantes"
        title="NPCs"
        subtitle="Aliados, suspeitos, inimigos — às vezes os três."
      />
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {npcs.map((n) => (
          <li key={n.slug}>
            <ChronicleCard as="article" className="h-full">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl text-foreground">{n.name}</h2>
                <StatusBadge tone={tone(n.status)}>{n.status}</StatusBadge>
              </div>
              <p className="text-sm text-[var(--gold)]/80">{n.role}</p>
              <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div>
                  <dt className="inline text-foreground/80">Local: </dt>
                  <dd className="inline">{n.location}</dd>
                </div>
                <div>
                  <dt className="inline text-foreground/80">Relação: </dt>
                  <dd className="inline">{n.relation}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">{n.summary}</p>
            </ChronicleCard>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
