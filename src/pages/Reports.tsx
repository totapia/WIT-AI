import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Phone,
  Target,
  Clock,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Eye,
  Star,
  Zap,
  Brain,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Search
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();

  const teamMetrics = [
    { label: "Total Calls", value: "1,247", change: "+8.2%", positive: true },
    { label: "Conversion Rate", value: "34.2%", change: "+12.1%", positive: true },
    { label: "Avg Call Duration", value: "18:45", change: "-2.3%", positive: false },
    { label: "Revenue Generated", value: "$2.1M", change: "+15.7%", positive: true },
  ];

  const agentPerformance = [
    {
      name: "John Smith",
      avatar: "/avatars/john.jpg",
      callsTotal: 156,
      conversionRate: 42.3,
      avgCallTime: "22:15",
      revenue: "$425K",
      aiScore: 92,
      grade: "A+",
      status: "excellent"
    },
    {
      name: "Sarah Wilson",
      avatar: "/avatars/sarah.jpg",
      callsTotal: 134,
      conversionRate: 38.1,
      avgCallTime: "19:30",
      revenue: "$380K",
      aiScore: 88,
      grade: "A",
      status: "excellent"
    },
    {
      name: "Mike Johnson",
      avatar: "/avatars/mike.jpg",
      callsTotal: 142,
      conversionRate: 29.6,
      avgCallTime: "16:45",
      revenue: "$310K",
      aiScore: 76,
      grade: "B+",
      status: "good"
    },
    {
      name: "Emma Davis",
      avatar: "/avatars/emma.jpg",
      callsTotal: 118,
      conversionRate: 24.8,
      avgCallTime: "14:20",
      revenue: "$265K",
      aiScore: 68,
      grade: "B",
      status: "needs-improvement"
    },
  ];

  const recentCalls = [
    {
      agent: "John Smith",
      client: "GlobalShip Corp",
      duration: "24:15",
      outcome: "Closed",
      value: "$45K",
      aiScore: 94,
      sentiment: "Positive",
      timestamp: "2 hours ago"
    },
    {
      agent: "Sarah Wilson",
      client: "FastTrack Logistics",
      duration: "18:30",
      outcome: "Follow-up",
      value: "$32K",
      aiScore: 87,
      sentiment: "Neutral",
      timestamp: "4 hours ago"
    },
    {
      agent: "Mike Johnson",
      client: "Metro Transport",
      duration: "16:45",
      outcome: "No Deal",
      value: "$0",
      aiScore: 71,
      sentiment: "Negative",
      timestamp: "6 hours ago"
    },
  ];

  const aiInsights = [
    {
      title: "Communication Pattern",
      insight: "Top performers spend 65% more time asking questions vs. talking about features",
      impact: "High",
      action: "Train team on consultative selling techniques"
    },
    {
      title: "Optimal Call Timing",
      insight: "Calls scheduled between 10-11 AM have 23% higher conversion rates",
      impact: "Medium",
      action: "Adjust scheduling preferences in CRM"
    },
    {
      title: "Client Mood Detection",
      insight: "Early mood detection in first 3 minutes correlates with 89% accuracy to final outcome",
      impact: "High",
      action: "Focus training on early rapport building"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-success";
      case "good": return "text-warning";
      case "needs-improvement": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "bg-success text-success-foreground";
    if (grade.startsWith('B')) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive": return "bg-success text-success-foreground";
      case "Neutral": return "bg-warning text-warning-foreground";
      case "Negative": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-background w-full">
          {/* Header */}
          <header className="border-b bg-card sticky top-0 z-40 h-14">
            <div className="px-3 h-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-lg font-bold">Sales Performance Reports</h1>
                  <p className="text-xs text-muted-foreground">Manager Dashboard • Real-time Analytics</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select defaultValue="30days">
                  <SelectTrigger className="w-28 h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                  <Filter className="w-2.5 h-2.5 mr-1" />
                  Filter
                </Button>
                
                <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                  <Download className="w-2.5 h-2.5 mr-1" />
                  Export
                </Button>

                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <Search className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <Bell className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <Settings className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="w-6 h-6">
                  <LogOut className="w-3 h-3" />
                </Button>
                
                <Avatar className="w-6 h-6">
                  <AvatarImage src="/avatars/user.jpg" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

      <div className="p-3 space-y-3">
        {/* Team Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {teamMetrics.map((metric, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                    <p className="text-lg font-bold">{metric.value}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {metric.positive ? (
                      <TrendingUp className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                    )}
                    <span className={`text-xs font-medium ${metric.positive ? 'text-success' : 'text-destructive'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="agents" className="space-y-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agents">Agent Performance</TabsTrigger>
            <TabsTrigger value="calls">Call Analysis</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Agent Performance Tab */}
          <TabsContent value="agents" className="space-y-3">
            <Card className="border-0 shadow-lg h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="pb-1.5 px-3 py-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Individual Agent Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 flex-1 overflow-y-auto">
                <div className="space-y-3">
                  {agentPerformance.map((agent, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-sm">{agent.name}</h3>
                            <div className="flex items-center gap-1.5">
                              <Badge className={`${getGradeColor(agent.grade)} text-xs px-1 py-0`}>
                                {agent.grade}
                              </Badge>
                              <span className={`text-xs ${getStatusColor(agent.status)}`}>
                                {agent.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <div className="text-sm font-bold text-primary">{agent.aiScore}</div>
                            <div className="text-xs text-muted-foreground">AI Score</div>
                          </div>
                          <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                            <Eye className="w-2.5 h-2.5 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Total Calls</div>
                          <div className="text-sm font-semibold">{agent.callsTotal}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Conversion Rate</div>
                          <div className="text-sm font-semibold">{agent.conversionRate}%</div>
                          <Progress value={agent.conversionRate} className="mt-0.5 h-1" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Avg Call Time</div>
                          <div className="text-sm font-semibold">{agent.avgCallTime}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Revenue</div>
                          <div className="text-sm font-semibold text-success">{agent.revenue}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Call Analysis Tab */}
          <TabsContent value="calls" className="space-y-6">
            <Card className="border-0 shadow-lg h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Recent Call Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {recentCalls.map((call, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{call.agent.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{call.agent}</h4>
                            <p className="text-sm text-muted-foreground">{call.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{call.timestamp}</div>
                          <Badge className={getSentimentColor(call.sentiment)} variant="secondary">
                            {call.sentiment}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Duration</div>
                          <div className="font-semibold">{call.duration}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Outcome</div>
                          <div className={`font-semibold ${
                            call.outcome === 'Closed' ? 'text-success' :
                            call.outcome === 'Follow-up' ? 'text-warning' :
                            'text-destructive'
                          }`}>
                            {call.outcome}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Potential Value</div>
                          <div className="font-semibold">{call.value}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">AI Score</div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">{call.aiScore}</span>
                            <Star className="w-3 h-3 text-warning fill-warning" />
                          </div>
                        </div>
                        <div>
                          <Button variant="outline" size="sm" className="w-full">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            View Transcript
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-0 shadow-lg h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI-Powered Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-6">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="p-6 border rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{insight.title}</h3>
                            <Badge variant={insight.impact === 'High' ? 'destructive' : 'default'}>
                              {insight.impact} Impact
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{insight.insight}</p>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium">Recommended Action:</span>
                            <span className="text-sm">{insight.action}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Conversion Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This Week</span>
                      <span className="font-semibold">34.2%</span>
                    </div>
                    <Progress value={34.2} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Week</span>
                      <span className="font-semibold">30.5%</span>
                    </div>
                    <Progress value={30.5} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Target</span>
                      <span className="font-semibold">40.0%</span>
                    </div>
                    <Progress value={40} className="opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Call Quality Score</span>
                      <span className="font-semibold">8.4/10</span>
                    </div>
                    <Progress value={84} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Client Satisfaction</span>
                      <span className="font-semibold">4.6/5</span>
                    </div>
                    <Progress value={92} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Coaching Adoption</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
        </div>
      </SidebarInset>
    </>
  );
};

export default Reports;