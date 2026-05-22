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

const pastHunts = [
  { hunt: "#251", start: "$5,000", winnings: "$3,507.47", avg: "75.20x", pl: "-$1,492.53" },
  { hunt: "#250", start: "$4,000", winnings: "$4,845.96", avg: "234.50x", pl: "+$845.96" },
  { hunt: "#249", start: "$5,000", winnings: "$3,982.42", avg: "195.76x", pl: "-$1,017.58" },
  { hunt: "#248", start: "$6,000", winnings: "$12,407.98", avg: "466.19x", pl: "+$6,407.98" },
];

const slots = [
  { name: "Merge Up 2", bet: "$0.75", multi: "138.24x", payout: "$103.68" },
  { name: "Rainbow Bonanza 2000", bet: "$0.40", multi: "50.10x", payout: "$20.04" },
  { name: "Tombstone Begins", bet: "$0.80", multi: "43.85x", payout: "$35.08" },
];

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

  const topThree = sortedClosest.slice(0, 3);

  return (
    <main className="min-h-screen px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-6xl font-black tracking-widest text-blue-100 drop-shadow-[0_0_20px_rgba(96,165,250,0.65)]">
          BONUS HUNTS
        </h1>

        <section className="mt-12">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">
            Past Bonus Hunts
          </p>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {pastHunts.map((item) => (
              <div
                key={item.hunt}
                className="min-w-[180px] rounded-2xl border border-blue-300/30 bg-slate-950/70 p-4 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              >
                <p className="font-bold">Hunt {item.hunt}</p>
                <p className="text-sm text-slate-300">Start: {item.start}</p>
                <p className="text-sm text-slate-300">Winnings: {item.winnings}</p>
                <p className="text-sm text-slate-300">Avg X: {item.avg}</p>
                <p className={`text-sm font-bold ${item.pl.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
                  P/L: {item.pl}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid overflow-hidden rounded-3xl border border-blue-300/20 bg-slate-950/80 shadow-[0_0_40px_rgba(37,99,235,0.25)] lg:grid-cols-2">
          <div className="border-b border-blue-300/10 p-8 lg:border-b-0 lg:border-r">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-black">
                <span className="mr-2 text-emerald-400">●</span>
                {hunt ? hunt.title : "No Hunt Live"}
              </h2>

              <span className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-1 text-xs font-black uppercase text-red-300">
                {hunt?.status || "closed"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-5">
              <div>
                <p className="text-xs uppercase text-slate-400">Start</p>
                <p className="text-2xl font-black">$4,000</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Bonuses</p>
                <p className="text-2xl font-black">19</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Required X</p>
                <p className="text-2xl font-black">—</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Avg X</p>
                <p className="text-2xl font-black">158.81x</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">End Balance</p>
                <p className="text-2xl font-black text-red-300">
                  {hunt?.final_amount ? `$${Number(hunt.final_amount).toLocaleString()}` : "TBD"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 text-center">
            <h2 className="text-2xl font-black">Guess the end balance</h2>
            <p className="mt-2 text-sm text-slate-400">
              Closest prediction wins. One entry per person.
            </p>

            <div className="mt-5 flex justify-center gap-3 text-xs font-black">
              <span className="rounded-full bg-purple-500/30 px-4 py-2">1st $50</span>
              <span className="rounded-full bg-purple-500/30 px-4 py-2">2nd $25</span>
              <span className="rounded-full bg-purple-500/30 px-4 py-2">3rd $10</span>
            </div>

            <div className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-950/20 p-5">
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => {
                  const p = topThree[i];
                  const prize = i === 0 ? "$50" : i === 1 ? "$25" : "$10";

                  return (
                    <div key={i} className="rounded-xl border border-purple-400/20 bg-slate-950/60 p-4">
                      <p className="font-black text-yellow-300">{i + 1}{i === 0 ? "ST" : i === 1 ? "ND" : "RD"}</p>
                      <p className="mt-2 font-bold">{p ? p.twitch_username || p.discord_username : "—"}</p>
                      <p className="mt-2 text-2xl font-black text-purple-300">
                        {p ? `$${Number(p.guess_amount).toLocaleString()}` : "No guess"}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">Prize: {prize}</p>
                    </div>
                  );
                })}
              </div>

              {hunt?.status === "completed" && hunt.final_amount && (
                <p className="mt-5 text-sm text-slate-300">
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
                className="w-full rounded-xl border border-purple-400/30 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
              />

              <button
                onClick={submitPrediction}
                disabled={!hunt || hunt.status !== "open" || !session?.user}
                className="rounded-xl bg-purple-500 px-6 font-black text-white hover:bg-purple-400 disabled:opacity-50"
              >
                Submit
              </button>
            </div>

            {!session?.user && (
              <p className="mt-3 text-sm text-yellow-300">Login with Discord to predict.</p>
            )}

            {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-blue-300/20 bg-slate-950/80">
          <div className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
            Slots in this hunt
          </div>

          {slots.map((slot, i) => (
            <div key={slot.name} className="grid grid-cols-4 border-t border-white/10 px-5 py-4 text-sm">
              <span className="font-bold">Bonus #{i + 1}</span>
              <span className="font-black">{slot.name}</span>
              <span>{slot.bet} · {slot.multi}</span>
              <span className="text-right font-black text-emerald-400">{slot.payout}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}