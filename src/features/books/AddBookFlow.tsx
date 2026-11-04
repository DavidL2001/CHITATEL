'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Banner } from '@/components/Banner/Banner';
import { Button } from '@/components/Button/Button';
import { Card, SectionHeading } from '@/components/Card/Card';
import { TextField } from '@/components/TextField/TextField';
import { LIMITS } from '@/constants/limits';
import { ROUTES } from '@/constants/routes';
import { formatNumber } from '@/lib/format';
import type { BookSearchResult } from '@/types';
import { BookForm, EMPTY_BOOK, type BookFormValues } from './BookForm';
import styles from './books.module.scss';

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; results: BookSearchResult[] }
  | { status: 'error'; message: string };

/** Search Open Library, pick a result (or enter manually), then confirm the details. */
export function AddBookFlow() {
  const [query, setQuery] = useState('');
  const [result, setSearch] = useState<SearchState>({ status: 'idle' });
  const [form, setForm] = useState<{ key: string; values: BookFormValues } | null>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);

  const q = query.trim();
  const tooShort = q.length < LIMITS.searchMinLength;
  const search: SearchState = tooShort ? { status: 'idle' } : result;

  useEffect(() => {
    if (tooShort) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearch({ status: 'loading' });
      try {
        const response = await fetch(`${ROUTES.bookSearch}?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const body = (await response.json()) as { results?: BookSearchResult[]; error?: string };
        if (!response.ok) throw new Error(body.error);
        setSearch({ status: 'done', results: body.results ?? [] });
      } catch (error) {
        if (controller.signal.aborted) return;
        setSearch({
          status: 'error',
          message:
            (error as Error).message || 'Search failed. Try again or enter the book manually.',
        });
      }
    }, LIMITS.searchDebounceMs);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [q, tooShort]);

  useEffect(() => {
    if (form) formHeading.current?.focus();
  }, [form]);

  const choose = (result: BookSearchResult) =>
    setForm({
      key: result.key,
      values: {
        ...EMPTY_BOOK,
        title: result.title,
        author: result.author,
        totalPages: result.pages,
        coverUrl: result.coverUrl,
        openLibraryKey: result.key,
      },
    });

  const announcement =
    search.status === 'loading'
      ? 'Searching…'
      : search.status === 'done'
        ? search.results.length
          ? `${formatNumber(search.results.length)} results`
          : 'No results. Try different words or enter the book manually.'
        : '';

  return (
    <>
      <Card as="section" aria-labelledby="search-heading">
        <SectionHeading id="search-heading">Find the book</SectionHeading>
        <form role="search" onSubmit={(e) => e.preventDefault()} className={styles.form}>
          <TextField
            label="Title or author"
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
            maxLength={LIMITS.searchMaxLength}
            hint="Results come from Open Library."
          />
        </form>
        <p className={styles.searchStatus} role="status">
          {announcement}
        </p>
        {search.status === 'error' && <Banner tone="danger" title={search.message} />}
        {search.status === 'done' && search.results.length > 0 && (
          <ul className={styles.results} aria-label="Search results">
            {search.results.map((r) => (
              <li key={r.key}>
                <button type="button" className={styles.result} onClick={() => choose(r)}>
                  <span className={styles.resultCover}>
                    {r.coverUrl && (
                      <Image
                        src={r.coverUrl}
                        alt=""
                        fill
                        sizes="48px"
                        className={styles.resultImage}
                      />
                    )}
                  </span>
                  <span className={styles.resultText}>
                    <span className={styles.resultTitle}>{r.title}</span>
                    <span className={styles.meta}>
                      {[r.author || 'Unknown author', r.year, r.pages ? `${r.pages} pages` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.manual}>
          <Button
            variant="secondary"
            icon="edit"
            onClick={() => setForm({ key: `manual-${Date.now()}`, values: EMPTY_BOOK })}
          >
            Enter manually
          </Button>
        </div>
      </Card>

      {form && (
        <section aria-labelledby="details-heading" className={styles.details}>
          <h2
            id="details-heading"
            ref={formHeading}
            tabIndex={-1}
            className={styles.detailsHeading}
          >
            Book details
          </h2>
          <BookForm key={form.key} initial={form.values} submitLabel="Add book" />
        </section>
      )}
    </>
  );
}
