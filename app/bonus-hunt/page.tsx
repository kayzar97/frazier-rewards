"use client";

import { useState } from "react";

const bonuses = [
  { name: "Phoenix DuelReels", bet: "$1", multi: "4093.9x", payout: "$4,093.90" },
  { name: "Gates of Anubis", bet: "$1", multi: "248.95x", payout: "$248.95" },
  { name: "Le Cowboy", bet: "$1", multi: "568.4x", payout: "$568.40" },
];

export default function BonusHuntPage() {
  const [prediction, setPrediction] = useState("");

  return (
    <main className="min-h-screen px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-center text-5xl font-black">
          Live Bonus Hunt
        </h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
<section className="rounded-2xl border border-red-500/40 bg-bg-[#140404]/75 backdrop-blur-xl p-6 shadow-[0_0_25px_rgba(255,0,0,0.25)]">
            <h2 className="text-center text-2xl font-bold">Hunt Stats</h2>

            <div className="mt-5 grid grid-cols-4 gap-3 text-center">
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                <p className="text-xs text-zinc-400">Start</p>
                <p className="font-bold">$3,350</p>
              </div>
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                <p className="text-xs text-zinc-400">Bonuses</p>
                <p className="font-bold">29</p>
              </div>
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                <p className="text-xs text-zinc-400">Avg</p>
                <p className="font-bold">226.8x</p>
              </div>
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                <p className="text-xs text-zinc-400">Required</p>
                <p className="font-bold">0x</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-red-500/40 bg-[#140404]/75 backdrop-blur-xl p-5 text-center">
              <p className="text-xs uppercase text-zinc-400">Current Best</p>
              <p className="mt-1 text-xl font-bold">Phoenix DuelReels</p>
              <p className="mt-2 text-white-300">$4,093.90</p>
            </div>
          </section>

<section className="rounded-2xl border border-red-500/40 bg-[#140404]/75 backdrop-blur-xl p-6 shadow-[0_0_25px_rgba(255,0,0,0.25)]">
            <h2 className="text-center text-2xl font-bold">Predictions</h2>

            <p className="mt-4 text-center text-zinc-400">
              Guess the final dollar amount the bonus hunt ends on.
            </p>

            <div className="mt-6 flex gap-3">
              <input
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                placeholder="Enter prediction, e.g. 7250"
className="w-full rounded-xl border border-red-500/30 bg-black px-4 py-3 text-white outline-none focus:border-red-400"
              />

              <button className="rounded-xl bg-red-500 px-6 font-bold text-white transition hover:bg-red-400 shadow-[0_0_12px_rgba(255,0,0,0.4)]">
                Submit
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-red-500/40 bg-white/5 p-5 text-center text-sm text-zinc-400">
              No prediction session is open yet.
            </div>
          </section>
        </div>

        <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-500/50 bg-[#140404]/75 backdrop-blur-xl overflow-hidden">
          <div className="grid grid-cols-4 bg-red-950/50 px-4 py-3 text-xs uppercase text-zinc-300">
            <span>Bonus</span>
            <span>Bet</span>
            <span>Multi</span>
            <span>Payout</span>
          </div>

          {bonuses.map((bonus) => (
            <div
              key={bonus.name}
              className="grid grid-cols-4 border-t border-white/10 px-4 py-3 text-sm"
            >
              <span className="font-bold">{bonus.name}</span>
              <span>{bonus.bet}</span>
              <span className="text-white-300">{bonus.multi}</span>
              <span className="text-emerald-400">{bonus.payout}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}