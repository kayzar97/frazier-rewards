"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { signIn, signOut, useSession } from "next-auth/react";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function Navbar() {
  const [role, setRole] = useState("user");
const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
const [captchaLoading, setCaptchaLoading] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [vaultCount, setVaultCount] = useState(0);
  

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchRole() {
if (status === "loading") return;
if (!session?.user?.name) {
  setRole("user");
  return;
}

      const res = await fetch("/api/profile");
      const data = await res.json();

      setRole(data?.profile?.role || "user");
    }

    fetchRole();
}, [session, status]);
useEffect(() => {
  async function fetchVaultCount() {
if (status === "loading") return;
if (!session) {
  setVaultCount(0);
  return;
}

    const res = await fetch("/api/vault/count");
    const data = await res.json();

    setVaultCount(data.count || 0);
  }

  fetchVaultCount();

  window.addEventListener("vault-count-updated", fetchVaultCount);

  return () => {
    window.removeEventListener("vault-count-updated", fetchVaultCount);
  };
}, [session, status]);
  return (
<nav className={`${cinzel.className} fixed left-0 top-0 z-50 w-full border-b border-yellow-500/20 bg-gradient-to-r from-[#2b0000] via-[#5a0000] to-[#2b0000] shadow-[0_0_25px_rgba(255,0,0,0.2)]`}>
      {/* glow layer */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.15),transparent_60%)]" />

      <div className="relative mx-auto flex h-20 max-w-7xl items-center px-0">
<Link href="/" className="group relative z-10 flex cursor-pointer items-center">
          <img
src="/Frazier-rewards-logo.png"
            alt="Frazier Rewards"
            className="h-40 translate-y-[2px] object-contain transition duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_18px_rgba(255,220,0,1)]"
          />
        </Link>

<div className="absolute left-1/2 flex w-full max-w-3x1 -translate-x-1/2 items-center justify-center gap-5 whitespace-nowrap text-md">

        <Link
  href="/wager-rewards"
  className={`rounded-xl px-3 py-2 transition-all duration-300 ${
    pathname === "/wager-rewards"
      ? "scale-105 border border-red-400 bg-red-500/20 text-yellow-400 shadow-[0_0_12px_rgba(255,0,0,0.35)]"
      : "scale-100 text-white hover:text-yellow-200 drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]"
  }`}
>
  Wager Rewards
</Link>

          <Link
            href="/leaderboard"
            className={`rounded-xl px-3 py-2 transition-all duration-300 ${
              pathname === "/leaderboard"
                ? "scale-105 border border-red-400 bg-red-500/20 text-yellow-400 shadow-[0_0_12px_rgba(255,0,0,0.35)]"
                : "text-white hover:text-yellow-200 drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]"
            }`}
          >
            Leaderboard
          </Link>

          <Link
            href="/socials"
            className={`rounded-xl px-3 py-2 transition-all duration-300 ${
              pathname === "/socials"
                ? "scale-105 border border-red-400 bg-red-500/20 text-yellow-400 shadow-[0_0_12px_rgba(255,0,0,0.35)]"
                : "text-white hover:text-yellow-200 drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]"
            }`}
          >
            Socials
          </Link>

          <Link
            href="/bonus-hunt"
            className={`rounded-xl px-4 py-2 transition-all duration-300 ${
              pathname === "/bonus-hunt"
                ? "scale-105 border border-red-400 bg-red-500/20 text-yellow-400 shadow-[0_0_12px_rgba(255,0,0,0.35)]"
                : "text-white hover:text-yellow-200 drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]"
            }`}
          >
            Bonus Hunt
          </Link>

<Link
  href="/giveaways"
  className="group relative flex items-center transition-all duration-300"
>
  <img
    src="/vault.png"
    alt="The Vault"
    className="h-11 w-auto transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]"
  />

  {vaultCount > 0 && (
    <span className="absolute -right-3 -top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-red-200 px-1 text-xl font-black text-black shadow-[0_0_10px_rgba(255,215,0,0.9)]">
      {vaultCount}
    </span>
  )}
</Link>
        </div>

        <div className="ml-auto flex items-center">
{status === "loading" ? (
  <div className="h-10 w-40 animate-pulse rounded-xl bg-white/10" />
) : status === "unauthenticated" ? (
            <button
onClick={() => setShowCaptcha(true)}
className="relative z-50 pointer-events-auto flex items-center gap-1.5 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4752C4] active:scale-[0.98]"
            >
              <img src="/discord-logo.png" alt="Discord" className="h-5 w-5" />
              Login with Discord
            </button>
          ) : (
            <>
<div ref={dropdownRef} className="relative ml-20 mr-1 flex items-right">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-black/30"
                >
                  <img
                    src={session?.user?.image || "/default-avatar.png"}
                    alt="Profile avatar"
                    className={`h-10 w-10 rounded-full border ${
                      session
                        ? "border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.9)]"
                        : "border-white/20"
                    }`}
                  />

                  <span className="text-white">{session?.user?.name}</span>
                </button>

                {open && (
                  <div className="absolute right-0 top-14 w-52 rounded-xl border border-red-500/40 bg-black/95 p-2 shadow-[0_0_20px_rgba(255,0,0,0.25)]">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-4 py-2 text-white hover:bg-red-500/20"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
className="w-full rounded-lg px-4 py-2 text-left text-white hover:bg-white/10"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {role === "admin" && (
<Link
  href="/admin/users"
className="relative z-[9999] pointer-events-auto ml-0 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-300 transition hover:bg-red-500/20"
>
  Admin Panel
</Link>
              )}
            </>
          )}
        </div>
      </div>
      {showCaptcha && (
<div className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center bg-[#111111]">
<div
  onContextMenu={(e) => e.preventDefault()}
  className="w-full max-w-md rounded-2xl border border-yellow-500/30 bg-[#1b0705] p-6 text-center shadow-[0_0_40px_rgba(255,180,0,0.22)]"
>
      <h2 className="mb-4 text-2xl font-black text-yellow-300">
        Verify you are human
      </h2>

<div className="pointer-events-auto">
  <Turnstile
    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
    onSuccess={async (token) => {
  try {
    setCaptchaLoading(true);

    const res = await fetch("/api/turnstile/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    console.log("Turnstile verify result:", data);

    if (data.success) {
      setShowCaptcha(false);
      signIn("discord");
      return;
    }

    alert(data.error || "Verification failed.");
  } catch (error) {
    console.error("Turnstile error:", error);
    alert("Captcha verification crashed. Check console.");
  } finally {
    setCaptchaLoading(false);
  }
}}
      />
      </div>

      <button
        onClick={() => setShowCaptcha(false)}
        className="mt-4 text-sm font-bold text-white/40 hover:text-white/70"
      >
        Cancel
      </button>

      {captchaLoading && (
        <p className="mt-3 text-sm text-yellow-300">
          Verifying...
        </p>
      )}
    </div>
  </div>
)}
    </nav>
  );
}
