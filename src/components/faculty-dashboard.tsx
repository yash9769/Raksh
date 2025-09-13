import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  Star,
  FileText,
  TrendingUp,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Bell,
  LogOut,
  CheckCircle,
  Clock,
  Award
} from "lucide-react";
import { useAuth } from '../lib/auth-context';

interface FacultyDashboardProps {
  onBack: () => void;
}

export function FacultyDashboard({ onBack }: FacultyDashboardProps) {
  const { user, signOut } = useAuth();

  // Mock data for faculty courses
  const myCourses = [
    {
      id: 1,
      title: "Advanced Fire Safety Training",
      status: "active",
      enrolled: 45,
      completion: 78,
      rating: 4.8,
      revenue: 186750,
      lastUpdated: "2024-01-15"
    },
    {
      id: 2,
      title: "Earthquake Preparedness Workshop",
      status: "active",
      enrolled: 32,
      completion: 65,
      rating: 4.6,
      revenue: 132800,
      lastUpdated: "2024-01-12"
    },
    {
      id: 3,
      title: "Emergency Communication Skills",
      status: "inactive",
      enrolled: 18,
      completion: 42,
      rating: 4.3,
      revenue: 74700,
      lastUpdated: "2024-01-08"
    }
  ];

  // Mock data for students
  const myStudents = [
    { id: 1, name: "Priya Sharma", course: "Fire Safety", progress: 85, lastActive: "2 hours ago", status: "active" },
    { id: 2, name: "Rahul Kumar", course: "Earthquake", progress: 92, lastActive: "1 day ago", status: "active" },
    { id: 3, name: "Anjali Patel", course: "Communication", progress: 45, lastActive: "3 days ago", status: "inactive" },
    { id: 4, name: "Vikram Singh", course: "Fire Safety", progress: 78, lastActive: "5 hours ago", status: "active" }
  ];

  // Mock earnings data
  const earnings = {
    totalRevenue: 394250,
    pendingPayout: 99600,
    lastPayout: 149400,
    payoutDate: "2024-01-01",
    currencySymbol: "₹"
  };

  // Mock upcoming sessions
  const upcomingSessions = [
    { id: 1, title: "Live Q&A: Fire Safety", date: "2024-01-20", time: "14:00", attendees: 25 },
    { id: 2, title: "Workshop: Emergency Response", date: "2024-01-22", time: "10:00", attendees: 18 },
    { id: 3, title: "Guest Lecture: Disaster Management", date: "2024-01-25", time: "15:30", attendees: 32 }
  ];

  // Mock reviews
  const reviews = [
    { id: 1, student: "Priya S.", course: "Fire Safety", rating: 5, comment: "Excellent course! Very practical and well-structured.", date: "2024-01-14" },
    { id: 2, student: "Rahul K.", course: "Earthquake", rating: 4, comment: "Good content but could use more real-world examples.", date: "2024-01-13" },
    { id: 3, student: "Anjali P.", course: "Communication", rating: 5, comment: "Life-changing skills! Highly recommend.", date: "2024-01-12" }
  ];

  const stats = {
    totalCourses: myCourses.length,
    totalStudents: myStudents.length,
    avgRating: (myCourses.reduce((sum, course) => sum + course.rating, 0) / myCourses.length).toFixed(1),
    totalRevenue: earnings.totalRevenue
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
            <p className="text-muted-foreground">Manage your courses and track student progress</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" onClick={async () => {
              try {
                await signOut();
                // Navigation will be handled automatically by auth state change
              } catch (error) {
                console.error('Sign out error:', error);
              }
            }}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Button variant="outline" onClick={onBack}>
              Back to App
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex w-full space-x-4 overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">My Students</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="flex flex-row gap-6">
              <Card className="flex-1">
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold">{stats.totalCourses}</div>
                  <div className="text-base text-muted-foreground">My Courses</div>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardContent className="p-8 text-center">
                  <Users className="w-8 h-8 text-green-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold">{stats.totalStudents}</div>
                  <div className="text-base text-muted-foreground">Total Students</div>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardContent className="p-8 text-center">
                  <Star className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold">{stats.avgRating}</div>
                  <div className="text-base text-muted-foreground">Avg Rating</div>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardContent className="p-8 text-center">
                  <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold">{earnings.currencySymbol}{stats.totalRevenue}</div>
                  <div className="text-base text-muted-foreground">Total Revenue</div>
                </CardContent>
              </Card>
            </div>

            {/* Course Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Completion rates and student engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myCourses.map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{course.title}</span>
                          <Badge variant={course.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                            {course.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{course.completion}% complete</span>
                          <div className="text-xs text-muted-foreground">{course.enrolled} students</div>
                        </div>
                      </div>
                      <Progress value={course.completion} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Student Activity</CardTitle>
                <CardDescription>Latest interactions from your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <span className="font-medium">Priya Sharma</span>
                      <span className="text-muted-foreground"> completed Fire Safety module</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 min ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <span className="font-medium">Rahul Kumar</span>
                      <span className="text-muted-foreground"> earned Earthquake Expert badge</span>
                    </div>
                    <span className="text-xs text-muted-foreground">5 min ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <span className="font-medium">Anjali Patel</span>
                      <span className="text-muted-foreground"> submitted assignment</span>
                    </div>
                    <span className="text-xs text-muted-foreground">8 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {/* Course Management */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Courses</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Course
              </Button>
            </div>

            <div className="grid gap-4">
              {myCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {course.enrolled} students enrolled
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span className="text-sm">{course.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                        <div className="text-lg font-semibold">{course.completion}%</div>
                        <Progress value={course.completion} className="h-2 mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="text-lg font-semibold">{earnings.currencySymbol}{course.revenue}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="text-sm">{course.lastUpdated}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Student Management */}
            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>Track progress and communicate with enrolled students</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.course}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={student.progress} className="w-16 h-2" />
                            <span className="text-sm">{student.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{student.lastActive}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Message
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-600">{earnings.currencySymbol}{earnings.totalRevenue}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-600">{earnings.currencySymbol}{earnings.pendingPayout}</div>
                  <div className="text-sm text-muted-foreground">Pending Payout</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-purple-600">{earnings.currencySymbol}{earnings.lastPayout}</div>
                  <div className="text-sm text-muted-foreground">Last Payout ({earnings.payoutDate})</div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Course */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Course</CardTitle>
                <CardDescription>Earnings breakdown for each course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myCourses.map((course) => (
                    <div key={course.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">{course.enrolled} students</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{earnings.currencySymbol}{course.revenue}</div>
                        <div className="text-sm text-muted-foreground">{earnings.currencySymbol}{Math.round(course.revenue / course.enrolled)} per student</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Sessions & Lectures
                </CardTitle>
                <CardDescription>Manage your teaching schedule and live sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <div className="text-sm text-muted-foreground">
                          {session.date} at {session.time} • {session.attendees} expected attendees
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="w-3 h-3 mr-1" />
                          Notify
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule New Session
                </Button>
              </CardContent>
            </Card>

            {/* Calendar View Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>Visual calendar of your teaching schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive Calendar</p>
                    <p className="text-sm text-gray-400">View and manage your teaching schedule</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            {/* Course Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Course Reviews & Ratings
                </CardTitle>
                <CardDescription>Student feedback and ratings for your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{stats.avgRating}</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                    <div className="flex justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(parseFloat(stats.avgRating)) ? 'text-amber-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
                    <div className="text-sm text-muted-foreground">Total Reviews</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Positive Reviews</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{review.student}</span>
                          <span className="text-muted-foreground ml-2">• {review.course}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2">{review.comment}</p>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
