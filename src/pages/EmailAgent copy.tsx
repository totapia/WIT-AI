import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, History, FileText, Sparkles, Settings, Mail, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

interface SentEmail {
  id: string;
  to: string;
  subject: string;
  content: string;
  tone: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'read';
}

const EmailAgent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('compose');
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    content: '',
    tone: 'professional'
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for templates and sent emails
  const templates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Follow-up Email',
      subject: 'Following up on our conversation',
      content: 'Hi [Name],\n\nI hope this email finds you well. I wanted to follow up on our recent conversation...',
      category: 'Follow-up'
    },
    {
      id: '2',
      name: 'Meeting Request',
      subject: 'Request for a meeting',
      content: 'Dear [Name],\n\nI hope you\'re having a great day. I would like to schedule a meeting...',
      category: 'Meeting'
    },
    {
      id: '3',
      name: 'Thank You',
      subject: 'Thank you for your time',
      content: 'Hi [Name],\n\nThank you for taking the time to meet with me today...',
      category: 'Gratitude'
    }
  ];

  const sentEmails: SentEmail[] = [
    {
      id: '1',
      to: 'john@example.com',
      subject: 'Follow-up on proposal',
      content: 'Hi John, following up on our proposal...',
      tone: 'professional',
      sentAt: new Date('2024-01-15'),
      status: 'read'
    },
    {
      id: '2',
      to: 'sarah@company.com',
      subject: 'Meeting request',
      content: 'Hi Sarah, would you be available...',
      tone: 'friendly',
      sentAt: new Date('2024-01-14'),
      status: 'delivered'
    }
  ];

  const handleBackToLiveCall = () => {
    navigate('/call-dashboard');
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setAiSuggestions([
        'Consider adding a clear call-to-action at the end',
        'The subject line could be more engaging',
        'Try using more specific details about the recipient'
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSendEmail = () => {
    // Handle email sending logic
    console.log('Sending email:', emailData);
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setEmailData({
      ...emailData,
      subject: template.subject,
      content: template.content
    });
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
                  onClick={handleBackToLiveCall}
                  className="h-8 text-xs px-3"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Live Call
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Email AI Agent</h1>
                    <p className="text-muted-foreground text-xs">AI-powered email composition and management</p>
                  </div>
                </div>
              </div>
              
              {/* Right side - User actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </header>

          <div className="p-3 space-y-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Sent History
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email Composition Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Compose Email
                  </CardTitle>
                  <CardDescription>
                    Write your email with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        To
                      </label>
                      <Input
                        placeholder="recipient@example.com"
                        value={emailData.to}
                        onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tone
                      </label>
                      <Select
                        value={emailData.tone}
                        onValueChange={(value) => setEmailData({ ...emailData, tone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Subject
                    </label>
                    <Input
                      placeholder="Enter email subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Content
                    </label>
                    <Textarea
                      placeholder="Write your email content here..."
                      value={emailData.content}
                      onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isGenerating ? 'Generating...' : 'Generate AI Suggestions'}
                    </Button>
                    <Button
                      onClick={handleSendEmail}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Suggestions Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiSuggestions.length > 0 ? (
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Click "Generate AI Suggestions" to get started
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Tone Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Tone:</span>
                      <Badge variant="secondary">{emailData.tone}</Badge>
                    </div>
                    <Separator />
                    <div className="text-xs text-gray-500">
                      <p><strong>Professional:</strong> Business-like, respectful</p>
                      <p><strong>Friendly:</strong> Warm, approachable</p>
                      <p><strong>Formal:</strong> Traditional, proper</p>
                      <p><strong>Casual:</strong> Relaxed, informal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Choose from pre-written templates or create your own
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.subject}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplateSelect(template)}
                        className="w-full"
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sent Email History</CardTitle>
              <CardDescription>
                Track your sent emails and their delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentEmails.map((email) => (
                  <Card key={email.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{email.to}</span>
                            <Badge variant="outline">{email.tone}</Badge>
                          </div>
                          <h4 className="font-semibold">{email.subject}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {email.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            Sent: {email.sentAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={email.status === 'read' ? 'default' : 'secondary'}
                          >
                            {email.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </>
  );
};

export default EmailAgent;
