import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useNavigate } from "react-router-dom";
import { useClients, useCalls } from "@/hooks/useSupabase"; // Add this
import { 
  Calendar, 
  Phone, 
  Users, 
  TrendingUp, 
  Clock, 
  FileText, 
  Target,
  DollarSign,
  PhoneCall,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Package,
  Mail,
  Globe,
  MessageCircle,
  Circle
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Replace mock data with real Supabase data
  const { clients, loading: clientsLoading } = useClients();
  const { calls, loading: callsLoading } = useCalls();

  // Transform Supabase calls data to match your UI format
  const todaySchedule = calls.map(call => {
    const client = clients.find(c => c.id === call.client_id);
    return {
      time: call.scheduled_time ? new Date(call.scheduled_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : "TBD",
      client: client?.company_name || "Unknown Client",
      type: call.call_type || "Call",
      status: call.status === 'scheduled' ? 'upcoming' : 
              call.status === 'completed' ? 'completed' : 'current'
    };
  });

  // Transform Supabase clients data to match your UI format
  const recentClients = clients.map(client => ({
    name: client.contact_person || "No Contact",
    company: client.company_name,
    status: client.status === 'qualified' ? 'Hot Lead' :
            client.status === 'proposal_sent' ? 'Qualified' :
            client.status === 'negotiation' ? 'Proposal Sent' : 'Prospect',
    lastContact: "Recently updated", // You can add last_contact field to your database later
    avatar: "/avatars/default.jpg"
  }));

  // Keep mock data for now (we'll add shipments later)
  const inboundLoadRequests = [
    { 
      sender: "procurement@techcorp.com", 
      route: "Chicago, IL → Atlanta, GA", 
      weight: "25,000 lbs", 
      type: "Electronics", 
      urgency: "urgent", 
      receivedTime: "2 hours ago",
      rate: "$2,850",
      source: "Email"
    },
    { 
      sender: "logistics@retailplus.com", 
      route: "Los Angeles, CA → Denver, CO", 
      weight: "18,500 lbs", 
      type: "Consumer Goods", 
      urgency: "standard", 
      receivedTime: "4 hours ago",
      rate: "$1,950",
      source: "Platform"
    },
    { 
      sender: "shipping@pharmacare.com", 
      route: "Miami, FL → Houston, TX", 
      weight: "12,000 lbs", 
      type: "Pharmaceuticals", 
      urgency: "high", 
      receivedTime: "6 hours ago",
      rate: "$3,200",
      source: "SMS"
    },
    { 
      sender: "freight@manufactory.com", 
      route: "Detroit, MI → Nashville, TN", 
      weight: "22,000 lbs", 
      type: "Machinery", 
      urgency: "mid", 
      receivedTime: "8 hours ago",
      rate: "$2,450",
      source: "Platform"
    },
  ];

  const kpis = [
    { label: "Monthly Revenue", value: "$342K", change: "+12.5%", positive: true, icon: DollarSign },
    { label: "Calls Today", value: "8", change: "+2", positive: true, icon: Phone },
    { label: "Conversion Rate", value: "32%", change: "+5.2%", positive: true, icon: Target },
    { label: "Active Deals", value: "24", change: "-1", positive: false, icon: Truck },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hot Lead": return "bg-destructive text-destructive-foreground";
      case "Qualified": return "bg-warning text-warning-foreground";
      case "Proposal Sent": return "bg-primary text-primary-foreground";
      case "Negotiation": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "standard": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Email": return Mail;
      case "Platform": return Globe;
      case "SMS": return MessageCircle;
      default: return Mail;
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "text-red-500";
      case "high": return "text-amber-500";
      case "mid": return "text-orange-500";
      case "standard": return "text-green-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-40 h-14">
          <div className="px-3 h-full flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">WIT Ai Dashboard</h2>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-2">
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

        {/* Main Content */}
        <div className="min-h-screen bg-background">
          <div className="p-6">
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                {kpis.map((kpi, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale animate-fade-in" style={{animationDelay: `${0.1 * index}s`}}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center animate-pulse ${
                            kpi.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                          }`}>
                            <kpi.icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{kpi.label}</p>
                            <p className="text-sm font-bold counter-animate">{kpi.value}</p>
                          </div>
                        </div>
                        <Badge variant={kpi.positive ? "default" : "destructive"} className="text-xs px-1 py-0">
                          {kpi.change}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-3 flex-1">
                {/* Today's Schedule */}
                <Card className="border-0 shadow-lg h-[calc(100vh-240px)] flex flex-col">
                  <CardHeader className="pb-1.5 px-3 py-2 flex-shrink-0">
                    <CardTitle className="flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 px-3 flex-1 overflow-y-auto">
                    {todaySchedule.map((call, index) => (
                      <div key={index} className={`p-2 rounded-lg border ${
                        call.status === 'current' ? 'bg-primary/5 border-primary' : 'bg-muted/30'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">{call.time}</span>
                          {call.status === 'current' && (
                            <Badge variant="default" className="text-xs px-1 py-0">
                              <Clock className="w-2 h-2 mr-0.5" />
                              Current
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs">{call.client}</h4>
                        <p className="text-xs text-muted-foreground">{call.type}</p>
                        {call.status === 'current' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="mt-1.5 w-full h-6 text-xs"
                            onClick={() => navigate("/call-dashboard")}
                          >
                            <PhoneCall className="w-2.5 h-2.5 mr-1" />
                            Join Call
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Clients */}
                <Card className="border-0 shadow-lg h-[calc(100vh-240px)] flex flex-col">
                  <CardHeader className="pb-1.5 px-3 py-2 flex-shrink-0">
                    <CardTitle className="flex items-center gap-1.5 text-xs">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      Recent Clients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 px-3 flex-1 overflow-y-auto">
                    {recentClients.map((client, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={client.avatar} />
                            <AvatarFallback className="text-xs">{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs truncate">{client.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                            <p className="text-xs text-muted-foreground">{client.lastContact}</p>
                          </div>
                          <Badge className={`text-xs px-1 py-0 ${getStatusColor(client.status)}`}>
                            {client.status}
                          </Badge>
                        </div>
                        {index < recentClients.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Loads */}
                <Card className="border-0 shadow-lg h-[calc(100vh-240px)] flex flex-col">
                  <CardHeader className="pb-1.5 px-3 py-2 flex-shrink-0">
                    <CardTitle className="flex items-center gap-1.5 text-xs">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      Loads
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 px-3 flex-1 overflow-y-auto">
                    {inboundLoadRequests.map((request, index) => (
                      <div key={index} className="p-2 rounded-lg bg-muted/30 relative">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const SourceIcon = getSourceIcon(request.source);
                              return <SourceIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />;
                            })()}
                            <h4 className="font-semibold text-xs">{request.route}</h4>
                          </div>
                          <Circle className={`w-3 h-3 fill-current ${getUrgencyIcon(request.urgency)}`} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground">From: {request.sender}</p>
                          <p className="text-xs">{request.weight} • {request.type}</p>
                          <p className="text-xs font-medium text-success">Suggested Rate: {request.rate}</p>
                        </div>
                        <span className="absolute bottom-1 right-2 text-xs text-muted-foreground">{request.receivedTime}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-1.5 px-3 py-2">
                  <CardTitle className="text-xs">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-3">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <Button variant="outline" className="h-12 flex-col gap-1 text-xs" onClick={() => navigate("/make-call")}>
                      <Phone className="h-4 w-4" />
                      Make Call
                    </Button>
                    <Button variant="outline" className="h-12 flex-col gap-1 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      Add Client
                    </Button>
                    <Button variant="outline" className="h-12 flex-col gap-1 text-xs">
                      <FileText className="w-3.5 h-3.5" />
                      Create Memo
                    </Button>
                    <Button variant="outline" className="h-12 flex-col gap-1 text-xs" onClick={() => navigate("/reports")}>
                      <BarChart3 className="w-3.5 h-3.5" />
                      View Reports
                    </Button>
                    <Button 
                      onClick={() => navigate("/shipments")}
                      className="h-12 flex-col gap-1 text-xs"
                      variant="outline"
                    >
                      <Package className="h-3.5 w-3.5" />
                      Shipments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
};

export default Dashboard;