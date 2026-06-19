import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard } from "../components/ui-chrome";
import { getCampaignContent } from "../lib/api/campaign.functions";

const sessionCoverImage = "/images/sessions/acampamento.webp";

export const Route = createFileRoute("/sessoes")({
  loader: () => getCampaignContent(),
  head: () => ({
    meta: [
      { title: "Sessões — Tenebre" },
      { name: "description", content: "Registros das sessões da campanha Tenebre." },
      { property: "og:title", content: "Sessões — Tenebre" },
      { property: "og:description", content: "Os capítulos da crônica, sessão a sessão." },
    ],
  }),
  component: SessionsPage,
});

function SessionsPage() {
  const { sessions } = Route.useLoaderData();
  const isListRoute = useRouterState({
    select: (state) => state.location.pathname === "/sessoes",
  });

  if (!isListRoute) return <Outlet />;

  return (
    <PageContainer>
      <SectionTitle
        eyebrow="Registros"
        title="Sessões da Campanha"
        subtitle="Cada noite na mesa é um capítulo escrito a mais."
      />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sessions.map((s) => (
          <li key={s.slug}>
            <Link to="/sessoes/$slug" params={{ slug: s.slug }} className="block h-full">
              <ChronicleCard as="article" className="h-full">
                <img
                  src={sessionCoverImage}
                  alt=""
                  className="aspect-[16/9] w-full rounded border border-[var(--gold)]/30 object-cover"
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={675}
                  sizes="(max-width: 768px) calc(100vw - 3rem), 560px"
                />
                <h2 className="mt-4 font-display text-2xl text-[var(--gold)]">
                  Sessão {String(s.number).padStart(2, "0")}
                </h2>
              </ChronicleCard>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
