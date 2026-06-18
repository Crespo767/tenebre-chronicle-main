import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard } from "../components/ui-chrome";
import { getCampaignContent } from "../lib/api/campaign.functions";

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
            <ChronicleCard as="article" className="h-full">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-sm tracking-[0.25em] text-[var(--gold)]/80">
                  SESSÃO {String(s.number).padStart(2, "0")}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{s.date}</span>
              </div>
              <h2 className="mt-2 font-display text-2xl text-foreground">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground/80">
                Presentes: {s.present.join(", ")}
              </p>
              <div className="mt-5">
                <Link
                  to="/sessoes/$slug"
                  params={{ slug: s.slug }}
                  className="inline-flex items-center text-sm text-[var(--gold)] hover:underline"
                >
                  Ler registro →
                </Link>
              </div>
            </ChronicleCard>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
