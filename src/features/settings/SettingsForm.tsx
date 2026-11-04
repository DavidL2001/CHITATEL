'use client';

import { useRef, useState } from 'react';
import { FormError } from '@/components/Banner/Banner';
import { Button } from '@/components/Button/Button';
import { ChoiceGroup } from '@/components/ChoiceGroup/ChoiceGroup';
import { NumberField } from '@/components/NumberField/NumberField';
import { SelectField } from '@/components/SelectField/SelectField';
import { LIMITS } from '@/constants/limits';
import { useFormAction } from '@/hooks/useFormAction';
import { saveSettings } from '@/server/actions/settings';
import type { GoalType, SettingsDTO } from '@/types';
import styles from './settings.module.scss';

export function SettingsForm({
  settings,
  timezones,
}: {
  settings: SettingsDTO;
  timezones: string[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [goalType, setGoalType] = useState<GoalType>(settings.dailyGoal.type);
  const [timezone, setTimezone] = useState(settings.timezone);
  const { state, onSubmit, pending, fieldErrors } = useFormAction(saveSettings, { formRef });

  const detect = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && timezones.includes(tz)) setTimezone(tz);
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form}>
      <FormError message={state.status === 'error' ? state.message : null} />
      <ChoiceGroup
        label="Daily goal is measured in"
        name="goalType"
        layout="row"
        value={goalType}
        onChange={setGoalType}
        options={[
          { value: 'pages', label: 'Pages' },
          { value: 'minutes', label: 'Minutes' },
        ]}
        error={fieldErrors.goalType}
      />
      <NumberField
        label={`Daily goal (${goalType})`}
        stepperLabel="daily goal"
        name="goalAmount"
        stepper
        step={5}
        min={1}
        max={goalType === 'pages' ? LIMITS.maxDailyGoalPages : LIMITS.maxDailyGoalMinutes}
        defaultValue={settings.dailyGoal.amount}
        error={fieldErrors.goalAmount}
        required
      />
      <NumberField
        label="Books to read this year"
        stepperLabel="yearly goal"
        name="yearlyBookGoal"
        stepper
        min={0}
        max={LIMITS.maxYearlyBookGoal}
        defaultValue={settings.yearlyBookGoal}
        error={fieldErrors.yearlyBookGoal}
        required
      />
      <div className={styles.timezone}>
        <SelectField
          label="Timezone"
          name="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          hint="Reading days and streaks follow your local date in this timezone."
          error={fieldErrors.timezone}
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </SelectField>
        <Button variant="ghost" onClick={detect}>
          Use this device’s timezone
        </Button>
      </div>
      <Button type="submit" size="lg" pending={pending}>
        Save settings
      </Button>
    </form>
  );
}
