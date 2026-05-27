import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import RoleButtons from "@/components/RoleButtons";
import Link from "next/link";
import AdminSettingsToggles from "../../../components/AdminSettingsToggles";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const session = await auth();

  if (!session?.user?.name) return <AccessDenied />;

  const { data: currentProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("Discord_Username", session.user.name)
    .single();

  if (currentProfile?.role !== "admin") return <AccessDenied />;

  const query = searchParams?.q?.trim() || "";

  let request = supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (query) {
    request = request.or(
      `twitch_username.ilike.%${query}%,spartans_username.ilike.%${query}%,Discord_Username.ilike.%${query}%`
    );
  }

  const { data: profiles, error } = await request;

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 p-10 text-white">
        <p>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-black">Admin Panel</h1>

        <div className="mb-6 mt-6 flex gap-3">
          <Link
            href="/admin/users"
            className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-2 font-bold text-yellow-300"
          >
            Users
          </Link>

          <Link
            href="/admin/claims"
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2 font-bold text-red-300 hover:bg-red-500/20"
          >
            Reward Claims
          </Link>

          <Link
  href="/admin/audit-logs"
  className="rounded-xl border border-green-500 px-5 py-3 font-bold text-green-400 transition hover:bg-green-500/10"
>
  Audit Logs
</Link>

<Link
  href="/admin/fraud"
  className="rounded-xl border border-orange-500/40 bg-orange-500/10 px-5 py-2 font-bold text-orange-300 hover:bg-orange-500/20"
>
  Fraud Review
</Link>

<Link
  href="/admin/dashboard"
  className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-5 py-2 font-bold text-purple-300 hover:bg-purple-500/20"
>
  Dashboard
</Link>
<Link
  href="/admin/bonus-hunt"
  className="rounded-xl border border-pink-500/40 bg-pink-500/10 px-5 py-2 font-bold text-pink-300 hover:bg-pink-500/20"
>
  Bonus Hunt
</Link>
<Link
  href="/admin/giveaway-claims"
  className="rounded-xl border border-yellow-500/20 bg-[#140404]/80 px-4 py-2 text-sm font-black text-yellow-300 transition hover:bg-yellow-500/10"
>
  Giveaway Claims
</Link>
        </div>

        <AdminSettingsToggles />

        <h2 className="mb-4 mt-10 text-2xl font-black text-yellow-300">
          All Users
        </h2>

        <form className="mb-6 flex gap-3">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search Twitch, Discord, or Spartans username..."
            className="w-full rounded-xl border border-red-500/40 bg-black/50 px-5 py-3 text-white outline-none focus:border-red-400"
          />

          <button
            type="submit"
            className="rounded-xl bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-400"
          >
            Search
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-red-500/40 bg-black/40 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-500/10 text-red-300">
              <tr>
                <th className="p-4">Twitch</th>
                <th className="p-4">Discord</th>
                <th className="p-4">Spartans Username</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Role</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {profiles?.map((user: any) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="flex items-center gap-3 p-4">
                    {user.twitch_image && (
                      <img
                        src={user.twitch_image}
                        alt={user.twitch_username || "Twitch user"}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <span className="font-bold">
                      {user.twitch_username ||
                        user.Discord_Username ||
                        "Unknown"}
                    </span>
                  </td>

                  <td className="p-4 text-zinc-300">
                    {user.Discord_Username || "Not linked"}
                  </td>

                  <td className="p-4 text-zinc-300">
                    {user.spartans_username || "Not linked"}
                  </td>

                  <td className="p-4 text-zinc-400">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "Unknown"}
                  </td>

                  <td className="p-4 text-sm font-bold text-yellow-300">
                    {(user.role || "user").toUpperCase()}
                  </td>

                  <td className="px-4 py-3 align-middle text-center">
                    <RoleButtons profileId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function AccessDenied() {
  return (
    <main className="min-h-screen bg-zinc-950 p-10 text-white">
      <h1 className="text-3xl font-bold">Access denied</h1>
      <p className="mt-2 text-zinc-300">
        You do not have permission to view this page.
      </p>
    </main>
  );
}