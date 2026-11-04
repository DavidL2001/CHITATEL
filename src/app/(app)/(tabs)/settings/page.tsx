import type { Metadata } from 'next';
import { buttonClassName } from '@/components/Button/Button';
import { SubmitButton } from '@/components/Button/SubmitButton';
import { Card, SectionHeading } from '@/components/Card/Card';
import { Icon } from '@/components/Icon/Icon';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { ROUTES } from '@/constants/routes';
import { DeleteAccount } from '@/features/settings/DeleteAccount';
import { SettingsForm } from '@/features/settings/SettingsForm';
import styles from '@/features/settings/settings.module.scss';
import { ThemeChoice } from '@/features/settings/ThemeChoice';
import { signOutAction } from '@/server/actions/account';
import { requireUser } from '@/server/currentUser';
import { getSettings } from '@/server/data';

export const metadata: Metadata = { title: 'Settings' };

function timezoneList(current: string): string[] {
  const zones = new Set(Intl.supportedValuesOf('timeZone'));
  zones.add('UTC');
  zones.add(current);
  return [...zones].sort();
}

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettings(user.id);

  return (
    <PageContainer>
      <PageHeader title="Settings" />

      <Card as="section" aria-labelledby="goals-heading" padding="lg">
        <SectionHeading id="goals-heading">Goals and timezone</SectionHeading>
        <SettingsForm settings={settings} timezones={timezoneList(settings.timezone)} />
      </Card>

      <Card as="section" aria-labelledby="appearance-heading" padding="lg">
        <SectionHeading id="appearance-heading">Appearance</SectionHeading>
        <ThemeChoice theme={settings.theme} />
      </Card>

      <Card as="section" aria-labelledby="data-heading" padding="lg" className={styles.section}>
        <SectionHeading id="data-heading">Your data</SectionHeading>
        <p className={styles.sectionText}>
          Download everything (books, sessions, notes, quotes and settings) as a JSON file.
        </p>
        <a href={ROUTES.exportData} download className={buttonClassName({ variant: 'secondary' })}>
          <Icon name="download" size="sm" />
          <span>Export all my data</span>
        </a>
      </Card>

      <Card as="section" aria-labelledby="account-heading" padding="lg" className={styles.section}>
        <SectionHeading id="account-heading">Account</SectionHeading>
        <p className={styles.sectionText}>
          Signed in as {user.name ?? user.email ?? 'you'}
          {user.email && user.name ? ` (${user.email})` : ''}.
        </p>
        <div className={styles.account}>
          <form action={signOutAction}>
            <SubmitButton variant="secondary" icon="logout" fullWidth>
              Sign out
            </SubmitButton>
          </form>
          <DeleteAccount />
        </div>
      </Card>
    </PageContainer>
  );
}
