import { NextResponse } from "next/server";
import {
  fetchSpotPrices,
  getCurrentSpotPrice,
  type PriceArea,
} from "@/lib/api/electricity-prices";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const priceArea = (searchParams.get("area") || "NO1") as PriceArea;
  const dateParam = searchParams.get("date");

  const date = dateParam ? new Date(dateParam) : new Date();

  try {
    const [dailyPrices, currentPrice] = await Promise.all([
      fetchSpotPrices(date, priceArea),
      getCurrentSpotPrice(priceArea),
    ]);

    if (!dailyPrices) {
      return NextResponse.json(
        { error: "Kunne ikke hente strømpriser" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...dailyPrices,
      currentPrice,
      // Convert to øre for display
      averageOre: Math.round(dailyPrices.average * 100),
      currentOre: currentPrice ? Math.round(currentPrice * 100) : null,
      minOre: Math.round(dailyPrices.min * 100),
      maxOre: Math.round(dailyPrices.max * 100),
      source: "hvakosterstrommen.no",
      disclaimer: "Spotpriser fra Nord Pool via hvakosterstrommen.no. Påslag og avgifter kommer i tillegg.",
    });
  } catch (error) {
    console.error("Error in electricity prices API:", error);
    return NextResponse.json(
      { error: "Intern feil ved henting av priser" },
      { status: 500 }
    );
  }
}
