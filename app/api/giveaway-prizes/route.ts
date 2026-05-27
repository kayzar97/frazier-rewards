import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

function normalizeUsername(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, Discord_Username, twitch_username, spartans_username")
    .eq("Discord_Username", session.user.name)
    .single();

  if (profileError || !profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const twitchUsername = normalizeUsername(profile.twitch_username);
  const spartansUsername = normalizeUsername(profile.spartans_username);

  const matchFilters = [];

  if (twitchUsername) {
    matchFilters.push(
      `and(winner_type.eq.twitch,winner_username_normalized.eq.${twitchUsername})`
    );
  }

  if (spartansUsername) {
    matchFilters.push(
      `and(winner_type.eq.spartans,winner_username_normalized.eq.${spartansUsername})`
    );
  }

  if (matchFilters.length === 0) {
    return Response.json({ prizes: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("giveaway_prizes")
    .select("*")
    .or(matchFilters.join(","))
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    prizes: data || [],
  });
}