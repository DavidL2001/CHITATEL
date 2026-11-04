import styles from './books.module.scss';

/** Read-only star rating; the stars are decorative and the text carries the meaning. */
export function Rating({ value }: { value: number }) {
  return (
    <p className={styles.rating}>
      <span aria-hidden="true" className={styles.stars}>
        {'★'.repeat(value)}
        <span className={styles.starsEmpty}>{'★'.repeat(5 - value)}</span>
      </span>
      <span className="visually-hidden">Rated {value} out of 5</span>
    </p>
  );
}
