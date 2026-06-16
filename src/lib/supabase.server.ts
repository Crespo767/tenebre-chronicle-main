import { createClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  secretKey: string;
};

const SUPABASE_REQUEST_TIMEOUT_MS = 8_000;

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.hostname.includes("your-project-ref");
  } catch {
    return false;
  }
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: init?.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) return null;
  if (!isValidSupabaseUrl(url)) return null;
  return { url, secretKey };
}

export function getCharacterImagesBucket() {
  return process.env.SUPABASE_CHARACTER_IMAGES_BUCKET || "character-images";
}

export function getSupabaseAdminClient() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase server config is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(config.url, config.secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  });
}
