export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDistance(km) {
  if (km == null || Number.isNaN(Number(km))) return "0 km";
  const num = Number(km);
  if (num < 1) {
    return `${Math.round(num * 1000)} m`;
  }
  return `${num.toLocaleString("en-US", { maximumFractionDigits: 1 })} km`;
}

export function formatPercentage(ratio) {
  if (ratio == null) return "0%";
  return `${Math.round(ratio * 100)}%`;
}
