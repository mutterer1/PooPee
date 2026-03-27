/*
  # Add Entry Insights System

  1. New Tables
    - `entry_insights` - Stores AI-generated insights for individual entries
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `entry_type` (text) - Type of entry: bowel_movement, urination, meal
      - `entry_id` (uuid) - ID of the related entry
      - `insight_type` (text) - Type of insight: immediate, pattern, recommendation
      - `title` (text) - Insight title
      - `description` (text) - Detailed insight
      - `severity` (text) - normal, attention, positive
      - `actionable_tips` (text[]) - Array of actionable suggestions
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `entry_insights` table
    - Add policies for authenticated users to access their own insights

  3. Notes
    - Immediate insights are generated right after entry creation
    - Pattern insights are generated from historical data analysis
    - All insights are stored for future reference and trends
*/

CREATE TABLE IF NOT EXISTS entry_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type text NOT NULL CHECK (entry_type IN ('bowel_movement', 'urination', 'meal')),
  entry_id uuid NOT NULL,
  insight_type text NOT NULL CHECK (insight_type IN ('immediate', 'pattern', 'recommendation')),
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'normal' CHECK (severity IN ('normal', 'attention', 'positive')),
  actionable_tips text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE entry_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entry insights"
  ON entry_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entry insights"
  ON entry_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entry insights"
  ON entry_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_entry_insights_user_id ON entry_insights(user_id);
CREATE INDEX idx_entry_insights_entry_id ON entry_insights(entry_id);
CREATE INDEX idx_entry_insights_created_at ON entry_insights(created_at);
CREATE INDEX idx_entry_insights_entry_type ON entry_insights(entry_type);
