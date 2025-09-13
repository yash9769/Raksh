import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { AuthGate } from './components/auth-gate';
import { Onboarding } from './components/onboarding';
import { StudentDashboard } from './components/student-dashboard';
import { LearningModule } from './components/learning-module';
import { EmergencyMode } from './components/emergency-mode';
import { AdminDashboard } from './components/admin-dashboard';
import { FacultyDashboard } from './components/faculty-dashboard';
import { AIChatbot } from './components/ai-chatbot';

function AppContent() {
  const { user, profile, loading, updateProfile } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'learning', 'emergency', 'admin', 'onboarding'
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [emergencyFromLogin, setEmergencyFromLogin] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('earthquake-safety-basics');

  // Define all handler functions first
  const handleNavigation = (section: string, moduleId?: string) => {
    setCurrentView(section);
    if (moduleId) {
      setSelectedModuleId(moduleId);
    }
  };

  const handleEmergencyMode = () => {
    setCurrentView('emergency');
  };

  const handleExitEmergency = () => {
    // Return to appropriate dashboard based on user role or login page
    if (!user || emergencyFromLogin) {
      setEmergencyFromLogin(false);
      setCurrentView('dashboard');
    } else if (profile?.role === 'student') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('admin');
    }
  };

  const handleEmergencyFromLogin = () => {
    setEmergencyFromLogin(true);
    setCurrentView('emergency');
  };

  // Onboarding disabled - users go directly to dashboard
  // useEffect(() => {
  //   if (user && profile) {
  //     // Show onboarding for users with 0 XP and no badges (completely new users)
  //     if (profile.xp === 0 && (!profile.badges || profile.badges.length === 0)) {
  //       setShowOnboarding(true);
  //     }
  //   }
  // }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !emergencyFromLogin) {
    return <AuthGate onEmergencyMode={handleEmergencyFromLogin} />;
  }

  // Handle emergency mode from login page (no user)
  if (emergencyFromLogin && currentView === 'emergency') {
    return <EmergencyMode onExit={handleExitEmergency} />;
  }

  // Onboarding disabled - skip directly to dashboard
  // if (showOnboarding) {
  //   return (
  //     <Onboarding 
  //       onComplete={(selectedRole: string) => {
  //         setShowOnboarding(false);
  //         // Award welcome XP to mark user as no longer new and update role if needed
  //         updateProfile({ 
  //           xp: 10,
  //           role: selectedRole as 'student' | 'faculty' | 'admin'
  //         });
  //       }} 
  //     />
  //   );
  // }

  const handleLearningComplete = () => {
    setCurrentView('dashboard');
  };

  const handleBackToApp = () => {
    if (profile?.role === 'student') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('admin');
    }
  };

  // Render current view based on role and navigation
  if (profile?.role === 'admin') {
    switch (currentView) {
      case 'emergency':
        return <EmergencyMode onExit={handleExitEmergency} />;
      default:
        return <AdminDashboard onBack={handleBackToApp} />;
    }
  } else if (profile?.role === 'faculty') {
    switch (currentView) {
      case 'emergency':
        return <EmergencyMode onExit={handleExitEmergency} />;
      default:
        return <FacultyDashboard onBack={handleBackToApp} />;
    }
  } else {
    // Student interface
    switch (currentView) {
      case 'learning':
        return (
          <LearningModule 
            moduleId={selectedModuleId}
            onBack={() => setCurrentView('dashboard')}
            onComplete={handleLearningComplete}
          />
        );
      case 'emergency':
        return <EmergencyMode onExit={handleExitEmergency} />;
      default:
        return (
          <StudentDashboard 
            onNavigate={handleNavigation}
            onEmergencyMode={handleEmergencyMode}
          />
        );
    }
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <AIChatbot />
    </AuthProvider>
  );
}
