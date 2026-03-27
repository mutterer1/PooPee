export type UnifiedEntry = {
  id: string;
  type: 'bowel' | 'urination' | 'meal';
  created_at: string;
  title: string;
  detail: string;
};

export function buildUnifiedEntries(
  bowels: Array<{ id: string; created_at: string; bristol_scale: number; symptoms?: string[] }>,
  urinations: Array<{ id: string; created_at: string; flow_characteristic: string; is_nighttime: boolean }>,
  meals: Array<{ id: string; created_at: string; meal_type: string; description?: string }>
): UnifiedEntry[] {
  const entries: UnifiedEntry[] = [
    ...bowels.map((b) => ({
      id: b.id,
      type: 'bowel' as const,
      created_at: b.created_at,
      title: 'Bowel Movement',
      detail: `Bristol ${b.bristol_scale}${b.symptoms?.length ? ` • ${b.symptoms.join(', ')}` : ''}`,
    })),
    ...urinations.map((u) => ({
      id: u.id,
      type: 'urination' as const,
      created_at: u.created_at,
      title: 'Urination',
      detail: `${u.flow_characteristic}${u.is_nighttime ? ' • Nighttime' : ''}`,
    })),
    ...meals.map((m) => ({
      id: m.id,
      type: 'meal' as const,
      created_at: m.created_at,
      title: 'Meal',
      detail: `${m.meal_type}${m.description ? ` • ${m.description}` : ''}`,
    })),
  ];

  return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function formatEntryTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface InsightSummaryInput {
  totalEntries: number;
  totalBowelMovements: number;
  totalUrinations: number;
  totalMeals: number;
  firstLoggedAt?: string;
  looseStoolCount: number;
  urgentBowelCount: number;
  nighttimeUrinationCount: number;
}

interface InsightSummary {
  daysSinceStart: number;
  trackingScore: number;
  message: string;
}

export function buildInsightSummary(input: InsightSummaryInput): InsightSummary {
  let daysSinceStart = 1;
  if (input.firstLoggedAt) {
    const startDate = new Date(input.firstLoggedAt);
    const today = new Date();
    daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const trackingScore = Math.min(100, Math.round((input.totalEntries / daysSinceStart) * 10));

  let message = '';

  if (input.totalEntries < 5) {
    message =
      'You are just getting started. Keep logging to build a useful history. Focus on consistency over perfection.';
  } else if (input.totalEntries < 20) {
    message =
      'Your data is starting to take shape. A few more weeks of tracking will reveal clearer patterns and trends.';
  } else {
    const patterns: string[] = [];

    if (input.looseStoolCount > input.totalBowelMovements * 0.3) {
      patterns.push('frequent loose stools');
    }

    if (input.urgentBowelCount > input.totalBowelMovements * 0.4) {
      patterns.push('recurring urgency');
    }

    if (input.nighttimeUrinationCount > input.totalUrinations * 0.2) {
      patterns.push('nighttime urination');
    }

    if (patterns.length === 0) {
      message =
        'Your tracking data shows general consistency. Continue monitoring for any shifts or changes that might be worth discussing with your provider.';
    } else if (patterns.length === 1) {
      message = `You have logged ${patterns[0]}. If this pattern continues or worsens, consider discussing it with your healthcare provider.`;
    } else {
      message = `Your data shows multiple patterns: ${patterns.join(', ')}. These trends may be worth discussing with your healthcare provider for further guidance.`;
    }
  }

  return {
    daysSinceStart,
    trackingScore,
    message,
  };
}
