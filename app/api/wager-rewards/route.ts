import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function GET() {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, Discord_Username, spartans_username")
    .eq("Discord_Username", session.user.name)
    .single();

  if (profileError || !profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: progress } = await supabaseAdmin
    .from("wager_rewards_progress")
    .select("current_wagered, spartans_username, leaderboard_period")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { data: tiers, error: tiersError } = await supabaseAdmin
    .from("wager_reward_tiers")
    .select("tier, threshold, reward_amount, active")
    .eq("active", true)
    .order("tier", { ascending: true });

  if (tiersError) {
    return Response.json({ error: tiersError.message }, { status: 500 });
  }

  const { data: claims } = await supabaseAdmin
    .from("wager_reward_claims")
    .select("tier, status, gamble_used, gamble_result")
.eq("profile_id", profile.id)
.order("created_at", { ascending: false });

  const currentWagered = Number(progress?.current_wagered || 0);

  const unlockedTiers = tiers.map((tier) => {
const claim = claims
  ?.filter((claim) => claim.tier === tier.tier)
  .sort((a, b) => Number(b.gamble_used) - Number(a.gamble_used))[0];

return {
  tier: tier.tier,
  threshold: tier.threshold,
  reward: tier.reward_amount,
unlocked: currentWagered >= tier.threshold,
  claimStatus: claim?.status ?? null,

  gambleUsed: claim?.gamble_used ?? false,
  gambleResult: claim?.gamble_result ?? null,
};
  });

  return Response.json({
    username: profile.spartans_username || progress?.spartans_username || "---",
    currentWagered,
    tiers: unlockedTiers,
  });
}