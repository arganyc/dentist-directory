import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DENTISTOS_SESSION_COOKIE,
  getCurrentUserFromSessionToken,
  type DentistOSUser,
} from "./dentistos-auth";
import { PostgresDentistOSAuthRepository } from "./dentistos-auth-data";

export async function getCurrentUser(): Promise<DentistOSUser | null> {
  const store = await cookies();
  const rawSessionToken = store.get(DENTISTOS_SESSION_COOKIE)?.value ?? "";
  return getCurrentUserFromSessionToken({
    rawSessionToken,
    repository: new PostgresDentistOSAuthRepository(),
  });
}

export async function requireUser(): Promise<DentistOSUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
