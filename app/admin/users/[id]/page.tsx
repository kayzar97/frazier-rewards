import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import Link from "next/link";
import { calculateTrustScore } from "@/lib/trustScore";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.name) return false;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .single();

  return profile?.role === "admin";
}

function money(value: number) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function AdminUserProfilePage({
  params,
}: {
params: Promise<{ id: string }>;
}) {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return (
      <main className="min-h-screen px-6 py-28 text-white">
        <h1 className="text-3xl font-bold text-red-400">Access denied</h1>
      </main>
    );
  }

const resolvedParams = await params;
const profileId = Number(resolvedParams.id);

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  const { data: claims } = await supabaseAdmin
    .from("wager_reward_claims")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  const { data: fraudFlags } = await supabaseAdmin
    .from("fraud_flags")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  const { data: securityLogs } = await supabaseAdmin
    .from("security_logs")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(25);

    const trust = calculateTrustScore({
  claims: claims || [],
  fraudFlags: fraudFlags || [],
  securityLogs: securityLogs || [],
});

  if (!profile) {
    return (
      <main className="min-h-screen px-6 py-28 text-white">
        <h1 className="text-3xl font-bold text-red-400">User not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-28 text-white">
      <section className="mx-auto max-w-7xl">
        <Link
          href="/admin/users"
          className="text-sm font-bold text-yellow-300 hover:underline"
        >
          ← Back to Users
        </Link>

        <h1 className="mt-6 text-4xl font-black text-yellow-300">
          User Profile #{profile.id}
        </h1>

        <p className="mt-2 text-white/60">
          Admin overview for claims, fraud flags, and security logs.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-400/20 bg-black/50 p-6">
            <h2 className="text-xl font-black text-yellow-300">Account</h2>

            <div className="mt-4 space-y-2 text-sm">
              <p><b>Discord:</b> {profile.Discord_Username || "-"}</p>
              <p><b>Twitch:</b> {profile.twitch_username || "-"}</p>
              <p><b>Spartans:</b> {profile.spartans_username || "-"}</p>
              <p><b>Role:</b> {profile.role || "user"}</p>
              <p><b>Profile ID:</b> {profile.id}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-black/50 p-6">
            <h2 className="text-xl font-black text-emerald-300">Claims</h2>

            <div className="mt-4 space-y-2 text-sm">
              <p><b>Total Claims:</b> {claims?.length || 0}</p>
              <p>
                <b>Total Claimed:</b>{" "}
                {money(
                  claims?.reduce(
                    (total, claim) => total + Number(claim.reward_amount || 0),
                    0
                  ) || 0
                )}
              </p>
              <p>
                <b>Pending:</b>{" "}
                {claims?.filter((claim) => claim.status === "pending").length || 0}
              </p>
              <p>
                <b>Sent:</b>{" "}
                {claims?.filter((claim) => claim.status === "sent").length || 0}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-red-400/20 bg-black/50 p-6">
            <h2 className="text-xl font-black text-red-300">Risk</h2>

            <div className="mt-4 space-y-2 text-sm">
                <p>
  <b>Trust Score:</b>{" "}
  <span className={`font-black ${trust.color}`}>
    {trust.score}/100 — {trust.label}
  </span>
</p>
              <p><b>Fraud Flags:</b> {fraudFlags?.length || 0}</p>
              <p><b>Security Logs:</b> {securityLogs?.length || 0}</p>
              <p>
                <b>Risk Level:</b>{" "}
                {(fraudFlags?.length || 0) >= 3
                  ? "High"
                  : (fraudFlags?.length || 0) >= 1
                  ? "Medium"
                  : "Low"}
              </p>
            </div>
          </div>
        </div>
<div className="mt-8 rounded-3xl border border-yellow-400/20 bg-black/50 p-6">
  <h2 className="text-xl font-black text-yellow-300">Admin Note</h2>

  <form
    action={async (formData) => {
      "use server";

      const adminNote = String(formData.get("adminNote") || "");

await supabaseAdmin
  .from("profiles")
  .update({ admin_note: adminNote || null })
  .eq("id", profileId);
    }}
    className="mt-4"
  >
    <textarea
      name="adminNote"
      defaultValue={profile.admin_note || ""}
      className="min-h-32 w-full rounded-xl border border-white/10 bg-black p-4 text-sm text-white outline-none focus:border-yellow-400/50"
      placeholder="Add internal admin notes about this user..."
    />

    <button
      type="submit"
      className="mt-3 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-2 font-bold text-yellow-300 hover:bg-yellow-400/20"
    >
      Save Note
    </button>
  </form>
</div>
        <div className="mt-10 rounded-3xl border border-red-500/30 bg-[#140404]/80 p-6">
          <h2 className="text-2xl font-black text-yellow-300">Reward Claims</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-yellow-300">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Reward</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Admin Note</th>
                </tr>
              </thead>

              <tbody>
                {!claims?.length ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-white/50">
                      No claims found.
                    </td>
                  </tr>
                ) : (
                  claims.map((claim) => (
                    <tr key={claim.id} className="border-t border-white/10">
                      <td className="p-3 text-white/60">
                        {new Date(claim.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">Tier {claim.tier}</td>
                      <td className="p-3">{money(claim.reward_amount)}</td>
                      <td className="p-3 font-bold">{claim.status}</td>
                      <td className="p-3 text-white/60">
                        {claim.admin_note || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-orange-500/30 bg-black/50 p-6">
          <h2 className="text-2xl font-black text-orange-300">Fraud Flags</h2>

          <div className="mt-4 space-y-3">
            {!fraudFlags?.length ? (
              <p className="text-white/50">No fraud flags.</p>
            ) : (
              fraudFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="font-bold text-white">{flag.reason}</p>
                  <p className="text-sm text-orange-300">
                    Severity: {flag.severity}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(flag.created_at).toLocaleString()}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-white/50">
                    {flag.metadata
                      ? JSON.stringify(flag.metadata, null, 2)
                      : "-"}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-blue-500/30 bg-black/50 p-6">
          <h2 className="text-2xl font-black text-blue-300">Security Logs</h2>

          <div className="mt-4 space-y-3">
            {!securityLogs?.length ? (
              <p className="text-white/50">No security logs.</p>
            ) : (
              securityLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="font-bold text-white">{log.action}</p>
                  <p className="text-sm text-white/60">IP: {log.ip || "-"}</p>
                  <p className="text-xs text-white/40">
                    {log.user_agent || "-"}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}