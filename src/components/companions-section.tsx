import type { Companion } from "../lib/campaign-content";
import { ImageFrame } from "./ui-chrome";

function hasCompanionContent(companion: Companion) {
  return companion.name.trim() || companion.image.trim();
}

export function CompanionsSection({
  companions,
  title = "Companheiros, servos e aliados",
}: {
  companions?: Companion[];
  title?: string;
}) {
  const entries = Array.isArray(companions) ? companions.filter(hasCompanionContent) : [];
  if (!entries.length) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-[var(--gold)]">{title}</h2>
      <div className="gold-rule mt-2 w-16" />
      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map((companion, index) => (
          <li key={`${companion.name}-${index}`} className="min-w-0">
            {companion.image ? (
              <ImageFrame src={companion.image} alt={companion.name} />
            ) : (
              <div className="flex aspect-[9/16] items-center justify-center rounded border border-border/70 bg-background/45 px-3 text-center text-xs text-muted-foreground">
                Sem imagem
              </div>
            )}
            <h3 className="mt-2 truncate text-center font-display text-lg text-foreground">
              {companion.name || "Sem nome"}
            </h3>
          </li>
        ))}
      </ul>
    </section>
  );
}
