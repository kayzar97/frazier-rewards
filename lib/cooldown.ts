import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function checkCooldown({
  profileId,
  action,
  seconds,
}: {
  profileId: number;
  action: string;
  seconds: number;
}) {
  const { data } = await supabaseAdmin
    .from("claim_cooldowns")
    .select("last_used_at")
    .eq("profile_id", profileId)
    .eq("action", action)
    .maybeSingle();

  if (data?.last_used_at) {
    const lastUsed = new Date(data.last_used_at).getTime();
    const now = Date.now();
    const diffSeconds = Math.floor((now - lastUsed) / 1000);

    if (diffSeconds < seconds) {
      return {
        allowed: false,
        remaining: seconds - diffSeconds,
      };
    }
  }

  await supabaseAdmin.from("claim_cooldowns").upsert(
    {
      profile_id: profileId,
      action,
      last_used_at: new Date().toISOString(),
    },
    {
      onConflict: "profile_id,action",
    }
  );

  return {
    allowed: true,
    remaining: 0,
  };
}