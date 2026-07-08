import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeSync } from "@/components/layout/ThemeSync";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, onboarding_completed, theme").eq("id", user.id).maybeSingle();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <ThemeSync theme={profile.theme} />
      <Sidebar name={profile.full_name || user.email || "You"} />
      <main className="flex-1 overflow-x-hidden pb-20 sm:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
