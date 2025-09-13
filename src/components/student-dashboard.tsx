import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";
import { DatabaseSetupReminder } from "./database-setup-reminder";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Alert, AlertDescription } from "./ui/alert";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import {
  Shield,
  BookOpen,
  Trophy,
  Target,
  Zap,
  Star,
  AlertTriangle,
  Users,
  Award,
  Flame,
  MapPin,
  LogOut,
  Rocket,
  TrendingUp,
  Clock,
  Heart,
  Mountain,
  Waves,
  PlayCircle,
  ChevronRight,
  Database,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";
import {
  EmergencyAlert,
  subscribeToAlerts,
  awardBadgeAndXP,
} from "../lib/supabase";

interface StudentDashboardProps {
  onNavigate: (section: string, moduleId?: string) => void;
  onEmergencyMode: () => void;
}

export function StudentDashboard({
  onNavigate,
  onEmergencyMode,
}: StudentDashboardProps) {
  const { user, profile, signOut, moduleProgress, getPreparednessScore, refreshProfile, updateStreak } = useAuth();
  const [activeAlert, setActiveAlert] =
    useState<EmergencyAlert | null>(null);

  useEffect(() => {
    // Subscribe to real-time emergency alerts
    const subscription = subscribeToAlerts((alert) => {
      if (alert.active) {
        setActiveAlert(alert);
        // Auto-switch to emergency mode for critical alerts
        if (
          alert.type === "fire" ||
          alert.type === "earthquake"
        ) {
          onEmergencyMode();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onEmergencyMode]);


  // Dynamic next mission based on completed modules
  const getNextMission = useCallback(() => {
    const earthquakeCompleted = moduleProgress.find(p => p.moduleId === 'earthquake-safety-basics')?.completed;
    const fireCompleted = moduleProgress.find(p => p.moduleId === 'fire-safety-basics')?.completed;
    const floodCompleted = moduleProgress.find(p => p.moduleId === 'flood-response-basics')?.completed;
    const commCompleted = moduleProgress.find(p => p.moduleId === 'emergency-communication-basics')?.completed;

    if (!earthquakeCompleted) {
      return {
        title: "Earthquake Safety Basics",
        duration: "15 min",
        xpReward: 200, // Match the module's actual XP reward
        type: "video-quiz",
        moduleId: "earthquake-safety-basics"
      };
    } else if (!fireCompleted) {
      return {
        title: "Fire Safety Fundamentals", 
        duration: "20 min",
        xpReward: 150,
        type: "video-quiz",
        moduleId: "fire-safety-basics"
      };
    } else if (!floodCompleted) {
      return {
        title: "Flood Response Training",
        duration: "18 min", 
        xpReward: 180,
        type: "video-quiz",
        moduleId: "flood-response-basics"
      };
    } else if (!commCompleted) {
      return {
        title: "Emergency Communication",
        duration: "12 min",
        xpReward: 120,
        type: "video-quiz", 
        moduleId: "emergency-communication-basics"
      };
    } else {
      // All modules completed
      return {
        title: "All Modules Complete! 🎉",
        duration: "Ongoing",
        xpReward: 0,
        type: "maintenance",
        moduleId: null
      };
    }
  }, [moduleProgress]);

  const [nextMission, setNextMission] = useState(() => getNextMission());

  // Update next mission when module progress changes
  useEffect(() => {
    const newMission = getNextMission();
    console.log('Updating next mission based on progress:', { 
      moduleProgress, 
      newMission,
      earthquakeCompleted: moduleProgress.find(p => p.moduleId === 'earthquake-safety-basics')?.completed 
    });
    setNextMission(newMission);
  }, [getNextMission]);

  const [dailyChallenge, setDailyChallenge] = useState({
    title: "Identify 3 Exit Routes",
    description:
      "Can you find the nearest emergency exits from your current location?",
    xpReward: 50,
    completed: false,
    showQuiz: false,
    currentQuestion: 0,
    selectedAnswer: '',
    answers: [] as string[],
    score: 0,
    showFeedback: false,
    showRetryMessage: false,
  });

  const dailyChallengeQuestions = [
    {
      question: "How many emergency exits should you be able to identify in any building?",
      options: [
        "At least 1",
        "At least 2",
        "At least 3",
        "As many as possible"
      ],
      correct: 1,
      explanation: "You should always know at least 2 exit routes from any location. Having multiple options ensures you can escape safely even if one route is blocked."
    },
    {
      question: "What should you look for when identifying emergency exits?",
      options: [
        "Green exit signs with white lettering",
        "Red exit signs with white lettering",
        "Any door that leads outside",
        "Windows that can be opened"
      ],
      correct: 0,
      explanation: "Emergency exits are marked with green signs containing white letters spelling 'EXIT'. These are the primary indicators of safe escape routes."
    },
    {
      question: "Why is it important to identify multiple exit routes?",
      options: [
        "To impress your friends",
        "In case one exit is blocked by fire or debris",
        "To find the shortest path",
        "For emergency drills only"
      ],
      correct: 1,
      explanation: "During an emergency, your primary exit route might be blocked by fire, smoke, or debris. Having alternative routes ensures you can always find a safe way out."
    }
  ];

  const handleStartDailyChallenge = () => {
    setDailyChallenge(prev => ({ ...prev, showQuiz: true }));
  };

  const handleDailyChallengeAnswerSelect = (value: string) => {
    console.log('Selected answer:', value);
    setDailyChallenge(prev => ({ ...prev, selectedAnswer: value }));
  };

  const handleDailyChallengeQuestionSubmit = () => {
    const currentQ = dailyChallengeQuestions[dailyChallenge.currentQuestion];
    const selectedIndex = parseInt(dailyChallenge.selectedAnswer);
    const isCorrect = selectedIndex === currentQ.correct;
    console.log(`Question ${dailyChallenge.currentQuestion + 1}: Selected ${selectedIndex}, Correct ${currentQ.correct}, isCorrect: ${isCorrect}`);
    const newAnswers = [...dailyChallenge.answers, dailyChallenge.selectedAnswer];
    const newScore = isCorrect ? dailyChallenge.score + 1 : dailyChallenge.score;

    setDailyChallenge(prev => ({
      ...prev,
      answers: newAnswers,
      score: newScore,
      showFeedback: true
    }));

    setTimeout(() => {
      setDailyChallenge(prev => {
        const nextQuestion = prev.currentQuestion + 1;
        if (nextQuestion < dailyChallengeQuestions.length) {
          return {
            ...prev,
            currentQuestion: nextQuestion,
            selectedAnswer: '',
            showFeedback: false
          };
        } else {
          // Quiz completed
          return {
            ...prev,
            showFeedback: false
          };
        }
      });
    }, 2500);
  };

  const handleCompleteDailyChallenge = async () => {
    if (!user || dailyChallenge.completed) return;

    let finalScore = dailyChallenge.score;

    // If we're on the last question and have a selected answer, submit it first
    if (dailyChallenge.currentQuestion + 1 >= dailyChallengeQuestions.length && dailyChallenge.selectedAnswer) {
      const currentQ = dailyChallengeQuestions[dailyChallenge.currentQuestion];
      const isCorrect = parseInt(dailyChallenge.selectedAnswer) === currentQ.correct;
      const newAnswers = [...dailyChallenge.answers, dailyChallenge.selectedAnswer];
      finalScore = isCorrect ? dailyChallenge.score + 1 : dailyChallenge.score;

      setDailyChallenge(prev => ({
        ...prev,
        answers: newAnswers,
        score: finalScore,
        showFeedback: true
      }));

      console.log(`Question ${dailyChallenge.currentQuestion + 1}: Selected ${parseInt(dailyChallenge.selectedAnswer)}, Correct ${currentQ.correct}, isCorrect: ${isCorrect}`);
    }

    // Check if quiz is passed (at least 80% score)
    console.log('Daily challenge final score:', finalScore, 'out of', dailyChallengeQuestions.length);
    const percentage = Math.round((finalScore / dailyChallengeQuestions.length) * 100);
    console.log('Calculated percentage:', percentage);
    if (percentage < 80) {
      // Show retry message and reset quiz after a delay
      setDailyChallenge(prev => ({ ...prev, showRetryMessage: true }));

      setTimeout(() => {
        setDailyChallenge(prev => ({
          ...prev,
          currentQuestion: 0,
          selectedAnswer: '',
          answers: [],
          score: 0,
          showFeedback: false,
          showRetryMessage: false,
          showQuiz: true
        }));
      }, 3000); // Show message for 3 seconds before resetting
      return;
    }

    try {
      // Award XP for completing the daily challenge
      const result = await awardBadgeAndXP(user.id, dailyChallenge.xpReward);

      if (result.error) {
        console.error('Failed to award XP for daily challenge:', result.error);
        return;
      }

      // Mark challenge as completed
      setDailyChallenge(prev => ({ ...prev, completed: true, showQuiz: false }));

      // Refresh profile to update XP display and update streak
      await Promise.all([
        refreshProfile(),
        updateStreak()
      ]);

      console.log(`Daily challenge completed! Awarded ${dailyChallenge.xpReward} XP`);
    } catch (error) {
      console.error('Error completing daily challenge:', error);
    }
  };

  // Dynamic badges based on user profile
  const recentBadges =
    profile?.badges?.map((badge) => {
      switch (badge) {
        case "fire_safety_expert":
          return {
            name: "Fire Safety Expert",
            icon: Flame,
            color: "text-red-500",
          };
        case "quick_learner":
          return {
            name: "Quick Learner",
            icon: Zap,
            color: "text-yellow-500",
          };
        case "earthquake_expert":
          return {
            name: "Earthquake Expert",
            icon: Mountain,
            color: "text-orange-500",
          };
        case "map_navigator":
          return {
            name: "Map Navigator",
            icon: MapPin,
            color: "text-green-500",
          };
        case "flood_expert":
          return {
            name: "Flood Expert",
            icon: Waves,
            color: "text-blue-500",
          };
        case "communication_expert":
          return {
            name: "Communication Expert",
            icon: Heart,
            color: "text-pink-500",
          };
        case "safety_expert":
          return {
            name: "Safety Expert",
            icon: Shield,
            color: "text-green-500",
          };
        default:
          return {
            name: badge,
            icon: Award,
            color: "text-purple-500",
          };
      }
    }) || [];

  // Enhanced modules with icons, colors, and XP rewards - now with real progress data
  const getModuleStatus = (moduleId: string) => {
    const progress = moduleProgress.find(p => p.moduleId === moduleId)
    if (progress?.completed) return "completed"
    // All modules are now available from the start
    return "available"
  }

  const getModuleProgress = (moduleId: string) => {
    const progress = moduleProgress.find(p => p.moduleId === moduleId)
    return progress?.completed ? 100 : 0
  }

  const modules = [
    {
      id: "fire-safety-basics",
      title: "Fire Safety",
      progress: getModuleProgress("fire-safety-basics"),
      icon: Flame,
      color: "bg-red-50 border-red-200 hover:border-red-300",
      tagColor: "bg-red-100 text-red-700",
      progressColor: "bg-red-500",
      xpReward: 150,
      description: "Learn fire prevention and emergency response",
      status: getModuleStatus("fire-safety-basics")
    },
    {
      id: "earthquake-safety-basics",
      title: "Earthquake Preparedness", 
      progress: getModuleProgress("earthquake-safety-basics"),
      icon: Mountain,
      color: "bg-orange-50 border-orange-200 hover:border-orange-300",
      tagColor: "bg-orange-100 text-orange-700",
      progressColor: "bg-orange-500",
      xpReward: 200,
      description: "Master earthquake safety and survival techniques",
      status: getModuleStatus("earthquake-safety-basics")
    },
    {
      id: "flood-response-basics",
      title: "Flood Response",
      progress: getModuleProgress("flood-response-basics"),
      icon: Waves,
      color: "bg-blue-50 border-blue-200 hover:border-blue-300", 
      tagColor: "bg-blue-100 text-blue-700",
      progressColor: "bg-blue-500",
      xpReward: 180,
      description: "Navigate flood emergencies safely",
      status: getModuleStatus("flood-response-basics")
    },
    {
      id: "emergency-communication-basics",
      title: "Emergency Communication",
      progress: getModuleProgress("emergency-communication-basics"),
      icon: Heart,
      color: "bg-pink-50 border-pink-200 hover:border-pink-300",
      tagColor: "bg-pink-100 text-pink-700", 
      progressColor: "bg-pink-500",
      xpReward: 120,
      description: "Essential communication during crises",
      status: getModuleStatus("emergency-communication-basics")
    },
  ];

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-4">
      {/* Enhanced Header with Personalized Welcome */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 ring-2 ring-blue-200">
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold">
              {profile?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back, {profile?.full_name ? getFirstName(profile.full_name) : 'User'}! 👋
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                Level {profile?.level || 1}
              </Badge>
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-sm">
                <Flame className="w-4 h-4" />
                <span className="font-medium">{profile?.streak_days || 0} day streak</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => signOut()} className="hover:bg-gray-100">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onEmergencyMode}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency SOS
          </Button>
        </div>
      </div>

      {/* Active Alert */}
      {activeAlert && (
        <Alert className="mb-6 border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-600">
            <strong>{activeAlert.title}</strong> -{" "}
            {activeAlert.message}
          </AlertDescription>
        </Alert>
      )}


      {/* Database Setup Reminder */}
      {moduleProgress.length === 0 && (profile?.xp || 0) === 0 && (
        <div className="mb-6">
          <DatabaseSetupReminder />
        </div>
      )}

      {/* Enhanced Preparedness Score */}
      <Card className="mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white shadow-xl border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm"></div>
        <CardHeader className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-white" />
                <CardTitle className="text-white text-xl">
                  Preparedness Score
                </CardTitle>
              </div>
              <CardDescription className="text-blue-100">
                Your disaster readiness level
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                {getPreparednessScore()}%
              </div>
              <div className="text-sm text-blue-100">
                {getPreparednessScore() < 25
                  ? "Next Badge at 25%"
                  : getPreparednessScore() < 50
                  ? "Next Badge at 50%"
                  : getPreparednessScore() < 75
                  ? "Next Badge at 75%"
                  : "Expert Level! 🏆"}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="relative">
            <Progress
              value={getPreparednessScore()}
              className="h-4 bg-white/20"
            />
            {/* Milestone markers */}
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Enhanced Next Mission */}
      <Card className="mb-6 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-blue-600 text-lg">
                Your Next Mission
              </CardTitle>
            </div>
            <div className="flex items-center gap-1 bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm">
              <Mountain className="w-4 h-4" />
              <span className="font-medium">Essential</span>
            </div>
          </div>
          <CardTitle className="text-xl text-gray-900 mb-2">
            {nextMission.title}
          </CardTitle>
          {nextMission.moduleId ? (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{nextMission.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-600">
                <Zap className="w-4 h-4" />
                <span className="font-medium">+{nextMission.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <PlayCircle className="w-4 h-4" />
                <span>Video + Quiz</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-green-600 mb-2">🎓 Congratulations!</p>
              <p className="text-sm text-muted-foreground">You've completed all available learning modules. Keep practicing daily challenges!</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="relative z-10">
          {nextMission.moduleId ? (
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => onNavigate("learning", nextMission.moduleId || "earthquake-safety-basics")}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Start Learning 🚀
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-50"
              disabled
            >
              <Trophy className="w-4 h-4 mr-2" />
              All Modules Complete! 🎉
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Daily Challenge */}
      <Card className="mb-6 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-full -translate-y-12 translate-x-12"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold">Daily Challenge</span>
            </div>
          <Badge variant="outline" className="mr-2 bg-amber-200 text-amber-800 hover:bg-amber-300">
            Today
          </Badge>
          </div>
          <CardTitle className="text-xl text-gray-900 mb-2">
            {dailyChallenge.title}
          </CardTitle>
          {!dailyChallenge.showQuiz && !dailyChallenge.completed && (
            <CardDescription className="text-gray-600">
              {dailyChallenge.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="relative z-10">
          {dailyChallenge.completed ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-green-700 font-semibold">Challenge Completed!</p>
              <p className="text-sm text-gray-600">Earned +{dailyChallenge.xpReward} XP</p>
            </div>
          ) : dailyChallenge.showQuiz ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-700">
                  <Zap className="w-3 h-3 mr-1" />
                  Question {dailyChallenge.currentQuestion + 1}
                </Badge>
                <Badge variant="outline">
                  {dailyChallengeQuestions.length - dailyChallenge.currentQuestion} remaining
                </Badge>
              </div>

              <CardTitle className="text-lg leading-relaxed mb-4">
                {dailyChallengeQuestions[dailyChallenge.currentQuestion]?.question}
              </CardTitle>

              <RadioGroup value={dailyChallenge.selectedAnswer} onValueChange={handleDailyChallengeAnswerSelect}>
                {dailyChallengeQuestions[dailyChallenge.currentQuestion]?.options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300 cursor-pointer mb-2"
                  >
                    <RadioGroupItem value={index.toString()} id={`daily-option-${index}`} />
                    <Label htmlFor={`daily-option-${index}`} className="flex-1 cursor-pointer text-base">
                      {option}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>

              {dailyChallenge.showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl border-2 ${
                    parseInt(dailyChallenge.selectedAnswer) === dailyChallengeQuestions[dailyChallenge.currentQuestion].correct
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {parseInt(dailyChallenge.selectedAnswer) === dailyChallengeQuestions[dailyChallenge.currentQuestion].correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-bold">
                      {parseInt(dailyChallenge.selectedAnswer) === dailyChallengeQuestions[dailyChallenge.currentQuestion].correct ? 'Correct!' : 'Not quite right'}
                    </span>
                  </div>
                  <p className="text-sm">{dailyChallengeQuestions[dailyChallenge.currentQuestion].explanation}</p>
                </motion.div>
              )}

              {dailyChallenge.showRetryMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl border-2 bg-orange-50 border-orange-300 text-orange-800"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="font-bold">Quiz Not Passed</span>
                  </div>
                  <p className="text-sm">
                    You scored {Math.round((dailyChallenge.score / dailyChallengeQuestions.length) * 100)}%.
                    You need at least 80% to complete this challenge. Try again!
                  </p>
                </motion.div>
              )}

              <div className="flex justify-between items-center pt-4">
                <div className="flex items-center gap-1 text-amber-600">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">+{dailyChallenge.xpReward} XP</span>
                </div>
                {dailyChallenge.currentQuestion + 1 >= dailyChallengeQuestions.length ? (
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-md"
                    onClick={handleCompleteDailyChallenge}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Finish Challenge
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md"
                    onClick={handleDailyChallengeQuestionSubmit}
                    disabled={!dailyChallenge.selectedAnswer || dailyChallenge.showFeedback}
                  >
                    Next Question
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-amber-600">
                <Zap className="w-4 h-4" />
                <span className="font-medium">+{dailyChallenge.xpReward} XP</span>
              </div>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-md"
                onClick={handleStartDailyChallenge}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Challenge
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Stats Grid with Glassmorphism */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80 group cursor-pointer">
          <CardContent className="p-5">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3 group-hover:text-yellow-600 transition-colors" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {profile?.badges?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Badges
            </div>
          </CardContent>
        </Card>

        <Card className="text-center bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80 group cursor-pointer">
          <CardContent className="p-5">
            <Zap className="w-8 h-8 text-blue-500 mx-auto mb-3 group-hover:text-blue-600 transition-colors" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {profile?.xp || 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Total XP
            </div>
          </CardContent>
        </Card>

        <Card className="text-center bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80 group cursor-pointer">
          <CardContent className="p-5">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3 group-hover:text-green-600 transition-colors" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {(profile?.xp || 0) > 100 ? "Rising ⭐" : (profile?.xp || 0) > 0 ? "Learning 📚" : "New 🌱"}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Status
            </div>
          </CardContent>
        </Card>

        <Card className="text-center bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80 group cursor-pointer">
          <CardContent className="p-5">
            <Shield className="w-8 h-8 text-purple-500 mx-auto mb-3 group-hover:text-purple-600 transition-colors" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {profile?.level || 1}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Level
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Achievements */}
      <Card className="mb-6 bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Award className="w-6 h-6 text-amber-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentBadges.length > 0 ? (
              recentBadges.map((badge, index) => {
                const IconComponent = badge.icon;
                return (
                  <div
                    key={index}
                    className="flex-shrink-0 text-center cursor-pointer group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:border-gray-300">
                      <IconComponent
                        className={`w-8 h-8 ${badge.color} group-hover:scale-110 transition-transform`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground max-w-16 truncate font-medium">
                      {badge.name}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-12">
                <div className="inline-block mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-10 h-10 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges yet!</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Start your first mission to earn badges and build your safety expertise! 🏆
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Learning Modules */}
      <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-gray-900">Learning Modules</CardTitle>
          </div>
          <CardDescription>
            Complete modules to unlock badges and improve your disaster preparedness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.map((module, index) => {
              const IconComponent = module.icon;
              return (
                <div
                  key={module.id}
                  className={`p-5 rounded-xl border-2 ${module.color} transition-all duration-300 cursor-pointer group hover:shadow-lg`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/80 shadow-sm group-hover:shadow-md transition-all duration-300">
                        <IconComponent className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 text-lg">
                            {module.title}
                          </span>
              <Badge variant="secondary" className={`${module.tagColor} text-xs px-2 py-0.5 mr-2`}>
                {module.status === 'completed' ? '🎉 Completed' : 
                 module.status === 'locked' ? '🔒 Locked' : '✅ Available'}
              </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {module.description}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-amber-600">
                            <Zap className="w-4 h-4" />
                            <span className="font-medium">+{module.xpReward} XP</span>
                          </div>
                          <div className="text-gray-500">
                            {module.progress}% Complete
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={module.status === 'locked'}
                      className="group-hover:bg-white/90 transition-all duration-300"
                      onClick={() => module.status === 'available' && onNavigate('learning', module.id)}
                    >
                      {module.status === 'completed' ? 'Review' :
                       module.status === 'locked' ? 'Locked' : 'Start'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Progress
                      value={module.progress}
                      className="h-3 bg-white/60"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
