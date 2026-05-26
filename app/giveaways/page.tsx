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

function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function VaultPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    
    async function fetchClaims() {
      const res = await fetch("/api/vault");
      const data = await res.json();

      setClaims(data.claims || []);
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
  const pending = claims.filter((claim) => claim.status === "pending");
  const approved = claims.filter((claim) => claim.status === "approved");
  const paid = claims.filter((claim) => claim.status === "paid");

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

        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-[#140404]/80 p-5">
            <p className="text-xs tracking-[0.3em] text-yellow-300/70">
              PENDING
            </p>
            <p className="mt-1 text-3xl font-black">{pending.length}</p>
          </div>

          <div className="rounded-3xl bg-[#140404]/80 p-5">
            <p className="text-xs tracking-[0.3em] text-emerald-300/70">
              APPROVED
            </p>
            <p className="mt-1 text-3xl font-black">{approved.length}</p>
          </div>

          <div className="rounded-3xl bg-[#140404]/80 p-5">
            <p className="text-xs tracking-[0.3em] text-white/50">
              PAID
            </p>
            <p className="mt-1 text-3xl font-black">{paid.length}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {claims.length === 0 ? (
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
                    {claim.gamble_used && claim.gamble_result === "win" && (
  <p className="mt-1 text-sm font-bold text-emerald-300">
    DOUBLE DOWN WON
  </p>
)}
                  </p>
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