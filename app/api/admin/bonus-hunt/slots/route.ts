import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json();

  const { data: hunt } = await supabaseAdmin
    .from("bonus_hunts")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!hunt) {
    return Response.json({ error: "No active hunt found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from("bonus_hunt_slots").insert({
    hunt_id: hunt.id,
    slot_name: body.slotName,
    bet_amount: body.betAmount || null,
    multiplier: body.multiplier || null,
    payout: body.payout || null,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}