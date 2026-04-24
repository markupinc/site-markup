import { cookies } from "next/headers";

export const CORRETOR_COOKIE = "corretor_id";

export async function getCorretorId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CORRETOR_COOKIE)?.value || null;
}

export function normalizeCpf(cpf: string) {
  return cpf.replace(/\D/g, "");
}

export function normalizeCreci(creci: string) {
  return creci.trim().toUpperCase();
}

export function isValidCpf(cpf: string) {
  const cleaned = normalizeCpf(cpf);
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  const digits = cleaned.split("").map(Number);
  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) sum += digits[i] * (t + 1 - i);
    const check = ((sum * 10) % 11) % 10;
    if (check !== digits[t]) return false;
  }
  return true;
}
