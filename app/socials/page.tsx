"use client";

import { motion } from "framer-motion";

const socials = [
  {
    name: "Discord",
    hook: "Join Frazier Kay Live",
    benefit: "Get giveaway alerts, reward claims, roles, and exclusive drops.",
    cta: "Join Discord",
    link: "https://discord.gg/7Ea29zzeMV",
    color: "border-indigo-500 bg-indigo-950/70",
  },
{
  name: "Twitter / X",
  hook: "Follow Frazier & Frazier Rewards",
  benefit: "Check out posts, giveaways and everything Frazier.",
  buttons: [
    {
      label: "Follow Rewards",
      link: "https://x.com/FrazierRewards",
      primary: true,
    },
    {
      label: "Follow Frazier",
      link: "https://x.com/FrazierKay",
      primary: false,
    },
  ],
  color: "border-zinc-500 bg-zinc-900/80",
},
  {
    name: "Twitch",
    hook: "Catch Frazier Live",
    benefit: "Participate in live giveaways, get leaderboard updates and watch highlights.",
    cta: "Watch Twitch",
    link: "https://twitch.tv/frazierkaylive",
    color: "border-purple-500 bg-purple-950/70",
  },
  {
    name: "Youtube",
    hook: "Watch IRL Gambling Videos",
    benefit: "Watch videos featuring Frazier & Jarvis whilst they gamble IRL.",
    cta: "Subscribe",
    link: "https://www.youtube.com/@JarvisKayGambles",
    color: "border-red-500 bg-red-950/70",
  },
];

export default function SocialsPage() {
  return (
    <main className="min-h-screen px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 inline-block rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            Join • Follow • Win • Claim
          </p>

          <h1 className="text-5xl font-black">Frazier Rewards Socials</h1>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            Stay ahead of the curve and connect with Frazier.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {socials.map((social, i) => (
<motion.div
  key={social.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
className={`group rounded-2xl border p-6 transition hover:scale-[1.02] hover:shadow-[0_0_22px_rgba(255,0,0,0.25)] ${social.color}`}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">{social.name}</h2>
                <p className="mt-2 text-lg text-white">{social.hook}</p>
                <p className="mt-3 text-sm text-zinc-300">{social.benefit}</p>
              </div>

<div className="flex flex-wrap gap-3">
  {social.buttons ? (
    social.buttons.map((btn, i) => (
<a
  key={i}
  href={btn.link}
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) => e.stopPropagation()}
className="cursor-pointer rounded-xl px-5 py-3 font-bold transition bg-white text-black hover:bg-yellow-300"
      >
        {btn.label} →
      </a>
    ))
  ) : (
<a
  href={social.link}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex cursor-pointer rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-yellow-300"
>
  {social.cta} →
</a>
  )}
</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-red-500/40 bg-black/70 p-6 text-center">
          <h2 className="text-2xl font-bold">Best way to stay eligible for giveaways?</h2>
          <p className="mt-2 text-zinc-300">
            Join Discord first, then follow Twitter/X for giveaway updates and
            connect your Twitch account to FrazierRewards.com from your profile.
          </p>
        </div>
      </div>
    </main>
  );
}