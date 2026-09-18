import { prisma } from "@/lib/prisma";
import { deletePriceRule } from "@/lib/shopify";

export async function cleanupExpiredCodes(): Promise<number> {
  const expiredCodes = await prisma.generatedCode.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: new Date() },
    },
    include: {
      campaign: {
        include: { merchant: true },
      },
    },
  });

  for (const generatedCode of expiredCodes) {
    const merchant = generatedCode.campaign?.merchant;
    const shopUrl = merchant?.shopUrl;
    const accessToken = merchant?.accessToken;
    const priceRuleId = generatedCode.shopifyPriceRuleId;

    if (shopUrl && accessToken && priceRuleId) {
      await deletePriceRule(shopUrl, accessToken, priceRuleId).catch(() => undefined);
    }

    await prisma.generatedCode.updateMany({
      where: { id: generatedCode.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });
  }

  return expiredCodes.length;
}

export function scheduleCodeExpiration(input: {
  generatedCodeId: string;
  expiresAt: Date;
  shopUrl: string;
  accessToken: string;
  priceRuleId: string;
}): void {
  const delay = Math.max(0, input.expiresAt.getTime() - Date.now());

  setTimeout(() => {
    void (async () => {
      await deletePriceRule(input.shopUrl, input.accessToken, input.priceRuleId).catch(() => undefined);
      await prisma.generatedCode.updateMany({
        where: { id: input.generatedCodeId, status: "ACTIVE" },
        data: { status: "EXPIRED" },
      });
    })();
  }, delay);
}
