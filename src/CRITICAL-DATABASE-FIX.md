# 🚨 CRITICAL: Database Schema Fixes Required

## Problem 1: Emergency Contacts Not Saving
Your emergency contacts are failing to save because the database is missing the `emergency_contacts` column.

## Problem 2: Module Completion Not Tracking
Module completion (especially Fire Safety) isn't being captured because the database has incorrect module IDs that don't match the application code.

## The Solution
**YOU MUST RUN THIS SQL IN YOUR SUPABASE SQL EDITOR RIGHT NOW:**

```sql
-- Add emergency_contacts JSONB column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]'::jsonb;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_emergency_contacts 
ON public.user_profiles USING GIN (emergency_contacts);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'emergency_contacts';
```

## Fix 1: Emergency Contacts Column

**Run this SQL in your Supabase SQL Editor:**

```sql
-- Add emergency_contacts JSONB column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]'::jsonb;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_emergency_contacts
ON public.user_profiles USING GIN (emergency_contacts);

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'emergency_contacts';
```

**Steps:**
1. **Open Supabase Dashboard** → Go to SQL Editor
2. **Copy and paste the SQL above**
3. **Click "RUN"**
4. **Verify you see**: `emergency_contacts | jsonb` in the results
5. **Test adding a contact in your app**

## Fix 2: Module ID Migration & Streak System

**If you've already set up the database, run the migration script to fix module IDs and add streak tracking:**

The database sample data had incorrect module IDs that don't match what the app expects, and the streak system needs the `last_active_date` column. Run the contents of `migrate-module-ids.sql` in your Supabase SQL Editor.

**Key fixes:**
- `fire-safety-fundamentals` → `fire-safety-basics`
- `flood-response-training` → `flood-response-basics`
- `emergency-communication` → `emergency-communication-basics`
- Adds `last_active_date` column for proper streak tracking

## After Running All Fixes:
- ✅ Emergency contacts will save properly
- ✅ Module completion will be tracked correctly
- ✅ Fire Safety completion will now be captured
- ✅ All modules will display progress properly
- ✅ Streak counter will update properly when completing activities
- ✅ Daily activity streaks will be maintained accurately
- ✅ No more database errors

**These fixes must be applied before testing the features!**