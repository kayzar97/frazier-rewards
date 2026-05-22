import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import Link from "next/link";

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

export default async function AdminDashboardPage() {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return (
      <main className="min-h-screen px-6 py-28 text-white">
        <h1 className="text-3xl font-bold text-red-400">Access denied</h1>
      </main>
    );
  }

  const { data: claims } = await supabaseAdmin
    .from("wager_reward_claims")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: fraudFlags } = await supabaseAdmin
    .from("fraud_flags")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: auditLogs } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const pendingClaims = claims?.filter((c) => c.status === "pending") || [];
  const reviewingClaims = claims?.filter((c) => c.status === "reviewing") || [];
  const approvedClaims = claims?.filter((c) => c.status === "approved") || [];
  const sentClaims = claims?.filter((c) => c.status === "sent") || [];

  const totalPendingValue = pendingClaims.reduce(
    (total, claim) => total + Number(claim.reward_amount || 0),
    0
  );

  const totalSentValue = sentClaims.reduce(
    (total, claim) => total + Number(claim.reward_amount || 0),
    0
  );

  const totalClaimValue = claims?.reduce(
    (total, claim) => total + Number(claim.reward_amount || 0),
    0
  ) || 0;

  const activeUserIds = new Set(claims?.map((claim) => claim.profile_id));
const activeUsers = activeUserIds.size;

const topClaimers = Object.values(
  (claims || []).reduce((acc: any, claim: any) => {
    const id = claim.profile_id;

    if (!acc[id]) {
      acc[id] = {
        profile_id: id,
        total: 0,
        count: 0,
      };
    }

    acc[id].total += Number(claim.reward_amount || 0);
    acc[id].count += 1;

    return acc;
  }, {})
)
  .sort((a: any, b: any) => b.total - a.total)
  .slice(0, 5);

  return (
    <main className="min-h-screen px-6 py-28 text-white">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-yellow-300">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-white/70">
          Overview of rewards, claims, fraud flags, and admin activity.
        </p>

        <div className="mb-8 mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2 font-bold text-red-300 hover:bg-red-500/20"
          >
            Users
          </Link>

          <Link
            href="/admin/claims"
            className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-2 font-bold text-yellow-300 hover:bg-yellow-400/20"
          >
            Reward Claims
          </Link>

          <Link
            href="/admin/fraud"
            className="rounded-xl border border-orange-500/40 bg-orange-500/10 px-5 py-2 font-bold text-orange-300 hover:bg-orange-500/20"
          >
            Fraud Review
          </Link>

          <Link
            href="/admin/audit-logs"
            className="rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-2 font-bold text-green-300 hover:bg-green-500/20"
          >
            Audit Logs
          </Link>
        </div>

<div className="grid gap-5 md:grid-cols-5">
          <div className="rounded-3xl border border-yellow-400/20 bg-black/50 p-6">
            <p className="text-sm text-white/50">Pending Claims</p>
            <h2 className="mt-2 text-3xl font-black text-yellow-300">
              {pendingClaims.length}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {money(totalPendingValue)} pending
            </p>
          </div>

          <div className="rounded-3xl border border-blue-400/20 bg-black/50 p-6">
            <p className="text-sm text-white/50">Reviewing</p>
            <h2 className="mt-2 text-3xl font-black text-blue-300">
              {reviewingClaims.length}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Claims being checked
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-black/50 p-6">
            <p className="text-sm text-white/50">Sent Rewards</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-300">
              {money(totalSentValue)}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {sentClaims.length} sent claims
            </p>
          </div>

          <div className="rounded-3xl border border-red-400/20 bg-black/50 p-6">
            <p className="text-sm text-white/50">Fraud Flags</p>
            <h2 className="mt-2 text-3xl font-black text-red-300">
              {fraudFlags?.length || 0}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Recent suspicious events
            </p>
          </div>
        </div>

<div className="rounded-3xl border border-purple-400/20 bg-black/50 p-6">
  <p className="text-sm text-white/50">Active Users</p>
  <h2 className="mt-2 text-3xl font-black text-purple-300">
    {activeUsers}
  </h2>
  <p className="mt-1 text-sm text-white/60">
    Users with claim activity
  </p>
</div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
            <p className="text-sm text-white/50">Approved Claims</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-300">
              {approvedClaims.length}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
            <p className="text-sm text-white/50">Total Claims</p>
            <h2 className="mt-2 text-3xl font-black text-white">
              {claims?.length || 0}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
            <p className="text-sm text-white/50">Total Reward Liability</p>
            <h2 className="mt-2 text-3xl font-black text-yellow-300">
              {money(totalClaimValue)}
            </h2>
          </div>
        </div>
<div className="mt-10 rounded-3xl border border-purple-500/30 bg-black/50 p-6">
  <h2 className="text-2xl font-black text-purple-300">
    Top Claimers
  </h2>

  <div className="mt-4 space-y-3">
    {topClaimers.length === 0 ? (
      <p className="text-white/50">No claimers yet.</p>
    ) : (
      topClaimers.map((user: any, index: number) => (
        <Link
          key={user.profile_id}
          href={`/admin/users/${user.profile_id}`}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4 hover:bg-white/5"
        >
          <div>
            <p className="font-bold text-white">
              #{index + 1} Profile ID {user.profile_id}
            </p>
            <p className="text-sm text-white/50">
              {user.count} claims
            </p>
          </div>

          <p className="font-black text-yellow-300">
            {money(user.total)}
          </p>
        </Link>
      ))
    )}
  </div>
</div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-orange-500/30 bg-[#140404]/80 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-orange-300">
                Recent Fraud Flags
              </h2>

              <Link
                href="/admin/fraud"
                className="text-sm font-bold text-orange-300 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {!fraudFlags?.length ? (
                <p className="text-white/50">No fraud flags yet.</p>
              ) : (
                fraudFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="rounded-xl border border-white/10 bg-black/40 p-4"
                  >
                    <p className="font-bold text-white">{flag.reason}</p>
                    <p className="text-sm text-orange-300">
                      Severity: {flag.severity || "medium"}
                    </p>
                    <p className="text-xs text-white/40">
                      Profile ID: {flag.profile_id || "-"} •{" "}
                      {new Date(flag.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-green-500/30 bg-[#04140a]/80 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-green-300">
                Recent Audit Logs
              </h2>

              <Link
                href="/admin/audit-logs"
                className="text-sm font-bold text-green-300 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {!auditLogs?.length ? (
                <p className="text-white/50">No audit logs yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-white/10 bg-black/40 p-4"
                  >
                    <p className="font-bold text-white">{log.action}</p>
                    <p className="text-sm text-white/60">
                      Actor: {log.actor || "-"}
                    </p>
                    <p className="text-xs text-white/40">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}