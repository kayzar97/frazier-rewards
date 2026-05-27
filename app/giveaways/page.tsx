"use client";

import { useEffect, useState } from "react";

type Claim = {
  id: number;
  tier: number;
  reward_amount: number;
  status: "pending" | "approved" | "paid" | "rejected" | "lost";
  created_at: string;
  spartans_confirmed: boolean;

  gamble_used?: boolean;
gamble_result?: string;
};

type GiveawayPrize = {
  id: number;
  prize_name: string;
  prize_amount: number;
  winner_type: "twitch" | "spartans";
  winner_username: string;
  status: string;
  created_at: string;
};

function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function VaultPage() {
const [activeTab, setActiveTab] = useState<
  "rewards" | "giveaways" | "history"
>("rewards");

  const [claims, setClaims] = useState<Claim[]>([]);
  const [giveawayPrizes, setGiveawayPrizes] = useState<GiveawayPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGivenAway, setTotalGivenAway] = useState(0);

  useEffect(() => {

    
    async function fetchClaims() {
      const res = await fetch("/api/vault");
      const data = await res.json();

      setClaims(data.claims || []);
      const giveawayRes = await fetch("/api/giveaway-prizes");
const giveawayData = await giveawayRes.json();

setGiveawayPrizes(giveawayData.prizes || []);

const totalRes = await fetch("/api/giveaway-prizes/total-paid");
const totalData = await totalRes.json();

setTotalGivenAway(totalData.total || 0);
      setLoading(false);
    }

    fetchClaims();
  }, []);
async function confirmSpartans(claimId: number) {
  const confirmed = confirm(
    "Confirm this reward should be sent to your linked Spartans account?"
  );

  if (!confirmed) return;

  const res = await fetch("/api/vault/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ claimId }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to confirm");
    return;
  }

  setClaims((prev) =>
    prev.map((claim) =>
      claim.id === claimId
        ? { ...claim, spartans_confirmed: true }
        : claim
    )
  );
window.dispatchEvent(new Event("vault-count-updated"));
  alert("Spartans account confirmed!");
}
async function claimGiveawayPrize(prizeId: number) {
  const confirmed = confirm("Claim this giveaway prize?");
  if (!confirmed) return;

  const res = await fetch("/api/giveaway-prizes/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prizeId }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to claim prize");
    return;
  }

  setGiveawayPrizes((prev) =>
    prev.map((prize) =>
      prize.id === prizeId ? { ...prize, status: "claimed" } : prize
    )
  );

  alert("Prize claimed! Waiting for admin approval.");
}
  const pending = claims.filter((claim) => claim.status === "pending");
  const approved = claims.filter((claim) => claim.status === "approved");
  const paid = claims.filter((claim) => claim.status === "paid");
  const claimHistory = [
  ...claims.map((claim) => ({
    id: `reward-${claim.id}`,
    type: "Wager Reward",
    name: `Tier ${claim.tier}`,
    amount: claim.reward_amount,
    status: claim.status,
    created_at: claim.created_at,
  })),

  ...giveawayPrizes.map((prize) => ({
    id: `giveaway-${prize.id}`,
    type: "Giveaway",
    name: prize.prize_name,
    amount: prize.prize_amount,
    status: prize.status,
    created_at: prize.created_at,
  })),
].sort(
  (a, b) =>
    new Date(b.created_at).getTime() -
    new Date(a.created_at).getTime()
);

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-28 text-center text-white">
        Loading The Vault...
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-28 text-white">
      <section className="mx-auto max-w-5xl text-center">
<img
  src="/vault.png"
  alt="The Vault"
  className="mx-auto h-40 w-auto drop-shadow-[0_0_20px_rgba(255,215,0,0.45)]"
/>

        <p className="mt-3 text-lg text-white/80">
          Claim and track your unlocked Wager Rewards and Giveaways.
        </p>

<div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-red-400/40 bg-black/70 p-8 text-center">
  <p className="text-lg font-black uppercase tracking-[0.25em] text-yellow-300">
    Giveaways Paid
  </p>

  <p className="mt-3 text-6xl font-black text-yellow-300">
    {money(totalGivenAway)}
  </p>

  <p className="mt-3 text-lg font-bold text-yellow-300">
    To the community
  </p>
        </div>
<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
  <button
    onClick={() => setActiveTab("rewards")}
    className={`rounded-2xl border px-6 py-3 text-sm font-black uppercase tracking-[0.2em] transition ${
      activeTab === "rewards"
        ? "border-yellow-400 bg-yellow-500/20 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.25)]"
        : "border-white/10 bg-black/40 text-white/70 hover:bg-black/70"
    }`}
  >
    Wager Rewards
  </button>

  <button
    onClick={() => setActiveTab("giveaways")}
    className={`rounded-2xl border px-6 py-3 text-sm font-black uppercase tracking-[0.2em] transition ${
      activeTab === "giveaways"
        ? "border-yellow-400 bg-yellow-500/20 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.25)]"
        : "border-white/10 bg-black/40 text-white/70 hover:bg-black/70"
    }`}
  >
    Giveaway Claims
  </button>

  <button
  onClick={() => setActiveTab("history")}
  className={`rounded-2xl border px-6 py-3 text-sm font-black uppercase tracking-[0.2em] transition ${
    activeTab === "history"
      ? "border-yellow-400 bg-yellow-500/20 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.25)]"
      : "border-white/10 bg-black/40 text-white/70 hover:bg-black/70"
  }`}
>
  Claim History
</button>
</div>
{activeTab === "rewards" && (
  <>
    <div className="mt-8 space-y-4">
          {claimHistory.length === 0 ? (
            <div className="rounded-3xl bg-[#140404]/80 p-8">
              <p className="text-white/70">
                You have no rewards in The Vault yet.
              </p>
            </div>
) : (
  claims
    .filter((claim) => claim.status !== "lost")
    .map((claim) => (
              <div
                key={claim.id}
                className="grid grid-cols-4 items-center gap-4 rounded-2xl bg-[#140404]/80 p-5 text-left"
              >
                <div>
                  <p className="text-xs tracking-[0.25em] text-white/40">
                    REWARD
                  </p>
                  <p className="font-black text-yellow-300">
                    Tier {claim.tier}
                  </p>
                </div>

                <div>
                  <p className="text-xs tracking-[0.25em] text-white/40">
                    AMOUNT
                  </p>
                  <p className="font-black">
                    {money(claim.reward_amount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs tracking-[0.25em] text-white/40">
                    STATUS
                  </p>
                  <p
                    className={`font-black ${
                      claim.status === "pending"
                        ? "text-yellow-300"
                        : claim.status === "approved"
                        ? "text-emerald-300"
                        : claim.status === "paid"
                        ? "text-white"
                        : "text-red-300"
                    }`}
                  >
{claim.status.toUpperCase()}
</p>

{claim.gamble_used && claim.gamble_result === "win" && (
  <p className="mt-1 text-sm font-bold text-emerald-300">
    DOUBLE DOWN WON
  </p>
)}
      </div>
                

<button
  disabled={claim.spartans_confirmed}
  onClick={() => confirmSpartans(claim.id)}
  className={`rounded-xl border px-5 py-2 font-bold transition ${
    claim.spartans_confirmed
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
      : "border-yellow-400/30 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20"
  }`}
>
  {claim.spartans_confirmed
    ? "Spartans Confirmed"
    : "Confirm Spartans Account"}
</button>
              </div>
            ))
          )}
        </div>
        </>
)}

{activeTab === "giveaways" && (
  <div className="mt-8 grid gap-6 md:grid-cols-2">
    {/* GIVEAWAY CLAIMS */}
    <div className="rounded-3xl border border-yellow-500/20 bg-black/70 p-8 shadow-[0_0_30px_rgba(255,180,0,0.08)] backdrop-blur-sm">
      <h2 className="text-3xl font-black text-white">
        Giveaway Claims
      </h2>

      <p className="mt-2 text-white/60">
        Giveaway prizes added by admins will appear here when they match your connected Twitch or Spartans account.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#140404]/80 p-8">
{giveawayPrizes.filter((prize) => prize.status !== "paid").length === 0 ? (
  <div className="rounded-2xl border border-white/10 bg-[#140404]/80 p-6 text-center">
    <p className="text-lg font-black text-white">
      No Pending Claims
    </p>

    <p className="mt-2 text-sm text-white/60">
      You currently have no giveaway claims awaiting action.
    </p>
  </div>
) : (
  <div className="space-y-4">
    {giveawayPrizes
      .filter((prize) => prize.status !== "paid")
      .map((prize) => (
        <div
          key={prize.id}
          className="rounded-2xl border border-yellow-400/20 bg-black/40 p-4 text-left"
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300/70">
            {prize.winner_type}
          </p>

          <h3 className="mt-1 text-xl font-black text-white">
            {prize.prize_name}
          </h3>

          <p className="mt-1 text-2xl font-black text-yellow-300">
            ${prize.prize_amount}
          </p>

          <p className="mt-2 text-sm uppercase text-white/50">
            {prize.status}
          </p>

          <button
            disabled={prize.status !== "unclaimed"}
            onClick={() => claimGiveawayPrize(prize.id)}
            className={`mt-3 rounded-xl border px-5 py-3 font-black transition ${
              prize.status === "unclaimed"
                ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20"
                : prize.status === "claimed"
                ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
                : prize.status === "approved"
                ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
                : prize.status === "paid"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-400/30 bg-red-500/10 text-red-300"
            }`}
          >
            {prize.status === "unclaimed"
              ? "Claim Prize"
              : prize.status === "claimed"
              ? "Waiting for Approval"
              : prize.status === "approved"
              ? "Approved"
              : prize.status === "paid"
              ? "Paid"
              : prize.status === "rejected"
              ? "Rejected"
              : prize.status}
          </button>
        </div>
      ))}
  </div>
)}
      </div>
    </div>
{activeTab === "giveaways" && (
  <>
    {/* VERIFICATION */}
    <div className="rounded-3xl border border-white/10 bg-[#140404]/80 p-8 text-left shadow-[0_0_30px_rgba(255,180,0,0.08)] backdrop-blur-sm">
      <h2 className="mb-5 text-3xl font-black text-white">
        Verification
      </h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-4">
          <span className="text-white/70">Discord</span>

          <span className="font-bold text-white">
            Connected
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-4">
          <span className="text-white/70">Twitch</span>

          <span className="font-bold text-white">
            Check Profile Page
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-4">
          <span className="text-white/70">Status</span>

          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-emerald-300">
            Verified
          </span>
        </div>
      </div>

      <p className="mt-6 text-sm leading-7 text-yellow-100/70">
        Add only solo-owned accounts. Attempts to abuse giveaways, multi-account,
        botting, or reward systems may result in claim rejection or permanent bans.
      </p>
    </div>  </>
)}
  </div>
)}
{activeTab === "history" && (
  <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-black/70 p-8 text-left shadow-[0_0_30px_rgba(255,180,0,0.08)] backdrop-blur-sm">
    <h2 className="mb-6 text-3xl font-black text-white">
      Claim History
    </h2>

    <div className="space-y-4">
      {claims.length === 0 ? (
        <p className="text-white/60">
          You have no previous claims yet.
        </p>
      ) : (
        claimHistory.map((claim) => (
          <div
            key={claim.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#140404]/80 p-5"
          >
            <div>
              <p className="font-black text-white">
                {new Date(claim.created_at).toLocaleString()}
              </p>

              <p className="mt-1 text-white/60">
                {claim.type} — {claim.name}
<br />
Amount: {money(claim.amount)}
              </p>
            </div>

            <span className="rounded-full border border-yellow-400/30 bg-yellow-500/10 px-4 py-1 text-xs font-black uppercase text-yellow-300">
{claim.status === "pending"
  ? "Waiting for Approval"
  : claim.status === "unclaimed"
  ? "Available to Claim"
  : claim.status === "claimed"
  ? "Waiting for Approval"
  : claim.status === "approved"
  ? "Approved"
  : claim.status === "paid"
  ? "Paid"
  : claim.status === "rejected"
  ? "Rejected"
  : claim.status}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
)}
        <div className="mt-10 rounded-3xl border border-yellow-500/20 bg-black/70 p-8 shadow-[0_0_30px_rgba(255,180,0,0.08)] backdrop-blur-sm">
  <div className="mb-6 flex items-center gap-3">
    <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />

    <h2 className="text-3xl font-black text-white">
      Guide & FAQ
    </h2>
  </div>

  <div className="space-y-5 text-[15px] leading-8 text-zinc-300">
    <p>
      • Rewards and giveaway prizes are processed manually. Delivery times may vary depending on review volume and event schedules.
    </p>

    <p>
      • Claims that remain unsubmitted for extended periods may become invalid after leaderboard resets or giveaway expiration dates.
    </p>

    <p>
      • All rewards must be claimed through the official Vault system. Staff will never ask you to claim rewards elsewhere.
    </p>

    <p>
      • Ensure your Spartans username and connected Twitch account are correct before submitting claims.
    </p>

    <p>
      • Attempting to abuse rewards through alternate accounts, farming, automation, or misleading activity may result in claim rejection.
    </p>

    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
      <h3 className="mb-4 text-lg font-black text-yellow-300">
        Claim Status Meanings
      </h3>

      <div className="space-y-3">
        <p>
          <span className="font-black text-emerald-400">PAID</span>
          {" "}— Your reward has been approved and completed.
        </p>

        <p>
          <span className="font-black text-yellow-300">PENDING</span>
          {" "}— Your claim is awaiting review or processing.
        </p>

        <p>
          <span className="font-black text-red-400">REJECTED</span>
          {" "}— Your claim was denied due to verification or eligibility issues.
        </p>
      </div>
    </div>

    <p>
      • Support or verification requests will only come from official Frazier Rewards staff or verified Discord accounts.
    </p>
  </div>
</div>
      </section>
    </main>
  );
}