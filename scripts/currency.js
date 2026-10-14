export const CURRENCIES = ["USD", "RWF", "EUR"];

export const DEFAULT_RATES = Object.freeze({
  USD: { RWF: 1450, EUR: 0.92 },
  RWF: { USD: 0.0007, EUR: 0.0006 },
  EUR: { USD: 1.08, RWF: 1570 },
});

export function formatMoney(amount, code) {
  return new Intl.NumberFormat("en", { style: "currency", currency: code }).format(amount);
}

export function formatCompact(amount) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(amount);
}

export const convert = (amount, rate) => Math.round(amount * rate * 100) / 100;