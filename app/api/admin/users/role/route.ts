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
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { profileId, role } = body;

  if (!profileId || !["user", "vip", "admin"].includes(role)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("id", Number(profileId))
    .select("id, role")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
await sendDiscordLog(
  `🛡️ ROLE UPDATE\nAdmin: ${profileId}\nTarget Profile ID: ${profileId}\nNew Role: ${role}`
);

await createAuditLog({
  action: "ROLE_UPDATE",
  actor: profileId.toString(),
  target: role,
});

  return Response.json({ success: true, profile: data });
}