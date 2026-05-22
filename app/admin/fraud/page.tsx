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

export default async function FraudPage() {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return (
      <main className="min-h-screen px-6 py-28 text-white">
        <h1 className="text-3xl font-bold text-red-400">Access denied</h1>
      </main>
    );
  }

  const { data: flags, error } = await supabaseAdmin
    .from("fraud_flags")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen px-6 py-28 text-white">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-yellow-300">
          Fraud Review
        </h1>

        <p className="mt-2 text-white/70">
          Review suspicious claim activity, rate-limit abuse, and security flags.
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
            className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-2 font-bold text-yellow-300 hover:bg-yellow-400/20"
          >
            Reward Claims
          </Link>

          <Link
            href="/admin/audit-logs"
            className="rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-2 font-bold text-green-300 hover:bg-green-500/20"
          >
            Audit Logs
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-300">
            {error.message}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-3xl border border-red-500/30 bg-[#140404]/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-950/50 text-yellow-300">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Profile ID</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Metadata</th>
              </tr>
            </thead>

            <tbody>
              {!flags?.length ? (
                <tr>
                  <td className="p-6 text-center text-white/60" colSpan={5}>
                    No fraud flags yet.
                  </td>
                </tr>
              ) : (
                flags.map((flag) => (
                  <tr
                    key={flag.id}
                    className="border-t border-red-500/20 hover:bg-white/5"
                  >
                    <td className="p-4 text-white/60">
                      {new Date(flag.created_at).toLocaleString()}
                    </td>

<td className="p-4 font-bold">
  {flag.profile_id ? (
    <Link
      href={`/admin/users/${flag.profile_id}`}
      className="text-yellow-300 hover:underline"
    >
      #{flag.profile_id}
    </Link>
  ) : (
    "-"
  )}
</td>

                    <td className="p-4 font-bold text-white">
                      {flag.reason}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-black ${
                          flag.severity === "critical"
                            ? "bg-red-500/20 text-red-300"
                            : flag.severity === "high"
                            ? "bg-orange-500/20 text-orange-300"
                            : "bg-yellow-400/10 text-yellow-300"
                        }`}
                      >
                        {flag.severity?.toUpperCase() || "MEDIUM"}
                      </span>
                    </td>

                    <td className="max-w-md p-4 text-xs text-white/60">
                      <pre className="whitespace-pre-wrap break-words">
                        {flag.metadata
                          ? JSON.stringify(flag.metadata, null, 2)
                          : "-"}
                      </pre>
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