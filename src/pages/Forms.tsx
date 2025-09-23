import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, Lightbulb, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Forms = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('client');

  // Mock conversation data
  const conversationData = {
    clientName: "ABC Logistics Inc.",
    contactPerson: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@abclogistics.com",
    industry: "Retail",
    cargoType: "Electronics",
    origin: "Los Angeles, CA",
    destination: "New York, NY",
    frequency: "Weekly"
  };

  const suggestions = {
    client: [
      "Ask about their preferred payment terms",
      "Inquire about their typical shipment volume",
      "Request their DOT number for verification"
    ],
    background: [
      "Verify their business license number",
      "Ask for credit references",
      "Request proof of insurance coverage"
    ],
    industry: [
      "Clarify their seasonal shipping patterns",
      "Ask about temperature-controlled requirements",
      "Inquire about their compliance certifications"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/call-dashboard')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Smart Forms
            </h1>
            <p className="text-muted-foreground">Auto-filled from conversation data</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Forms Section */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="client">Client Form</TabsTrigger>
                <TabsTrigger value="background">Background Check</TabsTrigger>
                <TabsTrigger value="industry">Industry Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Client Information
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        85% Complete
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <div className="relative">
                          <Input 
                            id="company" 
                            value={conversationData.clientName}
                            className="pr-8"
                          />
                          <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact Person</Label>
                        <div className="relative">
                          <Input 
                            id="contact" 
                            value={conversationData.contactPerson}
                            className="pr-8"
                          />
                          <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Input 
                            id="phone" 
                            value={conversationData.phone}
                            className="pr-8"
                          />
                          <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Input 
                            id="email" 
                            value={conversationData.email}
                            className="pr-8"
                          />
                          <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <div className="relative">
                          <Select value={conversationData.industry}>
                            <SelectTrigger className="pr-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Retail">Retail</SelectItem>
                              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                            </SelectContent>
                          </Select>
                          <CheckCircle className="absolute right-8 top-2.5 h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-terms">Payment Terms</Label>
                        <div className="relative">
                          <Input 
                            id="payment-terms" 
                            placeholder="Not discussed yet..."
                            className="pr-8 border-orange-200 bg-orange-50"
                          />
                          <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Shipping Requirements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="origin">Origin</Label>
                          <div className="relative">
                            <Input 
                              id="origin" 
                              value={conversationData.origin}
                              className="pr-8"
                            />
                            <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="destination">Destination</Label>
                          <div className="relative">
                            <Input 
                              id="destination" 
                              value={conversationData.destination}
                              className="pr-8"
                            />
                            <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cargo-type">Cargo Type</Label>
                          <div className="relative">
                            <Input 
                              id="cargo-type" 
                              value={conversationData.cargoType}
                              className="pr-8"
                            />
                            <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="frequency">Shipping Frequency</Label>
                          <div className="relative">
                            <Input 
                              id="frequency" 
                              value={conversationData.frequency}
                              className="pr-8"
                            />
                            <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="background" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Background Check
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        45% Complete
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-license">Business License Number</Label>
                        <div className="relative">
                          <Input 
                            id="business-license" 
                            placeholder="Not provided yet..."
                            className="pr-8 border-orange-200 bg-orange-50"
                          />
                          <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="years-business">Years in Business</Label>
                        <div className="relative">
                          <Input 
                            id="years-business" 
                            placeholder="Not discussed..."
                            className="pr-8 border-orange-200 bg-orange-50"
                          />
                          <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="credit-score">Credit Score Range</Label>
                        <div className="relative">
                          <Select>
                            <SelectTrigger className="pr-8 border-orange-200 bg-orange-50">
                              <SelectValue placeholder="Not assessed..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent (750+)</SelectItem>
                              <SelectItem value="good">Good (700-749)</SelectItem>
                              <SelectItem value="fair">Fair (650-699)</SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertCircle className="absolute right-8 top-2.5 h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="insurance">Insurance Coverage</Label>
                        <div className="relative">
                          <Input 
                            id="insurance" 
                            placeholder="Needs verification..."
                            className="pr-8 border-orange-200 bg-orange-50"
                          />
                          <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="references">Credit References</Label>
                      <Textarea 
                        id="references" 
                        placeholder="Request client to provide 3 business references..."
                        className="border-orange-200 bg-orange-50"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="industry" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Industry Profile
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        60% Complete
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry-type">Primary Industry</Label>
                        <div className="relative">
                          <Select value={conversationData.industry}>
                            <SelectTrigger className="pr-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Retail">Retail</SelectItem>
                              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                            </SelectContent>
                          </Select>
                          <CheckCircle className="absolute right-8 top-2.5 h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="special-requirements">Special Requirements</Label>
                        <div className="relative">
                          <Input 
                            id="special-requirements" 
                            placeholder="Temperature control, hazmat, etc..."
                            className="pr-8 border-orange-200 bg-orange-50"
                          />
                          <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="peak-season">Peak Season</Label>
                        <div className="relative">
                          <Input 
                            id="peak-season" 
                            placeholder="Not discussed..."
                            className="pr-8 border-orange-200 bg-orange-50"
                          />
                          <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="compliance">Compliance Certifications</Label>
                        <div className="relative">
                          <Input 
                            id="compliance" 
                            placeholder="FDA, DOT, etc..."
                            className="pr-8 border-orange-200 bg-orange-50"
                          />
                          <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4 mt-6">
              <Button className="flex-1">Save Forms</Button>
              <Button variant="outline">Export to CRM</Button>
            </div>
          </div>

          {/* Suggestions Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Questions to complete the {activeTab} form:
                </div>
                {suggestions[activeTab as keyof typeof suggestions].map((suggestion, index) => (
                  <div key={index} className="p-3 bg-secondary/20 rounded-lg border-l-4 border-accent">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Add to Call Script
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Completion Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Client Form</span>
                  <span className="text-sm font-medium text-green-600">85%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Check</span>
                  <span className="text-sm font-medium text-orange-600">45%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Industry Profile</span>
                  <span className="text-sm font-medium text-blue-600">60%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};