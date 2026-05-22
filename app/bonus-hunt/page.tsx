"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Target, Flame, Lock, Coins } from "lucide-react";

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

const pastHunts: { hunt: string }[] = [];

export default function BonusHuntPage() {
  const { data: session } = useSession();
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [prediction, setPrediction] = useState("");
  const [message, setMessage] = useState("");

  async function loadHunt() {
    const res = await fetch("/api/bonus-hunt");
    const data = await res.json();
    setHunt(data.hunt);
    setPredictions(data.predictions || []);
  }

  useEffect(() => {
    loadHunt();
  }, []);

  async function submitPrediction() {
    setMessage("");

    if (!prediction) {
      setMessage("Enter a prediction first.");
      return;
    }

    const res = await fetch("/api/bonus-hunt/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guessAmount: prediction }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to submit prediction.");
      return;
    }

    setMessage("Prediction submitted.");
    setPrediction("");
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

  return (
<main className="min-h-screen bg-transparent px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-7xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_25px_rgba(255,0,0,0.7)]">
          BONUS HUNTS
        </h1>

        <section className="mt-12">
          <div className="mb-5 flex items-center gap-3 text-lg font-black uppercase tracking-widest text-zinc-300">
            <Target className="h-5 w-5 text-red-400" />
            Past Bonus Hunts
          </div>

{pastHunts.length === 0 ? (
  <div className="rounded-3xl border border-red-500/20 bg-black/60 p-10 text-center">
    <p className="text-2xl font-black uppercase text-white">
      No Previous Hunts Yet
    </p>

    <p className="mt-3 text-zinc-500">
      Completed bonus hunts will appear here.
    </p>
  </div>
) : (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {pastHunts.map((item) => (
      <div
        key={item.hunt}
        className="min-w-[220px] rounded-3xl border border-red-500/30 bg-black/70 p-6 shadow-[0_0_25px_rgba(255,0,0,0.12)]"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-4 text-5xl">🔒</div>

          <p className="text-2xl font-black text-white">
            HUNT {item.hunt}
          </p>

          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
            Locked
          </p>
        </div>
      </div>
    ))}
  </div>
)}
        </section>

<section className="mt-6 grid overflow-hidden rounded-3xl border border-red-500/20 bg-black/70 backdrop-blur-md shadow-[0_0_40px_rgba(255,0,0,0.2)] lg:grid-cols-2">
          <div className="border-b border-red-500/10 p-8 lg:border-b-0 lg:border-r">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase">
                <span className="mr-2 text-red-500">●</span>
                {hunt ? hunt.title : "No Hunt Live"}
              </h2>

              <span className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-1 text-xs font-black uppercase text-red-300">
                {hunt?.status || "closed"}
              </span>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-black/50 p-10 text-center">
              <h3 className="text-3xl font-black uppercase text-white">
                A New Bonus Hunt
              </h3>
              <p className="mt-2 text-3xl font-black uppercase text-red-400">
                Will Begin Soon
              </p>
              <p className="mt-6 uppercase tracking-widest text-zinc-400">
                Predictions are currently closed
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6 text-center md:grid-cols-5">
              {["Start Balance", "Bonuses", "Required X", "Avg X", "End Balance"].map(
                (label) => (
                  <div key={label}>
                    <p className="text-xs uppercase text-zinc-500">{label}</p>
                    <p className="mt-3 text-2xl font-black">-</p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="p-8 text-center">
            <h2 className="text-2xl font-black uppercase">
              Guess the end balance
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Closest prediction wins. One entry per person.
            </p>

            <div className="mt-5 flex justify-center gap-3 text-xs font-black">
              <span className="rounded-full bg-red-500/20 px-4 py-2 text-red-200">
                1st $50
              </span>
              <span className="rounded-full bg-red-500/20 px-4 py-2 text-red-200">
                2nd $25
              </span>
              <span className="rounded-full bg-red-500/20 px-4 py-2 text-red-200">
                3rd $10
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-950/10 p-5">
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => {
                  const p = sortedClosest[i];
                  const prize = i === 0 ? "$50" : i === 1 ? "$25" : "$10";

                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-red-500/20 bg-black/60 p-4"
                    >
                      <p className="font-black text-yellow-300">
                        {i + 1}
                        {i === 0 ? "ST" : i === 1 ? "ND" : "RD"}
                      </p>
                      <p className="mt-2 font-bold">
                        {p ? p.twitch_username || p.discord_username : "—"}
                      </p>
                      <p className="mt-2 text-2xl font-black text-red-300">
                        {p ? `$${Number(p.guess_amount).toLocaleString()}` : "No guess"}
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">
                        Prize: {prize}
                      </p>
                    </div>
                  );
                })}
              </div>

              {hunt?.status === "completed" && hunt.final_amount && (
                <p className="mt-5 text-sm text-zinc-300">
                  Ending Balance:{" "}
                  <span className="font-black text-white">
                    ${Number(hunt.final_amount).toLocaleString()}
                  </span>
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <input
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                disabled={!hunt || hunt.status !== "open"}
                placeholder="Enter prediction, e.g. 7250"
                className="w-full rounded-xl border border-red-500/30 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
              />

              <button
                onClick={submitPrediction}
                disabled={!hunt || hunt.status !== "open" || !session?.user}
                className="rounded-xl bg-red-600 px-6 font-black text-white hover:bg-red-500 disabled:opacity-50"
              >
                Submit
              </button>
            </div>

            {!session?.user && (
              <p className="mt-3 text-sm text-yellow-300">
                Login with Discord and connect Twitch to predict.
              </p>
            )}

            {message && <p className="mt-3 text-sm text-zinc-300">{message}</p>}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-red-500/20 bg-black/70 backdrop-blur-md">
          <div className="flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">
            <Trophy className="h-5 w-5 text-red-400" />
            Prediction Leaderboard
          </div>

          <div className="grid grid-cols-4 border-t border-red-500/10 px-5 py-3 text-xs uppercase text-zinc-500">
            <span>Rank</span>
            <span>User</span>
            <span>Prediction</span>
            <span>Difference</span>
          </div>

          {sortedClosest.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Target className="h-14 w-14 text-red-500/50" />
              <p className="mt-5 text-2xl font-black uppercase">
                No predictions yet
              </p>
              <p className="mt-2 text-zinc-500">
                Be the first to make a prediction.
              </p>
            </div>
          ) : (
            sortedClosest.map((p, index) => (
              <div
                key={p.id}
                className="grid grid-cols-4 border-t border-white/10 px-5 py-4 text-sm"
              >
                <span className="font-black">#{index + 1}</span>
                <span>{p.twitch_username || p.discord_username}</span>
                <span className="font-black text-red-300">
                  ${Number(p.guess_amount).toLocaleString()}
                </span>
                <span className="text-zinc-400">
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

        <section className="mt-8 overflow-hidden rounded-2xl border border-red-500/20 bg-black/70 backdrop-blur-md">
          <div className="flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">
            <Coins className="h-5 w-5 text-red-400" />
            Slots in this hunt
          </div>

          <div className="grid grid-cols-5 border-t border-red-500/10 px-5 py-3 text-xs uppercase text-zinc-500">
            <span>#</span>
            <span>Slot</span>
            <span>Bet</span>
            <span>Multi</span>
            <span>Payout</span>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Flame className="h-14 w-14 text-red-500/50" />
            <p className="mt-5 text-2xl font-black uppercase">
              Slots will appear here
            </p>
            <p className="mt-2 text-zinc-500">Once the hunt begins.</p>
          </div>
        </section>
      </div>
    </main>
  );
}