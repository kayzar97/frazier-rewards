import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.name) return false;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .single();

  return profile?.role === "admin";
}

export async function GET() {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("wager_reward_claims")
    .select(`
      id,
      tier,
      threshold,
      reward_amount,
      status,
      created_at,
      profile_id,
      profiles (
        Discord_Username,
        spartans_username,
        twitch_username
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ claims: data || [] });
}