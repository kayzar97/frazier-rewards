import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function GET() {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("Discord_Username", session.user.name)
    .single();

  if (profileError || !profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: claims, error } = await supabaseAdmin
    .from("wager_reward_claims")
.select("id, tier, reward_amount, status, created_at, spartans_confirmed")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    claims: claims || [],
  });
}