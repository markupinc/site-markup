import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const CORRETOR_COOKIE = "corretor_session";
const TOKEN_EXPIRY = "30d";

export interface CorretorSession {
  id: string;
  nome: string;
  creci: string;
}

function getSecret() {
  const secret = process.env.CORRETOR_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "CORRETOR_JWT_SECRET env var is missing or too short (min 32 chars)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signCorretorToken(payload: CorretorSession) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyCorretorToken(
  token: string
): Promise<CorretorSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.id === "string" &&
      typeof payload.nome === "string" &&
      typeof payload.creci === "string"
    ) {
      return { id: payload.id, nome: payload.nome, creci: payload.creci };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCorretorSession(): Promise<CorretorSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CORRETOR_COOKIE)?.value;
  if (!token) return null;
  return await verifyCorretorToken(token);
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
