import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { sendDiscordLog } from "@/lib/discordWebhook";
import { createAuditLog } from "@/lib/auditlog";
import { checkCooldown } from "@/lib/cooldown";
import { rateLimit } from "@/lib/rateLimit";
import { createFraudFlag } from "@/lib/fraud";
import { createSecurityLog, getRequestInfo } from "@/lib/securityLog";

export async function POST(req: Request) {
  const session = await auth();

  const { ip, userAgent } = getRequestInfo(req);


const limiter = rateLimit({
  key: `claim:${ip}`,
  limit: 10,
  windowMs: 60_000,
});

if (!limiter.allowed) {

  await createFraudFlag({
    reason: "Rate limit exceeded",
    severity: "high",
    metadata: {
      ip,
    },
  });

  return Response.json(
    {
      error: "Too many requests. Please slow down.",
    },
    { status: 429 }
  );
}

  if (!session?.user?.name) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json();
  const { tier } = body;

  if (!tier) {
    return Response.json({ error: "Missing tier" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, Discord_Username, spartans_username")
    .eq("Discord_Username", session.user.name)
    .single();

if (profileError || !profile) {
  return Response.json({ error: "Profile not found" }, { status: 404 });
}

await createSecurityLog({
  profileId: profile.id,
  action: "REWARD_CLAIM_ATTEMPT",
  ip,
  userAgent,
  metadata: {
    tier,
  },
});

const { data: recentLogs } = await supabaseAdmin
  .from("security_logs")
  .select("id")
  .eq("ip", ip)
  .gte(
    "created_at",
    new Date(Date.now() - 5 * 60 * 1000).toISOString()
  );

if ((recentLogs?.length || 0) > 20) {
  await createFraudFlag({
    profileId: profile.id,
    reason: "High activity from IP",
    severity: "critical",
    metadata: {
      ip,
      requests: recentLogs?.length,
    },
  });

  await sendDiscordLog(
    `🚨 HIGH IP ACTIVITY\nUser: ${profile.Discord_Username}\nIP: ${ip}\nRequests: ${recentLogs?.length}`
  );
}

const cooldown = await checkCooldown({
  profileId: profile.id,
  action: "REWARD_CLAIM",
  seconds: 30,
});

if (!cooldown.allowed) {

  await createFraudFlag({
    profileId: profile.id,
    reason: "Rapid reward claim spam",
    severity: "high",
    metadata: {
      cooldownRemaining: cooldown.remaining,
    },
  });

  return Response.json(
    {
      error: `Please wait ${cooldown.remaining}s before claiming again.`,
    },
    { status: 429 }
  );
}
const { data: claimsEnabled } = await supabaseAdmin
  .from("site_settings")
  .select("value")
  .eq("key", "claims_enabled")
  .single();

if (!claimsEnabled?.value) {
  return Response.json(
    { error: "Claims are temporarily disabled." },
    { status: 503 }
  );
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
    .select("id, status")
    .eq("profile_id", profile.id)
    .eq("tier", tier)
    .maybeSingle();

  if (existingClaim) {
    return Response.json(
      { error: "You have already claimed this tier" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("wager_reward_claims")
    .insert({
      profile_id: profile.id,
      tier: rewardTier.tier,
      threshold: rewardTier.threshold,
      reward_amount: rewardTier.reward_amount,
      status: "pending",
    })
    .select("id, tier, reward_amount, status")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  await sendDiscordLog(
  `🎁 New reward claim\nUser: ${profile.Discord_Username}\nSpartans: ${profile.spartans_username || "Not linked"}\nTier: ${rewardTier.tier}\nReward: $${rewardTier.reward_amount}\nWagered: $${currentWagered.toLocaleString()}`
);

await createAuditLog({
  action: "REWARD_CLAIM",
  actor: profile.Discord_Username,
  metadata: {
    tier: rewardTier.tier,
    reward: rewardTier.reward_amount,
  },
});

  return Response.json({
    success: true,
    claim: data,
  });
}