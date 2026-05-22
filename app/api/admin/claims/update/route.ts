import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { sendDiscordLog } from "@/lib/discordWebhook";
import { createAuditLog } from "@/lib/auditlog";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.name) return false;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .single();

  return profile?.role === "admin";
}

export async function POST(req: Request) {
  const session = await auth();
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

const { claimId, status, adminNote } = await req.json();

  if (!claimId || !["pending", "reviewing", "approved", "sent", "denied"].includes(status)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

const { data, error } = await supabaseAdmin
  .from("wager_reward_claims")
  .update({
    status,
    admin_note: adminNote || null,
    reviewed_at: new Date().toISOString(),
    ...(status === "sent"
      ? {
          sent_by: session?.user?.name || "Unknown admin",
          sent_at: new Date().toISOString(),
        }
      : {}),
  })
  .eq("id", claimId)
  .select("id, status, admin_note, sent_by, sent_at, reviewed_at")
  .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  await sendDiscordLog(
  `🎁 CLAIM STATUS UPDATE\nClaim ID: ${claimId}\nNew Status: ${status}`
);

await createAuditLog({
  action: "CLAIM_STATUS_UPDATE",
  actor: session?.user?.name || "Unknown admin",
  target: claimId.toString(),
  metadata: {
    status,
  },
});

  return Response.json({ success: true, claim: data });
}