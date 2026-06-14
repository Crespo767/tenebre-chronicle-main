import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard, StatusBadge } from "../components/ui-chrome";
import { getCampaignContent } from "../lib/api/campaign.functions";

export const Route = createFileRoute("/arquivo")({
  loader: () => getCampaignContent(),
  head: () => ({
    meta: [
      { title: "Arquivo — Tenebre" },
      { name: "description", content: "Cartas, mapas, documentos e handouts da campanha." },
      { property: "og:title", content: "Arquivo — Tenebre" },
      { property: "og:description", content: "Documentos e handouts da crônica." },
    ],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  const { archive } = Route.useLoaderData();

  return (
    <PageContainer>
      <SectionTitle
        eyebrow="Documentos"
        title="Arquivo"
        subtitle="Cartas, mapas, esboços e relíquias documentais."
      />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {archive.map((it) => (
          <li key={it.slug}>
            <ChronicleCard as="article" className="h-full">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl text-foreground">{it.title}</h2>
                <StatusBadge tone="warn">{it.type}</StatusBadge>
              </div>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                Descoberto: {it.discovered}
              </p>
              <p className="mt-3 leading-relaxed text-foreground/90">{it.description}</p>
              {it.link && (
                <a
                  href={it.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center text-sm text-[var(--gold)] hover:underline"
                >
                  Abrir documento →
                </a>
              )}
            </ChronicleCard>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
