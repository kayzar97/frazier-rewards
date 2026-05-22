import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function createFraudFlag({
  profileId,
  reason,
  severity = "medium",
  metadata,
}: {
  profileId?: number;
  reason: string;
  severity?: string;
  metadata?: any;
}) {
  await supabaseAdmin.from("fraud_flags").insert({
    profile_id: profileId,
    reason,
    severity,
    metadata,
  });
}