import type { Metadata } from 'next';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ROUTES } from '@/constants/routes';
import { AddBookFlow } from '@/features/books/AddBookFlow';
import { requireUser } from '@/server/currentUser';

export const metadata: Metadata = { title: 'Add a book' };

export default async function NewBookPage() {
  await requireUser();
  return (
    <PageContainer>
      <PageHeader title="Add a book" back={{ href: ROUTES.library, label: 'Back to Library' }} />
      <AddBookFlow />
    </PageContainer>
  );
}
