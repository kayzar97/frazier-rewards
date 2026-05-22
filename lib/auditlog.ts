import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function createAuditLog({
  action,
  actor,
  target,
  metadata,
}: {
  action: string;
  actor?: string;
  target?: string;
  metadata?: any;
}) {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      action,
      actor,
      target,
      metadata,
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}