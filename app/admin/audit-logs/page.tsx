import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

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

export default async function AuditLogsPage() {
  const isAdmin = await requireAdmin();

  if (!isAdmin) {
    return (
      <main className="min-h-screen px-6 py-28 text-white">
        <h1 className="text-3xl font-bold text-red-400">Access denied</h1>
      </main>
    );
  }

  const { data: logs, error } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-yellow-300">
          Audit Logs
        </h1>

        <p className="mt-2 text-zinc-400">
          View recent backend/admin activity.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-300">
            {error.message}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-yellow-400/20 bg-black/50 shadow-[0_0_30px_rgba(250,204,21,0.08)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-yellow-400/10 text-yellow-300">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Action</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Target</th>
                <th className="p-4">Metadata</th>
              </tr>
            </thead>

            <tbody>
              {logs?.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="p-4 text-zinc-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>

                  <td className="p-4 font-bold text-white">
                    {log.action}
                  </td>

                  <td className="p-4 text-zinc-300">
                    {log.actor || "-"}
                  </td>

                  <td className="p-4 text-zinc-300">
                    {log.target || "-"}
                  </td>

                  <td className="max-w-md p-4 text-xs text-zinc-400">
                    <pre className="whitespace-pre-wrap break-words">
                      {log.metadata
                        ? JSON.stringify(log.metadata, null, 2)
                        : "-"}
                    </pre>
                  </td>
                </tr>
              ))}

              {!logs?.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-zinc-500"
                  >
                    No audit logs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}