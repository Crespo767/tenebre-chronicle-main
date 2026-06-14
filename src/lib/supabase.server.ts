import { createClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  secretKey: string;
};

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) return null;
  return { url, secretKey };
}

export function getCharacterImagesBucket() {
  return process.env.SUPABASE_CHARACTER_IMAGES_BUCKET || "character-images";
}

export function getSupabaseAdminClient() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase server config is missing.");
  }

  return createClient(config.url, config.secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
