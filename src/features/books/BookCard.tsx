import Link from 'next/link';
import { BookCover } from '@/components/BookCover/BookCover';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { BOOK_STATUS_LABELS } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { pluralize } from '@/lib/format';
import { progressPercent } from '@/lib/pace';
import type { BookDTO } from '@/types';
import { Rating } from './Rating';
import styles from './books.module.scss';

/** A book in a list: the whole card is one link to the book's page. */
export function BookCard({
  book,
  headingLevel: Heading = 'h3',
}: {
  book: BookDTO;
  headingLevel?: 'h2' | 'h3';
}) {
  const percent = progressPercent(book.currentPage, book.totalPages);
  const pagesLeft = Math.max(0, book.totalPages - book.currentPage);
  const showProgress =
    book.status === 'reading' || (book.status === 'abandoned' && book.currentPage > 0);

  return (
    <article className={styles.card}>
      <BookCover title={book.title} coverUrl={book.coverUrl} size="md" />
      <div className={styles.cardBody}>
        <Heading className={styles.cardTitle}>
          <Link href={ROUTES.book(book.id)} className={styles.cardLink}>
            {book.title}
          </Link>
        </Heading>
        {book.author && <p className={styles.author}>{book.author}</p>}
        {showProgress && (
          <>
            <ProgressBar
              size="sm"
              value={book.currentPage}
              max={book.totalPages}
              label={`Progress in ${book.title}`}
              valueText={`${percent}%, page ${book.currentPage} of ${book.totalPages}`}
            />
            <p className={styles.meta}>
              {percent}% · {pluralize(pagesLeft, 'page')} left
            </p>
          </>
        )}
        {book.status === 'finished' &&
          (book.rating ? <Rating value={book.rating} /> : <p className={styles.meta}>Finished</p>)}
        {book.status === 'want_to_read' && (
          <p className={styles.meta}>{pluralize(book.totalPages, 'page')}</p>
        )}
        {book.status === 'abandoned' && !showProgress && (
          <p className={styles.meta}>{BOOK_STATUS_LABELS.abandoned}</p>
        )}
      </div>
    </article>
  );
}

export function BookList({
  books,
  headingLevel,
}: {
  books: BookDTO[];
  headingLevel?: 'h2' | 'h3';
}) {
  return (
    <ul className={styles.list}>
      {books.map((book) => (
        <li key={book.id}>
          <BookCard book={book} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
