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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const categorySlug = formData.get("categorySlug") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Ingen fil lastet opp" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Ugyldig filtype" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Filen er for stor (maks 10 MB)" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filename = `${user.id}/${categorySlug}/${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(filename, file, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { success: false, message: "Kunne ikke laste opp fil" },
        { status: 500 }
      );
    }

    // Create document record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: document, error: docError } = await (supabase as any)
      .from("documents")
      .insert({
        user_id: user.id,
        file_path: filename,
        file_type: file.type,
        original_filename: file.name,
        ocr_status: "processing",
      })
      .select()
      .single();

    if (docError) {
      console.error("Document error:", docError);
      return NextResponse.json(
        { success: false, message: "Kunne ikke lagre dokument" },
        { status: 500 }
      );
    }

    // Extract data from invoice using OCR
    // In production, this would call OpenAI Vision API or similar
    // For now, we'll simulate extraction with mock data
    const extractedData = await extractInvoiceData(file, categorySlug);

    // Update document with extracted data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("documents")
      .update({
        extracted_data: extractedData,
        ocr_status: extractedData ? "completed" : "failed",
      })
      .eq("id", document.id);

    return NextResponse.json({
      success: true,
      documentId: document.id,
      extractedData,
    });
  } catch (error) {
    console.error("Invoice upload error:", error);
    return NextResponse.json(
      { success: false, message: "Noe gikk galt" },
      { status: 500 }
    );
  }
}

/**
 * Extract data from invoice using OCR
 * In production, this would use OpenAI Vision API or similar service
 */
async function extractInvoiceData(
  file: File,
  categorySlug: string
): Promise<Record<string, unknown> | null> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In production, you would:
  // 1. Convert file to base64
  // 2. Send to OpenAI Vision API with a prompt to extract invoice data
  // 3. Parse the response and return structured data

  // For demo purposes, return mock data based on category
  if (categorySlug === "strom") {
    return {
      providerName: "Fjordkraft",
      consumption: 1250,
      totalAmount: 1149,
      period: "November 2025",
      priceType: "spot",
      monthlyFee: 39,
      spotMarkup: 1.9,
    };
  }

  return null;
}
