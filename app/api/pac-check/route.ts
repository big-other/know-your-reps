import { NextRequest, NextResponse } from "next/server";
import { checkPacMoney } from "@/lib/pac-matcher";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  const state = request.nextUrl.searchParams.get("state");

  if (!name) {
    return NextResponse.json(
      { error: "name parameter is required" },
      { status: 400 }
    );
  }

  const result = checkPacMoney(name, state || undefined);

  if (result) {
    return NextResponse.json({
      hasPacMoney: true,
      ...result,
    });
  }

  return NextResponse.json({
    hasPacMoney: false,
    contributions: [],
    totalAmount: 0,
  });
}
