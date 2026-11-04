'use client';

import { Button, ButtonLink } from '@/components/Button/Button';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ROUTES } from '@/constants/routes';
import styles from '@/features/app/app.module.scss';

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main">
      <PageContainer>
        <div className={styles.message} role="alert">
          <PageHeader
            title="Something went wrong"
            subtitle="Your data is safe. Please try again in a moment."
          />
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href={ROUTES.today} variant="secondary">
            Go to Today
          </ButtonLink>
        </div>
      </PageContainer>
    </main>
  );
}
