import { ButtonLink } from '@/components/Button/Button';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ROUTES } from '@/constants/routes';
import styles from '@/features/app/app.module.scss';

export const metadata = { title: 'Not found' };

export default function NotFound() {
  return (
    <main id="main">
      <PageContainer>
        <div className={styles.message}>
          <PageHeader
            title="Page not found"
            subtitle="This page doesn’t exist, or it belongs to another account."
          />
          <ButtonLink href={ROUTES.today}>Go to Today</ButtonLink>
        </div>
      </PageContainer>
    </main>
  );
}
