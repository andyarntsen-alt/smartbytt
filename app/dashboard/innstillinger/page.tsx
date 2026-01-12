"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const profileResult = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = profileResult.data as any;

    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setPostalCode(profile.postal_code || "");
    }

    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Check if profile exists
    const existingProfileResult = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingProfile = existingProfileResult.data as any;

    const profileData = {
      full_name: fullName || null,
      phone: phone || null,
      postal_code: postalCode || null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let error: any;
    if (existingProfile) {
      // Update existing profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (supabase as any)
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);
      error = result.error;
    } else {
      // Create new profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (supabase as any)
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          ...profileData,
        });
      error = result.error;
    }

    setSaving(false);
    if (error) {
      console.error("Error saving profile:", error);
      alert("Kunne ikke lagre endringene: " + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-zinc-600 dark:text-zinc-400">Laster...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight dark:text-zinc-100">
        Innstillinger
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Administrer din profil og preferanser
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        {/* Profile Section */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold dark:text-zinc-100">Profil</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Din personlige informasjon
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Fullt navn
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="Ola Nordmann"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Telefonnummer
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="+47 123 45 678"
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Postnummer
              </label>
              <input
                id="postalCode"
                type="text"
                maxLength={4}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                className="mt-1 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="0000"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          {success && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              ✓ Endringene ble lagret
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? "Lagrer..." : "Lagre endringer"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
          Faresone
        </h2>
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">
          Slett kontoen din og alle tilknyttede data
        </p>
        <button className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950">
          Slett konto
        </button>
      </div>
    </div>
  );
}
