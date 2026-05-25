import { NextResponse } from "next/server";

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ritmolab.vercel.app";
  return NextResponse.json({ url: `${siteUrl}/checkout/success`, note: "Conectar acá Stripe Checkout o Mercado Pago Preference cuando tengas las claves." });
}
