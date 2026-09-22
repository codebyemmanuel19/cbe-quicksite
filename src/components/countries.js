// Every country the platform knows. Only "live" ones can be picked at Setup.
export const COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "NGN", symbol: "₦", phoneCode: "234", live: true },
  { code: "GH", name: "Ghana", flag: "🇬🇭", currency: "GHS", symbol: "GH₵", phoneCode: "233", live: false },
  { code: "KE", name: "Kenya", flag: "🇰🇪", currency: "KES", symbol: "KSh", phoneCode: "254", live: false },
  { code: "UG", name: "Uganda", flag: "🇺🇬", currency: "UGX", symbol: "USh", phoneCode: "256", live: false },
];

// Price in the shop's own currency, e.g. formatPrice(15000, "₦") -> "₦15,000"
export function formatPrice(amount, symbol = "₦") {
  return symbol + Number(amount).toLocaleString("en");
}