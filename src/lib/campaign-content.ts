import { archive as defaultArchive, type ArchiveItem } from "../data/archive";
import {
  characters as defaultCharacters,
  type Character,
  type Companion,
  type ImageFraming,
} from "../data/characters";
import { masterNotes as defaultMasterNotes, type MasterNote } from "../data/masterNotes";
import { npcs as defaultNpcs, type Npc } from "../data/npcs";
import { sessions as defaultSessions, type Session } from "../data/sessions";

export type { ArchiveItem, Character, Companion, ImageFraming, MasterNote, Npc, Session };

export type CampaignContent = {
  sessions: Session[];
  characters: Character[];
  npcs: Npc[];
  archive: ArchiveItem[];
  masterNotes: MasterNote[];
};

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

export function normalizeContent(value: Partial<CampaignContent> | null): CampaignContent {
  return {
    sessions: Array.isArray(value?.sessions) ? value.sessions : defaultSessions,
    characters: Array.isArray(value?.characters) ? value.characters : defaultCharacters,
    npcs: Array.isArray(value?.npcs) ? value.npcs : defaultNpcs,
    archive: Array.isArray(value?.archive) ? value.archive : defaultArchive,
    masterNotes: Array.isArray(value?.masterNotes) ? value.masterNotes : defaultMasterNotes,
  };
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
