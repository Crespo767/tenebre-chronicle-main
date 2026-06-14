import { useEffect, useState } from "react";

import { archive as defaultArchive, type ArchiveItem } from "../data/archive";
import { characters as defaultCharacters, type Character } from "../data/characters";
import { masterNotes as defaultMasterNotes, type MasterNote } from "../data/masterNotes";
import { npcs as defaultNpcs, type Npc } from "../data/npcs";
import { sessions as defaultSessions, type Session } from "../data/sessions";

export type CampaignContent = {
  sessions: Session[];
  characters: Character[];
  npcs: Npc[];
  archive: ArchiveItem[];
  masterNotes: MasterNote[];
};

export const CAMPAIGN_CONTENT_STORAGE_KEY = "tenebre.campaignContent.v1";
const CONTENT_EVENT = "tenebre:campaign-content";

export const defaultCampaignContent: CampaignContent = {
  sessions: defaultSessions,
  characters: defaultCharacters,
  npcs: defaultNpcs,
  archive: defaultArchive,
  masterNotes: defaultMasterNotes,
};

export function cloneContent(content: CampaignContent): CampaignContent {
  return JSON.parse(JSON.stringify(content)) as CampaignContent;
}

function normalizeContent(value: Partial<CampaignContent> | null): CampaignContent {
  return {
    sessions: Array.isArray(value?.sessions) ? value.sessions : defaultSessions,
    characters: Array.isArray(value?.characters) ? value.characters : defaultCharacters,
    npcs: Array.isArray(value?.npcs) ? value.npcs : defaultNpcs,
    archive: Array.isArray(value?.archive) ? value.archive : defaultArchive,
    masterNotes: Array.isArray(value?.masterNotes) ? value.masterNotes : defaultMasterNotes,
  };
}

export function readCampaignContent(): CampaignContent {
  if (typeof window === "undefined") return cloneContent(defaultCampaignContent);

  const raw = window.localStorage.getItem(CAMPAIGN_CONTENT_STORAGE_KEY);
  if (!raw) return cloneContent(defaultCampaignContent);

  try {
    return normalizeContent(JSON.parse(raw) as Partial<CampaignContent>);
  } catch {
    return cloneContent(defaultCampaignContent);
  }
}

export function writeCampaignContent(content: CampaignContent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CAMPAIGN_CONTENT_STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new CustomEvent(CONTENT_EVENT));
}

export function resetCampaignContent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CAMPAIGN_CONTENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONTENT_EVENT));
}

export function useCampaignContent() {
  const [content, setContent] = useState<CampaignContent>(() =>
    cloneContent(defaultCampaignContent),
  );

  useEffect(() => {
    const load = () => setContent(readCampaignContent());
    load();

    window.addEventListener(CONTENT_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(CONTENT_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return content;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(base: string, existing: string[]) {
  const normalized = slugify(base) || "novo-registro";
  let candidate = normalized;
  let count = 2;

  while (existing.includes(candidate)) {
    candidate = `${normalized}-${count}`;
    count += 1;
  }

  return candidate;
}
