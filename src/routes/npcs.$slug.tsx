import { createFileRoute, Link } from "@tanstack/react-router";
import { CompanionsSection } from "../components/companions-section";
import { PageContainer, ImageFrame, StatusBadge } from "../components/ui-chrome";
import { getCampaignContent } from "../lib/api/campaign.functions";

export const Route = createFileRoute("/npcs/$slug")({
  loader: () => getCampaignContent(),
  head: () => ({
    meta: [
      { title: "NPC — Tenebre" },
      { name: "description", content: "Registro de NPC da campanha Tenebre." },
    ],
  }),
  component: NpcDetail,
});

function tone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("desaparec") || s.includes("desconhec")) return "warn" as const;
  if (s.includes("morto") || s.includes("morta")) return "danger" as const;
  return "ok" as const;
}

function isDeadStatus(status: string) {
  return tone(status) === "danger";
}

function NpcDetail() {
  const { slug } = Route.useParams();
  const { npcs } = Route.useLoaderData();
  const npc = npcs.find((entry) => entry.slug === slug);

  if (!npc) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">NPC não encontrado.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link
        to="/npcs"
        className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-[var(--gold)]"
      >
        ← NPCs
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        {npc.image && (
          <div>
            <ImageFrame
              src={npc.image}
              alt={npc.name}
              priority
              positionX={npc.imagePositionX}
              positionY={npc.imagePositionY}
              scale={npc.imageScale}
              grayscale={isDeadStatus(npc.status)}
            />
          </div>
        )}

        <article className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-4xl text-foreground sm:text-5xl">{npc.name}</h1>
              <p className="mt-2 text-[var(--gold)]/85">{npc.role}</p>
            </div>
            <StatusBadge tone={tone(npc.status)}>{npc.status}</StatusBadge>
          </div>

          <div className="gold-rule mt-5 w-32" />
          <dl className="mt-6 grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded border border-border/70 bg-background/35 p-4">
              <dt className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">Local</dt>
              <dd className="mt-2 text-foreground/90">{npc.location}</dd>
            </div>
            <div className="rounded border border-border/70 bg-background/35 p-4">
              <dt className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">Relação</dt>
              <dd className="mt-2 text-foreground/90">{npc.relation}</dd>
            </div>
          </dl>

          <section className="mt-8">
            <h2 className="font-display text-xl text-[var(--gold)]">Resumo</h2>
            <div className="gold-rule mt-2 w-16" />
            <p className="mt-3 leading-relaxed text-foreground/90">{npc.summary}</p>
          </section>
          <CompanionsSection companions={npc.companions} />
        </article>
      </div>
    </PageContainer>
  );
}
