import Image from 'next/image';
import styles from './BookCover.module.scss';

type Size = 'sm' | 'md' | 'lg';

// Rendered widths for the image optimiser; the visual size comes from the SCSS tokens.
const SIZES: Record<Size, string> = { sm: '48px', md: '72px', lg: '120px' };

interface Props {
  title: string;
  coverUrl: string | null;
  size?: Size;
  /** True when the title is shown next to the cover, so the image adds nothing for screen readers. */
  decorative?: boolean;
  priority?: boolean;
}

export function BookCover({ title, coverUrl, size = 'md', decorative = true, priority }: Props) {
  const alt = decorative ? '' : `Cover of ${title}`;
  return (
    <div className={[styles.cover, styles[size]].join(' ')}>
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={alt}
          fill
          sizes={SIZES[size]}
          className={styles.image}
          priority={priority}
        />
      ) : (
        <div
          className={styles.placeholder}
          role={decorative ? undefined : 'img'}
          aria-label={decorative ? undefined : alt}
        >
          <span aria-hidden="true">{title.trim().charAt(0).toUpperCase() || '?'}</span>
        </div>
      )}
    </div>
  );
}
