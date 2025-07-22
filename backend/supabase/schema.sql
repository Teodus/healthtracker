-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  preferences JSONB DEFAULT '{"darkMode": false, "notifications": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  calorie_goal INTEGER NOT NULL DEFAULT 2000,
  protein_goal INTEGER NOT NULL DEFAULT 150,
  workout_goal INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habit completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(habit_id, date)
);

-- Food entries table
CREATE TABLE IF NOT EXISTS food_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL DEFAULT 0,
  meal VARCHAR(20) NOT NULL CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT,
  analysis_confidence DECIMAL(3,2),
  nutrition_breakdown JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cardio', 'strength', 'flexibility', 'sports', 'other')),
  duration INTEGER NOT NULL, -- in minutes
  calories INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT true,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily summaries table for performance optimization
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calories INTEGER DEFAULT 0,
  total_protein INTEGER DEFAULT 0,
  meals_logged INTEGER DEFAULT 0,
  workouts_completed INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  total_habits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_completions_user_date ON habit_completions(user_id, date);
CREATE INDEX idx_habit_completions_habit_date ON habit_completions(habit_id, date);
CREATE INDEX idx_food_entries_user_timestamp ON food_entries(user_id, timestamp);
CREATE INDEX idx_workouts_user_timestamp ON workouts(user_id, timestamp);
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_entries_updated_at BEFORE UPDATE ON food_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_summaries_updated_at BEFORE UPDATE ON daily_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own data
CREATE POLICY users_policy ON users
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY user_goals_policy ON user_goals
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY habits_policy ON habits
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY habit_completions_policy ON habit_completions
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY food_entries_policy ON food_entries
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY workouts_policy ON workouts
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY daily_summaries_policy ON daily_summaries
  FOR ALL USING (auth.uid()::text = user_id::text);