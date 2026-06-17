import { createClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  secretKey: string;
};

const SUPABASE_REQUEST_TIMEOUT_MS = 5_000;
let adminClient: ReturnType<typeof createClient> | null = null;
let adminClientConfigKey = "";

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.hostname.includes("your-project-ref");
  } catch {
    return false;
  }
}

function combineAbortSignals(signals: AbortSignal[]) {
  if (signals.length === 1) return signals[0];
  if (typeof AbortSignal.any === "function") return AbortSignal.any(signals);

  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }

    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }

  return controller.signal;
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), SUPABASE_REQUEST_TIMEOUT_MS);
  const signal = init?.signal
    ? combineAbortSignals([init.signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    return await fetch(input, {
      ...init,
      signal,
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

  const configKey = `${config.url}:${config.secretKey}`;
  if (adminClient && adminClientConfigKey === configKey) return adminClient;

  adminClient = createClient(config.url, config.secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  });
  adminClientConfigKey = configKey;
  return adminClient;
}
