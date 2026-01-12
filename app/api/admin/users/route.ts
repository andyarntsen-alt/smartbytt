import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isSupabaseConfigured = supabaseUrl && supabaseKey;

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(request: Request) {
  try {
    // Return empty data if Supabase is not configured
    if (!supabase) {
      return NextResponse.json({
        success: true,
        users: [],
        total: 0,
        page: 1,
        pageSize: 20,
        message: "Supabase er ikke konfigurert",
      });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search");

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { success: false, message: "Kunne ikke hente brukere" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: data,
      total: count,
      page,
      pageSize,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Ugyldig forespørsel" },
      { status: 400 }
    );
  }
}
