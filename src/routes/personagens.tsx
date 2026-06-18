import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard, ImageFrame } from "../components/ui-chrome";
import { getCampaignContent } from "../lib/api/campaign.functions";

export const Route = createFileRoute("/personagens")({
  loader: () => getCampaignContent(),
  head: () => ({
    meta: [
      { title: "Personagens | Tenebre" },
      { name: "description", content: "Personagens dos jogadores da campanha Tenebre." },
      { property: "og:title", content: "Personagens | Tenebre" },
      { property: "og:description", content: "Quem ainda caminha com a caravana." },
    ],
  }),
  component: CharactersPage,
});

function CharactersPage() {
  const { characters } = Route.useLoaderData();
  const isListRoute = useRouterState({
    select: (state) => state.location.pathname === "/personagens",
  });

  if (!isListRoute) return <Outlet />;

  return (
    <PageContainer>
      <SectionTitle
        eyebrow="Grupo"
        title="Personagens"
        subtitle="Quem segue junto quando a estrada cobra seu preço."
      />
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((c) => (
          <li key={c.slug}>
            <Link to="/personagens/$slug" params={{ slug: c.slug }} className="block">
              <ChronicleCard as="article" className="h-full">
                <ImageFrame
                  src={c.image}
                  alt={c.name}
                  ratio="3/4"
                  positionX={c.imagePositionX}
                  positionY={c.imagePositionY}
                  scale={c.imageScale}
                  grayscale={isDeadStatus(c.status)}
                />
                <h2 className="mt-4 font-display text-2xl text-foreground">{c.name}</h2>
                <p className="text-sm text-[var(--gold)]/80">{c.role}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {c.people}
                </p>
                <p className="mt-3 italic text-foreground/85">“{c.quote}”</p>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[var(--gold)]/80">
                  Ver personagem →
                </p>
              </ChronicleCard>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

function isDeadStatus(status: string) {
  const normalized = status.toLowerCase();
  return (
    normalized.includes("mort") || normalized.includes("falec") || normalized.includes("morreu")
  );
}
