import { LOCALE } from '@/constants/app';

export function formatNumber(n: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(n);
}

/** "1 page", "12 pages", "1,204 pages" */
export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(n)} ${n === 1 ? singular : plural}`;
}

/** Stopwatch display: "4:05", "12:05", "1:02:05". */
export function formatTimer(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** Spoken-friendly duration: "45 minutes", "1 hour 20 minutes". */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.round(totalMinutes);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return pluralize(m, 'minute');
  if (m === 0) return pluralize(h, 'hour');
  return `${pluralize(h, 'hour')} ${pluralize(m, 'minute')}`;
}

/** Compact duration: "45 min", "1 h 20 min". */
export function formatDurationShort(totalMinutes: number): string {
  const minutes = Math.round(totalMinutes);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatHours(totalMinutes: number): string {
  return formatNumber(totalMinutes / 60, 1);
}
