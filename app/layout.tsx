import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import LiveStatus from "@/components/LiveStatus";
import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import { MAINTENANCE_MODE, TEAM_TESTING_MODE } from "@/lib/maintenance";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import "./globals.css";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
});

export const metadata: Metadata = {
title: {
  default: "FrazierRewards",
  template: "%s | FrazierRewards",
},
  description: "The Frazier Rewards Homepage",
  icons: {
    icon: "/favicon.ico", // or "/favicon.png"
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

let allowedTester = false;

if (session?.user?.name) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .maybeSingle();

  allowedTester =
    profile?.role === "admin" ||
    profile?.role === "vip";
}
if (MAINTENANCE_MODE || (TEAM_TESTING_MODE && !allowedTester)) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-xl rounded-3xl border border-yellow-400/30 bg-zinc-950/90 p-10 text-center shadow-[0_0_50px_rgba(250,204,21,0.2)] backdrop-blur-xl">
            
            <h1 className={`${leagueSpartan.className} text-4xl font-bold text-yellow-300`}>
              FrazierRewards
            </h1>

            <div className="mx-auto mt-6 h-px w-32 bg-yellow-400/30" />

            <h2 className="mt-6 text-2xl font-semibold">
              Under Maintenance
            </h2>

            <p className="mt-4 text-zinc-400">
              We’re currently upgrading rewards, claims, and backend systems.
              Please check back shortly.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="h-3 w-3 animate-pulse rounded-full bg-yellow-400" />
            </div>

          </div>
        </div>
      </body>
    </html>
  );
}
  return (
<html
  lang="en"
  className="h-full antialiased"
>
<body className={`${leagueSpartan.className} min-h-screen flex flex-col text-white`}>
  {/* Background image */}
  <div
    className="fixed inset-0 -z-20 bg-cover bg-center"
    style={{ backgroundImage: "url('/background3.png')" }}
  />

  {/* Dark overlay */}
  <div className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-[1.5px]" />

  {/* App content */}
<div className="relative z-10">
  <AuthProvider>

    <Navbar />
<LiveStatus />
<div className="pt-28">
  {children}
</div>

  </AuthProvider>
</div>
</body>
    </html>
  );
}
