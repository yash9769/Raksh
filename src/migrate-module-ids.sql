-- Migration script to fix module IDs and add missing columns
-- Run this in your Supabase SQL Editor if you've already set up the database

-- Add last_active_date column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_active_date') THEN
        ALTER TABLE public.user_profiles ADD COLUMN last_active_date DATE;
        RAISE NOTICE 'Added last_active_date column to user_profiles';
    ELSE
        RAISE NOTICE 'last_active_date column already exists';
    END IF;
END $$;

-- Update module IDs in learning_modules table
UPDATE public.learning_modules
SET id = 'fire-safety-basics'
WHERE id = 'fire-safety-fundamentals';

UPDATE public.learning_modules
SET id = 'flood-response-basics'
WHERE id = 'flood-response-training';

UPDATE public.learning_modules
SET id = 'emergency-communication-basics'
WHERE id = 'emergency-communication';

-- Update module IDs in user_progress table
UPDATE public.user_progress
SET module_id = 'fire-safety-basics'
WHERE module_id = 'fire-safety-fundamentals';

UPDATE public.user_progress
SET module_id = 'flood-response-basics'
WHERE module_id = 'flood-response-training';

UPDATE public.user_progress
SET module_id = 'emergency-communication-basics'
WHERE module_id = 'emergency-communication';

-- Update module IDs in module_questions table
UPDATE public.module_questions
SET module_id = 'fire-safety-basics'
WHERE module_id = 'fire-safety-fundamentals';

UPDATE public.module_questions
SET module_id = 'flood-response-basics'
WHERE module_id = 'flood-response-training';

UPDATE public.module_questions
SET module_id = 'emergency-communication-basics'
WHERE module_id = 'emergency-communication';

-- Insert any missing modules with correct IDs
INSERT INTO public.learning_modules (id, title, description, video_url, duration, xp_reward, category) VALUES
('fire-safety-basics', 'Fire Safety Fundamentals', 'Master fire prevention, detection, and evacuation procedures for various scenarios.', 'https://www.youtube.com/embed/Xgc90CoJbDI?rel=0&modestbranding=1&controls=1', '20 min', 150, 'fire'),
('flood-response-basics', 'Flood Response Training', 'Navigate flood emergencies safely with proper preparation and response techniques.', 'https://www.youtube.com/embed/43M5mZuzHF8?rel=0&modestbranding=1&controls=1', '18 min', 180, 'flood'),
('emergency-communication-basics', 'Emergency Communication', 'Essential communication strategies during crisis situations.', 'https://www.youtube.com/embed/kE3XAwR412I?rel=0&modestbranding=1&controls=1', '12 min', 120, 'communication')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    video_url = EXCLUDED.video_url,
    duration = EXCLUDED.duration,
    xp_reward = EXCLUDED.xp_reward,
    category = EXCLUDED.category,
    updated_at = timezone('utc'::text, now());

-- Insert questions for modules that might be missing them
INSERT INTO public.module_questions (module_id, question, options, correct_answer, explanation, order_index) VALUES
-- Fire safety questions
('fire-safety-basics', 'What does the acronym PASS stand for in fire extinguisher use?',
 '["Pull, Aim, Squeeze, Sweep", "Point, Activate, Stop, Start", "Push, Apply, Spray, Stop", "Prepare, Align, Spray, Secure"]',
 0, 'PASS stands for Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep from side to side.', 1),
('fire-safety-basics', 'What should you do if your clothes catch fire?',
 '["Run to get help", "Stop, Drop, and Roll", "Try to put it out with your hands", "Jump into water"]',
 1, 'Stop, Drop, and Roll helps smother the flames. Running will only make the fire worse by feeding it oxygen.', 2),
('fire-safety-basics', 'What is the most important thing to do in a fire emergency?',
 '["Save valuable items", "Get out and stay out", "Try to fight the fire", "Open windows for ventilation"]',
 1, 'The most important thing is to get out safely and stay out. Property can be replaced, but lives cannot.', 3),
-- Flood response questions
('flood-response-basics', 'How deep does moving water need to be to knock you down?',
 '["2 feet", "1 foot", "6 inches", "3 feet"]',
 2, 'Just 6 inches of moving water can knock you down. Water is much more powerful than people realize.', 1),
('flood-response-basics', 'What should you do if you''re driving and encounter flood water?',
 '["Drive through quickly", "Turn around, don''t drown", "Wait in your car", "Drive slowly through it"]',
 1, 'Turn around, don''t drown! Just 12 inches of rushing water can carry away a vehicle. Never drive through flood water.', 2),
('flood-response-basics', 'If trapped in a flooded building, where should you go?',
 '["Basement for safety", "Ground floor", "Highest floor available", "Outside immediately"]',
 2, 'Go to the highest floor available and wait for rescue. Avoid the basement where you can become trapped.', 3),
-- Emergency communication questions
('emergency-communication-basics', 'What information should you provide first when calling emergency services?',
 '["Your name", "What happened", "Your location", "How many people are involved"]',
 2, 'Always give your location first. This ensures help can be sent even if the call gets disconnected.', 1),
('emergency-communication-basics', 'During an emergency, what type of communication should you prioritize?',
 '["Social media posts", "Text messages to family", "Email updates", "Phone calls to friends"]',
 1, 'Text messages use less bandwidth and are more likely to get through when phone lines are overloaded.', 2),
('emergency-communication-basics', 'What should you include in your family emergency communication plan?',
 '["Only local contact numbers", "An out-of-state contact person", "Just immediate family contacts", "Work contacts only"]',
 1, 'An out-of-state contact can help coordinate family communication when local lines are down.', 3)
ON CONFLICT DO NOTHING;