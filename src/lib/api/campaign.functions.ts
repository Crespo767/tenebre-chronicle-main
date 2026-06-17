import { createServerFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  setCookie,
  setResponseHeaders,
} from "@tanstack/react-start/server";
import { z } from "zod";

import {
  cloneContent,
  defaultCampaignContent,
  normalizeContent,
  slugify,
  type CampaignContent,
} from "../campaign-content";

const MAX_ADMIN_USERS = 2;
const SESSION_COOKIE = "tenebre_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_OPTIONS = {
  N: 8192,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
};

const stringArraySchema = z.array(z.string());

const campaignContentSchema = z.object({
  sessions: z.array(
    z.object({
      slug: z.string().min(1),
      number: z.number().int().positive(),
      title: z.string().min(1),
      date: z.string(),
      present: stringArraySchema,
      summary: z.string(),
      events: stringArraySchema,
      npcs: stringArraySchema,
      locations: stringArraySchema,
      consequences: stringArraySchema,
      hooks: stringArraySchema,
      masterNotes: z.string(),
    }),
  ),
  characters: z.array(
    z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      role: z.string(),
      people: z.string(),
      shadow: z.string().optional(),
      quote: z.string(),
      image: z.string(),
      player: z.string().optional(),
      status: z.string(),
      appearance: z.string(),
      goal: z.string(),
      history: z.string(),
    }),
  ),
  npcs: z.array(
    z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      image: z.string().optional(),
      role: z.string(),
      location: z.string(),
      relation: z.string(),
      status: z.string(),
      summary: z.string(),
    }),
  ),
  archive: z.array(
    z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      type: z.enum(["Carta", "Mapa", "Imagem", "Documento", "Handout"]),
      discovered: z.string(),
      description: z.string(),
      link: z.string().optional(),
    }),
  ),
  masterNotes: z.array(
    z.object({
      title: z.string().min(1),
      date: z.string(),
      body: z.string(),
    }),
  ),
});

const credentialsSchema = z.object({
  username: z.string().min(3).max(80),
  password: z.string().min(6).max(200),
});

const imageUploadSchema = z.object({
  fileName: z.string().min(1).max(180),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]),
  base64: z.string().min(1),
});

type AdminStatus = {
  username: string | null;
  userCount: number;
  canRegister: boolean;
  configured: boolean;
  message?: string;
};

async function getSupabase() {
  const { getSupabaseAdminClient } = await import("../supabase.server");
  return getSupabaseAdminClient();
}

async function hasSupabaseConfig() {
  const { getSupabaseConfig } = await import("../supabase.server");
  return Boolean(getSupabaseConfig());
}

async function getCharacterImagesBucket() {
  const module = await import("../supabase.server");
  return module.getCharacterImagesBucket();
}

async function getCrypto() {
  return await import("node:crypto");
}

async function derivePasswordKey(password: string, salt: string) {
  const { scrypt } = await getCrypto();

  return await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_LENGTH, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

function asString(row: Record<string, unknown>, key: string, fallback = "") {
  const value = row[key];
  return typeof value === "string" ? value : fallback;
}

function asOptionalString(row: Record<string, unknown>, key: string) {
  const value = row[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumber(row: Record<string, unknown>, key: string, fallback = 0) {
  const value = row[key];
  return typeof value === "number" ? value : fallback;
}

function asStringArray(row: Record<string, unknown>, key: string) {
  const value = row[key];
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function mapSession(row: Record<string, unknown>) {
  return {
    slug: asString(row, "slug"),
    number: asNumber(row, "number"),
    title: asString(row, "title"),
    date: asString(row, "session_date"),
    present: asStringArray(row, "present"),
    summary: asString(row, "summary"),
    events: asStringArray(row, "events"),
    npcs: asStringArray(row, "npcs"),
    locations: asStringArray(row, "locations"),
    consequences: asStringArray(row, "consequences"),
    hooks: asStringArray(row, "hooks"),
    masterNotes: asString(row, "master_notes"),
  };
}

function mapCharacter(row: Record<string, unknown>) {
  return {
    slug: asString(row, "slug"),
    name: asString(row, "name"),
    role: asString(row, "role"),
    people: asString(row, "people"),
    shadow: asOptionalString(row, "shadow"),
    quote: asString(row, "quote"),
    image: asString(row, "image"),
    player: asOptionalString(row, "player"),
    status: asString(row, "status"),
    appearance: asString(row, "appearance"),
    goal: asString(row, "goal"),
    history: asString(row, "history"),
  };
}

function mapNpc(row: Record<string, unknown>) {
  return {
    slug: asString(row, "slug"),
    name: asString(row, "name"),
    image: asString(row, "image"),
    role: asString(row, "role"),
    location: asString(row, "location"),
    relation: asString(row, "relation"),
    status: asString(row, "status"),
    summary: asString(row, "summary"),
  };
}

function mapArchiveItem(row: Record<string, unknown>) {
  return {
    slug: asString(row, "slug"),
    title: asString(row, "title"),
    type: asString(row, "type", "Documento") as
      | "Carta"
      | "Mapa"
      | "Imagem"
      | "Documento"
      | "Handout",
    discovered: asString(row, "discovered"),
    description: asString(row, "description"),
    link: asOptionalString(row, "link"),
  };
}

function mapMasterNote(row: Record<string, unknown>) {
  return {
    title: asString(row, "title"),
    date: asString(row, "note_date"),
    body: asString(row, "body"),
  };
}

async function selectRows(table: string, firstOrder: string, secondOrder?: string) {
  const supabase = await getSupabase();
  let query = supabase.from(table).select("*").order(firstOrder, { ascending: true });

  if (secondOrder) {
    query = query.order(secondOrder, { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []) as Record<string, unknown>[];
}

async function readCampaignContentFromDb(): Promise<CampaignContent> {
  const [sessions, characters, npcs, archive, masterNotes] = await Promise.all([
    selectRows("campaign_sessions", "number", "order_index"),
    selectRows("campaign_characters", "order_index", "name"),
    selectRows("campaign_npcs", "order_index", "name"),
    selectRows("campaign_archive_items", "order_index", "title"),
    selectRows("campaign_master_notes", "order_index", "title"),
  ]);

  return normalizeContent({
    sessions: sessions.map(mapSession),
    characters: characters.map(mapCharacter),
    npcs: npcs.map(mapNpc),
    archive: archive.map(mapArchiveItem),
    masterNotes: masterNotes.map(mapMasterNote),
  });
}

async function replaceTable(table: string, deleteColumn: string, rows: Record<string, unknown>[]) {
  const supabase = await getSupabase();
  const deleted = await supabase.from(table).delete().neq(deleteColumn, "__tenebre_never__");
  if (deleted.error) throw new Error(deleted.error.message);
  if (!rows.length) return;

  const inserted = await supabase.from(table).insert(rows);
  if (inserted.error) throw new Error(inserted.error.message);
}

async function saveCampaignContentToDb(content: CampaignContent) {
  await replaceTable(
    "campaign_sessions",
    "slug",
    content.sessions.map((session, index) => ({
      slug: session.slug,
      number: session.number,
      title: session.title,
      session_date: session.date,
      present: session.present,
      summary: session.summary,
      events: session.events,
      npcs: session.npcs,
      locations: session.locations,
      consequences: session.consequences,
      hooks: session.hooks,
      master_notes: session.masterNotes,
      order_index: index + 1,
    })),
  );

  await replaceTable(
    "campaign_characters",
    "slug",
    content.characters.map((character, index) => ({
      slug: character.slug,
      name: character.name,
      role: character.role,
      people: character.people,
      shadow: character.shadow ?? null,
      quote: character.quote,
      image: character.image,
      player: character.player ?? null,
      status: character.status,
      appearance: character.appearance,
      goal: character.goal,
      history: character.history,
      order_index: index + 1,
    })),
  );

  await replaceTable(
    "campaign_npcs",
    "slug",
    content.npcs.map((npc, index) => ({
      slug: npc.slug,
      name: npc.name,
      image: npc.image ?? "",
      role: npc.role,
      location: npc.location,
      relation: npc.relation,
      status: npc.status,
      summary: npc.summary,
      order_index: index + 1,
    })),
  );

  await replaceTable(
    "campaign_archive_items",
    "slug",
    content.archive.map((item, index) => ({
      slug: item.slug,
      title: item.title,
      type: item.type,
      discovered: item.discovered,
      description: item.description,
      link: item.link || null,
      order_index: index + 1,
    })),
  );

  await replaceTable(
    "campaign_master_notes",
    "title",
    content.masterNotes.map((note, index) => ({
      title: note.title,
      note_date: note.date,
      body: note.body,
      order_index: index + 1,
    })),
  );
}

async function passwordHash(password: string) {
  const { randomBytes } = await getCrypto();
  const salt = randomBytes(16).toString("hex");
  const hash = (await derivePasswordKey(password, salt)).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const { timingSafeEqual } = await getCrypto();
  const actual = await derivePasswordKey(password, salt);
  const expected = Buffer.from(hash, "hex");

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

async function createSession(username: string) {
  const { createHash, randomBytes } = await getCrypto();
  const supabase = await getSupabase();
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  const { error } = await supabase.from("admin_sessions").insert({
    token_hash: tokenHash,
    username,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);

  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

async function getSessionUsername() {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;

  const { createHash } = await getCrypto();
  const supabase = await getSupabase();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("username, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  const expiresAt = asString(row, "expires_at");
  if (new Date(expiresAt).getTime() <= Date.now()) {
    await supabase.from("admin_sessions").delete().eq("token_hash", tokenHash);
    deleteCookie(SESSION_COOKIE, { path: "/" });
    return null;
  }

  return asString(row, "username") || null;
}

async function requireAdmin() {
  const username = await getSessionUsername();
  if (!username) throw new Error("Acesso administrativo necessário.");
  return username;
}

async function readAdminStatus(): Promise<AdminStatus> {
  const supabase = await getSupabase();
  const username = await getSessionUsername();
  const userCount = await readAdminUserCount(supabase);

  return {
    username,
    userCount,
    canRegister: userCount < MAX_ADMIN_USERS,
    configured: true,
  };
}

async function readAdminUserCount(supabase?: Awaited<ReturnType<typeof getSupabase>>) {
  const client = supabase ?? (await getSupabase());
  const { count, error } = await client
    .from("admin_users")
    .select("username", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  return count ?? 0;
}

function getAdminErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") {
    return "O Supabase demorou para responder. Verifique SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e se o projeto está ativo.";
  }

  if (error instanceof Error && error.message) return error.message;

  return "Falha ao conectar ao Supabase.";
}

export const getCampaignContent = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeaders({ "cache-control": "no-store" });

  try {
    return await readCampaignContentFromDb();
  } catch (error) {
    console.error(error);
    return cloneContent(defaultCampaignContent);
  }
});

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeaders({ "cache-control": "no-store" });

  if (!(await hasSupabaseConfig())) {
    return {
      username: null,
      userCount: 0,
      canRegister: false,
      configured: false,
      message:
        "Configuração do Supabase ausente no servidor. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do deploy.",
    };
  }

  try {
    return await readAdminStatus();
  } catch (error) {
    console.error(error);
    return {
      username: null,
      userCount: 0,
      canRegister: false,
      configured: false,
      message: getAdminErrorMessage(error),
    };
  }
});

export const registerAdminUser = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    setResponseHeaders({ "cache-control": "no-store" });
    const startedAt = Date.now();
    const logStep = (step: string) => {
      console.info(`[registerAdminUser] ${step} ${Date.now() - startedAt}ms`);
    };

    try {
      logStep("start");
      const supabase = await getSupabase();
      logStep("client");
      const userCount = await readAdminUserCount(supabase);
      logStep("count");

      if (userCount >= MAX_ADMIN_USERS) {
        return { ok: false as const, message: "O limite de 2 usuários já foi atingido." };
      }

      const username = data.username.trim();
      const normalized = username.toLowerCase();
      const password_hash = await passwordHash(data.password);
      logStep("hash");

      const { error } = await supabase.from("admin_users").insert({
        username,
        username_normalized: normalized,
        password_hash,
      });
      logStep("insert");
      if (error?.code === "23505") {
        return { ok: false as const, message: "Esse login já existe." };
      }
      if (error) throw new Error(error.message);

      await createSession(username);
      logStep("session");
      return { ok: true as const, username };
    } catch (error) {
      console.error(error);
      return { ok: false as const, message: getAdminErrorMessage(error) };
    }
  });

export const loginAdminUser = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    setResponseHeaders({ "cache-control": "no-store" });
    try {
      const supabase = await getSupabase();
      const normalized = data.username.trim().toLowerCase();
      const { data: user, error } = await supabase
        .from("admin_users")
        .select("username, password_hash")
        .eq("username_normalized", normalized)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!user) return { ok: false as const, message: "Login ou senha inválidos." };

      const row = user as Record<string, unknown>;
      const matches = await verifyPassword(data.password, asString(row, "password_hash"));
      if (!matches) return { ok: false as const, message: "Login ou senha inválidos." };

      const username = asString(row, "username");
      await createSession(username);
      return { ok: true as const, username };
    } catch (error) {
      console.error(error);
      return { ok: false as const, message: getAdminErrorMessage(error) };
    }
  });

export const logoutAdminUser = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeaders({ "cache-control": "no-store" });
  const token = getCookie(SESSION_COOKIE);

  if (token) {
    const { createHash } = await getCrypto();
    const supabase = await getSupabase();
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await supabase.from("admin_sessions").delete().eq("token_hash", tokenHash);
  }

  deleteCookie(SESSION_COOKIE, { path: "/" });
  return { ok: true as const };
});

export const saveCampaignContent = createServerFn({ method: "POST" })
  .validator(campaignContentSchema)
  .handler(async ({ data }) => {
    setResponseHeaders({ "cache-control": "no-store" });
    await requireAdmin();
    const content = normalizeContent(data);
    await saveCampaignContentToDb(content);
    return { ok: true as const, content };
  });

export const uploadCharacterImage = createServerFn({ method: "POST" })
  .validator(imageUploadSchema)
  .handler(async ({ data }) => {
    setResponseHeaders({ "cache-control": "no-store" });
    await requireAdmin();

    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.byteLength > 5 * 1024 * 1024) {
      return { ok: false as const, message: "A imagem precisa ter no máximo 5 MB." };
    }

    const supabase = await getSupabase();
    const bucket = await getCharacterImagesBucket();
    const extension = data.mimeType.split("/")[1]?.replace("jpeg", "jpg") || "webp";
    const name = slugify(data.fileName.replace(/\.[^.]+$/, "")) || "personagem";
    const path = `${name}-${Date.now()}.${extension}`;
    const uploaded = await supabase.storage.from(bucket).upload(path, bytes, {
      contentType: data.mimeType,
      upsert: true,
    });

    if (uploaded.error) throw new Error(uploaded.error.message);

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(uploaded.data.path);
    return { ok: true as const, url: publicUrl.data.publicUrl };
  });
