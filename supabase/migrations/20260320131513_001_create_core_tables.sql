/*
  # PooPee Core Database Schema

  1. New Tables
    - `profiles` - User profile data with settings and preferences
    - `bowel_movements` - Bowel movement tracking entries
    - `urinations` - Urination tracking entries
    - `meals` - Meal logging entries
    - `achievements` - User achievement tracking
    - `streaks` - Daily streak tracking
    - `chatbot_preferences` - User chatbot customization settings
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated user data access
    - Ensure users can only access their own data
    
  3. Features
    - Timestamps for all events
    - Enum types for Bristol scale and other classifications
    - Foreign key relationships to user profiles
    - Indexes for efficient querying
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'User',
  avatar_color text DEFAULT '#A8D5BA',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create enum for Bristol scale
CREATE TYPE bristol_scale_type AS ENUM (
  'type_1',
  'type_2',
  'type_3',
  'type_4',
  'type_5',
  'type_6',
  'type_7'
);

-- Create bowel movements table
CREATE TABLE IF NOT EXISTS bowel_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bristol_scale bristol_scale_type NOT NULL,
  color text NOT NULL,
  duration_seconds integer,
  urgency_level integer CHECK (urgency_level >= 0 AND urgency_level <= 5),
  satisfaction_rating integer CHECK (satisfaction_rating >= 0 AND satisfaction_rating <= 5),
  symptoms text[] DEFAULT ARRAY[]::text[],
  notes text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bowel_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bowel movements"
  ON bowel_movements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bowel movements"
  ON bowel_movements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bowel movements"
  ON bowel_movements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bowel movements"
  ON bowel_movements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_bowel_movements_user_id ON bowel_movements(user_id);
CREATE INDEX idx_bowel_movements_created_at ON bowel_movements(created_at);

-- Create urinations table
CREATE TABLE IF NOT EXISTS urinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volume_estimate integer CHECK (volume_estimate >= 0 AND volume_estimate <= 1000),
  color text NOT NULL,
  flow_characteristic text,
  urgency_level integer CHECK (urgency_level >= 0 AND urgency_level <= 5),
  frequency_level integer CHECK (frequency_level >= 0 AND frequency_level <= 5),
  symptoms text[] DEFAULT ARRAY[]::text[],
  is_nighttime boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE urinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own urinations"
  ON urinations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own urinations"
  ON urinations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own urinations"
  ON urinations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own urinations"
  ON urinations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_urinations_user_id ON urinations(user_id);
CREATE INDEX idx_urinations_created_at ON urinations(created_at);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description text NOT NULL,
  photo_url text,
  calories integer,
  carbs_grams integer,
  protein_grams integer,
  fat_grams integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_created_at ON meals(created_at);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text,
  icon_name text,
  achieved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_achieved_at ON achievements(achieved_at);

-- Create streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type text NOT NULL CHECK (streak_type IN ('daily_logs', 'bowel', 'urination')),
  current_count integer DEFAULT 0,
  max_count integer DEFAULT 0,
  last_logged_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_streaks_user_id ON streaks(user_id);

-- Create chatbot preferences table
CREATE TABLE IF NOT EXISTS chatbot_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  accent text DEFAULT 'british' CHECK (accent IN ('british', 'southern', 'australian')),
  voice_gender text DEFAULT 'male' CHECK (voice_gender IN ('male', 'female')),
  speech_rate float DEFAULT 1.0 CHECK (speech_rate >= 0.5 AND speech_rate <= 2.0),
  volume_level float DEFAULT 1.0 CHECK (volume_level >= 0.0 AND volume_level <= 1.0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chatbot_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chatbot preferences"
  ON chatbot_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own chatbot preferences"
  ON chatbot_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own chatbot preferences"
  ON chatbot_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_chatbot_preferences_user_id ON chatbot_preferences(user_id);