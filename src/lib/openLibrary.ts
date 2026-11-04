import { LIMITS } from '@/constants/limits';
import type { BookSearchResult } from '@/types';

export const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';
export const OPEN_LIBRARY_COVERS_ORIGIN = 'https://covers.openlibrary.org';

const SEARCH_FIELDS = [
  'key',
  'title',
  'author_name',
  'first_publish_year',
  'number_of_pages_median',
  'cover_i',
];

export interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  cover_i?: number;
}

export function buildSearchUrl(query: string, limit: number = LIMITS.searchResults): string {
  const params = new URLSearchParams({
    q: query.trim(),
    fields: SEARCH_FIELDS.join(','),
    limit: String(limit),
  });
  return `${OPEN_LIBRARY_SEARCH_URL}?${params}`;
}

export function coverUrlFromId(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
  return `${OPEN_LIBRARY_COVERS_ORIGIN}/b/id/${coverId}-${size}.jpg`;
}

/** Only Open Library covers are allowed, because next/image is configured for that host only. */
export function isOpenLibraryCoverUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === 'https:' &&
      u.hostname === 'covers.openlibrary.org' &&
      u.pathname.startsWith('/b/')
    );
  } catch {
    return false;
  }
}

export function mapSearchDoc(doc: OpenLibraryDoc): BookSearchResult | null {
  const title = doc.title?.trim();
  if (!doc.key || !title) return null;
  const pages = doc.number_of_pages_median;
  return {
    key: doc.key,
    title: title.slice(0, LIMITS.titleMaxLength),
    author: (doc.author_name ?? []).slice(0, 3).join(', ').slice(0, LIMITS.authorMaxLength),
    year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year! : null,
    pages: Number.isInteger(pages) && pages! > 0 && pages! <= LIMITS.maxPages ? pages! : null,
    coverUrl:
      Number.isInteger(doc.cover_i) && doc.cover_i! > 0 ? coverUrlFromId(doc.cover_i!) : null,
  };
}

export function mapSearchResponse(json: unknown): BookSearchResult[] {
  const docs = (json as { docs?: unknown })?.docs;
  if (!Array.isArray(docs)) return [];
  return docs
    .map((d) => mapSearchDoc(d as OpenLibraryDoc))
    .filter((r): r is BookSearchResult => r !== null);
}
