import { PageContainer } from '@/components/PageContainer/PageContainer';
import styles from './app.module.scss';

/** Route loading state: placeholder blocks with a polite "Loading" status. */
export function PageLoading({
  label = 'Loading…',
  blocks = 3,
}: {
  label?: string;
  blocks?: number;
}) {
  return (
    <PageContainer>
      <div role="status" className={styles.loading}>
        <span className="visually-hidden">{label}</span>
        <div className={styles.skeletonTitle} aria-hidden="true" />
        {Array.from({ length: blocks }, (_, i) => (
          <div key={i} className={styles.skeletonBlock} aria-hidden="true" />
        ))}
      </div>
    </PageContainer>
  );
}
