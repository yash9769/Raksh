-- Raksha Disaster Preparedness Platform Database Schema
-- Execute these commands in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
    institution TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges TEXT[] DEFAULT '{}',
    streak_days INTEGER DEFAULT 0,
    preparedness_score INTEGER DEFAULT 0,
    avatar_url TEXT,
    phone TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create learning_modules table
CREATE TABLE IF NOT EXISTS public.learning_modules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration TEXT,
    xp_reward INTEGER DEFAULT 0,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category TEXT,
    prerequisites TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create module_questions table
CREATE TABLE IF NOT EXISTS public.module_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id TEXT REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    module_id TEXT REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- in seconds
    attempts INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, module_id)
);

-- Create emergency_alerts table
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('fire', 'earthquake', 'flood', 'evacuation', 'general', 'test')),
    severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location TEXT,
    coordinates JSONB, -- {lat: number, lng: number}
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create safety_status table
CREATE TABLE IF NOT EXISTS public.safety_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'unknown' CHECK (status IN ('safe', 'need_help', 'injured', 'unknown')),
    location TEXT,
    coordinates JSONB, -- {lat: number, lng: number}
    message TEXT,
    alert_id UUID REFERENCES public.emergency_alerts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add completed column to existing user_progress table if it doesn't exist
DO $ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'completed') THEN
        ALTER TABLE public.user_progress ADD COLUMN completed BOOLEAN DEFAULT false;
    END IF;
END $;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON public.user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_progress(completed);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_active ON public.emergency_alerts(active);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_type ON public.emergency_alerts(type);
CREATE INDEX IF NOT EXISTS idx_safety_status_user_id ON public.safety_status(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_status_alert_id ON public.safety_status(alert_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- User profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User progress: users can read/update their own progress
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Learning modules: everyone can read, only admins can modify
CREATE POLICY "Anyone can view learning modules" ON public.learning_modules
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage learning modules" ON public.learning_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'faculty')
        )
    );

-- Module questions: everyone can read, only admins can modify
CREATE POLICY "Anyone can view module questions" ON public.module_questions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage module questions" ON public.module_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'faculty')
        )
    );

-- Emergency alerts: everyone can read, only admins can create/modify
CREATE POLICY "Anyone can view emergency alerts" ON public.emergency_alerts
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage emergency alerts" ON public.emergency_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'faculty')
        )
    );

-- Safety status: users can read/update their own, admins can view all
CREATE POLICY "Users can manage own safety status" ON public.safety_status
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all safety status" ON public.safety_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'faculty')
        )
    );

-- Insert sample learning module data
INSERT INTO public.learning_modules (id, title, description, video_url, duration, xp_reward, category) VALUES
('earthquake-safety-basics', 'Earthquake Safety Basics', 'Learn fundamental earthquake safety techniques including Drop, Cover, and Hold On procedures.', 'https://www.youtube.com/embed/BLEPakj1YTY?rel=0&modestbranding=1&controls=1', '15 min', 120, 'earthquake'),
('fire-safety-fundamentals', 'Fire Safety Fundamentals', 'Master fire prevention, detection, and evacuation procedures for various scenarios.', '', '20 min', 150, 'fire'),
('flood-response-training', 'Flood Response Training', 'Navigate flood emergencies safely with proper preparation and response techniques.', '', '18 min', 180, 'flood'),
('emergency-communication', 'Emergency Communication', 'Essential communication strategies during crisis situations.', '', '12 min', 120, 'communication')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    video_url = EXCLUDED.video_url,
    updated_at = timezone('utc'::text, now());

-- Insert sample questions for earthquake module
INSERT INTO public.module_questions (module_id, question, options, correct_answer, explanation, order_index) VALUES
('earthquake-safety-basics', 'What should you do immediately when you feel an earthquake?', 
 '["Run outside as fast as possible", "Drop, Cover, and Hold On", "Stand in a doorway", "Go to the top floor"]', 
 1, 'Drop, Cover, and Hold On is the recommended action. Drop to hands and knees, take cover under a desk or table, and hold on until shaking stops.', 1),
('earthquake-safety-basics', 'Which location is safest during an earthquake?', 
 '["Under a heavy desk or table", "In a doorway", "Next to a window", "On an upper floor"]', 
 0, 'Under a heavy desk or table provides the best protection from falling objects, which cause most earthquake injuries.', 2),
('earthquake-safety-basics', 'After an earthquake stops, what should you do first?', 
 '["Check for injuries and hazards", "Call your family immediately", "Go outside to see damage", "Turn on the TV for news"]', 
 0, 'Check yourself and others for injuries first, then assess for hazards like gas leaks, electrical damage, or structural damage.', 3)
ON CONFLICT DO NOTHING;

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.learning_modules FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.emergency_alerts FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.safety_status FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;