import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function GET() {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ count: 0 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("Discord_Username", session.user.name)
    .single();

  if (!profile) {
    return Response.json({ count: 0 });
  }

  const { count } = await supabaseAdmin
    .from("wager_reward_claims")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .neq("status", "lost")
    .eq("spartans_confirmed", false)
    .in("status", ["pending", "approved"]);

  return Response.json({ count: count || 0 });
}