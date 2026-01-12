import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Check if Supabase is configured (support both variable naming conventions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseKey;

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET() {
  try {
    // Return empty CSV if Supabase is not configured
    if (!supabase) {
      const csvContent = "id,email,source,created_at\n";
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="waitlist-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching waitlist:", error);
      return NextResponse.json(
        { success: false, message: "Kunne ikke hente venteliste" },
        { status: 500 }
      );
    }

    // Create CSV content
    const headers = ["id", "email", "source", "created_at"];
    const csvRows = [headers.join(",")];

    for (const entry of data || []) {
      const row = headers.map((header) => {
        const value = entry[header as keyof typeof entry];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || "");
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="waitlist-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Ugyldig forespørsel" },
      { status: 400 }
    );
  }
}
