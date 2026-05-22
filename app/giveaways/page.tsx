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
          <div className="rounded-3xl bg-[#140404]/80 p-5 backdrop-blur-xl">
            <p className="text-xs tracking-[0.3em] text-yellow-300/70">
              PENDING
            </p>
            <p className="mt-1 text-3xl font-black">{pending.length}</p>
          </div>

          <div className="rounded-3xl bg-[#140404]/80 p-5 backdrop-blur-xl">
            <p className="text-xs tracking-[0.3em] text-emerald-300/70">
              APPROVED
            </p>
            <p className="mt-1 text-3xl font-black">{approved.length}</p>
          </div>

          <div className="rounded-3xl bg-[#140404]/80 p-5 backdrop-blur-xl">
            <p className="text-xs tracking-[0.3em] text-white/50">
              PAID
            </p>
            <p className="mt-1 text-3xl font-black">{paid.length}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {claims.length === 0 ? (
            <div className="rounded-3xl bg-[#140404]/80 p-8 backdrop-blur-xl">
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
                className="grid grid-cols-4 items-center gap-4 rounded-2xl bg-[#140404]/80 p-5 text-left backdrop-blur-xl"
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
      </section>
    </main>
  );
}