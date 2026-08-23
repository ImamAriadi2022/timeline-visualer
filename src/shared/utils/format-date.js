export function formatDate(isoString, options = {}) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(+date)) return "";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("id-ID", { ...defaultOptions, ...options }).format(date);
}

export function formatDateTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(+date)) return "";

  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateRange(startIso, endIso) {
  if (!startIso && !endIso) return "Sepanjang Waktu";
  if (startIso && !endIso) return formatDate(startIso);
  if (!startIso && endIso) return formatDate(endIso);

  const s = formatDate(startIso);
  const e = formatDate(endIso);
  if (s === e) return s;
  return `${s} — ${e}`;
}
