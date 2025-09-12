import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Shield, BookOpen, Users, AlertTriangle } from "lucide-react";

interface OnboardingProps {
  onComplete: (role: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: 'student',
      title: 'I am a Student',
      description: 'Learn disaster preparedness through interactive modules and earn badges',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      id: 'faculty',
      title: 'I am a Faculty Member',
      description: 'Monitor student progress and manage disaster preparedness training',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'admin',
      title: 'I am an Administrator',
      description: 'Oversee campus-wide emergency protocols and send alerts',
      icon: Shield,
      color: 'bg-amber-500'
    }
  ];

  const features = [
    {
      title: 'Learn',
      description: 'Interactive modules with videos, quizzes, and gamification',
      icon: BookOpen
    },
    {
      title: 'Prepare',
      description: 'Track your progress and unlock achievements',
      icon: Shield
    },
    {
      title: 'Alert',
      description: 'Instant emergency mode with one-tap access',
      icon: AlertTriangle
    }
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setCurrentStep(1);
  };

  const handleComplete = () => {
    if (selectedRole) {
      onComplete(selectedRole);
    }
  };

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Welcome to Raksha
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Be Prepared, Be a Hero. Transform disaster preparedness into an engaging, life-saving experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card 
                key={role.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Button 
          variant="outline" 
          className="mt-8"
          onClick={() => setCurrentStep(1)}
        >
          Skip Tutorial
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">Quick Tutorial</Badge>
          <h2 className="mb-4">Three Key Features to Keep You Safe</h2>
          <p className="text-muted-foreground">
            Raksha combines learning, preparation, and emergency response in one powerful platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(0)}
          >
            Back
          </Button>
          <Button 
            onClick={handleComplete}
            className="bg-[var(--learning-primary)] hover:bg-blue-800 text-white px-8 py-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            Get Started with Raksha
          </Button>
        </div>
      </div>
    </div>
  );
}