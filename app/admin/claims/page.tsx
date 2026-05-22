"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Claim = {
  id: number;
  tier: number;
  threshold: number;
  reward_amount: number;
  status: string;
  created_at: string;
  profile_id: number;

admin_note?: string;
sent_by?: string;
sent_at?: string;
reviewed_at?: string;

  profiles?: {
    Discord_Username?: string;
    spartans_username?: string;
    twitch_username?: string;
  };
};

function money(value: number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
const [searchTerm, setSearchTerm] = useState("");

  async function fetchClaims() {
    const res = await fetch("/api/admin/claims");
    const data = await res.json();

    setClaims(data.claims || []);
    setLoading(false);
  }

async function updateClaim(claimId: number, status: string) {
  const adminNote = prompt(
    `Optional admin note for ${status.toUpperCase()}:`
  );

  const confirmed = confirm(`Mark this claim as ${status.toUpperCase()}?`);
  if (!confirmed) return;

  const res = await fetch("/api/admin/claims/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ claimId, status, adminNote }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to update claim");
    return;
  }

  setClaims((prev) =>
    prev.map((claim) =>
      claim.id === claimId
        ? {
            ...claim,
            status,
            admin_note: adminNote || claim.admin_note,
            sent_by: status === "sent" ? "You" : claim.sent_by,
            sent_at:
              status === "sent" ? new Date().toISOString() : claim.sent_at,
            reviewed_at: new Date().toISOString(),
          }
        : claim
    )
  );
}

  useEffect(() => {
    fetchClaims();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-28 text-center text-white">
        Loading claims...
      </main>
    );
  }
const filteredClaims = claims.filter((claim) => {
  const search = searchTerm.toLowerCase();

  const matchesStatus =
    statusFilter === "all" || claim.status === statusFilter;

  const matchesSearch =
    claim.profile_id.toString().includes(search) ||
    claim.profiles?.Discord_Username?.toLowerCase().includes(search) ||
    claim.profiles?.twitch_username?.toLowerCase().includes(search) ||
    claim.profiles?.spartans_username?.toLowerCase().includes(search);

  return matchesStatus && matchesSearch;
});
  return (
    <main className="min-h-screen px-6 py-28 text-white">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-yellow-300">
          Reward Claims
        </h1>

        <p className="mt-2 text-white/70">
          Approve, reject, or mark wager rewards as paid.
        </p>

<div className="mb-6 mt-6 flex gap-3">
  <Link
    href="/admin/users"
    className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2 font-bold text-red-300 hover:bg-red-500/20"
  >
    Users
  </Link>

  <Link
    href="/admin/claims"
    className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-2 font-bold text-yellow-300"
  >
    Reward Claims
  </Link>
</div>
<div className="mt-8 flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-black/40 p-4 md:flex-row md:items-center md:justify-between">
  <input
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search Discord, Twitch, Spartans, or Profile ID..."
    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-yellow-400/50 md:max-w-md"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-white outline-none focus:border-yellow-400/50"
  >
    <option value="all">All Statuses</option>
    <option value="pending">Pending</option>
    <option value="reviewing">Reviewing</option>
    <option value="approved">Approved</option>
    <option value="sent">Sent</option>
    <option value="denied">Denied</option>
  </select>
</div>
        <div className="mt-8 overflow-hidden rounded-3xl border border-red-500/30 bg-[#140404]/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-950/50 text-yellow-300">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Spartans</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Reward</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
<th className="p-4">Admin Info</th>
<th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
{filteredClaims.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-white/60" colSpan={7}>
                    No reward claims yet.
                  </td>
                </tr>
              ) : (
filteredClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="border-t border-red-500/20"
                  >
                    <td className="p-4">
<Link
  href={`/admin/users/${claim.profile_id}`}
  className="font-bold text-yellow-300 hover:underline"
>
  {claim.profiles?.Discord_Username || "Unknown"}
</Link>
                      <p className="text-xs text-white/40">
                        {claim.profiles?.twitch_username || "No Twitch"}
                      </p>
                    </td>

<td className="p-4">
  <div className="flex items-center gap-2">
    <span>{claim.profiles?.spartans_username || "Not set"}</span>

    {claim.profiles?.spartans_username && (
      <button
        onClick={() => {
          navigator.clipboard.writeText(claim.profiles?.spartans_username || "");
          alert("Spartans username copied!");
        }}
        className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 text-xs font-bold text-yellow-300 hover:bg-yellow-400/20"
      >
        Copy
      </button>
    )}
  </div>
</td>

                    <td className="p-4 font-black text-yellow-300">
                      Tier {claim.tier}
                    </td>

                    <td className="p-4 font-black">
                      {money(claim.reward_amount)}
                    </td>

                    <td className="p-4">
<span
  className={`rounded-lg px-3 py-1 text-xs font-black ${
    claim.status === "pending"
      ? "bg-yellow-400/10 text-yellow-300"
      : claim.status === "reviewing"
      ? "bg-blue-500/10 text-blue-300"
      : claim.status === "approved"
      ? "bg-emerald-500/10 text-emerald-300"
      : claim.status === "sent"
      ? "bg-white/10 text-white"
      : claim.status === "denied"
      ? "bg-red-500/10 text-red-300"
      : "bg-zinc-500/10 text-zinc-300"
  }`}
>
  {claim.status.toUpperCase()}
</span>
                    </td>

                    <td className="p-4 text-white/60">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
<td className="p-4 text-xs text-white/60">

  {claim.admin_note ? (
    <div>
      <p className="font-bold text-yellow-300">Note</p>
      <p>{claim.admin_note}</p>
    </div>
  ) : (
    "-"
  )}

  {claim.sent_by && (
    <div className="mt-2">
      <p className="font-bold text-emerald-300">
        Sent by {claim.sent_by}
      </p>

      {claim.sent_at && (
        <p>
          {new Date(claim.sent_at).toLocaleString()}
        </p>
      )}
    </div>
  )}

</td>
                    <td className="p-4">
<div className="flex flex-wrap justify-center gap-2">

  <button
    onClick={() => updateClaim(claim.id, "reviewing")}
    className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300 hover:bg-blue-500/20"
  >
    Reviewing
  </button>

  <button
    onClick={() => updateClaim(claim.id, "approved")}
    className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20"
  >
    Approve
  </button>

  <button
    onClick={() => updateClaim(claim.id, "sent")}
    className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20"
  >
    Mark Sent
  </button>

  <button
    onClick={() => updateClaim(claim.id, "denied")}
    className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-500/20"
  >
    Deny
  </button>

</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}