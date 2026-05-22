"use client";

import DoubleDownGame from "../../components/DoubleDownGame";
import { useEffect, useState } from "react";

type Tier = {
  tier: number;
  threshold: number;
  reward: number;
  unlocked: boolean;
  claimStatus: string | null;
  gambleUsed?: boolean;
  gambleResult?: string;
};

type WagerRewardsData = {
  username: string;
  currentWagered: number;
  tiers: Tier[];
};

type DoubleDownResult = {
  success: boolean;
  claim?: any;
  choice: "left" | "right";
  shootingBottle: "left" | "right";
  gambleResult: "win" | "lose";
  finalAmount: number;
};

function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
export const metadata = {
  title: "Wager Rewards | FrazierRewards",
};
export default function WagerRewardsClient() {
  const [data, setData] = useState<WagerRewardsData | null>(null);
  const [doubleDownEnabled, setDoubleDownEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showGambleModal, setShowGambleModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [gambledTiers, setGambledTiers] = useState<number[]>([]);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
  document.title = "Wager Rewards | FrazierRewards";
}, []);

  useEffect(() => {
    async function fetchRewards() {
      const settingsRes = await fetch("/api/settings");
      const settings = await settingsRes.json();

      const profileRes = await fetch("/api/profile");
      const profile = await profileRes.json();

      const userRole = profile?.role || profile?.profile?.role;

      setIsVip(userRole === "vip" || userRole === "admin");
      setDoubleDownEnabled(settings.double_down_enabled);

      const res = await fetch("/api/wager-rewards");
      const rewardsData = await res.json();

      setData(rewardsData);
      setLoading(false);
    }

    fetchRewards();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-28 text-center text-white">
        Loading wager rewards...
      </main>
    );
  }

  if (!data?.tiers) {
    return (
      <main className="min-h-screen px-6 py-28 text-center text-white">
        Failed to load wager rewards.
      </main>
    );
  }

  const totalClaimable = data.tiers
    .filter((tier) => tier.unlocked && !tier.claimStatus)
    .reduce((sum, tier) => sum + tier.reward, 0);

  async function claimReward(tier: number) {
    const confirmed = confirm(`Claim Tier ${tier} reward?`);
    if (!confirmed) return;

    const res = await fetch("/api/wager-rewards/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tier }),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error || "Failed to claim reward");
      return;
    }

    window.dispatchEvent(new Event("vault-count-updated"));
    alert("Reward submitted! Head to The Vault to complete your claim.");

    setData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tiers: prev.tiers.map((t) =>
          t.tier === tier ? { ...t, claimStatus: "pending" } : t
        ),
      };
    });
  }

  function handleDoubleDownComplete(result: DoubleDownResult) {
    if (!selectedTier) return;

    setGambledTiers((prev) => [...prev, selectedTier.tier]);

    setData((prev) => {
      if (!prev || !selectedTier) return prev;

      return {
        ...prev,
        tiers: prev.tiers.map((tier) =>
          tier.tier === selectedTier.tier
            ? {
                ...tier,
                claimStatus: result.gambleResult === "win" ? "pending" : "lost",
                reward: result.finalAmount,
                gambleUsed: true,
                gambleResult: result.gambleResult,
              }
            : tier
        ),
      };
    });

    window.dispatchEvent(new Event("vault-count-updated"));
  }

  function closeDoubleDown() {
    setShowGambleModal(false);
    setSelectedTier(null);
  }

  return (
    <main className="min-h-screen px-6 py-28 text-white">
      <section className="mx-auto max-w-5xl text-center">
        <h1 className="text-6xl font-black text-yellow-300 drop-shadow-[0_0_18px_rgba(255,215,0,0.55)]">
          Wager Rewards
        </h1>

        <p className="mt-3 text-lg text-white/80">
          Wager on Spartans using code{" "}
          <span className="font-black text-yellow-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.9)]">
            FRAZIER
          </span>{" "}
          to unlock rewards.
        </p>

        {!isVip && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-yellow-400/40 bg-black/70 px-6 py-5 text-center shadow-[0_0_25px_rgba(250,204,21,0.15)]">
            <h2 className="text-2xl font-bold text-yellow-300">
              Wager Rewards are available for VIP&apos;s only
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              You can view rewards, but only VIP members can claim or interact with them. Please reach the minimum wager requirement of $40,000 to gain VIP access.
            </p>
          </div>
        )}

        <div className="mx-auto mt-6 max-w-4xl px-6 py-4 text-center">
          <p className="text-lg font-semibold leading-relaxed text-white-100">
            ⚠ Unclaimed rewards at the end of the leaderboard period will be lost. Tiers & rewards reset on every new leaderboard period.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 rounded-3xl bg-[#140404]/80 p-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs tracking-[0.3em] text-white/40">USERNAME</p>
            <p className="mt-1 text-xl font-bold">{data.username}</p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-black/25 p-4">
            <p className="text-xs tracking-[0.3em] text-white/40">
              CURRENT WAGERED
            </p>
            <p className="mt-1 text-2xl font-black text-white/80">
              {money(data.currentWagered)}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-black/25 p-4">
            <p className="text-xs tracking-[0.3em] text-yellow-300/70">
              TOTAL CLAIMABLE
            </p>
            <p className="mt-1 text-2xl font-black text-yellow-300">
              {money(totalClaimable)}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {data.tiers.map((item) => {
            const progress = Math.min(
              (data.currentWagered / item.threshold) * 100,
              100
            );

            return (
              <div
                key={item.tier}
                className="rounded-2xl border border-red-500/50 bg-[#140404]/80 p-5 text-left"
              >
                <div className="grid grid-cols-5 items-center gap-4">
                  <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-center font-black text-yellow-300">
                    Tier {item.tier}
                  </div>

                  <div className="text-xl font-black text-white/90">
                    {money(item.threshold)}
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.25em] text-white/40">
                      REQUIRED
                    </p>
                    <p className="font-bold text-white/80">
                      {money(item.threshold)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.25em] text-yellow-300/70">
                      REWARD
                    </p>
                    <p className="font-black text-yellow-300">
                      {money(item.reward)}
                    </p>
                  </div>

                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full bg-red-900 text-center text-sm font-black text-white transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    >
                      {progress.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    disabled={!isVip || !item.unlocked || !!item.claimStatus}
                    onClick={() => {
                      if (!isVip) return;
                      claimReward(item.tier);
                    }}
                    className={`rounded-xl border px-5 py-2 font-bold transition ${
                      item.unlocked && !item.claimStatus && isVip
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                        : "cursor-not-allowed border-white/10 bg-white/10 text-white/40"
                    }`}
                  >
                    {item.claimStatus
                      ? item.claimStatus.toUpperCase()
                      : item.unlocked
                        ? isVip
                          ? "Claim"
                          : "VIP Only"
                        : "Locked"}
                  </button>

                  {item.gambleUsed && item.gambleResult === "win" && (
                    <p className="ml-3 self-center text-sm font-bold text-emerald-300">
                      REWARD DOUBLED!
                    </p>
                  )}

                  {doubleDownEnabled &&
                    !item.claimStatus &&
                    item.unlocked &&
                    !gambledTiers.includes(item.tier) && (
                      <button
                        disabled={!isVip}
                        onClick={() => {
                          if (!isVip) return;

                          setSelectedTier(item);
                          setShowGambleModal(true);
                        }}
                        className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-2 font-bold text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isVip ? "Double Down" : "VIP Only"}
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {showGambleModal && selectedTier && (
        <DoubleDownGame
          tier={selectedTier}
          onClose={closeDoubleDown}
          onComplete={handleDoubleDownComplete}
        />
      )}
    </main>
  );
}
