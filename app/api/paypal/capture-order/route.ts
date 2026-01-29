import { NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = body?.orderId as string | undefined;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const capture = await captureOrder(orderId);
    return NextResponse.json({ capture });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
