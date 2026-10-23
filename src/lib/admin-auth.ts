import "server-only";
import { cookies } from "next/headers";
import { isValidSessionToken, SESSION_COOKIE } from "./admin-session";
import { getAdminCredentials } from "./env";

export async function isAdmin() {
  const admin = getAdminCredentials();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return admin !== null && isValidSessionToken(token, admin);
}
