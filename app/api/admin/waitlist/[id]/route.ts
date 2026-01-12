import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Check if Supabase is configured (support both variable naming conventions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseKey;

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Return error if Supabase is not configured
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: "Supabase er ikke konfigurert" },
        { status: 503 }
      );
    }
    const { id } = await params;

    const { error } = await supabase.from("waitlist").delete().eq("id", id);

    if (error) {
      console.error("Error deleting waitlist entry:", error);
      return NextResponse.json(
        { success: false, message: "Kunne ikke slette oppføring" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Ugyldig forespørsel" },
      { status: 400 }
    );
  }
}
