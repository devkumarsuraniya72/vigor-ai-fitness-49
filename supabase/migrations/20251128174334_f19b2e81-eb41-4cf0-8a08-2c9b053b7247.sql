-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  daily_calorie_target INTEGER DEFAULT 2000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in seconds
  rest_time INTEGER DEFAULT 30, -- in seconds
  image_url TEXT,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  calories_burned INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create day_exercises junction table
CREATE TABLE public.day_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day_number, order_index)
);

-- Create progress table
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  calories_burned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_number)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for exercises (public read)
CREATE POLICY "Anyone can view exercises"
  ON public.exercises FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for day_exercises (public read)
CREATE POLICY "Anyone can view day exercises"
  ON public.day_exercises FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for progress
CREATE POLICY "Users can view their own progress"
  ON public.progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert beginner exercises
INSERT INTO public.exercises (name, description, duration, rest_time, difficulty, calories_burned) VALUES
('Jumping Jacks', 'Full body cardio exercise with jumping and arm movements', 45, 30, 'beginner', 50),
('Push-ups', 'Upper body strength exercise targeting chest, shoulders, and triceps', 60, 30, 'beginner', 40),
('Squats', 'Lower body exercise targeting quads, hamstrings, and glutes', 60, 30, 'beginner', 45),
('Plank', 'Core stability exercise holding a push-up position', 60, 30, 'beginner', 35),
('Mountain Climbers', 'Dynamic cardio exercise with running motion in plank position', 45, 30, 'beginner', 60),
('High Knees', 'Cardio exercise with alternating knee lifts', 45, 30, 'beginner', 55),
('Burpees', 'Full body high-intensity exercise combining squat, plank, and jump', 45, 60, 'intermediate', 70),
('Alternate Lunges', 'Lower body exercise with alternating forward leg lunges', 60, 30, 'beginner', 50),
('Arm Circles', 'Shoulder mobility exercise with circular arm movements', 45, 20, 'beginner', 30),
('Glute Bridge', 'Lower body exercise targeting glutes and hamstrings', 60, 30, 'beginner', 40),
('Bicycle Crunches', 'Core exercise with alternating elbow to knee movements', 60, 30, 'beginner', 45),
('Leg Raises', 'Lower ab exercise lifting legs while lying down', 60, 30, 'beginner', 40),
('Russian Twist', 'Core rotational exercise with twisting motion', 60, 30, 'beginner', 50),
('Tricep Dips', 'Upper body exercise targeting triceps using bodyweight', 60, 30, 'beginner', 35),
('Side Plank', 'Core stability exercise holding side position', 60, 30, 'intermediate', 40);

-- Create day exercise mappings (Days 1-30 with varied exercises)
DO $$
DECLARE
  exercise_ids UUID[];
  day INT;
  exercise_count INT;
  idx INT;
BEGIN
  -- Get all exercise IDs
  SELECT ARRAY_AGG(id) INTO exercise_ids FROM public.exercises;
  exercise_count := array_length(exercise_ids, 1);
  
  -- Create mappings for each day
  FOR day IN 1..30 LOOP
    -- Each day gets 8-12 exercises in rotation
    FOR idx IN 0..7 LOOP
      INSERT INTO public.day_exercises (day_number, exercise_id, order_index)
      VALUES (
        day,
        exercise_ids[((day + idx) % exercise_count) + 1],
        idx
      );
    END LOOP;
  END LOOP;
END $$;