import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ROUTES } from '@/constants/routes';
import { BookForm } from '@/features/books/BookForm';
import { requireUser } from '@/server/currentUser';
import { getBook } from '@/server/data';

type Params = Promise<{ bookId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const user = await requireUser();
  const book = await getBook(user.id, (await params).bookId);
  return { title: book ? `Edit ${book.title}` : 'Book not found' };
}

export default async function EditBookPage({ params }: { params: Params }) {
  const user = await requireUser();
  const book = await getBook(user.id, (await params).bookId);
  if (!book) notFound();

  return (
    <PageContainer>
      <PageHeader
        title="Edit book"
        subtitle={book.title}
        back={{ href: ROUTES.book(book.id), label: `Back to ${book.title}` }}
      />
      <BookForm initial={book} submitLabel="Save changes" />
    </PageContainer>
  );
}
