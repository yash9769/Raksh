import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  TrendingUp,
  MapPin,
  CheckCircle,
  Clock,
  Send,
  Eye,
  Download,
  Bell,
  LogOut,
  XCircle
} from "lucide-react";
import { useAuth } from '../lib/auth-context';
import { createEmergencyAlert, getSafetyStatuses, subscribeToSafetyStatus, SafetyStatus } from '../lib/supabase';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { user, signOut } = useAuth();
  const [alertSent, setAlertSent] = useState(false);
  const [alertForm, setAlertForm] = useState({
    type: '',
    title: '',
    message: '',
    location: ''
  });
  const [safetyStatuses, setSafetyStatuses] = useState<SafetyStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSafetyStatuses();
    
    // Subscribe to real-time safety status updates
    const subscription = subscribeToSafetyStatus((status) => {
      setSafetyStatuses(prev => {
        const existing = prev.find(s => s.user_id === status.user_id);
        if (existing) {
          return prev.map(s => s.user_id === status.user_id ? status : s);
        } else {
          return [status, ...prev];
        }
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSafetyStatuses = async () => {
    const { data } = await getSafetyStatuses();
    if (data) {
      setSafetyStatuses(data);
    }
  };

  const stats = {
    totalStudents: 2847,
    totalFaculty: 156,
    preparednessScore: 73,
    completedModules: 1923,
    activeUsers: 234,
    safeUsers: 2689
  };

  const moduleStats = [
    { module: 'Fire Safety', completion: 89, students: 2534 },
    { module: 'Earthquake Preparedness', completion: 67, students: 1908 },
    { module: 'Flood Response', completion: 34, students: 968 },
    { module: 'Emergency Communication', completion: 23, students: 655 }
  ];

  const recentActivity = [
    { student: 'Priya Sharma', action: 'Completed Fire Safety module', time: '2 min ago' },
    { student: 'Rahul Kumar', action: 'Earned Earthquake Expert badge', time: '5 min ago' },
    { student: 'Anjali Patel', action: 'Started Flood Response module', time: '8 min ago' },
    { student: 'Vikram Singh', action: 'Reported safe status', time: '12 min ago' }
  ];

  const emergencyStatus = [
    { name: 'Arjun Mehta', status: 'safe', location: 'Library - 2nd Floor', time: '1 min ago' },
    { name: 'Kavya Reddy', status: 'safe', location: 'Cafeteria', time: '2 min ago' },
    { name: 'Rohit Gupta', status: 'safe', location: 'Computer Lab A', time: '3 min ago' },
    { name: 'Neha Joshi', status: 'safe', location: 'Auditorium', time: '5 min ago' }
  ];

  const handleSendAlert = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await createEmergencyAlert({
        admin_id: user.id,
        type: alertForm.type as any,
        title: alertForm.title,
        message: alertForm.message,
        location: alertForm.location,
        active: true
      });
      
      setAlertSent(true);
      setAlertForm({ type: '', title: '', message: '', location: '' });
      setTimeout(() => setAlertSent(false), 3000);
    } catch (error) {
      console.error('Error sending alert:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Control Center</h1>
            <p className="text-muted-foreground">Manage campus-wide disaster preparedness</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Button variant="outline" onClick={onBack}>
              Back to App
            </Button>
          </div>
        </div>

        {/* Alert Feedback */}
        {alertSent && (
          <Alert className="mb-6 bg-green-50 border-green-300">
            <Bell className="w-4 h-4" />
            <AlertDescription>
              Campus-wide alert has been sent to all students and faculty.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalFaculty}</div>
                  <div className="text-sm text-muted-foreground">Faculty</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.preparednessScore}%</div>
                  <div className="text-sm text-muted-foreground">Preparedness</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.completedModules.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                  <div className="text-sm text-muted-foreground">Active Now</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.safeUsers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Safe Status</div>
                </CardContent>
              </Card>
            </div>

            {/* Module Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Module Completion Rates</CardTitle>
                <CardDescription>Track learning progress across all modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleStats.map((module, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{module.module}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">{module.completion}%</span>
                          <div className="text-xs text-muted-foreground">{module.students} students</div>
                        </div>
                      </div>
                      <Progress value={module.completion} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest student interactions and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <span className="font-medium">{activity.student}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Institutional Preparedness Score</CardTitle>
                <CardDescription>Overall campus emergency readiness metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-blue-600 mb-2">{stats.preparednessScore}%</div>
                  <div className="text-muted-foreground">Campus Preparedness Level</div>
                </div>
                <Progress value={stats.preparednessScore} className="h-4 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">89%</div>
                    <div className="text-sm text-muted-foreground">Fire Safety</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">67%</div>
                    <div className="text-sm text-muted-foreground">Earthquake</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">34%</div>
                    <div className="text-sm text-muted-foreground">Flood Response</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">23%</div>
                    <div className="text-sm text-muted-foreground">Communication</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Completion by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Computer Science</span>
                      <span className="font-medium">84%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Engineering</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Business</span>
                      <span className="font-medium">71%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Arts & Sciences</span>
                      <span className="font-medium">65%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Daily Active Users</span>
                      <span className="font-medium text-green-600">↑ 12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Module Completions</span>
                      <span className="font-medium text-green-600">↑ 8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Badge Achievements</span>
                      <span className="font-medium text-green-600">↑ 15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Quiz Scores</span>
                      <span className="font-medium text-green-600">↑ 3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            {/* Send Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Send Campus-Wide Alert
                </CardTitle>
                <CardDescription>
                  Emergency notification system for immediate campus alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Alert Type</label>
                    <Select value={alertForm.type} onValueChange={(value) => setAlertForm({...alertForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select alert type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fire">Fire Emergency</SelectItem>
                        <SelectItem value="earthquake">Earthquake</SelectItem>
                        <SelectItem value="flood">Flood Warning</SelectItem>
                        <SelectItem value="security">Security Alert</SelectItem>
                        <SelectItem value="medical">Medical Emergency</SelectItem>
                        <SelectItem value="drill">Emergency Drill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input 
                      placeholder="e.g., Building A - 2nd Floor"
                      value={alertForm.location}
                      onChange={(e) => setAlertForm({...alertForm, location: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Alert Title</label>
                  <Input 
                    placeholder="e.g., FIRE ALERT"
                    value={alertForm.title}
                    onChange={(e) => setAlertForm({...alertForm, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea 
                    placeholder="Detailed emergency instructions..."
                    value={alertForm.message}
                    onChange={(e) => setAlertForm({...alertForm, message: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleSendAlert}
                  disabled={!alertForm.type || !alertForm.title || !alertForm.message || loading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending Alert...' : 'Send Emergency Alert'}
                </Button>
              </CardContent>
            </Card>

            {/* Live Status Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Live Campus Status
                </CardTitle>
                <CardDescription>Real-time location and safety status of students and faculty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive Campus Map</p>
                    <p className="text-sm text-gray-400">Live user locations and safety status</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {safetyStatuses.filter(s => s.status === 'safe').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Safe</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {safetyStatuses.filter(s => s.status === 'no_response').length}
                    </div>
                    <div className="text-sm text-muted-foreground">No Response</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {safetyStatuses.filter(s => s.status === 'help_needed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Need Help</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{safetyStatuses.length}</div>
                    <div className="text-sm text-muted-foreground">Total Reports</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Safety Status */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Safety Reports</CardTitle>
                <CardDescription>Latest safety status updates from campus</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safetyStatuses.slice(0, 10).map((status, index) => {
                      const statusConfig = {
                        safe: { color: 'text-green-600 border-green-300', icon: CheckCircle, label: 'Safe' },
                        help_needed: { color: 'text-red-600 border-red-300', icon: AlertTriangle, label: 'Help Needed' },
                        no_response: { color: 'text-yellow-600 border-yellow-300', icon: XCircle, label: 'No Response' }
                      }[status.status];
                      
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {(status as any).user?.full_name || 'Unknown User'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {status.location || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(status.updated_at).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {safetyStatuses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No safety reports yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage learning modules and educational content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BookOpen className="w-6 h-6 mb-2" />
                    Add New Module
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Eye className="w-6 h-6 mb-2" />
                    Preview Content
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Quick Add Video Module</h4>
                  <div className="space-y-3">
                    <Input placeholder="Module Title" />
                    <Input placeholder="YouTube Video URL" />
                    <Textarea placeholder="Module Description" rows={2} />
                    <Button size="sm">Add Module</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">47</div>
                    <div className="text-sm text-muted-foreground">Total Modules</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">342</div>
                    <div className="text-sm text-muted-foreground">Quiz Questions</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-muted-foreground">Badge Types</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}