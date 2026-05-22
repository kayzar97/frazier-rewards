import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: setting } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "double_down_enabled")
    .single();

  if (!setting?.value) {
    return Response.json(
      { error: "Double Down is temporarily disabled." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { tier, choice } = body;

  if (!tier || !choice) {
    return Response.json({ error: "Missing tier or choice" }, { status: 400 });
  }

  if (choice !== "left" && choice !== "right") {
    return Response.json(
      { error: "Invalid bottle choice." },
      { status: 400 }
    );
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
    .select("current_wagered, leaderboard_period")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const currentWagered = Number(progress?.current_wagered || 0);

  const { data: rewardTier, error: tierError } = await supabaseAdmin
    .from("wager_reward_tiers")
    .select("tier, threshold, reward_amount")
    .eq("tier", tier)
    .single();

  if (tierError || !rewardTier) {
    return Response.json({ error: "Tier not found" }, { status: 404 });
  }

  if (currentWagered < Number(rewardTier.threshold)) {
    return Response.json({ error: "Tier not unlocked yet" }, { status: 403 });
  }

  const { data: existingClaim } = await supabaseAdmin
    .from("wager_reward_claims")
    .select("id, status, gamble_used, created_at")
    .eq("profile_id", profile.id)
    .eq("tier", tier)
    .maybeSingle();

  if (existingClaim) {
    return Response.json(
      { error: "You have already claimed or gambled this tier." },
      { status: 409 }
    );
  }

  const { data: recentGamble } = await supabaseAdmin
    .from("wager_reward_claims")
    .select("id, created_at")
    .eq("profile_id", profile.id)
    .eq("gamble_used", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentGamble?.created_at) {
    const lastGambleTime = new Date(recentGamble.created_at).getTime();
    const now = Date.now();

    if (now - lastGambleTime < 3000) {
      return Response.json(
        { error: "Please wait a few seconds before gambling again." },
        { status: 429 }
      );
    }
  }

const didWin = Math.random() < 0.3;

const shootingBottle = didWin
  ? choice
  : choice === "left"
    ? "right"
    : "left";

const finalAmount = didWin
  ? Number(rewardTier.reward_amount) * 2
  : 0;

const gambleResult = didWin ? "win" : "lose";

  const { data, error } = await supabaseAdmin
    .from("wager_reward_claims")
    .insert({
      profile_id: profile.id,
      tier: rewardTier.tier,
      threshold: rewardTier.threshold,
      reward_amount: finalAmount,
      status: didWin ? "pending" : "lost",
      gamble_used: true,
      gamble_choice: choice,
      coin_result: shootingBottle,
      gamble_result: gambleResult,
      final_amount: finalAmount,
    })
    .select("id, tier, reward_amount, status")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    claim: data,
    choice,
    shootingBottle,
    gambleResult,
    finalAmount,
  });
}
