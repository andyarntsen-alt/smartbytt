import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, source = "landing" } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "E-post er påkrevd." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { success: false, message: "Ugyldig e-postadresse." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: trimmedEmail, source });

    if (error) {
      // Handle duplicate email (unique constraint violation)
      if (error.code === "23505") {
        return NextResponse.json(
          { success: true, message: "Du er allerede på ventelisten!" },
          { status: 200 }
        );
      }

      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Noe gikk galt. Prøv igjen senere." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Du er nå på ventelisten! Vi tar kontakt snart." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Ugyldig forespørsel." },
      { status: 400 }
    );
  }
}
