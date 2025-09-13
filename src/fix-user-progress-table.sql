-- Quick fix to add the missing 'completed' column to user_progress table
-- Run this in your Supabase SQL Editor if you've already created the tables

-- Add completed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'completed') THEN
        ALTER TABLE public.user_progress ADD COLUMN completed BOOLEAN DEFAULT false;
        
        -- Update existing records where completed_at is not null to set completed = true
        UPDATE public.user_progress 
        SET completed = true 
        WHERE completed_at IS NOT NULL;
        
        -- Add index for better performance
        CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_progress(completed);
        
        RAISE NOTICE 'Successfully added completed column to user_progress table';
    ELSE
        RAISE NOTICE 'completed column already exists in user_progress table';
    END IF;
END $$;