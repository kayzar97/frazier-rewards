import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.name) {
    return { error: "Not logged in", status: 401 };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Admin only", status: 403 };
  }

  return { session };
}

export async function POST(req: Request) {
  const admin = await requireAdmin();

  if ("error" in admin) {
    return Response.json({ error: admin.error }, { status: admin.status });
  }

  const body = await req.json();
  const action = body.action;

  if (action === "create") {
    const title = body.title || "Live Bonus Hunt";

    const { error } = await supabaseAdmin.from("bonus_hunts").insert({
      title,
      status: "open",
      final_amount: null,
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
  }

  const { data: hunt } = await supabaseAdmin
    .from("bonus_hunts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!hunt) {
    return Response.json({ error: "No hunt found" }, { status: 404 });
  }

  if (action === "lock") {
    const { error } = await supabaseAdmin
      .from("bonus_hunts")
      .update({ status: "locked" })
      .eq("id", hunt.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
  }

  if (action === "complete") {
    const finalAmount = Number(body.finalAmount);

    if (!finalAmount) {
      return Response.json({ error: "Final amount required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("bonus_hunts")
      .update({
        status: "completed",
        final_amount: finalAmount,
      })
      .eq("id", hunt.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}