"use client";

import { useEffect, useState } from "react";

type Hunt = {
  id: number;
  title: string;
  status: "open" | "locked" | "completed";
  final_amount: number | null;
};

type Prediction = {
  id: number;
  discord_username: string;
  twitch_username: string | null;
  guess_amount: number;
};

type Slot = {
  id: number;
  slot_name: string;
  bet_amount: number | null;
  multiplier: number | null;
  payout: number | null;
};

export default function AdminBonusHuntPage() {
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [title, setTitle] = useState("Live Bonus Hunt");
  const [finalAmount, setFinalAmount] = useState("");

  const [slotName, setSlotName] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [payout, setPayout] = useState("");

  const [message, setMessage] = useState("");

  async function loadHunt() {
    const res = await fetch("/api/bonus-hunt");
    const data = await res.json();

    setHunt(data.hunt);
    setPredictions(data.predictions || []);
    setSlots(data.slots || []);
  }

  useEffect(() => {
    loadHunt();
  }, []);

  async function adminAction(action: string) {
    setMessage("");

    const res = await fetch("/api/admin/bonus-hunt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        title,
        finalAmount,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Something went wrong.");
      return;
    }

    setMessage("Updated successfully.");
    setFinalAmount("");
    loadHunt();
  }

  async function addSlot() {
    setMessage("");

    if (!slotName.trim()) {
      setMessage("Slot name is required.");
      return;
    }

    const res = await fetch("/api/admin/bonus-hunt/slots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slotName,
        betAmount,
        multiplier,
        payout,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to add slot.");
      return;
    }

    setMessage("Slot added.");
    setSlotName("");
    setBetAmount("");
    setMultiplier("");
    setPayout("");
    loadHunt();
  }

  const sortedClosest =
    hunt?.status === "completed" && hunt.final_amount
      ? [...predictions].sort(
          (a, b) =>
            Math.abs(a.guess_amount - Number(hunt.final_amount)) -
            Math.abs(b.guess_amount - Number(hunt.final_amount))
        )
      : predictions;

  const winner = sortedClosest[0];

  return (
    <main className="min-h-screen px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-center text-5xl font-black">
          Admin Bonus Hunt
        </h1>

        <section className="rounded-2xl border border-red-500/50 bg-[#140404]/80 p-6 shadow-[0_0_25px_rgba(255,0,0,0.25)]">
          <h2 className="text-2xl font-bold">Hunt Controls</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hunt title"
              className="rounded-xl border border-red-500/40 bg-black px-4 py-3 text-white outline-none"
            />

            <button
              onClick={() => adminAction("create")}
              className="rounded-xl bg-red-500 px-6 py-3 font-bold hover:bg-red-400"
            >
              Create / Open New Hunt
            </button>

            <button
              onClick={() => adminAction("lock")}
              className="rounded-xl border border-yellow-400/50 bg-yellow-400/10 px-6 py-3 font-bold text-yellow-300 hover:bg-yellow-400/20"
            >
              Lock Predictions
            </button>

            <div className="flex gap-3">
              <input
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                placeholder="Final amount"
                className="w-full rounded-xl border border-emerald-500/40 bg-black px-4 py-3 text-white outline-none"
              />

              <button
                onClick={() => adminAction("complete")}
                className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black hover:bg-emerald-400"
              >
                Complete
              </button>
            </div>
          </div>

          {message && <p className="mt-4 text-sm text-zinc-300">{message}</p>}
        </section>

        <section className="mt-8 rounded-2xl border border-red-500/50 bg-[#140404]/80 p-6 shadow-[0_0_25px_rgba(255,0,0,0.18)]">
          <h2 className="text-2xl font-bold">Add Slot To Hunt</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <input
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              placeholder="Slot name"
              className="rounded-xl border border-red-500/40 bg-black px-4 py-3 text-white outline-none md:col-span-2"
            />

            <input
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Bet"
              className="rounded-xl border border-red-500/40 bg-black px-4 py-3 text-white outline-none"
            />

            <input
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              placeholder="Multiplier"
              className="rounded-xl border border-red-500/40 bg-black px-4 py-3 text-white outline-none"
            />

            <input
              value={payout}
              onChange={(e) => setPayout(e.target.value)}
              placeholder="Payout"
              className="rounded-xl border border-red-500/40 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <button
            onClick={addSlot}
            className="mt-4 rounded-xl bg-red-500 px-6 py-3 font-bold hover:bg-red-400"
          >
            Add Slot
          </button>
        </section>

        <section className="mt-8 rounded-2xl border border-red-500/50 bg-[#140404]/80 p-6">
          <h2 className="text-2xl font-bold">Current Hunt</h2>

          {!hunt ? (
            <p className="mt-4 text-zinc-400">No hunt created yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              <p>
                Title: <span className="font-bold">{hunt.title}</span>
              </p>
              <p>
                Status:{" "}
                <span className="font-bold uppercase text-red-300">
                  {hunt.status}
                </span>
              </p>
              <p>
                Predictions:{" "}
                <span className="font-bold">{predictions.length}</span>
              </p>
              <p>
                Slots: <span className="font-bold">{slots.length}</span>
              </p>

              {hunt.final_amount && (
                <p>
                  Final Amount:{" "}
                  <span className="font-bold text-emerald-300">
                    ${Number(hunt.final_amount).toLocaleString()}
                  </span>
                </p>
              )}

              {winner && hunt.status === "completed" && (
                <p className="text-yellow-300">
                  Winner: {winner.twitch_username || winner.discord_username} — $
                  {Number(winner.guess_amount).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-red-500/50 bg-[#140404]/80">
          <div className="grid grid-cols-5 bg-red-950/60 px-4 py-3 text-xs uppercase text-zinc-300">
            <span>#</span>
            <span>Slot</span>
            <span>Bet</span>
            <span>Multiplier</span>
            <span>Payout</span>
          </div>

          {slots.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-400">
              No slots added yet.
            </div>
          ) : (
            slots.map((slot, index) => (
              <div
                key={slot.id}
                className="grid grid-cols-5 border-t border-white/10 px-4 py-3 text-sm"
              >
                <span className="font-bold">#{index + 1}</span>
                <span>{slot.slot_name}</span>
                <span>
                  {slot.bet_amount ? `$${Number(slot.bet_amount).toLocaleString()}` : "-"}
                </span>
                <span>
                  {slot.multiplier ? `${Number(slot.multiplier).toLocaleString()}x` : "-"}
                </span>
                <span className="text-emerald-400">
                  {slot.payout ? `$${Number(slot.payout).toLocaleString()}` : "-"}
                </span>
              </div>
            ))
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-red-500/50 bg-[#140404]/80">
          <div className="grid grid-cols-4 bg-red-950/60 px-4 py-3 text-xs uppercase text-zinc-300">
            <span>Rank</span>
            <span>User</span>
            <span>Guess</span>
            <span>Difference</span>
          </div>

          {sortedClosest.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-400">
              No predictions yet.
            </div>
          ) : (
            sortedClosest.map((p, index) => (
              <div
                key={p.id}
                className="grid grid-cols-4 border-t border-white/10 px-4 py-3 text-sm"
              >
                <span className="font-bold">#{index + 1}</span>
                <span>{p.twitch_username || p.discord_username}</span>
                <span className="text-emerald-400">
                  ${Number(p.guess_amount).toLocaleString()}
                </span>
                <span>
                  {hunt?.status === "completed" && hunt.final_amount
                    ? `$${Math.abs(
                        Number(p.guess_amount) - Number(hunt.final_amount)
                      ).toLocaleString()}`
                    : "-"}
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}