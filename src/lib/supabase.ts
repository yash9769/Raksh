import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xidfvigvnqfezyuhwipf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZGZ2aWd2bnFmZXp5dWh3aXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjczMTUsImV4cCI6MjA3MzE0MzMxNX0.zuoLXXaf0y0zuWNVnMxy6LFdCQpgRiGhDKkFlK8kuEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Database Types
export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'faculty' | 'admin'
  avatar_url?: string
  preparedness_score: number
  level: number
  xp: number
  badges: string[]
  streak_days: number
  last_active_date?: string
  emergency_contacts?: EmergencyContact[]
  created_at: string
  updated_at: string
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: string
}

export interface LearningModule {
  id: string
  title: string
  description: string
  video_url: string
  duration_minutes: number
  xp_reward: number
  questions: ModuleQuestion[]
  created_at: string
  updated_at: string
}

export interface ModuleQuestion {
  id: string
  module_id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  order_index: number
}

export interface UserProgress {
  id: string
  user_id: string
  module_id: string
  completed: boolean
  score: number
  completed_at?: string
  created_at: string
}

export interface EmergencyAlert {
  id: string
  admin_id: string
  type: 'fire' | 'earthquake' | 'flood' | 'security' | 'medical' | 'drill'
  title: string
  message: string
  location?: string
  active: boolean
  created_at: string
}

export interface SafetyStatus {
  id: string
  user_id: string
  alert_id?: string
  status: 'safe' | 'need_help' | 'injured' | 'unknown'
  location?: string
  coordinates?: { lat: number; lng: number }
  message?: string
  created_at: string
  updated_at: string
}

// Auth helpers
export const signUp = async (email: string, password: string, metadata: { full_name: string, role: 'student' | 'faculty' | 'admin' }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
      // Email confirmation disabled in Supabase dashboard settings
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Profile helpers
export const createUserProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([profile])
    .select()
    .single()
  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// Learning modules and progress tracking
export const getLearningModules = async () => {
  const { data, error } = await supabase
    .from('learning_modules')
    .select(`
      *,
      questions:module_questions(*)
    `)
    .order('created_at')
  return { data, error }
}



export const updateLearningProgress = async (userId: string, moduleId: string, score: number, earnedXP: number) => {
  try {
    // Check if table exists first
    const { error: tableError } = await supabase.from('user_progress').select('id').limit(1)

    if (tableError) {
      throw new Error(`Database not set up properly: ${tableError.message}`)
    }

    // Get existing progress
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single()

    const updateData = {
      score: existingProgress ? Math.max(existingProgress.score, score) : score,
      completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .select()
        .single()
      return { data, error }
    } else {
      // Create new progress record
      const insertData = {
        user_id: userId,
        module_id: moduleId,
        ...updateData
      }

      const { data, error } = await supabase
        .from('user_progress')
        .insert([insertData])
        .select()
        .single()
      return { data, error }
    }
  } catch (error) {
    console.error('Progress update failed:', error)
    return { data: null, error: error as any }
  }
}

export const awardBadgeAndXP = async (userId: string, xpGained: number, badgeEarned?: string) => {
  try {
    const { data: profile, error: profileError } = await getUserProfile(userId)

    if (!profile || profileError) {
      return { error: profileError || 'Profile not found' }
    }

    const newXP = (profile.xp || 0) + xpGained
    const newBadges = badgeEarned && !profile.badges?.includes(badgeEarned)
      ? [...(profile.badges || []), badgeEarned]
      : profile.badges || []

    const { data, error } = await updateUserProfile(userId, {
      xp: newXP,
      badges: newBadges
    })

    return { data, error }
  } catch (error) {
    console.error('Badge/XP award failed:', error)
    return { data: null, error: error as any }
  }
}

export const getUserProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      *,
      module:learning_modules(*)
    `)
    .eq('user_id', userId)
  return { data, error }
}

export const saveModuleProgress = async (progress: Partial<UserProgress>) => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert([progress])
    .select()
    .single()
  return { data, error }
}

// Emergency alerts
export const createEmergencyAlert = async (alert: Partial<EmergencyAlert>) => {
  const { data, error } = await supabase
    .from('emergency_alerts')
    .insert([alert])
    .select()
    .single()
  return { data, error }
}

export const getActiveAlerts = async () => {
  const { data, error } = await supabase
    .from('emergency_alerts')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateSafetyStatus = async (status: Partial<SafetyStatus>) => {
  try {
    // Map the status fields to match database schema
    const dbStatus = {
      user_id: status.user_id,
      alert_id: status.alert_id,
      // Map status field correctly
      status: status.status,
      location: status.location,
      // Map coordinates to JSONB format
      coordinates: status.coordinates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('safety_status')
      .upsert([dbStatus])
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Safety status update error:', error)
    return { data: null, error: error as any }
  }
}

export const getSafetyStatuses = async (alertId?: string) => {
  let query = supabase
    .from('safety_status')
    .select(`
      *,
      user:user_profiles(full_name, role)
    `)
    .order('updated_at', { ascending: false })

  if (alertId) {
    query = query.eq('alert_id', alertId)
  }

  const { data, error } = await query
  return { data, error }
}

// Real-time subscriptions
export const subscribeToAlerts = (callback: (alert: EmergencyAlert) => void) => {
  return supabase
    .channel('emergency_alerts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'emergency_alerts'
    }, (payload) => {
      callback(payload.new as EmergencyAlert)
    })
    .subscribe()
}

export const subscribeToSafetyStatus = (callback: (status: SafetyStatus) => void) => {
  return supabase
    .channel('safety_status')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'safety_status'
    }, (payload) => {
      callback(payload.new as SafetyStatus)
    })
    .subscribe()
}

// Emergency contacts helpers
export const updateEmergencyContacts = async (userId: string, contacts: EmergencyContact[]) => {
  try {
    // Check if emergency_contacts column exists first
    const { error: columnError } = await supabase
      .from('user_profiles')
      .select('emergency_contacts')
      .limit(1)

    if (columnError?.code === 'PGRST204') {
      console.error('❌ Database schema error: emergency_contacts column not found!')
      return {
        data: null,
        error: {
          message: 'Database setup incomplete. Please run the migration SQL in Supabase.',
          code: 'SCHEMA_ERROR'
        }
      }
    }

    const { data, error } = await updateUserProfile(userId, { emergency_contacts: contacts })
    return { data, error }
  } catch (error) {
    console.error('Emergency contacts update failed:', error)
    return { data: null, error: error as any }
  }
}

export const getEmergencyContacts = async (userId: string): Promise<EmergencyContact[]> => {
  try {
    console.log('🔍 Getting emergency contacts for user:', userId)
    const { data: profile, error } = await getUserProfile(userId)

    if (error) {
      console.error('❌ Error getting user profile:', error)
      return []
    }

    if (!profile) {
      console.log('⚠️ No profile found for user:', userId)
      return []
    }

    const contacts = profile.emergency_contacts || []
    console.log('✅ Retrieved emergency contacts:', contacts)
    return contacts
  } catch (error) {
    console.error('❌ Failed to get emergency contacts:', error)
    return []
  }
}
