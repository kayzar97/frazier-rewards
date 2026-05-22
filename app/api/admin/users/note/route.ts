import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { createAuditLog } from "@/lib/auditlog";
import { sendDiscordLog } from "@/lib/discordWebhook";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.name) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .single();

if (profile?.role !== "admin") {
  console.log("NOTE ADMIN CHECK FAILED", session.user.name, profile);
  return null;
}

  return session;
}

export async function POST(req: Request) {
  const session = await requireAdmin();

  if (!session) {
    return Response.json({ error: "Access denied" }, { status: 403 });
  }

  const { profileId, adminNote } = await req.json();
  console.log("NOTE UPDATE", profileId, adminNote);

const { error } = await supabaseAdmin
  .from("profiles")
  .update({ admin_note: adminNote || null })
  .eq("id", Number(profileId));

if (error) {
  console.log(error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  await createAuditLog({
    action: "USER_ADMIN_NOTE_UPDATE",
    actor: session.user?.name || "Unknown admin",
    target: profileId.toString(),
    metadata: { adminNote },
  });

  await sendDiscordLog(
    `📝 USER NOTE UPDATED\nAdmin: ${session.user?.name || "Unknown"}\nProfile ID: ${profileId}`
  );

  return Response.json({ success: true });
}