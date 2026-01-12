import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Ikke autorisert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { categorySlug, extractedData } = body;

    if (!categorySlug || !extractedData) {
      return NextResponse.json(
        { success: false, message: "Mangler data" },
        { status: 400 }
      );
    }

    // Get category
    type Category = { id: string };
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle() as { data: Category | null; error: Error | null };

    if (categoryError) {
      console.error("Category fetch error:", categoryError);
      return NextResponse.json(
        { success: false, message: "Feil ved henting av kategori" },
        { status: 500 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Ugyldig kategori" },
        { status: 400 }
      );
    }

    // Check for existing contract
    type ExistingContract = { id: string };
    const { data: existingContract, error: contractError } = await supabase
      .from("user_contracts")
      .select("id")
      .eq("user_id", user.id)
      .eq("category_id", category.id)
      .maybeSingle() as { data: ExistingContract | null; error: Error | null };

    if (contractError) {
      console.error("Contract fetch error:", contractError);
    }

    // Prepare contract data based on category
    const contractData: Record<string, unknown> = {
      user_id: user.id,
      category_id: category.id,
      provider_name: extractedData.providerName || null,
      monthly_cost: extractedData.totalAmount || null,
    };

    if (categorySlug === "strom") {
      // Calculate yearly consumption from monthly
      const monthlyConsumption = extractedData.consumption || 0;
      contractData.yearly_consumption_kwh = monthlyConsumption * 12;
      contractData.price_type = extractedData.priceType || "spot";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let error: any;
    if (existingContract) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (supabase as any)
        .from("user_contracts")
        .update(contractData)
        .eq("id", existingContract.id);
      error = result.error;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (supabase as any)
        .from("user_contracts")
        .insert(contractData);
      error = result.error;
    }

    if (error) {
      console.error("Error saving contract:", error);
      return NextResponse.json(
        { success: false, message: "Kunne ikke lagre data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirm invoice error:", error);
    return NextResponse.json(
      { success: false, message: "Noe gikk galt" },
      { status: 500 }
    );
  }
}
