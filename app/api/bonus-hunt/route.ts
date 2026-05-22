import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function GET() {
  const { data: hunt } = await supabaseAdmin
    .from("bonus_hunts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!hunt) {
    return Response.json({ hunt: null, predictions: [], slots: [] });
  }

  const { data: predictions } = await supabaseAdmin
    .from("bonus_hunt_predictions")
    .select("*")
    .eq("hunt_id", hunt.id)
    .order("guess_amount", { ascending: false });

  const { data: slots } = await supabaseAdmin
    .from("bonus_hunt_slots")
    .select("*")
    .eq("hunt_id", hunt.id)
    .order("created_at", { ascending: true });

  return Response.json({
    hunt,
    predictions: predictions || [],
    slots: slots || [],
  });
}