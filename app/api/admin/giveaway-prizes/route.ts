import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/^@/, "");
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .single();

  if (adminProfile?.role !== "admin") {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();

  const prizeName = String(body.prizeName || "").trim();
  const prizeAmount = Number(body.prizeAmount || 0);
  const winnerType = body.winnerType;
  const winnerUsername = String(body.winnerUsername || "").trim();
  const adminNote = String(body.adminNote || "").trim();

  if (!prizeName || !winnerUsername) {
    return Response.json(
      { error: "Prize name and winner username are required." },
      { status: 400 }
    );
  }

  if (winnerType !== "twitch" && winnerType !== "spartans") {
    return Response.json(
      { error: "Winner type must be twitch or spartans." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("giveaway_prizes")
    .insert({
      prize_name: prizeName,
      prize_amount: prizeAmount,
      winner_type: winnerType,
      winner_username: winnerUsername,
      winner_username_normalized: normalizeUsername(winnerUsername),
      status: "unclaimed",
      admin_note: adminNote || null,
    })
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

export async function GET() {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .single();

  if (adminProfile?.role !== "admin") {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("giveaway_prizes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    prizes: data || [],
  });
}