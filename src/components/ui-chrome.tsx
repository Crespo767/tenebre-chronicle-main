import type { ReactNode } from "react";

function clamp(value: number | undefined, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 ${className}`}>{children}</div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const a = align === "center" ? "text-center" : "text-left";
  return (
    <header className={`mb-8 ${a}`}>
      {eyebrow && (
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[var(--gold)]/80">{eyebrow}</p>
      )}
      <h1 className="font-display text-3xl text-foreground sm:text-4xl md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">{subtitle}</p>}
      <div className={`gold-rule mt-5 ${align === "center" ? "mx-auto w-40" : "w-28"}`} />
    </header>
  );
}

export function ChronicleCard({
  children,
  as: As = "div",
  className = "",
}: {
  children: ReactNode;
  as?: "div" | "article" | "section";
  className?: string;
}) {
  return <As className={`chronicle-card chronicle-card-hover p-5 ${className}`}>{children}</As>;
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "danger" | "ok" | "warn";
}) {
  const tones: Record<string, string> = {
    neutral: "border-border text-muted-foreground",
    danger: "border-[var(--blood)]/60 text-[oklch(0.75_0.12_25)]",
    ok: "border-[var(--moss)] text-[oklch(0.78_0.06_140)]",
    warn: "border-[var(--gold)]/60 text-[var(--gold)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ImageFrame({
  src,
  alt,
  ratio = "4/5",
  priority = false,
  className = "",
  positionX = 50,
  positionY = 50,
  scale = 1,
}: {
  src: string;
  alt: string;
  ratio?: string;
  priority?: boolean;
  className?: string;
  positionX?: number;
  positionY?: number;
  scale?: number;
}) {
  const x = clamp(positionX, 50, 0, 100);
  const y = clamp(positionY, 50, 0, 100);
  const zoom = clamp(scale, 1, 1, 3);

  return (
    <div
      className={`relative overflow-hidden rounded border border-[var(--gold)]/30 bg-[oklch(0.18_0.012_95)] ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        style={{
          objectPosition: `${x}% ${y}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${x}% ${y}%`,
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent"
      />
    </div>
  );
}
