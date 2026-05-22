"use client";

import { useEffect, useState } from "react";

export default function LiveStatus() {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const checkLive = async () => {
      try {
        const res = await fetch(
          "https://decapi.me/twitch/uptime/frazierkaylive"
        );
        const text = await res.text();

        if (!text.toLowerCase().includes("offline")) {
          setIsLive(true);
        } else {
          setIsLive(false);
        }
      } catch {
        setIsLive(false);
      }
    };

    checkLive();
    const interval = setInterval(checkLive, 60000); // every 60s

    return () => clearInterval(interval);
  }, []);

  return (
    <a
      href="https://twitch.tv/frazierkaylive"
      target="_blank"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all ${
isLive
  ? "bg-red-500 text-white shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse"
          : "bg-zinc-700 text-white border border-white/20"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
isLive ? "bg-red-200 animate-pulse" : "bg-white/70"
        }`}
      />
      {isLive ? "LIVE" : "OFFLINE"}
    </a>
  );
}