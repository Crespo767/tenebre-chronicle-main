import type { Companion } from "../lib/campaign-content";
import { StatusBadge } from "./ui-chrome";

function companionTone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("morto") || s.includes("morta") || s.includes("perdido")) return "danger" as const;
  if (s.includes("desaparec") || s.includes("desconhec")) return "warn" as const;
  if (s.includes("vivo") || s.includes("ativa") || s.includes("ativo")) return "ok" as const;
  return "neutral" as const;
}

function hasCompanionContent(companion: Companion) {
  return (
    companion.name.trim() ||
    companion.type.trim() ||
    companion.status.trim() ||
    companion.description.trim()
  );
}

export function CompanionsSection({
  companions,
  title = "Companheiros",
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
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map((companion, index) => (
          <li key={`${companion.name}-${index}`} className="rounded border border-border/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                {companion.type && (
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/75">
                    {companion.type}
                  </p>
                )}
                <h3 className="mt-1 font-display text-lg text-foreground">
                  {companion.name || "Companheiro sem nome"}
                </h3>
              </div>
              {companion.status && (
                <StatusBadge tone={companionTone(companion.status)}>{companion.status}</StatusBadge>
              )}
            </div>
            {companion.description && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                {companion.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
