export type ServicePricing = {
  originalPrice: number | null;
  discountedPrice: number | null;
  hasDiscount: boolean;
  savingsAmount: number | null;
  savingsPercent: number | null;
};

export function getServicePricing(
  price: number | null,
  discountedPrice: number | null,
): ServicePricing {
  if (price === null) {
    return {
      originalPrice: null,
      discountedPrice: null,
      hasDiscount: false,
      savingsAmount: null,
      savingsPercent: null,
    };
  }

  const hasDiscount =
    discountedPrice !== null && discountedPrice > 0 && discountedPrice < price;
  const savingsAmount = hasDiscount ? price - discountedPrice : null;
  const savingsPercent =
    hasDiscount && savingsAmount !== null
      ? Math.round((savingsAmount / price) * 100)
      : null;

  return {
    originalPrice: price,
    discountedPrice: hasDiscount ? discountedPrice : price,
    hasDiscount,
    savingsAmount,
    savingsPercent,
  };
}

export function formatServiceCurrency(
  price: number | null,
  currency = "BDT",
): string {
  if (price === null) return "Custom Quote";

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
