import { NextResponse } from "next/server";
import { createOrder } from "@/lib/paypal";
import { priceFor, PackageChoice } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const packageChoice = body?.packageChoice as PackageChoice | undefined;

    const price = priceFor(packageChoice);
    if (!price) {
      return NextResponse.json({ error: "Invalid packageChoice" }, { status: 400 });
    }

    // IMPORTANT: price comes from server map, not from client
    const order = await createOrder(price.toFixed(2), `Custom Songs: ${packageChoice}`);

    return NextResponse.json({ id: order.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
