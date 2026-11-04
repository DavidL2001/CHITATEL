import Link from 'next/link';
import { Card } from '@/components/Card/Card';
import { Icon } from '@/components/Icon/Icon';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { ProgressRing } from '@/components/ProgressRing/ProgressRing';
import { ROUTES } from '@/constants/routes';
import { formatNumber, pluralize } from '@/lib/format';
import type { GoalProgress } from '@/lib/stats';
import { streakMessage, type StreakResult } from '@/lib/streak';
import type { GoalType } from '@/types';
import styles from './today.module.scss';

export function StreakCard({ streak }: { streak: StreakResult }) {
  const atRisk = !streak.readToday && streak.current > 0;
  return (
    <Card as="section" aria-labelledby="streak-heading" className={styles.streak}>
      <h2 id="streak-heading" className={styles.cardHeading}>
        Streak
      </h2>
      <div className={styles.streakNumbers}>
        <p className={styles.streakCurrent}>
          <Icon name="flame" size="lg" className={styles.flame} />
          <span>
            <span className={styles.bigNumber}>{formatNumber(streak.current)}</span>
            <span className={styles.unit}> {streak.current === 1 ? 'day' : 'days'}</span>
            <span className="visually-hidden"> current streak</span>
          </span>
        </p>
        <p className={styles.muted}>Longest: {pluralize(streak.longest, 'day')}</p>
      </div>
      <p className={atRisk ? styles.atRisk : styles.muted}>{streakMessage(streak)}</p>
    </Card>
  );
}

const UNITS: Record<GoalType, [string, string]> = {
  pages: ['page', 'pages'],
  minutes: ['minute', 'minutes'],
};

export function GoalCard({ progress, type }: { progress: GoalProgress; type: GoalType }) {
  const [one, many] = UNITS[type];
  const left = Math.max(0, progress.target - progress.value);
  return (
    <Card as="section" aria-labelledby="goal-heading" className={styles.goal}>
      <ProgressRing
        ratio={progress.ratio}
        value={progress.value}
        max={progress.target}
        label="Today’s goal"
        valueText={`${progress.value} of ${pluralize(progress.target, one, many)}${progress.met ? ', goal met' : ''}`}
      >
        <span className={styles.ringValue}>{formatNumber(progress.value)}</span>
        <span className={styles.muted}>of {formatNumber(progress.target)}</span>
      </ProgressRing>
      <div className={styles.goalText}>
        <h2 id="goal-heading" className={styles.cardHeading}>
          Today’s goal
        </h2>
        <p>
          {progress.met ? (
            <strong>Goal met. Lovely!</strong>
          ) : (
            `${pluralize(left, one, many)} to go`
          )}
        </p>
        <p className={styles.muted}>
          {pluralize(progress.target, one, many)} a day ·{' '}
          <Link href={ROUTES.settings}>Change goal</Link>
        </p>
      </div>
    </Card>
  );
}

export function YearGoal({
  finished,
  goal,
  year,
}: {
  finished: number;
  goal: number;
  year: number;
}) {
  return (
    <div className={styles.yearGoal}>
      <p>
        <strong>{finished}</strong> of {pluralize(goal, 'book')} in {year}
      </p>
      {goal > 0 && (
        <ProgressBar
          value={finished}
          max={goal}
          label={`Yearly goal ${year}`}
          valueText={`${finished} of ${goal} books`}
        />
      )}
    </div>
  );
}
