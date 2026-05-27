"use client";

import { useEffect, useState } from "react";

type GiveawayPrize = {
  id: number;
  prize_name: string;
  prize_amount: number;
  winner_type: "twitch" | "spartans";
  winner_username: string;
  status: string;
};

export default function GiveawayClaimsPage() {
  const [prizes, setPrizes] = useState<GiveawayPrize[]>([]);

  const [prizeName, setPrizeName] = useState("");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [winnerType, setWinnerType] = useState<"twitch" | "spartans">("twitch");
  const [winnerUsername, setWinnerUsername] = useState("");

  async function loadPrizes() {
    const res = await fetch("/api/admin/giveaway-prizes");
    const data = await res.json();

    setPrizes(data.prizes || []);
  }

  useEffect(() => {
    loadPrizes();
  }, []);

  async function createPrize() {
    const res = await fetch("/api/admin/giveaway-prizes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prizeName,
        prizeAmount: Number(prizeAmount),
        winnerType,
        winnerUsername,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to create giveaway claim");
      return;
    }

    setPrizeName("");
    setPrizeAmount("");
    setWinnerUsername("");

    loadPrizes();
  }
  async function updatePrizeStatus(
  prizeId: number,
  status: "approved" | "paid" | "rejected"
) {
  const confirmed = confirm(`Set this giveaway claim to ${status}?`);
  if (!confirmed) return;

  const res = await fetch("/api/admin/giveaway-prizes/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prizeId, status }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to update giveaway claim");
    return;
  }

  setPrizes((prev) =>
    prev.map((prize) =>
      prize.id === prizeId ? { ...prize, status } : prize
    )
  );
}

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-5xl font-black text-yellow-300">
          Giveaway Claims
        </h1>

        <div className="mb-10 rounded-3xl border border-yellow-500/20 bg-[#140404]/80 p-6">
          <h2 className="mb-5 text-2xl font-black">
            Add Giveaway Winner
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={prizeName}
              onChange={(e) => setPrizeName(e.target.value)}
              placeholder="Prize name"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4"
            />

            <input
              value={prizeAmount}
              onChange={(e) => setPrizeAmount(e.target.value)}
              placeholder="Prize amount"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4"
            />

            <select
              value={winnerType}
              onChange={(e) =>
                setWinnerType(e.target.value as "twitch" | "spartans")
              }
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4"
            >
              <option value="twitch">Twitch</option>
              <option value="spartans">Spartans</option>
            </select>

            <input
              value={winnerUsername}
              onChange={(e) => setWinnerUsername(e.target.value)}
              placeholder="Winner username"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4"
            />
          </div>

          <button
            onClick={createPrize}
            className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4 font-black uppercase tracking-[0.2em] text-yellow-300 transition hover:bg-yellow-500/20"
          >
            Create Giveaway Claim
          </button>
        </div>

        <div className="space-y-4">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className="rounded-2xl border border-white/10 bg-[#140404]/80 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">
                    {prize.winner_type.toUpperCase()}
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    {prize.winner_username}
                  </h2>

                  <p className="mt-2 text-yellow-300">
                    {prize.prize_name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-black text-emerald-300">
                    ${prize.prize_amount}
                  </p>

                  <p className="mt-2 text-sm uppercase text-white/50">
                    {prize.status}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
  <button
    onClick={() => updatePrizeStatus(prize.id, "approved")}
    className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 font-bold text-emerald-300 hover:bg-emerald-500/20"
  >
    Approve
  </button>

  <button
    onClick={() => updatePrizeStatus(prize.id, "paid")}
    className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-2 font-bold text-yellow-300 hover:bg-yellow-500/20"
  >
    Mark Paid
  </button>

  <button
    onClick={() => updatePrizeStatus(prize.id, "rejected")}
    className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 font-bold text-red-300 hover:bg-red-500/20"
  >
    Reject
  </button>
</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}