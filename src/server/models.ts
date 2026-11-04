import mongoose, { Schema, type Model, type Types } from 'mongoose';
import {
  DEFAULT_DAILY_GOAL,
  DEFAULT_THEME,
  DEFAULT_TIMEZONE,
  DEFAULT_YEARLY_BOOK_GOAL,
} from '@/constants/goals';
import { LIMITS } from '@/constants/limits';
import type { BookStatus, GoalType, Theme } from '@/types';

// userId is the Auth.js user id (hex string of the adapter's users._id).
// Every query in src/server/data.ts and src/server/actions filters on it.
// Document shapes are declared explicitly: InferSchemaType is very expensive for tsc.

interface Timestamps {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsDoc extends Timestamps {
  userId: string;
  timezone: string;
  timezoneDetected: boolean;
  dailyGoal: { type: GoalType; amount: number };
  yearlyBookGoal: number;
  theme: Theme;
}

export interface BookDoc extends Timestamps {
  userId: string;
  title: string;
  author: string;
  totalPages: number;
  coverUrl: string | null;
  openLibraryKey: string | null;
  status: BookStatus;
  currentPage: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  rating: number | null;
  review: string | null;
}

export interface ReadingSessionDoc extends Timestamps {
  userId: string;
  bookId: Types.ObjectId;
  /** Local date (YYYY-MM-DD) in the user's timezone. */
  date: string;
  startPage: number;
  endPage: number;
  pagesRead: number;
  minutes: number | null;
  note: string | null;
}

export interface QuoteDoc extends Timestamps {
  userId: string;
  bookId: Types.ObjectId;
  text: string;
  page: number | null;
}

/** The running timer. At most one per user, stored server-side so it survives devices. */
export interface ActiveSessionDoc extends Timestamps {
  userId: string;
  bookId: Types.ObjectId;
  startedAt: Date;
  resumedAt: Date | null;
  accumulatedSeconds: number;
  startPage: number;
}

const settingsSchema = new Schema<SettingsDoc>(
  {
    userId: { type: String, required: true, unique: true },
    timezone: { type: String, required: true, default: DEFAULT_TIMEZONE },
    timezoneDetected: { type: Boolean, required: true, default: false },
    dailyGoal: {
      // A nested field called "type" must itself be declared with `type`.
      type: {
        type: String,
        enum: ['pages', 'minutes'],
        required: true,
        default: DEFAULT_DAILY_GOAL.type,
      },
      amount: { type: Number, required: true, min: 1, default: DEFAULT_DAILY_GOAL.amount },
    },
    yearlyBookGoal: { type: Number, required: true, min: 0, default: DEFAULT_YEARLY_BOOK_GOAL },
    theme: { type: String, enum: ['dark', 'light'], required: true, default: DEFAULT_THEME },
  },
  { timestamps: true },
);

const bookSchema = new Schema<BookDoc>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true, maxlength: LIMITS.titleMaxLength },
    author: { type: String, default: '', maxlength: LIMITS.authorMaxLength },
    totalPages: { type: Number, required: true, min: 1, max: LIMITS.maxPages },
    coverUrl: { type: String, default: null },
    openLibraryKey: { type: String, default: null },
    status: {
      type: String,
      enum: ['want_to_read', 'reading', 'finished', 'abandoned'],
      required: true,
      default: 'reading',
    },
    currentPage: { type: Number, required: true, min: 0, default: 0 },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: null, maxlength: LIMITS.reviewMaxLength },
  },
  { timestamps: true },
);
bookSchema.index({ userId: 1, status: 1 });
bookSchema.index({ userId: 1, updatedAt: -1 });

const readingSessionSchema = new Schema<ReadingSessionDoc>(
  {
    userId: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, required: true },
    date: { type: String, required: true },
    startPage: { type: Number, required: true, min: 0 },
    endPage: { type: Number, required: true, min: 0 },
    pagesRead: { type: Number, required: true, min: 0 },
    minutes: { type: Number, default: null, min: 0 },
    note: { type: String, default: null, maxlength: LIMITS.noteMaxLength },
  },
  { timestamps: true },
);
readingSessionSchema.index({ userId: 1, date: 1 });
readingSessionSchema.index({ userId: 1, bookId: 1 });

const quoteSchema = new Schema<QuoteDoc>(
  {
    userId: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, required: true },
    text: { type: String, required: true, maxlength: LIMITS.quoteMaxLength },
    page: { type: Number, default: null, min: 0 },
  },
  { timestamps: true },
);
quoteSchema.index({ userId: 1, bookId: 1 });

const activeSessionSchema = new Schema<ActiveSessionDoc>(
  {
    userId: { type: String, required: true, unique: true },
    bookId: { type: Schema.Types.ObjectId, required: true },
    startedAt: { type: Date, required: true },
    resumedAt: { type: Date, default: null },
    accumulatedSeconds: { type: Number, required: true, default: 0 },
    startPage: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

function model<T>(name: string, schema: Schema<T>): Model<T> {
  // Reuse compiled models across hot reloads.
  return (mongoose.models[name] as Model<T> | undefined) ?? mongoose.model<T>(name, schema);
}

export const Settings = model('Settings', settingsSchema);
export const Book = model('Book', bookSchema);
export const ReadingSession = model('ReadingSession', readingSessionSchema);
export const Quote = model('Quote', quoteSchema);
export const ActiveSession = model('ActiveSession', activeSessionSchema);
