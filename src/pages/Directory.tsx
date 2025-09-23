import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Phone, Mail, MessageSquare, Building, Users, MapPin, Calendar, Star, MoreHorizontal, UserPlus, Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  location: string;
  avatar?: string;
  status: 'active' | 'away' | 'offline';
  joinDate: Date;
  managerId?: string;
  directReports?: string[];
  skills: string[];
  bio: string;
}

interface Department {
  id: string;
  name: string;
  manager: Employee;
  employeeCount: number;
  color: string;
  description: string;
}

const Directory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'org-chart'>('grid');

  // Mock data
  const departments: Department[] = [
    {
      id: '1',
      name: 'Operations',
      manager: { id: '1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@company.com', phone: '+1-555-0101', department: 'Operations', position: 'Operations Manager', location: 'New York', status: 'active', joinDate: new Date('2020-03-15'), skills: ['Leadership', 'Process Optimization', 'Team Management'], bio: 'Experienced operations leader with 8+ years in logistics management.' },
      employeeCount: 24,
      color: 'bg-blue-500',
      description: 'Core logistics and transportation operations'
    },
    {
      id: '2',
      name: 'Sales & Marketing',
      manager: { id: '2', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@company.com', phone: '+1-555-0102', department: 'Sales & Marketing', position: 'Sales Director', location: 'Los Angeles', status: 'active', joinDate: new Date('2019-07-22'), skills: ['Sales Strategy', 'Client Relations', 'Market Analysis'], bio: 'Dynamic sales professional driving revenue growth and market expansion.' },
      employeeCount: 18,
      color: 'bg-green-500',
      description: 'Customer acquisition and market development'
    },
    {
      id: '3',
      name: 'Technology',
      manager: { id: '3', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.rodriguez@company.com', phone: '+1-555-0103', department: 'Technology', position: 'CTO', location: 'San Francisco', status: 'active', joinDate: new Date('2018-11-10'), skills: ['Software Development', 'System Architecture', 'Team Leadership'], bio: 'Technology visionary leading digital transformation initiatives.' },
      employeeCount: 32,
      color: 'bg-purple-500',
      description: 'Software development and IT infrastructure'
    },
    {
      id: '4',
      name: 'Finance',
      manager: { id: '4', firstName: 'David', lastName: 'Thompson', email: 'david.thompson@company.com', phone: '+1-555-0104', department: 'Finance', position: 'CFO', location: 'Chicago', status: 'active', joinDate: new Date('2017-05-18'), skills: ['Financial Planning', 'Risk Management', 'Strategic Planning'], bio: 'Financial expert with deep expertise in corporate finance and strategy.' },
      employeeCount: 12,
      color: 'bg-yellow-500',
      description: 'Financial planning and accounting operations'
    }
  ];

  const employees: Employee[] = [
    // Operations Team
    { id: '1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@company.com', phone: '+1-555-0101', department: 'Operations', position: 'Operations Manager', location: 'New York', status: 'active', joinDate: new Date('2020-03-15'), skills: ['Leadership', 'Process Optimization', 'Team Management'], bio: 'Experienced operations leader with 8+ years in logistics management.' },
    { id: '5', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@company.com', phone: '+1-555-0105', department: 'Operations', position: 'Logistics Coordinator', location: 'New York', status: 'active', joinDate: new Date('2021-01-10'), skills: ['Logistics', 'Supply Chain', 'Coordination'], bio: 'Detail-oriented logistics professional ensuring smooth operations.' },
    { id: '6', firstName: 'Lisa', lastName: 'Garcia', email: 'lisa.garcia@company.com', phone: '+1-555-0106', department: 'Operations', position: 'Warehouse Supervisor', location: 'Chicago', status: 'away', joinDate: new Date('2020-08-20'), skills: ['Warehouse Management', 'Inventory Control', 'Team Leadership'], bio: 'Efficient warehouse supervisor with strong operational skills.' },
    
    // Sales & Marketing Team
    { id: '2', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@company.com', phone: '+1-555-0102', department: 'Sales & Marketing', position: 'Sales Director', location: 'Los Angeles', status: 'active', joinDate: new Date('2019-07-22'), skills: ['Sales Strategy', 'Client Relations', 'Market Analysis'], bio: 'Dynamic sales professional driving revenue growth and market expansion.' },
    { id: '7', firstName: 'Amanda', lastName: 'Davis', email: 'amanda.davis@company.com', phone: '+1-555-0107', department: 'Sales & Marketing', position: 'Account Executive', location: 'Los Angeles', status: 'active', joinDate: new Date('2021-03-15'), skills: ['Client Management', 'Sales', 'Communication'], bio: 'Results-driven sales professional building lasting client relationships.' },
    { id: '8', firstName: 'Robert', lastName: 'Brown', email: 'robert.brown@company.com', phone: '+1-555-0108', department: 'Sales & Marketing', position: 'Marketing Specialist', location: 'Miami', status: 'offline', joinDate: new Date('2020-12-01'), skills: ['Digital Marketing', 'Content Creation', 'Brand Management'], bio: 'Creative marketing specialist driving brand awareness and engagement.' },
    
    // Technology Team
    { id: '3', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.rodriguez@company.com', phone: '+1-555-0103', department: 'Technology', position: 'CTO', location: 'San Francisco', status: 'active', joinDate: new Date('2018-11-10'), skills: ['Software Development', 'System Architecture', 'Team Leadership'], bio: 'Technology visionary leading digital transformation initiatives.' },
    { id: '9', firstName: 'Alex', lastName: 'Martinez', email: 'alex.martinez@company.com', phone: '+1-555-0109', department: 'Technology', position: 'Senior Developer', location: 'San Francisco', status: 'active', joinDate: new Date('2019-04-12'), skills: ['React', 'Node.js', 'Database Design'], bio: 'Full-stack developer passionate about creating innovative solutions.' },
    { id: '10', firstName: 'Jennifer', lastName: 'Lee', email: 'jennifer.lee@company.com', phone: '+1-555-0110', department: 'Technology', position: 'DevOps Engineer', location: 'Austin', status: 'away', joinDate: new Date('2020-06-08'), skills: ['AWS', 'Docker', 'CI/CD'], bio: 'DevOps expert optimizing deployment and infrastructure processes.' },
    
    // Finance Team
    { id: '4', firstName: 'David', lastName: 'Thompson', email: 'david.thompson@company.com', phone: '+1-555-0104', department: 'Finance', position: 'CFO', location: 'Chicago', status: 'active', joinDate: new Date('2017-05-18'), skills: ['Financial Planning', 'Risk Management', 'Strategic Planning'], bio: 'Financial expert with deep expertise in corporate finance and strategy.' },
    { id: '11', firstName: 'Rachel', lastName: 'White', email: 'rachel.white@company.com', phone: '+1-555-0111', department: 'Finance', position: 'Financial Analyst', location: 'Chicago', status: 'active', joinDate: new Date('2021-02-14'), skills: ['Financial Analysis', 'Excel', 'Reporting'], bio: 'Analytical finance professional providing data-driven insights.' },
    { id: '12', firstName: 'Thomas', lastName: 'Anderson', email: 'thomas.anderson@company.com', phone: '+1-555-0112', department: 'Finance', position: 'Accountant', location: 'Boston', status: 'offline', joinDate: new Date('2020-09-30'), skills: ['Accounting', 'Tax Preparation', 'Bookkeeping'], bio: 'Detail-oriented accountant maintaining accurate financial records.' }
  ];

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleQuickAction = (action: string, employee: Employee) => {
    switch (action) {
      case 'call':
        window.open(`tel:${employee.phone}`);
        break;
      case 'email':
        window.open(`mailto:${employee.email}`);
        break;
      case 'message':
        // Navigate to messaging system
        console.log(`Opening message to ${employee.firstName}`);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  // Filtered employees based on search and department
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = 
        employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }, [searchQuery, selectedDepartment]);

  const getDepartmentColor = (departmentName: string) => {
    const dept = departments.find(d => d.name === departmentName);
    return dept?.color || 'bg-gray-500';
  };

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
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Employee Directory</h1>
                    <p className="text-muted-foreground text-xs">Connect with your team members and colleagues</p>
                  </div>
                </div>
              </div>
              
              {/* Right side - Stats */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2 py-1 text-xs">
                  <Users className="mr-1 h-3 w-3" />
                  {employees.length} Employees
                </Badge>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  <Building className="mr-1 h-3 w-3" />
                  {departments.length} Departments
                </Badge>
              </div>
            </div>
          </header>

          <div className="p-3 space-y-3">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees by name, email, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name} ({dept.employeeCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="org-chart" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Org Chart
            </TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="grid" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="text-lg font-semibold">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(employee.status)}`} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={getDepartmentColor(employee.department).replace('bg-', 'text-').replace('-500', '-600')}>
                          {employee.department}
                        </Badge>
                        <span className="text-xs text-gray-500">{getStatusText(employee.status)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{employee.position}</p>
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {employee.location}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{employee.phone}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction('call', employee);
                              }}
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Call {employee.firstName}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction('email', employee);
                              }}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Email {employee.firstName}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction('message', employee);
                              }}
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Message {employee.firstName}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee List</CardTitle>
                <CardDescription>Detailed view of all employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="text-sm font-semibold">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(employee.status)}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                          <Badge variant="outline" className={getDepartmentColor(employee.department).replace('bg-', 'text-').replace('-500', '-600')}>
                            {employee.department}
                          </Badge>
                          <span className="text-sm text-gray-500">{employee.position}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {employee.location}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction('call', employee)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction('email', employee)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEmployeeSelect(employee)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizational Chart View */}
          <TabsContent value="org-chart" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {departments.map((dept) => (
                <Card key={dept.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${dept.color}`} />
                        {dept.name}
                      </CardTitle>
                      <Badge variant="secondary">{dept.employeeCount} employees</Badge>
                    </div>
                    <CardDescription>{dept.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Department Manager */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={dept.manager.avatar} />
                          <AvatarFallback className="text-sm font-semibold">
                            {dept.manager.firstName[0]}{dept.manager.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{dept.manager.firstName} {dept.manager.lastName}</h4>
                            <Badge variant="outline" className="text-xs">Manager</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{dept.manager.position}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleQuickAction('call', dept.manager)}>
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleQuickAction('email', dept.manager)}>
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Department Employees */}
                      <div className="grid grid-cols-2 gap-2">
                        {employees
                          .filter(emp => emp.department === dept.name && emp.id !== dept.manager.id)
                          .slice(0, 6)
                          .map((emp) => (
                            <div key={emp.id} className="flex items-center gap-2 p-2 bg-white border rounded text-sm">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={emp.avatar} />
                                <AvatarFallback className="text-xs font-semibold">
                                  {emp.firstName[0]}{emp.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{emp.firstName} {emp.lastName}</p>
                                <p className="text-xs text-gray-500 truncate">{emp.position}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                      
                      {employees.filter(emp => emp.department === dept.name).length > 7 && (
                        <div className="text-center">
                          <Button variant="outline" size="sm">
                            View All {dept.employeeCount} Employees
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>

      {/* Employee Detail Modal */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedEmployee.avatar} />
                    <AvatarFallback className="text-2xl font-semibold">
                      {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">{selectedEmployee.firstName} {selectedEmployee.lastName}</DialogTitle>
                    <DialogDescription className="text-lg">{selectedEmployee.position}</DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getDepartmentColor(selectedEmployee.department).replace('bg-', 'text-').replace('-500', '-600')}>
                        {selectedEmployee.department}
                      </Badge>
                      <Badge variant="secondary">{getStatusText(selectedEmployee.status)}</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-gray-600">{selectedEmployee.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-gray-600">{selectedEmployee.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Joined</p>
                        <p className="text-sm text-gray-600">{selectedEmployee.joinDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <p className="text-gray-600">{selectedEmployee.bio}</p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                  <div className="flex gap-3">
                    <Button onClick={() => handleQuickAction('call', selectedEmployee)} className="flex-1">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    <Button onClick={() => handleQuickAction('email', selectedEmployee)} className="flex-1">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button onClick={() => handleQuickAction('message', selectedEmployee)} className="flex-1">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Directory;
