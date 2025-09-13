import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile, getUserProfile, createUserProfile, getUserProgress, getLearningModules } from './supabase'

interface ModuleProgress {
  moduleId: string
  title: string
  completed: boolean
  score: number
  completedAt?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  moduleProgress: ModuleProgress[]
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata: { full_name: string, role: 'student' | 'faculty' | 'admin' }) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateStreak: () => Promise<void>
  refreshProgress: () => Promise<void>
  refreshProfile: () => Promise<void>
  getPreparednessScore: () => number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await getUserProfile(userId)
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const user = await supabase.auth.getUser()
        if (user.data.user) {
          const newProfile = {
            id: userId,
            email: user.data.user.email!,
            full_name: user.data.user.user_metadata?.full_name || '',
            role: (user.data.user.user_metadata?.role as 'student' | 'faculty' | 'admin') || 'student',
            preparedness_score: 0,
            level: 1,
            xp: 0,
            badges: [],
            streak_days: 0
          }
          const { data: createdProfile } = await createUserProfile(newProfile)
          setProfile(createdProfile)
        }
      } else if (data) {
        setProfile(data)
      }
      
      // Load user progress after profile is loaded
      await loadUserProgress(userId)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProgress = async (userId: string) => {
    try {
      // Get user's progress
      const { data: progressData } = await getUserProgress(userId)
      
      // Create default modules if database doesn't exist yet
      const defaultModules = [
        { id: 'earthquake-safety-basics', title: 'Earthquake Safety Basics' },
        { id: 'fire-safety-basics', title: 'Fire Safety Basics' },
        { id: 'flood-response-basics', title: 'Flood Response Basics' },
        { id: 'emergency-communication-basics', title: 'Emergency Communication Basics' },
      ]
      
      let modulesData = defaultModules
      
      // Try to get modules from database
      try {
        const { data: dbModules } = await getLearningModules()
        if (dbModules && dbModules.length > 0) {
          modulesData = dbModules
        }
      } catch (moduleError) {
        console.log('Using default modules (database not set up yet)')
      }
      
      // Create progress array with completion status
      const progressMap = new Map(progressData?.map(p => [p.module_id, p]) || [])
      
      const moduleProgressArray: ModuleProgress[] = modulesData.map(module => {
        const userProgress = progressMap.get(module.id)
        // Check if completed column exists, otherwise use completed_at as indicator
        const isCompleted = userProgress?.completed !== undefined 
          ? userProgress.completed 
          : !!userProgress?.completed_at
        
        return {
          moduleId: module.id,
          title: module.title,
          completed: isCompleted,
          score: userProgress?.score || 0,
          completedAt: userProgress?.completed_at
        }
      })
      
      setModuleProgress(moduleProgressArray)

      // Update level based on completed modules
      const completedModules = moduleProgressArray.filter(m => m.completed).length
      const newLevel = completedModules + 1
      if (profile && profile.level !== newLevel) {
        await updateProfile({ level: newLevel })
      }

      

      
    } catch (error) {
      console.error('Error loading user progress:', error)
      // Set default empty progress if there's an error
      setModuleProgress([
        { moduleId: 'earthquake-safety-basics', title: 'Earthquake Safety Basics', completed: false, score: 0 },
        { moduleId: 'fire-safety-basics', title: 'Fire Safety Basics', completed: false, score: 0 },
        { moduleId: 'flood-response-basics', title: 'Flood Response Basics', completed: false, score: 0 },
        { moduleId: 'emergency-communication-basics', title: 'Emergency Communication Basics', completed: false, score: 0 },
      ])
    }
  }

  const refreshProgress = async () => {
    if (user) {
      await loadUserProgress(user.id)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile data for user:', user.id)
      console.log('📊 Current profile badges before refresh:', profile?.badges)
      
      // Reload the profile to get updated badges and XP
      const { data, error } = await getUserProfile(user.id)
      if (data && !error) {
        console.log('✅ Profile refreshed successfully!')
        console.log('🏆 New profile badges after refresh:', data.badges)
        setProfile(data)
      } else {
        console.error('❌ Error refreshing profile:', error)
      }
    }
  }

  const getPreparednessScore = (): number => {
    if (moduleProgress.length === 0) return 0
    const completedModules = moduleProgress.filter(m => m.completed).length
    return Math.round((completedModules / moduleProgress.length) * 100)
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, metadata: { full_name: string, role: 'student' | 'faculty' | 'admin' }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: undefined // Disable email confirmation
      }
    })
    
    // If signup is successful and user is immediately confirmed, create profile
    if (data.user && !error) {
      const newProfile = {
        id: data.user.id,
        email: data.user.email!,
        full_name: metadata.full_name,
        role: metadata.role,
        preparedness_score: 0,
        level: 1,
        xp: 0,
        badges: [],
        streak_days: 0
      }
      await createUserProfile(newProfile)
    }
    
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return

    const { data } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (data) {
      setProfile(data)
    }
  }

  const updateStreak = async () => {
    if (!user || !profile) return

    try {
      const today = new Date().toDateString()
      const lastActiveDate = profile.last_active_date ? new Date(profile.last_active_date).toDateString() : null
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      let newStreak = 1

      if (lastActiveDate === today) {
        // Already active today, keep current streak
        newStreak = profile.streak_days || 0
      } else if (lastActiveDate === yesterday.toDateString()) {
        // Active yesterday, increment streak
        newStreak = (profile.streak_days || 0) + 1
      } else {
        // Streak broken or first time, reset to 1
        newStreak = 1
      }

      // Update profile with new streak and last active date
      await updateProfile({
        streak_days: newStreak,
        last_active_date: new Date().toISOString().split('T')[0]
      })

      console.log(`Streak updated: ${newStreak} days`)
    } catch (error) {
      console.error('Error updating streak:', error)
    }
  }

  const value = {
    user,
    profile,
    moduleProgress,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateStreak,
    refreshProgress,
    refreshProfile,
    getPreparednessScore,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}