import { supabaseAdmin } from "@/lib/supabaseadmin";

export function getRequestInfo(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  return { ip, userAgent };
}

export async function createSecurityLog({
  profileId,
  action,
  ip,
  userAgent,
  metadata,
}: {
  profileId?: number;
  action: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
}) {
  try {
    await supabaseAdmin.from("security_logs").insert({
      profile_id: profileId,
      action,
      ip,
      user_agent: userAgent,
      metadata,
    });
  } catch (err) {
    console.error("Security log failed:", err);
  }
}