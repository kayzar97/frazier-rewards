"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import TwitchLoginButton from "../components/ui/TwitchLoginButton";
import { motion } from "framer-motion";
import { Trophy, Gift, Users, ShieldCheck, ExternalLink, Crown, Zap, Target } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";


const leaderboard = [
  { rank: 1, name: "KAYGEN_77", wagered: "$48,920", prize: "$500" },
  { rank: 2, name: "SpinLord", wagered: "$32,400", prize: "$250" },
  { rank: 3, name: "BonusBandit", wagered: "$21,850", prize: "$125" },
  { rank: 4, name: "VaultHunter", wagered: "$14,600", prize: "$75" },
  { rank: 5, name: "LuckyAce", wagered: "$9,300", prize: "$50" },
];

const rewards = [
  {
    icon: Gift,
    title: "Weekly Giveaways",
    text: "Enter exclusive giveaways, claim rewards, and track upcoming prize drops.",
  },
  {
    icon: Trophy,
    title: "Wager Leaderboards",
    text: "Compete against the community and climb the leaderboard for weekly prizes.",
  },
  {
    icon: Users,
    title: "Community Perks",
    text: "Join the Discord, earn roles, and unlock special campaign access.",
  },
];
export default function RewardsHubHomepage() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

  const [isLive, setIsLive] = useState(false);

useEffect(() => {
  const checkLive = async () => {
    try {
      const res = await fetch(
        `https://decapi.me/twitch/uptime/frazierkaylive`
      );
      const text = await res.text();

      if (!text.toLowerCase().includes("offline")) {
        setIsLive(true);
      } else {
        setIsLive(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  checkLive();
  const interval = setInterval(checkLive, 60000); // check every 60s

  return () => clearInterval(interval);
}, []);

  const tweetUrl = "https://x.com/FrazierRewards/status/2049175904039915780?s=20";

  const campaignEndDate = new Date("2026-05-01T20:00:00").getTime();

  const [timeLeft, setTimeLeft] = useState("72h");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = campaignEndDate - now;

      if (distance <= 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
<main className="min-h-screen bg-transparent text-white">
<section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(246, 72, 59, 0.35),transparent_35%),radial-gradient(circle_at_top_left,rgba(168,85,247,0.25),transparent_30%)]" />

<div className="relative z-10 flex h-screen -translate-y-30 flex-col items-center justify-center px-6 text-center gap-3">

<div className="flex flex-col items-center justify-center">
  <a
    href="http://spartans.com/?c=FRAZIER&affiliateid=533300"
    target="_blank"
    rel="noopener noreferrer"
    className="transition hover:scale-105"
  >
    <img
      src="/spartans.png"
      alt="Join Spartans"
      className="h-auto w-full max-w-xl drop-shadow-[0_0_25px_rgba(255,255,0,0.6)]"
    />
  </a>

<p className="mt-0 max-w-md text-center text-lg leading-tight text-white/90">
  Sign up to Spartans using code{" "}
  <span className="font-black text-yellow-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.9)]">
    FRAZIER
  </span>{" "}
  and start wagering to get access to the $75,000 leaderboard, access to the VIP Wager Rewards and more!
</p>
</div>
</div>
</section>
<section className="py-0">
  <div className="mx-auto max-w-6xl px-6 text-center">
    <h2 className="text-4xl font-black tracking-tight text-white-300">
      {isLive ? "LIVE NOW" : "RECENT STREAM"}
    </h2>

    <p className="mt-3 text-white/60">
      {isLive
        ? "Frazier is live right now — watch the stream below"
        : "Stream is currently offline — check out the last VOD below"}
    </p>

    <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
      <iframe
src="https://player.twitch.tv/?video=YOUR_VOD_ID&parent=frazier-rewards.vercel.app&autoplay=false"
        height="560"
        width="100%"
        allowFullScreen
        className="aspect-video w-full"
      />
    </div>
  </div>
</section>
      <footer id="socials" className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Frazier Rewards. All rights reserved. </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-wrap gap-4">
  <a href="https://x.com/FrazierRewards" target="_blank" rel="noopener noreferrer"className="inline-flex items-center gap-1 hover:text-white">
    Twitter <ExternalLink className="h-3 w-3" />
  </a>

  <a href="https://www.instagram.com/frazierkay/" target="_blank" rel="noopener noreferrer"className="inline-flex items-center gap-1 hover:text-white">
    Instagram <ExternalLink className="h-3 w-3" />
  </a>
<a
  href="https://twitch.tv/frazierkaylive"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-1 hover:text-white"
>
  Twitch
  {isLive && (
    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg shadow-red-500/50 animate-pulse">
      LIVE
    </span>
  )}
  <ExternalLink className="h-3 w-3" />
</a>
</div>
          </div>
        </div>
        <div className="mx-auto mt-3 max-w-7xl rounded-2xl bg-white/[0.03] p-4 text-xs leading-6 text-white-500">
          <ShieldCheck className="mr-2 inline h-4 w-4" /> 18+ only. Please gamble responsibly. This website is a community rewards hub and will include all required legal, affiliate, and regional disclaimers before launch.
        </div>
      </footer>
    </main>
  );
}
