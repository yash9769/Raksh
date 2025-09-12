# 🚨 CRITICAL: Database Schema Fix Required

## The Problem
Your emergency contacts are failing to save because the database is missing the `emergency_contacts` column.

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

## Steps:
1. **Open Supabase Dashboard** → Go to SQL Editor
2. **Copy and paste the SQL above**
3. **Click "RUN"**
4. **Verify you see**: `emergency_contacts | jsonb` in the results
5. **Test adding a contact in your app**

## After Running the SQL:
- ✅ Emergency contacts will save properly
- ✅ Dialog will close automatically after save
- ✅ Contacts will appear in "Personal Contacts" section immediately
- ✅ No more database errors

**This must be done before testing emergency contacts!**