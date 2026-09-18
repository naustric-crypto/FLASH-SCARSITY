import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isValidHmac(rawBody: string, receivedHmac: string | null): boolean {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret || !receivedHmac) return false;

  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const expected = Buffer.from(digest, "utf8");
  const received = Buffer.from(receivedHmac, "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  if (!isValidHmac(rawBody, request.headers.get("x-shopify-hmac-sha256"))) {
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const shopDomain = request.headers.get("x-shopify-shop-domain");
  if (!shopDomain) return Response.json({ error: "Missing shop domain" }, { status: 400 });

  await prisma.merchant.deleteMany({ where: { shopUrl: shopDomain.toLowerCase() } });
  return new Response(null, { status: 204 });
}
