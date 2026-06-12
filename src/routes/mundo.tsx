import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer, SectionTitle, ChronicleCard } from "../components/ui-chrome";
import { lore } from "../data/lore";

export const Route = createFileRoute("/mundo")({
  head: () => ({
    meta: [
      { title: "Mundo — Tenebre" },
      { name: "description", content: "Alberetor, Ambria, Davokar e o que repousa entre eles." },
      { property: "og:title", content: "Mundo — Tenebre" },
      { property: "og:description", content: "A geografia, os deuses e os perigos da crônica." },
    ],
  }),
  component: WorldPage,
});

function WorldPage() {
  return (
    <PageContainer>
      <SectionTitle eyebrow="Lore" title="Mundo" subtitle="Os reinos, deuses e ameaças que moldam Tenebre." />
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lore.map((l) => (
          <li key={l.slug}>
            <Link to="/mundo/$slug" params={{ slug: l.slug }} className="block">
              <ChronicleCard as="article" className="h-full">
                <h2 className="font-display text-2xl text-foreground">{l.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[var(--gold)]/80">Saber mais →</p>
              </ChronicleCard>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
