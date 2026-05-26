"use client";

import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
const [role, setRole] = useState("user");
const [username, setUsername] = useState("");
const [twitchUsername, setTwitchUsername] = useState("");
const [twitchAvatar, setTwitchAvatar] = useState("");
const [saved, setSaved] = useState(false);
const [profileLoading, setProfileLoading] = useState(true);
async function disconnectTwitch() {
  const confirmed = confirm(
    "Disconnect Twitch? The previous Twitch account will be kept in our records for giveaway security."
  );

  if (!confirmed) return;

  const res = await fetch("/api/connect/twitch/disconnect", {
    method: "POST",
  });

  if (!res.ok) {
    alert("Failed to disconnect Twitch");
    return;
  }

  setTwitchUsername("");
  setTwitchAvatar("");
}
useEffect(() => {
  if (status === "loading") return;

  if (!session?.user?.name) {
    setProfileLoading(false);
    return;
  }

  async function loadProfile() {

    const res = await fetch("/api/profile");
    const data = await res.json();

    setRole(data?.profile?.role || "user");

    if (data?.profile?.spartans_username) {
      setUsername(data.profile.spartans_username);
      setSaved(localStorage.getItem("spartansUsernameSaved") === "true");
    }


setTwitchUsername(data?.profile?.twitch_username || "");
setTwitchAvatar(data?.profile?.twitch_image || "");
    setProfileLoading(false);
  }

  loadProfile();
}, [session, status]);

async function saveProfile() {
  const res = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      spartansUsername: username,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    alert("API Error: " + text);
    return;
  }
setSaved(true);
localStorage.setItem("spartansUsernameSaved", "true");
setSaved(true);
}

  if (status === "loading") return <p className="p-10 text-white">Loading...</p>;

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-zinc-950 p-10 text-white">
<p>You need to login with Discord first.</p>
      </main>
    );
  }
  return (
<main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-5xl font-black">Profile</h1>

        {/* 🔴 USER CARD */}
<div className="relative rounded-2xl border border-red-500/60 bg-black/100 p-8 shadow-[0_0_25px_rgba(239,68,68,0.35)]">
  <h2 className="mb-6 text-2xl font-bold">Connected Accounts</h2>
<div className="absolute right-8 top-8 inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-bold text-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.35)]">
  ROLE: {role.toUpperCase()}
</div>

  <div className="grid gap-4 md:grid-cols-2">
    {/* Discord Card */}
<div className="rounded-xl border border-blue-500 bg-zinc-800 p-5">
      <div className="flex items-center gap-4">
        <img
          src={session.user.image || ""}
          alt="Discord profile"
          className="h-16 w-16 rounded-full border border-white/20"
        />

        <div>
          <p className="text-xl font-bold">{session.user.name}</p>
          <p className="text-sm text-zinc-400">Discord connected</p>
        </div>
      </div>

      <span className="mt-5.5 inline-block rounded-md bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-300">
        VERIFIED
      </span>
    </div>

{/* Twitch Card */}
<div className="rounded-xl border border-purple-500 bg-zinc-800 p-5">
  {profileLoading ? (
    <div className="animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-white/10" />

        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-white/10" />
          <div className="h-4 w-24 rounded bg-white/10" />
        </div>
      </div>

      <div className="mt-4 h-10 w-40 rounded bg-white/10" />
    </div>
  ) : (
    <>
      <div className="flex items-center gap-4">
        {twitchAvatar ? (
          <img
            src={twitchAvatar}
            alt="Twitch profile"
            className="h-16 w-16 rounded-full border border-white/20"
          />
        ) : (
          <div className="h-16 w-16 rounded-full border border-white/20" />
        )}

        <div>
          <p className="text-xl font-bold text-white">
            {twitchUsername
              ? twitchUsername.charAt(0).toUpperCase() +
                twitchUsername.slice(1)
              : "Twitch"}
          </p>

          <p className="text-sm text-zinc-400">
            {twitchUsername
              ? "Twitch connected"
              : "Twitch not connected"}
          </p>
        </div>
      </div>

      {twitchUsername ? (
        <>
          <span className="mt-4 inline-block rounded-md bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-300">
            CONNECTED
          </span>

          <button
            onClick={disconnectTwitch}
            className="mt-3 ml-3 rounded-xl border border-red-500/50 bg-black/80 px-6 py-2 font-bold text-white transition hover:bg-red-500/20"
          >
            Disconnect
          </button>

          <div className="mt-4">
            <p className="text-sm font-bold text-yellow-300">
              This Twitch account is eligible to claim future giveaways.
            </p>
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() =>
              (window.location.href = "/api/connect/twitch")
            }
            className="mt-4 rounded-xl border border-purple-500/50 bg-black/80 px-6 py-3 font-bold text-white transition hover:bg-black/80"
          >
            Connect Twitch
          </button>

          <div className="mt-4">
            <p className="text-sm font-bold text-yellow-300">
              You must connect your Twitch account in order to claim any giveaways won on stream.
            </p>
          </div>
        </>
      )}
    </>
  )}
</div>
</div>
</div>

<div className="mt-8 rounded-3xl border border-red-500/50 bg-black/80 p-8 shadow-[0_0_30px_rgba(239,68,68,0.18)] backdrop-blur-xl">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-black text-white">
        Spartans Account
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Link the username you use on Spartans.
      </p>
    </div>

    {saved && (
      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-300">
        SAVED
      </span>
    )}
  </div>

  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-yellow-300/80">
    Spartans Username
  </label>

  <input
    value={username}
    onChange={(e) => {
      setUsername(e.target.value);
      setSaved(false);
      localStorage.removeItem("spartansUsernameSaved");
    }}
    placeholder="Enter your Spartans username"
    className="w-full rounded-2xl border border-red-500/50 bg-red-950/70 px-5 py-4 text-lg font-bold text-white outline-none transition focus:border-yellow-300 focus:shadow-[0_0_18px_rgba(250,204,21,0.25)]"
  />

  <p className="mt-3 text-sm text-zinc-400">
    This username is used for reward claims, giveaways, and account checks.
  </p>

  <button
    onClick={saveProfile}
    className="mt-6 rounded-2xl border border-yellow-400/40 bg-yellow-500/10 px-8 py-3 font-black text-yellow-300 transition hover:bg-yellow-500/20 hover:shadow-[0_0_18px_rgba(250,204,21,0.25)]"
  >
    Save Spartans Username
  </button>
</div>
      <div className="mt-8 flex justify-end">
  <button
    onClick={() => signOut({ callbackUrl: "/", redirect: true })}
className="cursor-pointer bg-black/90 border border-red-500/50 rounded-xl px-8 py-3 font-bold text-white hover:bg-black/90 transition-all duration-200"
  >
    Logout
  </button>
</div>
        {/* 🔴 LOGOUT */}
      </div>

    </main>
  );
}