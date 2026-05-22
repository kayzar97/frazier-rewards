import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const { guessAmount } = await req.json();

  const { data: hunt } = await supabaseAdmin
    .from("bonus_hunts")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!hunt) {
    return Response.json({ error: "No open bonus hunt" }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("twitch_username")
    .eq("Discord_Username", session.user.name)
    .single();

    if (!profile?.twitch_username) {
  return Response.json(
    { error: "You must connect your Twitch account before entering bonus hunts." },
    { status: 403 }
  );
}

  const { error } = await supabaseAdmin.from("bonus_hunt_predictions").upsert(
    {
      hunt_id: hunt.id,
      discord_username: session.user.name,
      twitch_username: profile?.twitch_username || null,
      guess_amount: Number(guessAmount),
    },
    {
      onConflict: "hunt_id,discord_username",
    }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}