import { supabase } from './supabase';

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  emoji: string;
  criteria: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_log',
    type: 'milestone',
    title: 'Getting Started',
    description: 'Log your first entry',
    emoji: '🌱',
    criteria: 'first_log',
  },
  {
    id: 'week_warrior',
    type: 'streak',
    title: 'Week Warrior',
    description: '7 days of logging',
    emoji: '🏆',
    criteria: '7_day_streak',
  },
  {
    id: 'month_master',
    type: 'streak',
    title: 'Month Master',
    description: '30 days of logging',
    emoji: '👑',
    criteria: '30_day_streak',
  },
  {
    id: 'perfect_day',
    type: 'milestone',
    title: 'Perfect Day',
    description: 'Log all three tracking types in one day',
    emoji: '✨',
    criteria: 'perfect_day',
  },
  {
    id: 'data_detective',
    type: 'milestone',
    title: 'Data Detective',
    description: 'Log 50 total entries',
    emoji: '🔍',
    criteria: '50_entries',
  },
  {
    id: 'meal_master',
    type: 'milestone',
    title: 'Meal Master',
    description: 'Log 25 meals',
    emoji: '🍽️',
    criteria: '25_meals',
  },
  {
    id: 'hydration_hero',
    type: 'milestone',
    title: 'Hydration Hero',
    description: 'Log 50 urinations',
    emoji: '💧',
    criteria: '50_urinations',
  },
];

export async function checkAndAwardAchievements(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: bowels } = await supabase
      .from('bowel_movements')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    const { data: urinations } = await supabase
      .from('urinations')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    const { data: meals } = await supabase
      .from('meals')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    const { data: todayBowels } = await supabase
      .from('bowel_movements')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', today);

    const { data: todayUrinations } = await supabase
      .from('urinations')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', today);

    const { data: todayMeals } = await supabase
      .from('meals')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', today);

    const totalBowels = bowels?.length || 0;
    const totalUrinations = urinations?.length || 0;
    const totalMeals = meals?.length || 0;
    const totalEntries = totalBowels + totalUrinations + totalMeals;

    const todayBowelCount = todayBowels?.length || 0;
    const todayUrinationCount = todayUrinations?.length || 0;
    const todayMealCount = todayMeals?.length || 0;

    const { data: existingAchievements } = await supabase
      .from('achievements')
      .select('achievement_type')
      .eq('user_id', userId);

    const existingTypes = new Set((existingAchievements || []).map((a) => a.achievement_type));

    const newAchievements = [];

    if (totalEntries > 0 && !existingTypes.has('first_log')) {
      newAchievements.push({
        achievement_type: 'first_log',
        title: 'Getting Started',
        icon_name: '🌱',
      });
    }

    if (todayBowelCount > 0 && todayUrinationCount > 0 && todayMealCount > 0 && !existingTypes.has('perfect_day')) {
      newAchievements.push({
        achievement_type: 'perfect_day',
        title: 'Perfect Day',
        icon_name: '✨',
      });
    }

    if (totalEntries >= 50 && !existingTypes.has('data_detective')) {
      newAchievements.push({
        achievement_type: 'data_detective',
        title: 'Data Detective',
        icon_name: '🔍',
      });
    }

    if (totalMeals >= 25 && !existingTypes.has('meal_master')) {
      newAchievements.push({
        achievement_type: 'meal_master',
        title: 'Meal Master',
        icon_name: '🍽️',
      });
    }

    if (totalUrinations >= 50 && !existingTypes.has('hydration_hero')) {
      newAchievements.push({
        achievement_type: 'hydration_hero',
        title: 'Hydration Hero',
        icon_name: '💧',
      });
    }

    if (newAchievements.length > 0) {
      await supabase.from('achievements').insert(
        newAchievements.map((ach) => ({
          user_id: userId,
          achievement_type: ach.achievement_type,
          title: ach.title,
          icon_name: ach.icon_name,
        }))
      );
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}
