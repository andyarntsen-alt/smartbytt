"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserContract } from "@/lib/supabase/types";

// Postal code to price area mapping
const POSTAL_TO_PRICE_AREA: Record<string, string> = {
  "0": "NO1", // Oslo
  "1": "NO1",
  "2": "NO1",
  "3": "NO2", // Kristiansand
  "4": "NO2",
  "5": "NO5", // Bergen
  "6": "NO3", // Trondheim
  "7": "NO3",
  "8": "NO4", // Tromsø
  "9": "NO4",
};

const PRICE_AREA_NAMES: Record<string, string> = {
  NO1: "Sør-Norge Øst (NO1)",
  NO2: "Sør-Norge Vest (NO2)",
  NO3: "Midt-Norge (NO3)",
  NO4: "Nord-Norge (NO4)",
  NO5: "Vest-Norge (NO5)",
};

interface ElectricityFormProps {
  existingContract?: UserContract | null;
}

export default function ElectricityForm({ existingContract }: ElectricityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [postalCode, setPostalCode] = useState(existingContract?.postal_code || "");
  const [yearlyConsumption, setYearlyConsumption] = useState(
    existingContract?.yearly_consumption_kwh?.toString() || ""
  );
  const [providerName, setProviderName] = useState(existingContract?.provider_name || "");
  const [priceType, setPriceType] = useState<"spot" | "fixed" | "variable">(
    (existingContract?.price_type as "spot" | "fixed" | "variable") || "spot"
  );
  const [monthlyCost, setMonthlyCost] = useState(
    existingContract?.monthly_cost?.toString() || ""
  );

  // Calculate price area from postal code
  const priceArea = postalCode.length >= 1 
    ? POSTAL_TO_PRICE_AREA[postalCode[0]] || "NO1"
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!postalCode || postalCode.length !== 4) {
      setError("Postnummer må være 4 siffer");
      setLoading(false);
      return;
    }

    if (!yearlyConsumption || parseInt(yearlyConsumption) <= 0) {
      setError("Årlig forbruk må være større enn 0");
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Du må være logget inn");
      setLoading(false);
      return;
    }

    // Ensure profile exists (required for foreign key constraint)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileError } = await (supabase as any)
        .from("profiles")
        .insert({ id: user.id, email: user.email || "" });
      
      if (profileError) {
        console.error("Error creating profile:", profileError);
        setError("Kunne ikke opprette brukerprofil");
        setLoading(false);
        return;
      }
    }

    // Get electricity category
    const categoryResult = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "strom")
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const category = categoryResult.data as any;

    if (!category) {
      setError("Kunne ikke finne kategori");
      setLoading(false);
      return;
    }

    const contractData = {
      user_id: user.id,
      category_id: category.id,
      provider_name: providerName || null,
      price_type: priceType,
      monthly_cost: monthlyCost ? parseFloat(monthlyCost) : null,
      yearly_consumption_kwh: parseInt(yearlyConsumption),
      postal_code: postalCode,
      price_area: priceArea,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    if (existingContract) {
      // Update existing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result = await (supabase as any)
        .from("user_contracts")
        .update(contractData)
        .eq("id", existingContract.id);
    } else {
      // Insert new
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result = await (supabase as any).from("user_contracts").insert(contractData);
    }

    if (result.error) {
      console.error("Error saving contract:", {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details,
        hint: result.error.hint,
      });
      setError("Kunne ikke lagre informasjonen: " + (result.error.message || "Ukjent feil"));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard/strom/sammenlign");
      router.refresh();
    }, 1500);
  };

  if (success) {
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
        <div className="mb-2 text-2xl">✓</div>
        <p className="font-medium text-emerald-700 dark:text-emerald-400">
          Informasjon lagret!
        </p>
        <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-500">
          Omdirigerer til sammenligning...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

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
          inputMode="numeric"
          maxLength={4}
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
          required
          className="mt-1 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          placeholder="0000"
        />
        {priceArea && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Prisområde: {PRICE_AREA_NAMES[priceArea]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="yearlyConsumption"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Årlig forbruk (kWh)
        </label>
        <input
          id="yearlyConsumption"
          type="number"
          value={yearlyConsumption}
          onChange={(e) => setYearlyConsumption(e.target.value)}
          required
          className="mt-1 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          placeholder="16000"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Gjennomsnittlig norsk husholdning bruker ca. 16 000 kWh/år
        </p>
      </div>

      <div>
        <label
          htmlFor="providerName"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Nåværende leverandør (valgfritt)
        </label>
        <input
          id="providerName"
          type="text"
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          placeholder="f.eks. Tibber, Fjordkraft"
        />
      </div>

      <div>
        <label
          htmlFor="priceType"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Pristype
        </label>
        <select
          id="priceType"
          value={priceType}
          onChange={(e) => setPriceType(e.target.value as "spot" | "fixed" | "variable")}
          className="mt-1 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="spot">Spotpris</option>
          <option value="fixed">Fastpris</option>
          <option value="variable">Variabel</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="monthlyCost"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Månedlig kostnad (kr) (valgfritt)
        </label>
        <input
          id="monthlyCost"
          type="number"
          value={monthlyCost}
          onChange={(e) => setMonthlyCost(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          placeholder="1149"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Brukes for å beregne ditt sparepotensial
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "Lagrer..." : existingContract ? "Oppdater" : "Sammenlign tilbud"}
      </button>
    </form>
  );
}
