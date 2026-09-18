type ShopifyErrorPayload = {
  errors?: string | Record<string, string[]>;
};

type PriceRule = {
  id: number;
};

type DiscountCode = {
  id: number;
  code: string;
};

const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2025-01";

export function normalizeShopUrl(shopUrl: string): string {
  const value = shopUrl.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(value)) {
    throw new Error("Invalid Shopify shop domain");
  }
  return value;
}

export function isDemoShopifyCredential(value: string | null | undefined): boolean {
  const normalized = value?.trim() ?? "";
  return normalized.length === 0 || normalized === "demo-token" || normalized.includes("replace-with") || normalized.length < 20;
}

async function shopifyRequest<T>(
  shopUrl: string,
  accessToken: string,
  path: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(`https://${shopUrl}/admin/api/${apiVersion}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ShopifyErrorPayload;
    const detail = typeof payload.errors === "string" ? payload.errors : response.statusText;
    throw new Error(`Shopify API error (${response.status}): ${detail}`);
  }

  return (await response.json()) as T;
}

export async function createSingleUseDiscount(input: {
  shopUrl: string;
  accessToken: string;
  code: string;
  discountValue: number;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
}): Promise<{ priceRuleId: string; discountCodeId: string }> {
  if (isDemoShopifyCredential(input.accessToken)) {
    throw new Error("Shopify credentials are not configured for live discount creation");
  }

  const normalizedShopUrl = normalizeShopUrl(input.shopUrl);
  const priceRuleValue = input.discountType === "PERCENTAGE" ? String(-Math.abs(input.discountValue)) : String(-Math.abs(input.discountValue));

  const priceRuleResponse = await shopifyRequest<{ price_rule: PriceRule }>(
    normalizedShopUrl,
    input.accessToken,
    "/price_rules.json",
    {
      method: "POST",
      body: JSON.stringify({
        price_rule: {
          title: `Flash Scarcity ${input.code}`,
          target_type: "line_item",
          target_selection: "all",
          allocation_method: "across",
          value_type: input.discountType === "PERCENTAGE" ? "percentage" : "fixed_amount",
          value: priceRuleValue,
          customer_selection: "all",
          starts_at: new Date().toISOString(),
          usage_limit: 1,
        },
      }),
    },
  );

  try {
    const discountResponse = await shopifyRequest<{ discount_code: DiscountCode }>(
      normalizedShopUrl,
      input.accessToken,
      `/price_rules/${priceRuleResponse.price_rule.id}/discount_codes.json`,
      { method: "POST", body: JSON.stringify({ discount_code: { code: input.code } }) },
    );

    return {
      priceRuleId: String(priceRuleResponse.price_rule.id),
      discountCodeId: String(discountResponse.discount_code.id),
    };
  } catch (error) {
    await deletePriceRule(normalizedShopUrl, input.accessToken, String(priceRuleResponse.price_rule.id)).catch(() => undefined);
    throw error;
  }
}

export async function deletePriceRule(shopUrl: string, accessToken: string, priceRuleId: string): Promise<void> {
  const normalizedShopUrl = normalizeShopUrl(shopUrl);
  await shopifyRequest<unknown>(normalizedShopUrl, accessToken, `/price_rules/${priceRuleId}.json`, { method: "DELETE" });
}
