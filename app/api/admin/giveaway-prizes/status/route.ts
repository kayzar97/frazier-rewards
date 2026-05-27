import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

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

  const { prizeId, status } = await req.json();

  if (!prizeId) {
    return Response.json({ error: "Missing prize ID" }, { status: 400 });
  }

  if (!["approved", "paid", "rejected"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const updateData: any = {
    status,
    reviewed_at: new Date().toISOString(),
  };

  if (status === "paid") {
    updateData.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("giveaway_prizes")
    .update(updateData)
    .eq("id", prizeId)
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