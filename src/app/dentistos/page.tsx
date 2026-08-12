import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dentistos-auth-server";

export default async function DentistOSHomePage() {
  await requireUser();
  redirect("/dentistos/dashboard");
}
