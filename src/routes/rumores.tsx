import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard, StatusBadge } from "../components/ui-chrome";
import { rumors } from "../data/rumors";

export const Route = createFileRoute("/rumores")({
  head: () => ({
    meta: [
      { title: "Rumores — Tenebre" },
      { name: "description", content: "Sussurros e meias-verdades colhidos pelo caminho." },
      { property: "og:title", content: "Rumores — Tenebre" },
      { property: "og:description", content: "Sussurros e meias-verdades." },
    ],
  }),
  component: RumorsPage,
});

function statusTone(s: string) {
  if (s === "Confirmado") return "ok" as const;
  if (s === "Falso") return "danger" as const;
  if (s === "Investigado") return "warn" as const;
  return "neutral" as const;
}

function RumorsPage() {
  return (
    <PageContainer>
      <SectionTitle eyebrow="Sussurros" title="Rumores" subtitle="Nem tudo o que se conta nos campos é verdade. Nem tudo é mentira." />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {rumors.map((r) => (
          <li key={r.slug}>
            <ChronicleCard as="article" className="h-full">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl text-foreground">{r.title}</h2>
                <StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge>
              </div>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                Origem: {r.origin} · Confiança: {r.confidence}
              </p>
              <p className="mt-3 leading-relaxed text-foreground/90">{r.text}</p>
            </ChronicleCard>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
