import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Campaign = {
  id: string;
  name: string;
  code: string;
  discount: string;
  redemptions: number;
  clicks: number;
  status: "Live" | "Paused";
  expires: string;
  expiresAt?: string;
};

const demoCampaigns: Campaign[] = [
  { id: "sun-night", name: "Sunday night reset", code: "SUNDAY15", discount: "15% off", redemptions: 84, clicks: 312, status: "Live", expires: "Today, 11:45 PM" },
  { id: "welcome", name: "New subscriber welcome", code: "HELLO10", discount: "10% off", redemptions: 46, clicks: 205, status: "Live", expires: "Tomorrow, 9:00 AM" },
  { id: "clearance", name: "Old stock exit", code: "CLEAR25", discount: "$25 off", redemptions: 19, clicks: 88, status: "Paused", expires: "Sep 22, 6:30 PM" },
];

function formatDiscount(value: number, type: "PERCENTAGE" | "FIXED_AMOUNT") {
  if (type === "FIXED_AMOUNT") return `$${Number(value).toFixed(0)} off`;
  return `${Number(value).toFixed(0)}% off`;
}

function mapCampaign(campaign: {
  id: string;
  name: string;
  discountValue: Prisma.Decimal;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  generatedCodes?: Array<{ code: string; expiresAt: Date }>;
}): Campaign {
  const discountValue = Number(campaign.discountValue);
  const activeCode = campaign.generatedCodes?.[0];

  return {
    id: campaign.id,
    name: campaign.name,
    code: activeCode?.code ?? `FLASH${Math.max(5, Math.min(99, Math.round(discountValue)))}`,
    discount: formatDiscount(discountValue, campaign.discountType),
    redemptions: 0,
    clicks: 0,
    status: campaign.status === "ACTIVE" ? "Live" : "Paused",
    expires: activeCode ? `Ends ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(activeCode.expiresAt)}` : "In 15 minutes",
    expiresAt: activeCode?.expiresAt.toISOString(),
  };
}

export async function GET(): Promise<Response> {
  try {
    const merchant = await prisma.merchant.findFirst({
      include: {
        campaigns: {
          orderBy: { createdAt: "desc" },
          include: {
            generatedCodes: {
              where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
              orderBy: { expiresAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!merchant || merchant.campaigns.length === 0) {
      return Response.json(demoCampaigns);
    }

    const campaigns = merchant.campaigns.map(mapCampaign);
    return Response.json(campaigns);
  } catch {
    return Response.json(demoCampaigns);
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: {
    name?: unknown;
    discount?: unknown;
    shopUrl?: unknown;
    accessToken?: unknown;
    durationMinutes?: unknown;
    discountType?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const rawDiscount = typeof body.discount === "string" || typeof body.discount === "number" ? body.discount : "15";
  const parsedDiscount = Number(rawDiscount);
  const rawDuration = Number(body.durationMinutes ?? 15);
  const discountType = body.discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE";
  const shopUrl = typeof body.shopUrl === "string" && body.shopUrl.trim().length > 0 ? body.shopUrl.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "") : "demo-store.myshopify.com";

  if (!name) {
    return Response.json({ error: "Campaign name is required" }, { status: 400 });
  }

  const maxDiscount = discountType === "FIXED_AMOUNT" ? 10000 : 100;

  if (!Number.isFinite(parsedDiscount) || parsedDiscount < 1 || parsedDiscount > maxDiscount) {
    return Response.json({ error: `Discount must be between 1 and ${maxDiscount}` }, { status: 400 });
  }

  if (!Number.isFinite(rawDuration) || rawDuration < 1 || rawDuration > 1440) {
    return Response.json({ error: "Duration must be between 1 and 1440 minutes" }, { status: 400 });
  }

  try {
    const merchant = await prisma.merchant.upsert({
      where: { shopUrl },
      update: {
        accessToken: typeof body.accessToken === "string" && body.accessToken.length > 0 ? body.accessToken : "demo-token",
      },
      create: {
        shopUrl,
        accessToken: typeof body.accessToken === "string" && body.accessToken.length > 0 ? body.accessToken : "demo-token",
      },
    });

    const createdCampaign = await prisma.campaign.create({
      data: {
        merchantId: merchant.id,
        name,
        discountValue: new Prisma.Decimal(parsedDiscount),
        discountType,
        durationMinutes: Math.round(rawDuration),
        status: "ACTIVE",
      },
      include: { generatedCodes: { where: { status: "ACTIVE" }, orderBy: { expiresAt: "desc" }, take: 1 } },
    });

    const campaign = mapCampaign(createdCampaign);
    return Response.json(campaign, { status: 201 });
  } catch {
    const fallbackCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name,
      code: `FLASH${Math.max(5, Math.min(99, Math.round(parsedDiscount)))}`,
      discount: `${parsedDiscount}% off`,
      redemptions: 0,
      clicks: 0,
      status: "Live",
      expires: "In 15 minutes",
    };

    demoCampaigns.unshift(fallbackCampaign);
    return Response.json(fallbackCampaign, { status: 201 });
  }
}
