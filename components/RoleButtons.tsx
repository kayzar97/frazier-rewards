"use client";

export default function RoleButtons({ profileId }: { profileId: string }) {
  async function updateRole(role: "user" | "vip" | "admin") {
    const confirmed = confirm(
      `Are you sure you want to change this user to ${role.toUpperCase()}?`
    );

    if (!confirmed) return;

    const res = await fetch("/api/admin/users/role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profileId, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Failed to update role");
      return;
    }

    alert(`Role changed to ${role.toUpperCase()}`);
    window.location.reload();
  }

return (
  <div className="flex items-center justify-center gap-2">
    <button
      type="button"
      onClick={() => updateRole("user")}
      className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
    >
      User
    </button>

    <button
      type="button"
      onClick={() => updateRole("vip")}
      className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300 hover:bg-yellow-400/20"
    >
      VIP
    </button>

    <button
      type="button"
      onClick={() => updateRole("admin")}
      className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20"
    >
      Admin
    </button>
  </div>
);
}