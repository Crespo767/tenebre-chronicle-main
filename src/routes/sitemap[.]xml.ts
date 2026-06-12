import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { sessions } from "../data/sessions";
import { characters } from "../data/characters";
import { lore } from "../data/lore";
import { factions } from "../data/factions";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { path: string; changefreq?: string; priority?: string }[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/sessoes", changefreq: "weekly" },
          { path: "/personagens", changefreq: "weekly" },
          { path: "/mundo", changefreq: "monthly" },
          { path: "/faccoes", changefreq: "monthly" },
          { path: "/npcs", changefreq: "weekly" },
          { path: "/rumores", changefreq: "weekly" },
          { path: "/arquivo", changefreq: "monthly" },
          { path: "/notas", changefreq: "weekly" },
          ...sessions.map((s) => ({ path: `/sessoes/${s.slug}` })),
          ...characters.map((c) => ({ path: `/personagens/${c.slug}` })),
          ...lore.map((l) => ({ path: `/mundo/${l.slug}` })),
          ...factions.map((f) => ({ path: `/faccoes/${f.slug}` })),
        ];
        const urls = entries
          .map(
            (e) =>
              `  <url><loc>${BASE_URL}${e.path}</loc>${
                e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ""
              }${e.priority ? `<priority>${e.priority}</priority>` : ""}</url>`
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
