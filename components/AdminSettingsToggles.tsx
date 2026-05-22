"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsToggles() {
  const [settings, setSettings] = useState<
    Record<string, boolean>
  >({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();

        const formatted: Record<string, boolean> = {};

        for (const setting of data.settings || []) {
          formatted[setting.key] = setting.value;
        }

        setSettings(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  async function toggleSetting(
    key: string,
    value: boolean
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-yellow-500/30 bg-black/40 p-6 text-yellow-300">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-yellow-500/30 bg-black/40 p-6 shadow-[0_0_20px_rgba(250,204,21,0.15)]">
      <h2 className="mb-5 text-2xl font-black text-yellow-300">
        Site Settings
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(settings).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3"
          >
            <div>
              <p className="font-bold text-white">
                {key.replaceAll("_", " ").toUpperCase()}
              </p>

              <p className="text-sm text-zinc-400">
                Toggle this feature on or off
              </p>
            </div>

            <button
              onClick={() =>
                toggleSetting(key, !value)
              }
              className={`rounded-xl px-4 py-2 text-sm font-black transition-all ${
                value
                  ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
              }`}
            >
              {value ? "ENABLED" : "DISABLED"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}