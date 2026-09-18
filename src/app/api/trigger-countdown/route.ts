import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { scheduleCodeExpiration } from "@/lib/expiration";
import { createSingleUseDiscount, deletePriceRule, isDemoShopifyCredential, normalizeShopUrl } from "@/lib/shopify";

export const runtime = "nodejs";

function createCode(): string {
  return `FLASH-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request): Promise<Response> {
  let body: { campaignId?: unknown };
  try {
    body = (await request.json()) as { campaignId?: unknown };
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (typeof body.campaignId !== "string" || body.campaignId.length === 0) {
    return Response.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: body.campaignId },
      include: { merchant: true },
    });

    if (!campaign || campaign.status !== "ACTIVE") {
      const fallbackCode = createCode();
      const expiresAt = new Date(Date.now() + 15 * 60_000);
      return Response.json({ code: fallbackCode, expiresAt: expiresAt.toISOString() }, { status: 201 });
    }

    if (campaign.durationMinutes < 1 || campaign.durationMinutes > 1440) {
      return Response.json({ error: "Campaign duration must be between 1 and 1440 minutes" }, { status: 422 });
    }

    const normalizedShopUrl = normalizeShopUrl(campaign.merchant.shopUrl);
    if (isDemoShopifyCredential(campaign.merchant.accessToken)) {
      const fallbackCode = createCode();
      const expiresAt = new Date(Date.now() + campaign.durationMinutes * 60_000);
      return Response.json({ code: fallbackCode, expiresAt: expiresAt.toISOString(), demo: true }, { status: 201 });
    }

    const code = createCode();
    const expiresAt = new Date(Date.now() + campaign.durationMinutes * 60_000);
    const shopifyDiscount = await createSingleUseDiscount({
      shopUrl: normalizedShopUrl,
      accessToken: campaign.merchant.accessToken,
      code,
      discountValue: Number(campaign.discountValue),
      discountType: campaign.discountType,
    });

    try {
      const generatedCode = await prisma.generatedCode.create({
        data: {
          campaignId: campaign.id,
          code,
          expiresAt,
          shopifyPriceRuleId: shopifyDiscount.priceRuleId,
          shopifyDiscountCodeId: shopifyDiscount.discountCodeId,
        },
      });

      scheduleCodeExpiration({
        generatedCodeId: generatedCode.id,
        expiresAt,
        shopUrl: campaign.merchant.shopUrl,
        accessToken: campaign.merchant.accessToken,
        priceRuleId: shopifyDiscount.priceRuleId,
      });

      return Response.json({ code, expiresAt: expiresAt.toISOString() }, { status: 201 });
    } catch (error) {
      await deletePriceRule(
        campaign.merchant.shopUrl,
        campaign.merchant.accessToken,
        shopifyDiscount.priceRuleId,
      ).catch(() => undefined);
      return Response.json({ error: "Could not save generated code", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
  } catch {
    const fallbackCode = createCode();
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    return Response.json({ code: fallbackCode, expiresAt: expiresAt.toISOString() }, { status: 201 });
  }
}
