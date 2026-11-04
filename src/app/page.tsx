import { redirect } from 'next/navigation';
import { Banner } from '@/components/Banner/Banner';
import { SubmitButton } from '@/components/Button/SubmitButton';
import { Icon, type IconName } from '@/components/Icon/Icon';
import { APP_NAME } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { signInWith } from '@/server/actions/account';
import { getCurrentUser } from '@/server/currentUser';
import styles from './welcome.module.scss';

const FEATURES: { icon: IconName; text: string }[] = [
  { icon: 'timer', text: 'Time your reading sessions and jot down a note when you finish.' },
  { icon: 'flame', text: 'Keep a daily streak and a gentle daily goal.' },
  { icon: 'calendar', text: 'See every reading day on a calendar.' },
  { icon: 'quote', text: 'Save quotes and keep a journal for each book.' },
];

const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    'That email is already linked to another sign-in method. Use the one you signed up with.',
  AccessDenied: 'Sign-in was cancelled.',
};

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect(ROUTES.today);
  const { error } = await searchParams;

  return (
    <main id="main" className={styles.main}>
      <div className={styles.hero}>
        <Icon name="book" size="lg" className={styles.logo} />
        <h1 className={styles.title}>{APP_NAME}</h1>
        <p className={styles.tagline}>
          A calm place to log what you read, keep your streak and watch your progress grow.
        </p>
      </div>

      <ul className={styles.features}>
        {FEATURES.map((f) => (
          <li key={f.text} className={styles.feature}>
            <Icon name={f.icon} className={styles.featureIcon} />
            {f.text}
          </li>
        ))}
      </ul>

      <section aria-labelledby="sign-in-heading" className={styles.signIn}>
        <h2 id="sign-in-heading" className={styles.signInHeading}>
          Sign in to start
        </h2>
        {error && (
          <Banner tone="danger" role="alert" title="Couldn’t sign you in">
            {ERRORS[error] ?? 'Something went wrong. Please try again.'}
          </Banner>
        )}
        <form action={signInWith.bind(null, 'google')}>
          <SubmitButton size="lg" fullWidth>
            Continue with Google
          </SubmitButton>
        </form>
        <form action={signInWith.bind(null, 'github')}>
          <SubmitButton size="lg" fullWidth variant="secondary">
            Continue with GitHub
          </SubmitButton>
        </form>
        <p className={styles.fineprint}>
          {APP_NAME} never sees or stores a password. Your reading data is private to your account.
        </p>
      </section>
    </main>
  );
}
