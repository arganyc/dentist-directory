import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DENTISTOS_SESSION_COOKIE,
  getCurrentUserFromSessionToken,
  type DentistOSUser,
} from "./dentistos-auth";
import { PostgresDentistOSAuthRepository } from "./dentistos-auth-data";
import {
  assertValidPracticeMembership,
  getAuthorizedPracticeContext,
  type DentistOSPracticeContext,
} from "./dentistos-practices";
import { PostgresDentistOSPracticeRepository } from "./dentistos-practices-data";

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

export async function getCurrentPractice(): Promise<DentistOSPracticeContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getAuthorizedPracticeContext({
    user,
    repository: new PostgresDentistOSPracticeRepository(),
  });
}

export async function requirePracticeMembership(
  practiceId: string
): Promise<DentistOSPracticeContext> {
  const user = await requireUser();
  const context = await new PostgresDentistOSPracticeRepository().getPracticeContextForUser(
    user.id,
    practiceId
  );
  try {
    return assertValidPracticeMembership(user, context, practiceId);
  } catch {
    redirect("/dentistos/dashboard");
  }
}
