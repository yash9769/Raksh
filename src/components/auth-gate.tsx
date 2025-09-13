import { useState } from 'react'
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Alert, AlertDescription } from "./ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { motion } from "motion/react"
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ChevronDown,
  Waves,
  Home,
  Zap,
  Key,
  HelpCircle,
  AlertTriangle
} from "lucide-react"
import { useAuth } from '../lib/auth-context'

interface AuthGateProps {
  onEmergencyMode?: () => void;
}

export function AuthGate({ onEmergencyMode }: AuthGateProps) {
  const { signIn, signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showDemoCredentials, setShowDemoCredentials] = useState(false)

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  })

  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: ''
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signIn(signInForm.email, signInForm.password)
    
    if (error) {
      setError(error.message)
    }
    
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!signUpForm.role) {
      setError('Please select your role')
      setLoading(false)
      return
    }

    const { error } = await signUp(signUpForm.email, signUpForm.password, {
      full_name: signUpForm.fullName,
      role: signUpForm.role
    })
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Account created successfully! You can now sign in.')
      // Reset form after successful signup
      setSignUpForm({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: ''
      })
    }
    
    setLoading(false)
  }

  const fillDemoCredentials = (type: 'student' | 'admin') => {
    if (type === 'student') {
      setSignInForm({
        email: 'demo@student.com',
        password: 'password123'
      })
    } else {
      setSignInForm({
        email: 'demo@admin.com',
        password: 'password123'
      })
    }
    setShowDemoCredentials(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Emergency SOS Button - Top Right */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        className="absolute top-4 right-4 z-50"
      >
        <Button
          onClick={onEmergencyMode}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm px-4 py-2 shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 border-2 border-white/20 backdrop-blur-sm group animate-pulse hover:animate-none"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>SOS</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 group-hover:translate-x-full transition-transform duration-500"></div>
        </Button>
      </motion.div>

      {/* Softened Background with Better Contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-400">
        {/* Subtle Wave Pattern */}
        <div className="absolute inset-0 opacity-15">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <path d="M0,300 C300,200 700,400 1000,300 L1000,1000 L0,1000 Z" fill="white" opacity="0.1"/>
            <path d="M0,500 C300,400 700,600 1000,500 L1000,1000 L0,1000 Z" fill="white" opacity="0.05"/>
          </svg>
        </div>
        
        {/* Enhanced Shield Pattern Overlay */}
        <div className="absolute inset-0 opacity-12">
          <div className="absolute top-20 left-1/4 w-24 h-24 border border-white/30 rounded-lg transform rotate-12 animate-pulse"></div>
          <div className="absolute top-40 right-1/3 w-16 h-16 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-40 left-1/3 w-20 h-20 border border-white/25 rounded-lg transform -rotate-12"></div>
          <div className="absolute bottom-20 right-1/4 w-28 h-28 border border-white/20 rounded-full animate-pulse"></div>
          {/* Additional geometric shapes */}
          <div className="absolute top-60 left-10 w-32 h-1 bg-white/20 transform rotate-45"></div>
          <div className="absolute bottom-60 right-10 w-24 h-1 bg-white/25 transform -rotate-45"></div>
        </div>
        
        {/* Enhanced Safety Icons Pattern */}
        <div className="absolute inset-0 opacity-12">
          <Shield className="absolute top-24 left-1/5 w-12 h-12 text-white/40 transform rotate-12 animate-pulse" />
          <Home className="absolute top-48 right-1/4 w-10 h-10 text-white/30 transform -rotate-12" />
          <Zap className="absolute bottom-48 left-1/4 w-11 h-11 text-white/35 transform rotate-45 animate-pulse" />
          <Waves className="absolute bottom-24 right-1/5 w-14 h-14 text-white/40 transform -rotate-12" />
          {/* Additional emergency themed icons */}
          <HelpCircle className="absolute top-36 right-10 w-8 h-8 text-white/25 transform rotate-12" />
          <Key className="absolute bottom-36 left-10 w-9 h-9 text-white/30 transform -rotate-12" />
        </div>
        
        {/* Lighter Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            {/* Custom Raksha Logo */}
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <div className="relative">
                <Shield className="w-10 h-10 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-30 scale-110"></div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Welcome to <span className="text-amber-300">Raksha</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              Be Prepared, Be a Hero
            </p>
            <p className="text-blue-200 text-sm mt-2 max-w-md mx-auto">
              Transform disaster preparedness into an engaging, life-saving experience
            </p>
          </motion.div>
        </div>

        {/* Alert Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-6"
          >
            <Alert className="border-red-400 bg-red-50/95 backdrop-blur shadow-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-6"
          >
            <Alert className="border-green-400 bg-green-50/95 backdrop-blur shadow-lg">
              <AlertCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700 font-medium">{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Enhanced Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/96 backdrop-blur-xl shadow-2xl border-0 overflow-hidden">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1 mx-6 mt-6 mb-4 rounded-xl relative overflow-hidden">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg font-semibold transition-all duration-300 ease-out data-[state=active]:scale-[1.02] py-3 relative z-10"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg font-semibold transition-all duration-300 ease-out data-[state=active]:scale-[1.02] py-3 relative z-10"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                <CardHeader className="pb-6 px-6">
                  <CardTitle className="text-3xl font-extrabold text-gray-900">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-500 text-base mt-2">
                    Sign in to continue your disaster preparedness journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-gray-700 font-semibold">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-11 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base hover:bg-gray-100 focus:bg-white group-focus-within:shadow-md placeholder:text-gray-400 shadow-inner"
                          value={signInForm.email}
                          onChange={(e) => setSignInForm({...signInForm, email: e.target.value})}
                          required
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password" className="text-gray-700 font-semibold">Password</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-xs text-gray-500 cursor-help hover:text-gray-700 transition-colors">
                                <Lock className="h-3 w-3" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Your data is encrypted and secure</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base hover:bg-gray-100 focus:bg-white group-focus-within:shadow-md placeholder:text-gray-400 shadow-inner"
                          value={signInForm.password}
                          onChange={(e) => setSignInForm({...signInForm, password: e.target.value})}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center"></div>
                      </div>
                      <div className="text-right">
                        <button type="button" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline">
                          Forgot password?
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 hover:from-blue-700 hover:via-indigo-800 hover:to-blue-900 text-white font-semibold text-base shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] focus:ring-4 focus:ring-blue-200 relative overflow-hidden group hover:shadow-blue-500/25" 
                      disabled={loading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-white/10 transition-all duration-300"></div>
                      {loading ? (
                        <div className="flex items-center gap-2 relative z-10">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 relative z-10">
                          <Key className="w-4 h-4" />
                          <span>Sign In</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
                </motion.div>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                <CardHeader className="pb-6 px-6">
                  <CardTitle className="text-3xl font-extrabold text-gray-900">Join Raksha</CardTitle>
                  <CardDescription className="text-gray-500 text-base mt-2">
                    Create your account to start building safety expertise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-gray-700 font-semibold">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          className="pl-11 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base hover:bg-gray-100 focus:bg-white group-focus-within:shadow-md placeholder:text-gray-400 shadow-inner"
                          value={signUpForm.fullName}
                          onChange={(e) => setSignUpForm({...signUpForm, fullName: e.target.value})}
                          required
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-700 font-semibold">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-11 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base hover:bg-gray-100 focus:bg-white group-focus-within:shadow-md placeholder:text-gray-400 shadow-inner"
                          value={signUpForm.email}
                          onChange={(e) => setSignUpForm({...signUpForm, email: e.target.value})}
                          required
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-role" className="text-gray-700 font-semibold">Role</Label>
                      <Select value={signUpForm.role} onValueChange={(value) => setSignUpForm({...signUpForm, role: value})}>
                        <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base hover:bg-gray-100 focus:bg-white shadow-inner [&>span]:placeholder:text-gray-400">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="faculty">Faculty Member</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signup-password" className="text-gray-700 font-semibold">Password</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-xs text-gray-500 cursor-help hover:text-gray-700 transition-colors">
                                <Lock className="h-3 w-3" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Your data is encrypted and secure</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base hover:bg-gray-100 focus:bg-white group-focus-within:shadow-md placeholder:text-gray-400 shadow-inner"
                          value={signUpForm.password}
                          onChange={(e) => setSignUpForm({...signUpForm, password: e.target.value})}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-gray-700 font-semibold">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        <Input
                          id="signup-confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base hover:bg-gray-100 focus:bg-white group-focus-within:shadow-md placeholder:text-gray-400 shadow-inner"
                          value={signUpForm.confirmPassword}
                          onChange={(e) => setSignUpForm({...signUpForm, confirmPassword: e.target.value})}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-center"></div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white font-semibold text-base shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] focus:ring-4 focus:ring-green-200 relative overflow-hidden group" 
                      disabled={loading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      {loading ? (
                        <div className="flex items-center gap-2 relative z-10">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating account...
                        </div>
                      ) : (
                        <span className="relative z-10">Create Account</span>
                      )}
                    </Button>
                  </form>
                </CardContent>
                </motion.div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Enhanced Demo Credentials Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <Collapsible open={showDemoCredentials} onOpenChange={setShowDemoCredentials}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full bg-white/15 border-white/30 text-white hover:bg-white/25 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl transform hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Try Demo Access</span>
                  <ChevronDown className={`h-4 w-4 transition-all duration-300 ${showDemoCredentials ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`} />
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/15 backdrop-blur-md rounded-xl p-5 space-y-4 shadow-xl border border-white/20"
              >
                <div className="text-center">
                  <p className="text-white font-medium text-sm mb-1">
                    Quick Demo Access
                  </p>
                  <p className="text-white/80 text-xs">
                    One-click login with sample accounts
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => fillDemoCredentials('student')}
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105 group backdrop-blur"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Student Demo</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => fillDemoCredentials('admin')}
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105 group backdrop-blur"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Admin Demo</span>
                    </div>
                  </Button>
                </div>
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>
      </motion.div>
    </div>
  )
}