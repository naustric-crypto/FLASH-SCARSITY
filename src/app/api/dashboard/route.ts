import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const [campaignCount, codeCount, revenue] = await Promise.all([
    prisma.campaign.count({
      where: { status: "ACTIVE" },
    }),
    prisma.generatedCode.count({
      where: { status: "ACTIVE" },
    }),
    prisma.campaign.aggregate({
      _sum: { discountValue: true },
      where: { status: "ACTIVE" },
    }),
  ]);

  return Response.json({
    activeCampaigns: campaignCount,
    codesRedeemed: codeCount,
    revenueInfluenced: Number(revenue._sum.discountValue ?? 0) * 125,
  });
}
