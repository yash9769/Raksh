import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { motion } from "motion/react";
import { useAuth } from '../lib/auth-context';
import { updateLearningProgress, awardBadgeAndXP } from '../lib/supabase';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Trophy,
  Star,
  BookOpen,
  Zap,
  Target,
  Award,
  Lock,
  Unlock,
  Sparkles,
  Shield,
  PlayCircle,
  Rocket,
  AlertTriangle,
  RotateCcw,
  LogOut
} from "lucide-react";

interface LearningModuleProps {
  moduleId: string;
  onBack: () => void;
  onComplete: () => void;
}

export function LearningModule({ moduleId, onBack, onComplete }: LearningModuleProps) {
  const { user, updateProfile, refreshProgress, refreshProfile, updateStreak, signOut } = useAuth();
  const [currentStep, setCurrentStep] = useState('intro'); // 'intro', 'video', 'quiz', 'complete'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [insufficientScore, setInsufficientScore] = useState(false);

  const getModuleData = (moduleId: string) => {
    switch (moduleId) {
      case 'earthquake-safety-basics':
        return {
          title: "Earthquake Safety Basics",
          videoUrl: "https://www.youtube.com/embed/BLEPakj1YTY?rel=0&modestbranding=1&controls=1",
          duration: "15 min",
          xpReward: 200,
          badgeThreshold: 80,
          badgeName: "Earthquake Expert",
          perfectScoreBadge: "Quick Learner",
          questions: [
            {
              question: "What should you do immediately when you feel an earthquake?",
              options: [
                "Run outside as fast as possible",
                "Drop, Cover, and Hold On",
                "Stand in a doorway", 
                "Go to the top floor"
              ],
              correct: 1,
              explanation: "Drop, Cover, and Hold On is the recommended action. Drop to hands and knees, take cover under a desk or table, and hold on until shaking stops."
            },
            {
              question: "Which location is safest during an earthquake?",
              options: [
                "Under a heavy desk or table",
                "In a doorway",
                "Next to a window",
                "On an upper floor"
              ],
              correct: 0,
              explanation: "Under a heavy desk or table provides the best protection from falling objects, which cause most earthquake injuries."
            },
            {
              question: "After an earthquake stops, what should you do first?",
              options: [
                "Check for injuries and hazards",
                "Call your family immediately",
                "Go outside to see damage",
                "Turn on the TV for news"
              ],
              correct: 0,
              explanation: "Check yourself and others for injuries first, then assess for hazards like gas leaks, electrical damage, or structural damage."
            }
          ]
        };
      case 'fire-safety-basics':
        return {
          title: "Fire Safety Fundamentals",
          videoUrl: "https://www.youtube.com/embed/Xgc90CoJbDI?rel=0&modestbranding=1&controls=1",
          duration: "20 min",
          xpReward: 150,
          badgeThreshold: 80,
          badgeName: "Fire Safety Expert",
          perfectScoreBadge: "Fire Master",
          questions: [
            {
              question: "What does the acronym PASS stand for in fire extinguisher use?",
              options: [
                "Pull, Aim, Squeeze, Sweep",
                "Point, Activate, Stop, Start",
                "Push, Apply, Spray, Stop",
                "Prepare, Align, Spray, Secure"
              ],
              correct: 0,
              explanation: "PASS stands for Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep from side to side."
            },
            {
              question: "What should you do if your clothes catch fire?",
              options: [
                "Run to get help",
                "Stop, Drop, and Roll",
                "Try to put it out with your hands",
                "Jump into water"
              ],
              correct: 1,
              explanation: "Stop, Drop, and Roll helps smother the flames. Running will only make the fire worse by feeding it oxygen."
            },
            {
              question: "What is the most important thing to do in a fire emergency?",
              options: [
                "Save valuable items",
                "Get out and stay out",
                "Try to fight the fire",
                "Open windows for ventilation"
              ],
              correct: 1,
              explanation: "The most important thing is to get out safely and stay out. Property can be replaced, but lives cannot."
            }
          ]
        };
      case 'flood-response-basics':
        return {
          title: "Flood Response Training",
          videoUrl: "https://www.youtube.com/embed/43M5mZuzHF8?rel=0&modestbranding=1&controls=1",
          duration: "18 min",
          xpReward: 180,
          badgeThreshold: 80,
          badgeName: "Flood Navigator",
          perfectScoreBadge: "Water Wise",
          questions: [
            {
              question: "How deep does moving water need to be to knock you down?",
              options: [
                "2 feet",
                "1 foot",
                "6 inches",
                "3 feet"
              ],
              correct: 2,
              explanation: "Just 6 inches of moving water can knock you down. Water is much more powerful than people realize."
            },
            {
              question: "What should you do if you're driving and encounter flood water?",
              options: [
                "Drive through quickly",
                "Turn around, don't drown",
                "Wait in your car",
                "Drive slowly through it"
              ],
              correct: 1,
              explanation: "Turn around, don't drown! Just 12 inches of rushing water can carry away a vehicle. Never drive through flood water."
            },
            {
              question: "If trapped in a flooded building, where should you go?",
              options: [
                "Basement for safety",
                "Ground floor",
                "Highest floor available",
                "Outside immediately"
              ],
              correct: 2,
              explanation: "Go to the highest floor available and wait for rescue. Avoid the basement where you can become trapped."
            }
          ]
        };
      case 'emergency-communication-basics':
        return {
          title: "Emergency Communication",
          videoUrl: "https://www.youtube.com/embed/kE3XAwR412I?rel=0&modestbranding=1&controls=1",
          duration: "12 min",
          xpReward: 120,
          badgeThreshold: 80,
          badgeName: "Communication Expert",
          perfectScoreBadge: "Voice of Calm",
          questions: [
            {
              question: "What information should you provide first when calling emergency services?",
              options: [
                "Your name",
                "What happened",
                "Your location",
                "How many people are involved"
              ],
              correct: 2,
              explanation: "Always give your location first. This ensures help can be sent even if the call gets disconnected."
            },
            {
              question: "During an emergency, what type of communication should you prioritize?",
              options: [
                "Social media posts",
                "Text messages to family",
                "Email updates",
                "Phone calls to friends"
              ],
              correct: 1,
              explanation: "Text messages use less bandwidth and are more likely to get through when phone lines are overloaded."
            },
            {
              question: "What should you include in your family emergency communication plan?",
              options: [
                "Only local contact numbers",
                "An out-of-state contact person",
                "Just immediate family contacts",
                "Work contacts only"
              ],
              correct: 1,
              explanation: "An out-of-state contact can help coordinate family communication when local lines are down."
            }
          ]
        };
      default:
        // Fallback to earthquake module
        return getModuleData('earthquake-safety-basics');
    }
  };

  const module = getModuleData(moduleId);

  const getProgressValue = () => {
    if (currentStep === 'intro') return 0;
    if (currentStep === 'video') return 25;
    if (currentStep === 'quiz') return 50 + ((currentQuestion / module.questions.length) * 25);
    if (currentStep === 'insufficient') return 75;
    if (currentStep === 'complete') return 100;
    return 0;
  };

  const getStepStatus = (step: string) => {
    if (currentStep === 'intro') return step === 'intro' ? 'current' : 'upcoming';
    if (currentStep === 'video') {
      if (step === 'intro') return 'completed';
      if (step === 'video') return 'current';
      return 'upcoming';
    }
    if (currentStep === 'quiz') {
      if (step === 'intro' || step === 'video') return 'completed';
      if (step === 'quiz') return 'current';
      return 'upcoming';
    }
    if (currentStep === 'insufficient') {
      if (step === 'intro' || step === 'video') return 'completed';
      if (step === 'quiz') return 'current';
      return 'upcoming';
    }
    if (currentStep === 'complete') {
      return step === 'complete' ? 'current' : 'completed';
    }
    return 'upcoming';
  };

  const handleVideoComplete = () => {
    setVideoWatched(true);
    setCurrentStep('quiz');
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleQuestionSubmit = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    
    const isCorrect = parseInt(selectedAnswer) === module.questions[currentQuestion].correct;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
    }
    
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer('');
      
      if (currentQuestion + 1 < module.questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Check if score meets minimum requirement (80%) using the correct final score
        const finalPercentage = Math.round((newScore / module.questions.length) * 100);
        if (finalPercentage < 80) {
          setInsufficientScore(true);
          setCurrentStep('insufficient');
        } else {
          setCurrentStep('complete');
        }
      }
    }, 2500);
  };

  const handleRetakeQuiz = () => {
    // Reset quiz state for retake
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setAnswers([]);
    setScore(0);
    setShowFeedback(false);
    setInsufficientScore(false);
    setCurrentStep('quiz');
  };

  const handleComplete = async () => {
    if (!user || isProcessing) return;
    
    // Double-check that score meets minimum requirement
    const percentage = Math.round((score / module.questions.length) * 100);
    if (percentage < 80) {
      console.warn('Attempted to complete with insufficient score:', percentage);
      return;
    }
    
    setIsProcessing(true);
    console.log('Starting progress save for user:', user.id);
    
    // Set a generous timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Progress save taking too long, proceeding anyway');
      setIsProcessing(false);
      setSaveError('⚠️ Connection slow. Your progress is saved locally.');
      onComplete();
    }, 15000); // 15 second timeout
    
    try {
      const percentage = Math.round((score / module.questions.length) * 100);
      const earnedXP = Math.round((percentage / 100) * module.xpReward);
      
      console.log('Saving progress:', { percentage, earnedXP });
      
      // Try to save progress to database with improved error handling
      try {
        console.log('Attempting to save to database...');
        const progressResult = await updateLearningProgress(user.id, moduleId, percentage, earnedXP);
        
        if (progressResult.error) {
          throw new Error(progressResult.error.message);
        }
        
        console.log('Progress saved to database successfully!');
        
        // Award XP and badges
        const badgesToAward = [];
        
        // Award module-specific badge if score meets threshold
        if (percentage >= module.badgeThreshold) {
          switch (moduleId) {
            case 'earthquake-safety-basics':
              badgesToAward.push('earthquake_expert');
              break;
            case 'fire-safety-basics':
              badgesToAward.push('fire_safety_expert');
              break;
            case 'flood-response-basics':
              badgesToAward.push('flood_expert');
              break;
            case 'emergency-communication-basics':
              badgesToAward.push('communication_expert');
              break;
            default:
              badgesToAward.push('safety_expert');
          }
        }
        
        // Award quick learner badge for perfect scores
        if (percentage === 100) {
          badgesToAward.push('quick_learner');
        }
        
        console.log('Awarding XP and badges:', { earnedXP, badgesToAward });
        
        // Award badges sequentially to avoid race conditions
        if (badgesToAward.length > 0) {
          // Award XP only once with the first badge
          try {
            const xpResult = await awardBadgeAndXP(user.id, earnedXP, badgesToAward[0]);
            
            if (xpResult.error) {
              console.warn(`Failed to award first badge ${badgesToAward[0]}:`, xpResult.error.message);
            } else {
              console.log(`Badge ${badgesToAward[0]} and XP awarded successfully!`);
              
              // Award additional badges without XP (XP was already awarded)
              for (let i = 1; i < badgesToAward.length; i++) {
                try {
                  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to avoid race conditions
                  const additionalBadgeResult = await awardBadgeAndXP(user.id, 0, badgesToAward[i]);
                  
                  if (additionalBadgeResult.error) {
                    console.warn(`Failed to award additional badge ${badgesToAward[i]}:`, additionalBadgeResult.error.message);
                  } else {
                    console.log(`Additional badge ${badgesToAward[i]} awarded successfully!`);
                  }
                } catch (badgeError) {
                  console.warn(`Error awarding additional badge ${badgesToAward[i]}:`, badgeError);
                }
              }
            }
          } catch (badgeError) {
            console.warn(`Error awarding badges:`, badgeError);
          }
        }
        
      } catch (dbError) {
        console.warn('Database operations failed, using fallback:', dbError);
        
        // Save progress locally as fallback
        const badgesToAward = [];
        if (percentage >= module.badgeThreshold) {
          switch (moduleId) {
            case 'earthquake-safety-basics':
              badgesToAward.push('earthquake_expert');
              break;
            case 'fire-safety-basics':
              badgesToAward.push('fire_safety_expert');
              break;
            case 'flood-response-basics':
              badgesToAward.push('flood_expert');
              break;
            case 'emergency-communication-basics':
              badgesToAward.push('communication_expert');
              break;
            default:
              badgesToAward.push('safety_expert');
          }
        }
        if (percentage === 100) {
          badgesToAward.push('quick_learner');
        }
        
        const localProgress = {
          moduleId: moduleId,
          score: percentage,
          xp: earnedXP,
          badges: badgesToAward,
          completedAt: new Date().toISOString()
        };
        
        localStorage.setItem('raksha_pending_progress', JSON.stringify(localProgress));
        console.log('Progress saved locally as fallback');
        
        // Show user-friendly error message but don't block completion
        if (dbError instanceof Error) {
          if (dbError.message.includes('Database not set up') || 
              dbError.message.includes('relation') || 
              dbError.message.includes('does not exist') ||
              dbError.message.includes('Could not find') ||
              dbError.message.includes('completed')) {
            setSaveError('⚠️ Database setup required. Please run the database setup script in your Supabase dashboard. Your progress is saved locally.');
          } else if (dbError.message.includes('timeout')) {
            setSaveError('⚠️ Connection timeout. Your progress is saved locally and will sync when connection is restored.');
          } else {
            setSaveError(`⚠️ Database error. Progress saved locally: ${dbError.message}`);
          }
        }
        
        // Don't throw error - let completion continue with local storage
      }
      
      // Try to refresh progress data if database operations succeeded
      if (!saveError) {
        console.log('Refreshing progress and profile data...');
        try {
          await Promise.all([
            refreshProgress(),
            refreshProfile(),
            updateStreak()
          ]);
          console.log('Progress, profile, and streak refreshed successfully!');
        } catch (refreshError) {
          console.warn('Failed to refresh data:', refreshError);
        }
      }
      
      console.log('Module completion flow finished!');
      clearTimeout(timeoutId);
      
      // Always complete the module, even if there were database issues
      setTimeout(() => {
        onComplete();
      }, saveError ? 2000 : 500); // Longer delay if there was an error to show the message
      
    } catch (error) {
      console.error('Unexpected error in module completion:', error);
      clearTimeout(timeoutId);
      
      // Save to local storage as final fallback
      const localProgress = {
        moduleId: moduleId,
        score: Math.round((score / module.questions.length) * 100),
        xp: Math.round((Math.round((score / module.questions.length) * 100) / 100) * module.xpReward),
        badge: score === module.questions.length ? 'quick_learner' : score >= Math.ceil(module.questions.length * 0.8) ? (
          moduleId === 'earthquake-safety-basics' ? 'earthquake_expert' :
          moduleId === 'fire-safety-basics' ? 'fire_safety_expert' :
          moduleId === 'flood-response-basics' ? 'flood_expert' :
          moduleId === 'emergency-communication-basics' ? 'communication_expert' :
          'safety_expert'
        ) : undefined,
        completedAt: new Date().toISOString()
      };
      
      localStorage.setItem('raksha_pending_progress', JSON.stringify(localProgress));
      
      setSaveError('⚠️ Unexpected error occurred. Your progress is saved locally.');
      
      // Still complete the module
      setTimeout(() => {
        onComplete();
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced Sticky Progress Tracker
  const ProgressTracker = () => (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 mb-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">{module.title}</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {currentStep === 'intro' && 'Getting Started'}
            {currentStep === 'video' && 'Watching Video'}
            {currentStep === 'quiz' && `Quiz: ${currentQuestion + 1}/${module.questions.length}`}
            {currentStep === 'complete' && 'Complete!'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
          {/* Step 1: Intro */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              getStepStatus('intro') === 'completed' ? 'bg-green-500 text-white' :
              getStepStatus('intro') === 'current' ? 'bg-blue-500 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {getStepStatus('intro') === 'completed' ? <CheckCircle className="w-4 h-4" /> : 
               getStepStatus('intro') === 'current' ? <Target className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Start</span>
          </div>

          <div className="flex-1 h-1 bg-gray-200 rounded">
            <div 
              className="h-full bg-blue-500 rounded transition-all duration-500"
              style={{ width: `${Math.min(getProgressValue(), 33)}%` }}
            />
          </div>

          {/* Step 2: Video */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              getStepStatus('video') === 'completed' ? 'bg-green-500 text-white' :
              getStepStatus('video') === 'current' ? 'bg-blue-500 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {getStepStatus('video') === 'completed' ? <CheckCircle className="w-4 h-4" /> : 
               getStepStatus('video') === 'current' ? <Play className="w-4 h-4" /> : '🎥'}
            </div>
            <span className="text-sm font-medium">Video</span>
          </div>

          <div className="flex-1 h-1 bg-gray-200 rounded">
            <div 
              className="h-full bg-blue-500 rounded transition-all duration-500"
              style={{ width: `${Math.min(Math.max(getProgressValue() - 33, 0), 33)}%` }}
            />
          </div>

          {/* Step 3: Quiz */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              getStepStatus('quiz') === 'completed' ? 'bg-green-500 text-white' :
              getStepStatus('quiz') === 'current' ? 'bg-blue-500 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {getStepStatus('quiz') === 'completed' ? <CheckCircle className="w-4 h-4" /> : 
               getStepStatus('quiz') === 'current' ? <Zap className="w-4 h-4" /> : '📝'}
            </div>
            <span className="text-sm font-medium">Quiz</span>
          </div>

          <div className="flex-1 h-1 bg-gray-200 rounded">
            <div 
              className="h-full bg-blue-500 rounded transition-all duration-500"
              style={{ width: `${Math.max(getProgressValue() - 66, 0)}%` }}
            />
          </div>

          {/* Step 4: Complete */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              getStepStatus('complete') === 'current' ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {getStepStatus('complete') === 'current' ? <Trophy className="w-4 h-4" /> : '🏆'}
            </div>
            <span className="text-sm font-medium">Done</span>
          </div>
        </div>
        
        <Progress value={getProgressValue()} className="h-2" />
      </div>
    </div>
  );

  // Intro/Start Screen
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <ProgressTracker />
        
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Shield className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 mb-3"
            >
              {module.title}
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Master earthquake safety through expert video content and interactive challenges. 
              Protect yourself and others with life-saving knowledge.
            </motion.p>
          </div>

          {/* XP & Badge Preview */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* XP Reward Preview */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Earn XP</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">+{module.xpReward}</div>
                <p className="text-sm text-gray-600">Maximum experience points for perfect completion</p>
              </CardContent>
            </Card>

            {/* Badge Preview */}
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Badge</h3>
                <div className="text-lg font-bold text-amber-600 mb-2">{module.badgeName}</div>
                <p className="text-sm text-gray-600">Score {module.badgeThreshold}%+ to unlock this achievement</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Module Overview */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="mb-8 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Drop, Cover, Hold On</h4>
                      <p className="text-sm text-gray-600">Master the critical earthquake response technique</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Safe Locations</h4>
                      <p className="text-sm text-gray-600">Identify the safest spots during earthquakes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Post-Earthquake Actions</h4>
                      <p className="text-sm text-gray-600">Know what to do after the shaking stops</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Real-World Application</h4>
                      <p className="text-sm text-gray-600">Practice scenarios and safety planning</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setCurrentStep('video')}
            >
              <Rocket className="w-5 h-5 mr-3" />
              Start Learning Journey
              <Sparkles className="w-5 h-5 ml-3" />
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              {module.duration} • Interactive video + quiz
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Video Learning Step
  if (currentStep === 'video') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <ProgressTracker />
        
        <div className="max-w-4xl mx-auto px-4">
          {/* Video Player Card */}
          <Card className="mb-6 shadow-xl bg-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <PlayCircle className="w-6 h-6 text-blue-600" />
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Watch this expert guide to earthquake safety fundamentals
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  <Play className="w-3 h-3 mr-1" />
                  Video
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={module.videoUrl}
                  title={module.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="w-full h-full"
                  loading="lazy"
                ></iframe>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quiz CTA */}
          <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-8 relative z-10">
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <Zap className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready for the Challenge? 🎯
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Test your earthquake safety knowledge with our interactive quiz and earn valuable XP!
                </p>
                
                {/* XP & Badge Preview in CTA */}
                <div className="flex justify-center gap-6 mb-6">
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold">Earn up to +{module.xpReward} XP</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full">
                    <Trophy className="w-5 h-5" />
                    <span className="font-bold">Unlock Badge</span>
                  </div>
                </div>
                
                <p className="text-sm text-amber-700 mb-6 bg-amber-100 rounded-lg px-4 py-2 inline-block">
                  🎯 Score {module.badgeThreshold}%+ to unlock the <strong>{module.badgeName}</strong> badge!
                </p>
                
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  onClick={handleVideoComplete}
                >
                  <Rocket className="w-5 h-5 mr-3" />
                  Start Quiz Challenge
                  <Sparkles className="w-5 h-5 ml-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz Step
  if (currentStep === 'quiz') {
    const currentQ = module.questions[currentQuestion];
    const isCorrect = showFeedback && parseInt(selectedAnswer) === currentQ.correct;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <ProgressTracker />
        
        <div className="max-w-2xl mx-auto px-4">
          {/* Question Card */}
          <Card className="mb-6 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Question {currentQuestion + 1}
                    </Badge>
                    <Badge variant="outline">
                      {module.questions.length - currentQuestion} remaining
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-relaxed">{currentQ.question}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                {currentQ.options.map((option, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-3 p-4 rounded-xl hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300 cursor-pointer"
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                      {option}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>

              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-6 rounded-xl border-2 ${
                    isCorrect 
                      ? 'bg-green-50 border-green-300 text-green-800' 
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {isCorrect ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <span className="text-lg font-bold">
                      {isCorrect ? 'Excellent! 🎉' : 'Not quite right 🤔'}
                    </span>
                  </div>
                  <p className="text-base leading-relaxed">{currentQ.explanation}</p>
                </motion.div>
              )}

              <Button 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base"
                onClick={handleQuestionSubmit}
                disabled={!selectedAnswer || showFeedback}
              >
                {currentQuestion + 1 === module.questions.length ? (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Finish Quiz
                  </>
                ) : (
                  <>
                    Next Question
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Insufficient Score Step - Require 80% to proceed
  if (currentStep === 'insufficient') {
    const percentage = Math.round((score / module.questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <Card className="p-8 shadow-2xl bg-white border-orange-200">
            {/* Warning Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <AlertTriangle className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold mb-3 text-orange-600"
            >
              Almost There! 🎯
            </motion.h2>

            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-600 mb-6"
            >
              You scored <span className="font-bold text-orange-600">{percentage}%</span> but need <span className="font-bold text-green-600">80%</span> or higher to earn XP and complete this mission.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
                <strong>💡 Study Tip:</strong> Review the video content and pay attention to the key safety procedures before retaking the quiz.
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleRetakeQuiz}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>

                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="w-full border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Completion Step with Animation
  if (currentStep === 'complete') {
    const percentage = Math.round((score / module.questions.length) * 100);
    const earnedXP = Math.round((percentage / 100) * module.xpReward);
    const earnedBadge = percentage >= module.badgeThreshold;
    const perfectScore = percentage === 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <Card className="p-8 shadow-2xl bg-white">
            {/* Animated Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold mb-3"
            >
              🎉 Mission Complete!
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-8 text-lg"
            >
              Outstanding work completing the Earthquake Safety Basics module!
            </motion.p>

            {/* Animated Results Grid */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="text-3xl font-bold text-blue-600 mb-1"
                >
                  {score}/{module.questions.length}
                </motion.div>
                <div className="text-sm text-gray-600">Questions Correct</div>
                <div className="text-sm font-semibold text-blue-600">{percentage}% Score</div>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring" }}
                  className="text-3xl font-bold text-green-600 mb-1"
                >
                  +{earnedXP}
                </motion.div>
                <div className="text-sm text-gray-600">XP Earned</div>
                <div className="text-sm font-semibold text-green-600">Level Up!</div>
              </div>
            </motion.div>

            {/* Badge Unlock Animation */}
            {earnedBadge && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.5, type: "spring" }}
                className="mb-8"
              >
                <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3"
                  >
                    <Award className="w-8 h-8 text-white" />
                  </motion.div>
                  <Badge className="bg-amber-500 text-white mb-2 text-sm">
                    <Star className="w-3 h-3 mr-1" />
                    Badge Unlocked!
                  </Badge>
                  <p className="font-bold text-amber-700">
                    {perfectScore ? module.perfectScoreBadge : module.badgeName}
                  </p>
                  <p className="text-sm text-amber-600 mt-1">
                    {perfectScore ? "Perfect score achievement!" : `Scored ${module.badgeThreshold}%+ on earthquake safety`}
                  </p>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              {saveError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm mb-2">
                    <strong>Save Issue:</strong> {saveError}
                  </p>
                  <p className="text-red-600 text-sm mb-3">
                    Don't worry - your completion has been recorded locally! You can continue safely.
                  </p>
                  {saveError.includes('Database setup required') && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                      <p className="text-blue-700 text-sm mb-2">
                        <strong>To fix this:</strong>
                      </p>
                      <ol className="text-blue-600 text-sm space-y-1 list-decimal list-inside">
                        <li>Go to your Supabase dashboard</li>
                        <li>Open the SQL Editor</li>
                        <li>Copy and run the content from <code>/database-setup.sql</code></li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
              
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 text-lg shadow-xl"
                onClick={saveError ? onComplete : handleComplete}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    Saving Progress...
                  </>
                ) : saveError ? (
                  <>
                    <Rocket className="w-5 h-5 mr-3" />
                    Continue to Dashboard
                    <Sparkles className="w-5 h-5 ml-3" />
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-3" />
                    Return to Dashboard
                    <Sparkles className="w-5 h-5 ml-3" />
                  </>
                )}
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}