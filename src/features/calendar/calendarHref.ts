import { QUERY, ROUTES } from '@/constants/routes';
import { monthKeyOf, yearOf } from '@/lib/dates';
import type { DateString } from '@/types';

/** Calendar URL for a selected day; month and year default to the day's own. */
export function calendarHref({
  day,
  month,
  year,
}: {
  day: DateString;
  month?: string;
  year?: number;
}): string {
  const params = new URLSearchParams({
    [QUERY.day]: day,
    [QUERY.month]: month ?? monthKeyOf(day),
    [QUERY.year]: String(year ?? yearOf(day)),
  });
  return `${ROUTES.calendar}?${params}`;
}
