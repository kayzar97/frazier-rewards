import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("giveaway_prizes")
    .select("prize_amount")
    .eq("status", "paid");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const total = (data || []).reduce(
    (sum, prize) => sum + Number(prize.prize_amount || 0),
    0
  );

  return Response.json({ total });
}