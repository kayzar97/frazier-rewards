"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
export default function TwitchLoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button className="h-10 px-5 rounded-2xl bg-zinc-800 text-white/70 font-semibold">
        Checking...
      </button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80">
          <img
            src={session.user.image || ""}
            alt="Profile"
            className="h-10 w-10 rounded-full border border-white/20"
          />
          <span className="font-semibold text-white">
            {session.user.name}
          </span>
        </Link>
      </div>
    );
  }

return (
  <button
    onClick={() => signIn("discord")}
    className="h-10 px-5 rounded-2xl bg-slate-600 text-white font-semibold hover:bg-slate-500"
  >
    Login with Discord
  </button>
);
}

