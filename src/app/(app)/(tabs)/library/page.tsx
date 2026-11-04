import type { Metadata } from 'next';
import Form from 'next/form';
import { ButtonLink } from '@/components/Button/Button';
import { SubmitButton } from '@/components/Button/SubmitButton';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { SelectField } from '@/components/SelectField/SelectField';
import { TabLinks } from '@/components/Tabs/Tabs';
import { TextField } from '@/components/TextField/TextField';
import {
  BOOK_STATUS_LABELS,
  BOOK_STATUSES,
  LIBRARY_SORTS,
  type LibrarySort,
} from '@/constants/app';
import { LIMITS } from '@/constants/limits';
import { QUERY, ROUTES } from '@/constants/routes';
import { BookList } from '@/features/books/BookCard';
import styles from '@/features/books/library.module.scss';
import { requireUser } from '@/server/currentUser';
import { countBooksByStatus, getBooks } from '@/server/data';
import type { BookStatus } from '@/types';

export const metadata: Metadata = { title: 'Library' };

const EMPTY: Record<BookStatus, { title: string; text: string }> = {
  reading: { title: 'No books yet', text: 'Add the one you’re reading.' },
  want_to_read: { title: 'Nothing on your list', text: 'Add books you’d like to read next.' },
  finished: { title: 'No finished books yet', text: 'Books you finish will collect here.' },
  abandoned: { title: 'No abandoned books', text: 'Books you put down for good show up here.' },
};

type Search = Promise<{ tab?: string; q?: string; sort?: string }>;

export default async function LibraryPage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser();
  const params = await searchParams;
  const tab: BookStatus = BOOK_STATUSES.includes(params.tab as BookStatus)
    ? (params.tab as BookStatus)
    : 'reading';
  const sort: LibrarySort =
    params.sort && params.sort in LIBRARY_SORTS ? (params.sort as LibrarySort) : 'recent';
  const q = (params.q ?? '').trim().slice(0, LIMITS.searchMaxLength);

  const [counts, books] = await Promise.all([
    countBooksByStatus(user.id),
    getBooks(user.id, { status: tab, search: q, sort }),
  ]);

  const href = (status: BookStatus) => {
    const p = new URLSearchParams({ [QUERY.tab]: status });
    if (q) p.set(QUERY.q, q);
    if (sort !== 'recent') p.set(QUERY.sort, sort);
    return `${ROUTES.library}?${p}`;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Library"
        actions={
          <ButtonLink href={ROUTES.newBook} icon="plus">
            Add book
          </ButtonLink>
        }
      />

      <TabLinks
        label="Books by status"
        items={BOOK_STATUSES.map((s) => ({
          href: href(s),
          current: s === tab,
          label: (
            <>
              {BOOK_STATUS_LABELS[s]} <span className={styles.count}>({counts[s]})</span>
            </>
          ),
        }))}
      />

      <Form
        action={ROUTES.library}
        role="search"
        aria-label="Search and sort books"
        className={styles.search}
      >
        <input type="hidden" name={QUERY.tab} value={tab} />
        <TextField
          label="Search by title or author"
          type="search"
          name={QUERY.q}
          defaultValue={q}
          maxLength={LIMITS.searchMaxLength}
        />
        <SelectField label="Sort by" name={QUERY.sort} defaultValue={sort}>
          {Object.entries(LIBRARY_SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <SubmitButton variant="secondary" icon="search">
          Apply
        </SubmitButton>
      </Form>

      <p className="visually-hidden" role="status">
        {books.length} {books.length === 1 ? 'book' : 'books'} in {BOOK_STATUS_LABELS[tab]}
        {q ? ` matching ${q}` : ''}
      </p>

      {books.length ? (
        <BookList books={books} headingLevel="h2" />
      ) : q ? (
        <EmptyState icon="search" title={`No books match “${q}”`}>
          Try another search, or look in a different tab.
        </EmptyState>
      ) : (
        <EmptyState
          title={EMPTY[tab].title}
          action={
            <ButtonLink href={ROUTES.newBook} icon="plus">
              Add a book
            </ButtonLink>
          }
        >
          {EMPTY[tab].text}
        </EmptyState>
      )}
    </PageContainer>
  );
}
