import { describe, expect, it } from 'vitest';
import { buildExport, exportFileName } from './export';
import { formatDuration, formatTimer, pluralize } from './format';
import { describeDay, heatLegend, heatLevel, weekColumns } from './heatmap';
import { bookMilestone, crossedStreakMilestone, ordinal } from './milestones';
import {
  buildSearchUrl,
  isOpenLibraryCoverUrl,
  mapSearchDoc,
  mapSearchResponse,
} from './openLibrary';
import { elapsedMinutes, elapsedSeconds } from './timer';

describe('milestones', () => {
  it('detects crossed streak milestones', () => {
    expect(crossedStreakMilestone(6, 7)).toBe(7);
    expect(crossedStreakMilestone(7, 8)).toBeNull();
    expect(crossedStreakMilestone(5, 31)).toBe(30); // back-filling a gap can jump past several
    expect(crossedStreakMilestone(0, 0)).toBeNull();
  });

  it('detects book milestones', () => {
    expect(bookMilestone(1)).toBe(1);
    expect(bookMilestone(10)).toBe(10);
    expect(bookMilestone(11)).toBeNull();
  });

  it('formats ordinals', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 25, 50, 101].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '25th',
      '50th',
      '101st',
    ]);
  });
});

describe('heatmap', () => {
  it('maps pages to levels', () => {
    expect([0, 1, 9, 10, 24, 25, 49, 50, 400].map(heatLevel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it('builds a text legend', () => {
    expect(heatLegend().map((l) => l.label)).toEqual([
      'No reading',
      '1–9 pages',
      '10–24 pages',
      '25–49 pages',
      '50+ pages',
    ]);
  });

  it('describes days accessibly', () => {
    expect(describeDay('2026-10-14', { pages: 32, minutes: 0, sessions: 1 }, true)).toBe(
      '14 October: 32 pages, goal met',
    );
    expect(describeDay('2026-10-14', { pages: 1, minutes: 25, sessions: 1 }, false)).toBe(
      '14 October: 1 page, 25 minutes',
    );
    expect(describeDay('2026-10-14', undefined, false, { today: '2026-10-14' })).toBe(
      '14 October (today): no reading',
    );
  });

  it('builds week columns', () => {
    const cols = weekColumns('2026-10-01', '2026-10-31');
    expect(cols[0]![0]).toBeNull();
    expect(cols[0]![3]).toBe('2026-10-01');
    expect(cols.flat().filter(Boolean)).toHaveLength(31);
  });
});

describe('format', () => {
  it('formats timers and durations', () => {
    expect(formatTimer(65)).toBe('1:05');
    expect(formatTimer(3725)).toBe('1:02:05');
    expect(formatDuration(80)).toBe('1 hour 20 minutes');
    expect(formatDuration(1)).toBe('1 minute');
    expect(pluralize(1204, 'page')).toBe('1,204 pages');
  });
});

describe('timer', () => {
  const now = Date.parse('2026-10-29T10:10:30Z');
  it('adds running time to accumulated time', () => {
    expect(elapsedSeconds({ resumedAt: '2026-10-29T10:00:00Z', accumulatedSeconds: 30 }, now)).toBe(
      660,
    );
    expect(elapsedSeconds({ resumedAt: null, accumulatedSeconds: 125 }, now)).toBe(125);
  });
  it('rounds minutes, with a minimum of one', () => {
    expect(elapsedMinutes({ resumedAt: null, accumulatedSeconds: 10 }, now)).toBe(1);
    expect(elapsedMinutes({ resumedAt: null, accumulatedSeconds: 0 }, now)).toBe(0);
    expect(elapsedMinutes({ resumedAt: null, accumulatedSeconds: 150 }, now)).toBe(3);
  });
});

describe('Open Library mapping', () => {
  it('builds a search URL', () => {
    const url = new URL(buildSearchUrl(' dune herbert '));
    expect(url.searchParams.get('q')).toBe('dune herbert');
    expect(url.searchParams.get('fields')).toContain('cover_i');
  });

  it('maps a search document', () => {
    expect(
      mapSearchDoc({
        key: '/works/OL893415W',
        title: 'Dune',
        author_name: ['Frank Herbert'],
        first_publish_year: 1965,
        number_of_pages_median: 604,
        cover_i: 11481354,
      }),
    ).toEqual({
      key: '/works/OL893415W',
      title: 'Dune',
      author: 'Frank Herbert',
      year: 1965,
      pages: 604,
      coverUrl: 'https://covers.openlibrary.org/b/id/11481354-M.jpg',
    });
  });

  it('tolerates missing fields and drops unusable docs', () => {
    expect(mapSearchDoc({ key: '/works/X', title: 'Untitled draft' })).toMatchObject({
      author: '',
      year: null,
      pages: null,
      coverUrl: null,
    });
    expect(
      mapSearchResponse({ docs: [{ title: 'No key' }, { key: '/works/Y', title: 'Ok' }] }),
    ).toHaveLength(1);
    expect(mapSearchResponse(null)).toEqual([]);
  });

  it('only accepts Open Library cover URLs', () => {
    expect(isOpenLibraryCoverUrl('https://covers.openlibrary.org/b/id/1-M.jpg')).toBe(true);
    expect(isOpenLibraryCoverUrl('https://evil.example/b/id/1-M.jpg')).toBe(false);
    expect(isOpenLibraryCoverUrl('not a url')).toBe(false);
  });
});

describe('export', () => {
  it('wraps data with metadata and sorts it', () => {
    const payload = buildExport(
      {
        user: { name: 'Reader', email: null },
        settings: {
          timezone: 'UTC',
          timezoneDetected: true,
          dailyGoal: { type: 'pages', amount: 20 },
          yearlyBookGoal: 24,
          theme: 'dark',
        },
        books: [],
        sessions: [
          {
            id: 'b',
            bookId: 'x',
            date: '2026-10-29',
            startPage: 0,
            endPage: 5,
            pagesRead: 5,
            minutes: null,
            note: null,
            createdAt: '2026-10-29T10:00:00Z',
          },
          {
            id: 'a',
            bookId: 'x',
            date: '2026-10-28',
            startPage: 0,
            endPage: 5,
            pagesRead: 5,
            minutes: null,
            note: null,
            createdAt: '2026-10-29T11:00:00Z',
          },
        ],
        quotes: [],
      },
      new Date('2026-10-29T12:00:00Z'),
    );
    expect(payload).toMatchObject({
      app: 'CHITATEL',
      version: 1,
      exportedAt: '2026-10-29T12:00:00.000Z',
      counts: { sessions: 2 },
    });
    expect(payload.sessions.map((s) => s.id)).toEqual(['a', 'b']);
    expect(exportFileName('2026-10-29')).toBe('chitatel-export-2026-10-29.json');
  });
});
