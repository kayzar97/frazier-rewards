"use client";

import { useState } from "react";

type Tier = {
  tier: number;
  threshold: number;
  reward: number;
  unlocked: boolean;
  claimStatus: string | null;
  gambleUsed?: boolean;
  gambleResult?: string;
};

type DoubleDownResult = {
  success: boolean;
  claim?: any;
  choice: "left" | "right";
  shootingBottle: "left" | "right";
  gambleResult: "win" | "lose";
  finalAmount: number;
};

type DoubleDownGameProps = {
  tier: Tier;
  onClose: () => void;
  onComplete: (result: DoubleDownResult) => void;
};

function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function DoubleDownGame({
  tier,
  onClose,
  onComplete,
}: DoubleDownGameProps) {
  const [loading, setLoading] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [resultData, setResultData] = useState<DoubleDownResult | null>(null);
  const [showFinalResult, setShowFinalResult] = useState(false);

  async function chooseBottle(choice: "left" | "right") {
    if (loading || resultVideo) return;

    setLoading(true);
    setResultVideo(null);
    setResultData(null);
    setShowFinalResult(false);

    const res = await fetch("/api/wager-rewards/gamble", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tier: tier.tier,
        rewardAmount: tier.reward,
        choice,
      }),
    });

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.error("Gamble API returned non-JSON:", text);
      alert("Gamble API returned an error page. Check console.");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      alert(data.error || "Failed to gamble reward.");
      setLoading(false);
      return;
    }

    const shootingBottle = data.shootingBottle as "left" | "right";

    const videoPath =
      shootingBottle === "left"
        ? "/videos/double-down/shooting-left-bottle.mp4"
        : "/videos/double-down/shooting-right-bottle.mp4";

    console.log("DOUBLE DOWN RESULT:", data);
    console.log("PLAYING RESULT VIDEO:", videoPath);

    setResultData(data);
    setResultVideo(videoPath);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70">
      <div className="relative flex w-[95vw] max-w-[1800px] flex-col items-center rounded-2xl border border-yellow-500/30 bg-[#1b0705] p-4 text-center shadow-[0_0_40px_rgba(255,180,0,0.22)]">
        {!resultVideo ? (
          <>
            <h2 className="mb-2 text-4xl font-black text-yellow-300">
              Double Down
            </h2>

            <p className="mb-3 text-base leading-relaxed text-white/70">
              Shoot the correct bottle to double your reward to{" "}
              <span className="font-bold text-yellow-300">
                {money(tier.reward * 2)}
              </span>
              . Miss and this reward becomes{" "}
              <span className="font-bold text-red-400">$0</span>.
            </p>

<div className="relative mx-auto mb-3 w-full cursor-crosshair overflow-hidden rounded-2xl border border-yellow-400/20">
  <video
    src="/videos/double-down/idle.mp4"
    autoPlay
    loop
    muted
    playsInline
    disablePictureInPicture
    controlsList="nodownload noplaybackrate noremoteplayback"
    className="w-full pointer-events-none select-none"
  />

<button
  type="button"
  disabled={loading}
  onClick={() => chooseBottle("left")}
  className="absolute left-[31.9%] top-[43.5%] h-[12.5%] w-[3.2%] cursor-crosshair bg-transparent disabled:pointer-events-none"
  aria-label="Choose left bottle"
/>

<button
  type="button"
  disabled={loading}
  onClick={() => chooseBottle("right")}
  className="absolute left-[63.9%] top-[43.5%] h-[12.5%] w-[3.2%] cursor-crosshair bg-transparent disabled:pointer-events-none"
  aria-label="Choose right bottle"
/>
</div>

            {loading && (
              <p className="mb-4 text-sm font-black tracking-[0.25em] text-yellow-300">
                SHOOTING...
              </p>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="mt-2 text-sm font-bold text-white/40 hover:text-white/70"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <video
              key={resultVideo}
              src={resultVideo}
              autoPlay
              muted
              playsInline
              disablePictureInPicture
              controlsList="nodownload noplaybackrate noremoteplayback"
              className="mb-5 w-full pointer-events-none select-none rounded-2xl border border-yellow-400/30"
onEnded={() => {
  setShowFinalResult(true);
}}
            />

{showFinalResult && resultData && (
              <>
                <h2
                  className={`mb-2 text-4xl font-black ${
                    resultData.gambleResult === "win"
                      ? "text-emerald-300"
                      : "text-red-400"
                  }`}
                >
                  {resultData.gambleResult === "win" ? "YOU WON" : "YOU LOST"}
                </h2>

                <p className="mb-2 text-white/70">
                  Shot bottle:{" "}
                  <span className="font-bold text-yellow-300">
                    {resultData.shootingBottle.toUpperCase()}
                  </span>
                </p>

                <p className="mb-4 text-4xl font-black text-yellow-300">
                  {money(resultData.finalAmount)}
                </p>
                <button
  type="button"
  onClick={() => {
    onComplete(resultData);
    onClose();
  }}
  className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-6 py-3 font-bold text-yellow-300 transition hover:bg-yellow-500/20"
>
  Continue
</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}