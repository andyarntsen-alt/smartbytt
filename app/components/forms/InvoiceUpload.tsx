"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface InvoiceUploadProps {
  categorySlug: string;
}

interface ExtractedInvoiceData {
  providerName?: string;
  consumption?: number;
  totalAmount?: number;
  period?: string;
  priceType?: string;
  monthlyFee?: number;
  spotMarkup?: number;
}

export default function InvoiceUpload({ categorySlug }: InvoiceUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Kun PDF- og bildefiler er støttet");
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Filen er for stor (maks 10 MB)");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress("Laster opp fil...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categorySlug", categorySlug);

      const res = await fetch("/api/upload/invoice", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Opplasting feilet");
      }

      setProgress("Analyserer faktura...");

      const data = await res.json();
      
      if (data.success && data.extractedData) {
        setExtractedData(data.extractedData);
        setProgress(null);
      } else {
        throw new Error("Kunne ikke lese fakturaen");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!extractedData) return;

    setLoading(true);
    setProgress("Lagrer informasjon...");

    try {
      const res = await fetch("/api/upload/invoice/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug,
          extractedData,
        }),
      });

      if (!res.ok) {
        throw new Error("Kunne ikke lagre informasjonen");
      }

      router.push(`/dashboard/${categorySlug}/sammenlign`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
      setProgress(null);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedData(null);
    setError(null);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show extracted data confirmation
  if (extractedData) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Vi fant følgende informasjon:
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          {extractedData.providerName && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Leverandør</span>
              <span className="font-medium dark:text-zinc-100">
                {String(extractedData.providerName)}
              </span>
            </div>
          )}
          {extractedData.consumption && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Forbruk</span>
              <span className="font-medium dark:text-zinc-100">
                {String(extractedData.consumption)} kWh
              </span>
            </div>
          )}
          {extractedData.totalAmount && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Beløp</span>
              <span className="font-medium dark:text-zinc-100">
                {String(extractedData.totalAmount)} kr
              </span>
            </div>
          )}
          {extractedData.period && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Periode</span>
              <span className="font-medium dark:text-zinc-100">
                {String(extractedData.period)}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Lagrer..." : "Bekreft og sammenlign"}
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Avbryt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {progress && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-900 dark:bg-sky-950">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 animate-spin text-sky-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-sky-700 dark:text-sky-400">{progress}</span>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          file
            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20"
            : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {file ? (
          <div>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <svg
                className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm font-medium dark:text-zinc-100">{file.name}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg
                className="h-6 w-6 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium dark:text-zinc-100">
              Klikk for å velge fil
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              PDF eller bilde (maks 10 MB)
            </p>
          </div>
        )}
      </div>

      {file && !progress && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Analyserer..." : "Analyser faktura"}
        </button>
      )}

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        Vi leser ut leverandør, forbruk og pris fra fakturaen.
        <br />
        Dataene brukes kun til å beregne ditt sparepotensial.
      </p>
    </div>
  );
}
