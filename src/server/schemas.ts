import { z } from 'zod';
import { LIMITS } from '@/constants/limits';
import { isDateString, isValidTimeZone } from '@/lib/dates';
import { isOpenLibraryCoverUrl } from '@/lib/openLibrary';
import type { ActionState } from '@/types';

// Server-side validation for every Server Action. Form values arrive as strings.

const blankToUndefined = (v: unknown) =>
  v === null || v === undefined || (typeof v === 'string' && v.trim() === '') ? undefined : v;

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, { error: 'Invalid id' });

function int(label: string, min: number, max: number) {
  const message = `${label} must be a whole number from ${min} to ${max}`;
  return z.preprocess(
    (v) => (blankToUndefined(v) === undefined ? undefined : Number(v)),
    z
      .number({
        error: (issue) => (issue.input === undefined ? `Enter ${label.toLowerCase()}` : message),
      })
      .int({ error: message })
      .min(min, { error: message })
      .max(max, { error: message }),
  );
}

const optionalInt = (label: string, min: number, max: number) =>
  z.preprocess(blankToUndefined, int(label, min, max).optional());

function text(label: string, max: number) {
  return z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z
      .string({ error: `Enter ${label.toLowerCase()}` })
      .min(1, { error: `Enter ${label.toLowerCase()}` })
      .max(max, { error: `${label} can be at most ${max} characters` }),
  );
}

const optionalText = (label: string, max: number) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() || undefined : undefined),
    z
      .string()
      .max(max, { error: `${label} can be at most ${max} characters` })
      .optional(),
  );

export const bookStatus = z.enum(['want_to_read', 'reading', 'finished', 'abandoned'], {
  error: 'Choose a status',
});

const page = (label: string) => int(label, 0, LIMITS.maxPages);

export const bookSchema = z
  .object({
    title: text('Title', LIMITS.titleMaxLength),
    author: optionalText('Author', LIMITS.authorMaxLength),
    totalPages: int('Total pages', 1, LIMITS.maxPages),
    currentPage: optionalInt('Current page', 0, LIMITS.maxPages),
    status: bookStatus,
    coverUrl: z.preprocess(
      blankToUndefined,
      z
        .string()
        .refine(isOpenLibraryCoverUrl, { error: 'Only Open Library cover links are supported' })
        .optional(),
    ),
    openLibraryKey: z.preprocess(
      blankToUndefined,
      z
        .string()
        .regex(/^\/works\/OL\d+W$/)
        .optional(),
    ),
  })
  .refine((b) => (b.currentPage ?? 0) <= b.totalPages, {
    error: 'Current page can’t be more than the total pages',
    path: ['currentPage'],
  });

const sessionFields = {
  startPage: page('Start page'),
  endPage: page('End page'),
  minutes: optionalInt('Minutes', 1, LIMITS.maxSessionMinutes),
  note: optionalText('Note', LIMITS.noteMaxLength),
};

const endAfterStart = {
  check: (s: { startPage: number; endPage: number }) => s.endPage > s.startPage,
  options: { error: 'End page must be after the start page', path: ['endPage'] },
};

export const sessionSchema = z
  .object({
    sessionId: z.preprocess(blankToUndefined, objectId.optional()),
    bookId: objectId.refine(Boolean, { error: 'Choose a book' }),
    date: z
      .string({ error: 'Choose a date' })
      .refine(isDateString, { error: 'Choose a valid date' })
      .refine((d) => d >= LIMITS.earliestLogDate, { error: 'That date is too far back' }),
    ...sessionFields,
  })
  .refine(endAfterStart.check, endAfterStart.options);

export const finishActiveSchema = z
  .object(sessionFields)
  .refine(endAfterStart.check, endAfterStart.options);

export const finishBookSchema = z.object({
  rating: optionalInt('Rating', 1, 5),
  review: optionalText('Review', LIMITS.reviewMaxLength),
});

export const quoteSchema = z.object({
  quoteId: z.preprocess(blankToUndefined, objectId.optional()),
  text: text('Quote', LIMITS.quoteMaxLength),
  page: optionalInt('Page', 0, LIMITS.maxPages),
});

export const timezoneSchema = z
  .string()
  .refine(isValidTimeZone, { error: 'Choose a valid timezone' });
export const themeSchema = z.enum(['dark', 'light']);

export const settingsSchema = z
  .object({
    goalType: z.enum(['pages', 'minutes'], { error: 'Choose pages or minutes' }),
    goalAmount: int(
      'Daily goal',
      1,
      Math.max(LIMITS.maxDailyGoalPages, LIMITS.maxDailyGoalMinutes),
    ),
    yearlyBookGoal: int('Yearly goal', 0, LIMITS.maxYearlyBookGoal),
    timezone: timezoneSchema,
  })
  .refine((s) => s.goalType === 'pages' || s.goalAmount <= LIMITS.maxDailyGoalMinutes, {
    error: `A minutes goal can be at most ${LIMITS.maxDailyGoalMinutes}`,
    path: ['goalAmount'],
  });

export const searchQuerySchema = z
  .string()
  .trim()
  .min(LIMITS.searchMinLength)
  .max(LIMITS.searchMaxLength);

type ParseResult<T> = { ok: true; data: T } | { ok: false; state: ActionState };

/** Validates FormData against a schema, producing field errors in ActionState shape. */
export function parseForm<S extends z.ZodType>(
  schema: S,
  formData: FormData,
): ParseResult<z.output<S>> {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    state: {
      status: 'error',
      message: 'Please fix the highlighted fields.',
      fieldErrors: z.flattenError(result.error).fieldErrors as ActionState['fieldErrors'],
    },
  };
}

export function errorState(message: string, fieldErrors?: ActionState['fieldErrors']): ActionState {
  return { status: 'error', message, fieldErrors };
}
