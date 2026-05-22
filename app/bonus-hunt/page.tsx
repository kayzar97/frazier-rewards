"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guessAmount: prediction,
      }),
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

  const winner = sortedClosest[0];

  return (
    <main className="min-h-screen px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-center text-5xl font-black">
          Live Bonus Hunt
        </h1>

        <p className="mb-10 text-center text-zinc-400">
          Predict the final bonus hunt amount before Frazier starts the hunt.
        </p>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-2xl border border-red-500/40 bg-[#140404]/75 p-6 shadow-[0_0_25px_rgba(255,0,0,0.25)] backdrop-blur-xl">
            <h2 className="text-center text-2xl font-bold">Hunt Status</h2>

            {!hunt ? (
              <div className="mt-6 rounded-xl border border-dashed border-red-500/40 bg-white/5 p-5 text-center text-sm text-zinc-400">
                No prediction session is open yet.
              </div>
            ) : (
              <div className="mt-6 space-y-4 text-center">
                <p className="text-3xl font-black">{hunt.title}</p>

                <div className="inline-flex rounded-full border border-red-500/50 bg-black px-5 py-2 text-sm font-bold uppercase text-red-300">
                  {hunt.status}
                </div>

                {hunt.status === "open" && (
                  <p className="text-zinc-400">
                    Predictions are open. Submit before the hunt starts.
                  </p>
                )}

                {hunt.status === "locked" && (
                  <p className="text-yellow-300">
                    Predictions are locked. The hunt has started.
                  </p>
                )}

                {hunt.status === "completed" && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5">
                    <p className="text-xs uppercase text-zinc-400">
                      Final Amount
                    </p>
                    <p className="text-4xl font-black text-emerald-300">
                      ${Number(hunt.final_amount).toLocaleString()}
                    </p>

                    {winner && (
                      <p className="mt-4 text-sm text-white">
                        Winner:{" "}
                        <span className="font-bold text-yellow-300">
                          {winner.twitch_username || winner.discord_username}
                        </span>{" "}
                        guessed ${Number(winner.guess_amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-red-500/40 bg-[#140404]/75 p-6 shadow-[0_0_25px_rgba(255,0,0,0.25)] backdrop-blur-xl">
            <h2 className="text-center text-2xl font-bold">Predictions</h2>

            <p className="mt-4 text-center text-zinc-400">
              Guess the final dollar amount the bonus hunt ends on.
            </p>

            <div className="mt-6 flex gap-3">
              <input
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                disabled={!hunt || hunt.status !== "open"}
                placeholder="Enter prediction, e.g. 7250"
                className="w-full rounded-xl border border-red-500/30 bg-black px-4 py-3 text-white outline-none focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                onClick={submitPrediction}
                disabled={!hunt || hunt.status !== "open" || !session?.user}
                className="rounded-xl bg-red-500 px-6 font-bold text-white shadow-[0_0_12px_rgba(255,0,0,0.4)] transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit
              </button>
            </div>

            {!session?.user && (
              <p className="mt-3 text-center text-sm text-yellow-300">
                Login with Discord to submit a prediction.
              </p>
            )}

            {message && (
              <p className="mt-3 text-center text-sm text-zinc-300">
                {message}
              </p>
            )}
          </section>
        </div>

        <section className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-red-500/50 bg-[#140404]/75 backdrop-blur-xl">
          <div className="grid grid-cols-4 bg-red-950/50 px-4 py-3 text-xs uppercase text-zinc-300">
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
                <span className="text-zinc-300">
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