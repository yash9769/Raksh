-- Add emergency_contacts JSONB column to user_profiles table
-- This will replace the old emergency_contact TEXT column

-- Add the new emergency_contacts column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]'::jsonb;

-- Optional: Migrate data from old emergency_contact column to new structure
-- This converts the old TEXT field to the new JSONB array format
UPDATE public.user_profiles 
SET emergency_contacts = CASE 
    WHEN emergency_contact IS NOT NULL AND emergency_contact != '' THEN
        jsonb_build_array(
            jsonb_build_object(
                'id', '1',
                'name', 'Emergency Contact',
                'phone', emergency_contact,
                'relationship', 'Emergency'
            )
        )
    ELSE '[]'::jsonb
END
WHERE emergency_contacts = '[]'::jsonb AND emergency_contact IS NOT NULL;

-- Optional: Drop the old emergency_contact column after migration
-- Uncomment the next line if you want to remove the old column completely
-- ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS emergency_contact;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_emergency_contacts 
ON public.user_profiles USING GIN (emergency_contacts);