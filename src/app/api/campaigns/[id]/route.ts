import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  let body: { name?: unknown; discount?: unknown; discountType?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const discountType = body.discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE";
  const discount = Number(body.discount);
  const maxDiscount = discountType === "FIXED_AMOUNT" ? 10000 : 100;

  if (!name) return Response.json({ error: "Campaign name is required" }, { status: 400 });
  if (!Number.isFinite(discount) || discount < 1 || discount > maxDiscount) {
    return Response.json({ error: `Discount must be between 1 and ${maxDiscount}` }, { status: 400 });
  }

  try {
    const campaign = await prisma.campaign.update({
      where: { id },
      data: { name, discountValue: new Prisma.Decimal(discount), discountType },
      include: { generatedCodes: { where: { status: "ACTIVE" }, orderBy: { expiresAt: "desc" }, take: 1 } },
    });

    return Response.json({
      id: campaign.id,
      name: campaign.name,
      code: campaign.generatedCodes[0]?.code ?? `FLASH${Math.max(5, Math.min(99, Math.round(discount)))}`,
      discount: discountType === "FIXED_AMOUNT" ? `$${discount.toFixed(0)} off` : `${discount.toFixed(0)}% off`,
      redemptions: 0,
      clicks: 0,
      status: campaign.status === "ACTIVE" ? "Live" : "Paused",
      expires: campaign.generatedCodes[0] ? `Ends ${campaign.generatedCodes[0].expiresAt.toLocaleString()}` : "In 15 minutes",
    });
  } catch {
    return Response.json({ error: "Campaign could not be found or updated." }, { status: 404 });
  }
}
