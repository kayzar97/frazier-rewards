import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

function normalizeUsername(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { prizeId } = await req.json();

  if (!prizeId) {
    return Response.json({ error: "Missing prize ID" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, Discord_Username, twitch_username, spartans_username")
    .eq("Discord_Username", session.user.name)
    .single();

  if (profileError || !profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: prize, error: prizeError } = await supabaseAdmin
    .from("giveaway_prizes")
    .select("*")
    .eq("id", prizeId)
    .single();

  if (prizeError || !prize) {
    return Response.json({ error: "Prize not found" }, { status: 404 });
  }

  if (prize.status !== "unclaimed") {
    return Response.json(
      { error: "This prize has already been claimed." },
      { status: 409 }
    );
  }

  const twitchUsername = normalizeUsername(profile.twitch_username);
  const spartansUsername = normalizeUsername(profile.spartans_username);
  const winnerUsername = normalizeUsername(prize.winner_username);

  const matchesTwitch =
    prize.winner_type === "twitch" &&
    twitchUsername &&
    twitchUsername === winnerUsername;

  const matchesSpartans =
    prize.winner_type === "spartans" &&
    spartansUsername &&
    spartansUsername === winnerUsername;

  if (!matchesTwitch && !matchesSpartans) {
    return Response.json(
      { error: "This prize does not match your connected accounts." },
      { status: 403 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("giveaway_prizes")
    .update({
      status: "claimed",
      claimed_by_profile_id: profile.id,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", prizeId)
    .eq("status", "unclaimed")
    .select("*")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    prize: data,
  });
}