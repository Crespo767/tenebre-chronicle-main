import { useEffect, useState } from "react";

export type AdminUser = {
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export const MAX_ADMIN_USERS = 2;

const USERS_KEY = "tenebre.adminUsers.v1";
const SESSION_KEY = "tenebre.adminSession.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function encodeHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createSalt() {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return encodeHex(digest);
}

export function getAdminUsers() {
  return readJson<AdminUser[]>(USERS_KEY, []);
}

export function getCurrentAdminUsername() {
  return readJson<string | null>(SESSION_KEY, null);
}

export async function registerAdminUser(username: string, password: string) {
  const users = getAdminUsers();
  const cleanUsername = username.trim();

  if (users.length >= MAX_ADMIN_USERS) {
    return { ok: false as const, message: "O limite de 2 usuários já foi atingido." };
  }

  if (cleanUsername.length < 3) {
    return { ok: false as const, message: "Use um login com pelo menos 3 caracteres." };
  }

  if (password.length < 6) {
    return { ok: false as const, message: "Use uma senha com pelo menos 6 caracteres." };
  }

  if (users.some((user) => user.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { ok: false as const, message: "Esse login já existe." };
  }

  const salt = createSalt();
  const nextUsers: AdminUser[] = [
    ...users,
    {
      username: cleanUsername,
      passwordHash: await hashPassword(password, salt),
      salt,
      createdAt: new Date().toISOString(),
    },
  ];

  writeJson(USERS_KEY, nextUsers);
  writeJson(SESSION_KEY, cleanUsername);

  return { ok: true as const, username: cleanUsername };
}

export async function loginAdminUser(username: string, password: string) {
  const cleanUsername = username.trim();
  const user = getAdminUsers().find(
    (entry) => entry.username.toLowerCase() === cleanUsername.toLowerCase(),
  );

  if (!user) return { ok: false as const, message: "Login ou senha inválidos." };

  const passwordHash = await hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash) {
    return { ok: false as const, message: "Login ou senha inválidos." };
  }

  writeJson(SESSION_KEY, user.username);
  return { ok: true as const, username: user.username };
}

export function logoutAdminUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function useAdminSession() {
  const [username, setUsername] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const refresh = () => {
    setUsername(getCurrentAdminUsername());
    setUsers(getAdminUsers());
  };

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  return {
    username,
    users,
    canRegister: users.length < MAX_ADMIN_USERS,
    refresh,
  };
}
