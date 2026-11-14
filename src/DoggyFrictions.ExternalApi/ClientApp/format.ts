/** An amount as the app shows it: two decimals and the rouble sign. */
export function formatMoney(value: number): string {
  return `${Number(value).toFixed(2)}₽`;
}

/** What was typed into an amount field, as a number: a decimal comma and currency signs are fine. Blank is 0. */
export function parseNumber(text: string): number {
  return Number(text.replace(/[$₽\s]/g, '').replace(/,/g, '.'));
}

/** Rounds to kopecks. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** "2026-01-15" or "2026-01-15T00:00:00Z" → "15/01/2026". The calendar date as stored, whatever the time zone. */
export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

/** "2026-01-15T00:00:00Z" → "2026-01-15", the value of a date field. */
export function dateOnly(value: string): string {
  return value.slice(0, 10);
}

/** Today in the user's time zone, as the value of a date field. */
export function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
