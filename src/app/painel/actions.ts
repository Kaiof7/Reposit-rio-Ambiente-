"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseModelForm, sizeFormSchema } from "@/catalog/admin-input";
import { saveModel, saveSize } from "@/catalog/admin-store";
import { pgErrorCode } from "@/db";
import { isAdmin } from "@/lib/admin-auth";
import { createSessionToken, credentialsMatch, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/admin-session";
import { getAdminCredentials, hasDatabase } from "@/lib/env";
import { logger } from "@/lib/logger";

export type ActionState = { status: "idle" | "ok" | "error"; message: string; errors?: Record<string, string> };

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/painel",
};

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = getAdminCredentials();
  const input = { email: String(form.get("email") ?? ""), password: String(form.get("senha") ?? "") };
  if (!admin || !credentialsMatch(input, admin)) {
    // Slows down guessing; there is no other rate limit (see docs/architecture.md).
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { status: "error", message: "E-mail ou senha incorretos." };
  }
  (await cookies()).set(SESSION_COOKIE, createSessionToken(admin), { ...cookieOptions, maxAge: SESSION_MAX_AGE_SECONDS });
  redirect("/painel");
}

export async function logout() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: cookieOptions.path });
  redirect("/painel");
}

// Server actions are public endpoints: every write checks the session itself.
async function guard(): Promise<ActionState | null> {
  if (!(await isAdmin())) return { status: "error", message: "Sua sessão expirou. Entre de novo." };
  if (!hasDatabase()) return { status: "error", message: "O banco ainda não foi criado; nada foi salvo." };
  return null;
}

async function persist(write: () => Promise<void>, success: string): Promise<ActionState> {
  try {
    await write();
  } catch (error) {
    const code = pgErrorCode(error);
    logger.error({ code }, "Panel save failed");
    // 42P01 (undefined_table): the database exists but migrations never ran.
    if (code === "42P01") {
      return { status: "error", message: "O banco ainda não foi preparado. Faça um novo deploy de produção na Vercel e tente de novo." };
    }
    return { status: "error", message: "Não foi possível salvar. Tente de novo em instantes." };
  }
  revalidatePath("/", "layout");
  return { status: "ok", message: success };
}

export async function saveModelAction(_: ActionState, form: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const sizeIds = String(form.get("sizeIds") ?? "").split(",").filter(Boolean);
  const parsed = parseModelForm(form, sizeIds);
  if (!parsed.ok) return { status: "error", message: "Corrija os campos marcados.", errors: parsed.errors };
  return persist(() => saveModel(parsed.value), "Modelo salvo. A loja já mostra as mudanças.");
}

export async function saveSizeAction(_: ActionState, form: FormData): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  const parsed = sizeFormSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
    return { status: "error", message: "Corrija os campos marcados.", errors };
  }
  return persist(() => saveSize(parsed.data), parsed.data.id ? "Tamanho salvo." : "Tamanho criado. Ative-o nos modelos abaixo.");
}
