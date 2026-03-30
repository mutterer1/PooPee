/*
  # Chatbot System Tables

  1. New Tables
    - `chatbot_preferences` - User chatbot settings
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `enabled` (boolean, default true)
      - `accent` (text: 'british' | 'southern' | 'australian')
      - `voice_gender` (text: 'male' | 'female')
      - `speech_rate` (number, default 1.0)
      - `volume_level` (number, default 1.0)
      - `analysis_mode` (text: 'standard' | 'ai_powered', default 'standard')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chatbot_conversations` - Stores chat sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chatbot_messages` - Individual messages in conversations
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `role` (text: 'user' | 'assistant')
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write own data only
    - Users cannot access other users' conversations or preferences

  3. Key Features
    - User preferences stored for chatbot customization
    - Conversation history maintained for context
    - Messages linked to conversations for organization
    - Timestamps for all records
*/

CREATE TABLE IF NOT EXISTS chatbot_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  accent text DEFAULT 'british' CHECK (accent IN ('british', 'southern', 'australian')),
  voice_gender text DEFAULT 'male' CHECK (voice_gender IN ('male', 'female')),
  speech_rate numeric DEFAULT 1.0 CHECK (speech_rate BETWEEN 0.5 AND 2.0),
  volume_level numeric DEFAULT 1.0 CHECK (volume_level BETWEEN 0 AND 1),
  analysis_mode text DEFAULT 'standard' CHECK (analysis_mode IN ('standard', 'ai_powered')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chatbot_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON chatbot_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON chatbot_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON chatbot_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own conversations"
  ON chatbot_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON chatbot_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own messages"
  ON chatbot_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND chatbot_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON chatbot_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbot_conversations
      WHERE chatbot_conversations.id = chatbot_messages.conversation_id
      AND chatbot_conversations.user_id = auth.uid()
    )
  );
