import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Play, 
  CheckCircle, 
  Clock, 
  Star, 
  Target, 
  Award, 
  Users, 
  TrendingUp, 
  Video, 
  FileText, 
  Zap,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  BookMarked,
  Headphones,
  Calendar,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  enrolledUsers: number;
  progress: number;
  modules: LearningModule[];
  certificate: boolean;
  thumbnail: string;
  instructor: string;
  lastUpdated: Date;
  tags: string[];
}

interface LearningModule {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'interactive';
  duration: number;
  completed: boolean;
  content?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit: number;
  passingScore: number;
  attempts: number;
  bestScore: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Certificate {
  id: string;
  courseName: string;
  issuedDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'pending';
  downloadUrl: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: string[];
  estimatedDuration: number;
  difficulty: string;
  category: string;
}

const Training = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Mock data
  const courses: Course[] = [
    {
      id: '1',
      title: 'Logistics Fundamentals',
      description: 'Master the basics of logistics operations, supply chain management, and transportation.',
      category: 'Core Skills',
      duration: 120,
      difficulty: 'Beginner',
      rating: 4.8,
      enrolledUsers: 156,
      progress: 75,
      certificate: true,
      thumbnail: '📦',
      instructor: 'Dr. Sarah Johnson',
      lastUpdated: new Date('2024-01-15'),
      tags: ['logistics', 'supply chain', 'transportation'],
      modules: [
        { id: '1-1', title: 'Introduction to Logistics', type: 'video', duration: 15, completed: true },
        { id: '1-2', title: 'Supply Chain Basics', type: 'text', duration: 20, completed: true },
        { id: '1-3', title: 'Transportation Modes', type: 'interactive', duration: 25, completed: false },
        { id: '1-4', title: 'Assessment Quiz', type: 'quiz', duration: 30, completed: false }
      ]
    },
    {
      id: '2',
      title: 'Customer Service Excellence',
      description: 'Develop exceptional customer service skills for logistics and transportation.',
      category: 'Soft Skills',
      duration: 90,
      difficulty: 'Intermediate',
      rating: 4.6,
      enrolledUsers: 89,
      progress: 45,
      certificate: true,
      thumbnail: '🎯',
      instructor: 'Mike Chen',
      lastUpdated: new Date('2024-01-10'),
      tags: ['customer service', 'communication', 'soft skills'],
      modules: [
        { id: '2-1', title: 'Communication Skills', type: 'video', duration: 20, completed: true },
        { id: '2-2', title: 'Problem Solving', type: 'interactive', duration: 25, completed: false },
        { id: '2-3', title: 'Final Assessment', type: 'quiz', duration: 30, completed: false }
      ]
    },
    {
      id: '3',
      title: 'Advanced Route Optimization',
      description: 'Learn advanced techniques for optimizing delivery routes and reducing costs.',
      category: 'Advanced Skills',
      duration: 180,
      difficulty: 'Advanced',
      rating: 4.9,
      enrolledUsers: 67,
      progress: 20,
      certificate: true,
      thumbnail: '🗺️',
      instructor: 'Dr. Emma Davis',
      lastUpdated: new Date('2024-01-05'),
      tags: ['route optimization', 'algorithms', 'advanced'],
      modules: [
        { id: '3-1', title: 'Algorithm Basics', type: 'text', duration: 30, completed: false },
        { id: '3-2', title: 'Practical Applications', type: 'interactive', duration: 45, completed: false },
        { id: '3-3', title: 'Case Studies', type: 'video', duration: 35, completed: false },
        { id: '3-4', title: 'Final Project', type: 'interactive', duration: 40, completed: false }
      ]
    },
    {
      id: '4',
      title: 'Safety Protocols & Compliance',
      description: 'Essential safety training for logistics operations and regulatory compliance.',
      category: 'Core Skills',
      duration: 60,
      difficulty: 'Beginner',
      rating: 4.7,
      enrolledUsers: 234,
      progress: 100,
      certificate: true,
      thumbnail: '🛡️',
      instructor: 'Carlos Rodriguez',
      lastUpdated: new Date('2023-12-20'),
      tags: ['safety', 'compliance', 'regulations'],
      modules: [
        { id: '4-1', title: 'Safety Fundamentals', type: 'video', duration: 20, completed: true },
        { id: '4-2', title: 'Regulatory Requirements', type: 'text', duration: 25, completed: true },
        { id: '4-3', title: 'Safety Assessment', type: 'quiz', duration: 15, completed: true }
      ]
    }
  ];

  const certificates: Certificate[] = [
    {
      id: '1',
      courseName: 'Logistics Fundamentals',
      issuedDate: new Date('2024-01-10'),
      status: 'active',
      downloadUrl: '#'
    },
    {
      id: '2',
      courseName: 'Safety Protocols & Compliance',
      issuedDate: new Date('2023-12-15'),
      expiryDate: new Date('2024-12-15'),
      status: 'active',
      downloadUrl: '#'
    }
  ];

  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Logistics Professional Track',
      description: 'Complete path to become a certified logistics professional',
      courses: ['1', '4', '2'],
      estimatedDuration: 270,
      difficulty: 'Intermediate',
      category: 'Professional Development'
    },
    {
      id: '2',
      title: 'Advanced Operations Specialist',
      description: 'Advanced training for senior logistics professionals',
      courses: ['1', '2', '3'],
      estimatedDuration: 390,
      difficulty: 'Advanced',
      category: 'Leadership'
    }
  ];

  const quizzes: Quiz[] = [
    {
      id: '1',
      title: 'Logistics Fundamentals Assessment',
      questions: [
        {
          id: '1',
          question: 'What is the primary goal of logistics management?',
          options: [
            'To maximize profits',
            'To minimize costs while meeting service requirements',
            'To increase inventory levels',
            'To reduce customer satisfaction'
          ],
          correctAnswer: 1,
          explanation: 'Logistics management aims to minimize costs while meeting customer service requirements.'
        },
        {
          id: '2',
          question: 'Which transportation mode is typically fastest for long-distance shipments?',
          options: ['Truck', 'Rail', 'Air', 'Ocean'],
          correctAnswer: 2,
          explanation: 'Air transportation is typically the fastest mode for long-distance shipments.'
        }
      ],
      timeLimit: 600,
      passingScore: 70,
      attempts: 2,
      bestScore: 85
    }
  ];

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setQuizTimeLeft(quiz.timeLimit);
    setShowQuiz(true);
    setQuizAnswers({});
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;
    
    const correctAnswers = currentQuiz.questions.filter(q => 
      quizAnswers[q.id] === q.correctAnswer
    ).length;
    
    const score = (correctAnswers / currentQuiz.questions.length) * 100;
    
    console.log(`Quiz completed! Score: ${score}%`);
    setShowQuiz(false);
    setCurrentQuiz(null);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-background animate-fade-in w-full">
          {/* Header */}
          <header className="border-b bg-card sticky top-0 z-40 h-14">
            <div className="px-3 h-full flex items-center justify-between">
              {/* Left side - Back button and title */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleBackToDashboard}
                  className="h-8 text-xs px-3"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Training Center</h1>
                    <p className="text-muted-foreground text-xs">Master your skills with our comprehensive learning platform</p>
                  </div>
                </div>
              </div>
              
              {/* Right side - Stats and notifications */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2 py-1 text-xs">
                  <Trophy className="mr-1 h-3 w-3" />
                  {certificates.length} Certificates
                </Badge>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  <Users className="mr-1 h-3 w-3" />
                  {courses.reduce((acc, course) => acc + course.enrolledUsers, 0)} Learners
                </Badge>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-3 space-y-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Courses
                </TabsTrigger>
                <TabsTrigger value="certificates" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certificates
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Progress Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Courses in Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">
                        {courses.filter(c => c.progress > 0 && c.progress < 100).length}
                      </div>
                      <p className="text-blue-100 text-sm">Keep going! You're doing great!</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Completed Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">
                        {courses.filter(c => c.progress === 100).length}
                      </div>
                      <p className="text-green-100 text-sm">Excellent progress!</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Learning Goal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">85%</div>
                      <p className="text-purple-100 text-sm">Target: Complete 5 courses this month</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Learning Paths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Recommended Learning Paths
                    </CardTitle>
                    <CardDescription>
                      Structured learning paths to accelerate your career growth
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {learningPaths.map((path) => (
                        <div key={path.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg">{path.title}</h3>
                            <Badge variant="outline" className={getDifficultyColor(path.difficulty)}>
                              {path.difficulty}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {path.estimatedDuration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {path.courses.length} courses
                            </span>
                          </div>
                          <Button className="w-full mt-3" size="sm">
                            Start Learning Path
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Learning Activity</CardTitle>
                    <CardDescription>Your latest achievements and progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Completed "Safety Protocols & Compliance"</p>
                          <p className="text-sm text-gray-600">2 hours ago</p>
                        </div>
                        <Badge variant="secondary">+100 XP</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Play className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Started "Customer Service Excellence"</p>
                          <p className="text-sm text-gray-600">1 day ago</p>
                        </div>
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {difficulty === 'all' ? 'All Levels' : difficulty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="text-4xl mb-2">{course.thumbnail}</div>
                          <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.enrolledUsers}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span className={getProgressColor(course.progress)}>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {course.rating}
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="text-sm text-gray-500">{course.modules.length} modules</span>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            onClick={() => handleCourseSelect(course)}
                          >
                            {course.progress === 0 ? 'Start Course' : 'Continue'}
                          </Button>
                          {course.certificate && (
                            <Badge variant="secondary" className="px-2 py-1">
                              <Award className="h-3 w-3 mr-1" />
                              Certificate
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Certificates</h2>
                    <p className="text-gray-600">Track your achievements and download certificates</p>
                  </div>
                  <Button>
                    <Award className="mr-2 h-4 w-4" />
                    View All Certificates
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert) => (
                    <Card key={cert.id} className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{cert.courseName}</CardTitle>
                          <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                            {cert.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          Issued on {cert.issuedDate.toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Successfully completed course requirements
                        </div>
                        {cert.expiryDate && (
                          <div className="text-sm text-gray-600">
                            <strong>Expires:</strong> {cert.expiryDate.toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <Eye className="mr-2 h-4 w-4" />
                            View Certificate
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Learning Progress Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Progress Over Time</CardTitle>
                      <CardDescription>Your course completion rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>Progress chart visualization</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skill Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills Distribution</CardTitle>
                      <CardDescription>Your expertise across different areas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Core Skills</span>
                          <span className="text-sm text-gray-500">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Soft Skills</span>
                          <span className="text-sm text-gray-500">45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Advanced Skills</span>
                          <span className="text-sm text-gray-500">20%</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Learning Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Statistics</CardTitle>
                    <CardDescription>Your learning journey at a glance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {courses.reduce((acc, course) => acc + course.duration, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Hours</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {courses.filter(c => c.progress === 100).length}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {certificates.length}
                        </div>
                        <div className="text-sm text-gray-600">Certificates</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length)}
                        </div>
                        <div className="text-sm text-gray-600">Avg Progress</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>

      {/* Course Detail Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCourse.thumbnail}</span>
                  {selectedCourse.title}
                </DialogTitle>
                <DialogDescription>{selectedCourse.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Course Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedCourse.duration}</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedCourse.rating}</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedCourse.modules.length}</div>
                    <div className="text-sm text-gray-600">Modules</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedCourse.progress}%</div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Course Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instructor:</span>
                        <span className="font-medium">{selectedCourse.instructor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedCourse.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <Badge variant="outline" className={getDifficultyColor(selectedCourse.difficulty)}>
                          {selectedCourse.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{selectedCourse.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modules */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Learning Modules</h3>
                  <div className="space-y-3">
                    {selectedCourse.modules.map((module) => (
                      <div key={module.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {module.type === 'video' && <Video className="h-4 w-4" />}
                          {module.type === 'text' && <FileText className="h-4 w-4" />}
                          {module.type === 'quiz' && <Target className="h-4 w-4" />}
                          {module.type === 'interactive' && <Zap className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{module.title}</span>
                            {module.completed && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.duration} min
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {module.type}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          variant={module.completed ? "outline" : "default"}
                          size="sm"
                          onClick={() => {
                            if (module.type === 'quiz') {
                              const quiz = quizzes.find(q => q.title.includes(selectedCourse.title));
                              if (quiz) handleStartQuiz(quiz);
                            }
                          }}
                        >
                          {module.completed ? 'Completed' : 'Start'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-lg font-bold text-blue-600">{selectedCourse.progress}%</span>
                  </div>
                  <Progress value={selectedCourse.progress} className="h-3" />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Modal */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {currentQuiz && (
            <>
              <DialogHeader>
                <DialogTitle>{currentQuiz.title}</DialogTitle>
                <DialogDescription>
                  Time remaining: {Math.floor(quizTimeLeft / 60)}:{(quizTimeLeft % 60).toString().padStart(2, '0')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {currentQuiz.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <h3 className="font-medium">
                      Question {index + 1}: {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name={question.id}
                            value={optionIndex}
                            checked={quizAnswers[question.id] === optionIndex}
                            onChange={() => handleQuizAnswer(question.id, optionIndex)}
                            className="text-blue-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowQuiz(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitQuiz} className="flex-1">
                    Submit Quiz
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Training;
