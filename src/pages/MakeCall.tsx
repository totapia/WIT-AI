import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, User, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useTwilioCalls } from '@/hooks/useTwilioCalls';
import { useClients } from '@/hooks/useSupabase';
import { toast } from 'sonner';

const MakeCall = () => {
  const navigate = useNavigate();
  const { makeCall, loading } = useTwilioCalls();
  const { clients } = useClients();
  
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customPhoneNumber, setCustomPhoneNumber] = useState('');

  const selectedClientData = clients.find(c => c.id === selectedClient);

  const handleMakeCall = async () => {
    try {
      if (!selectedClient && !customPhoneNumber) {
        toast.error('Please select a client or enter a phone number');
        return;
      }

      const phoneToCall = selectedClient ? phoneNumber : customPhoneNumber;
      const clientId = selectedClient || 'custom';

      await makeCall(phoneToCall, clientId);
      
      toast.success('Call initiated successfully!');
      
      // Navigate to call dashboard
      navigate('/call-dashboard');
    } catch (error) {
      console.error('Error making call:', error);
      toast.error('Failed to make call. Please try again.');
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setPhoneNumber(client.phone || '');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/call-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Live Call
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Make Call</h1>
              <p className="text-muted-foreground">Initiate a new phone call to a client</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Select Client
                </CardTitle>
                <CardDescription>
                  Choose a client from your directory or enter a custom phone number
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-select">Client</Label>
                  <select
                    id="client-select"
                    value={selectedClient}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full p-2 border border-input bg-background rounded-md"
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company_name} - {client.contact_person}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClientData && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{selectedClientData.company_name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Contact: {selectedClientData.contact_person}</p>
                      <p>Phone: {selectedClientData.phone}</p>
                      <p>Email: {selectedClientData.email}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={selectedClient ? phoneNumber : customPhoneNumber}
                    onChange={(e) => selectedClient ? setPhoneNumber(e.target.value) : setCustomPhoneNumber(e.target.value)}
                    disabled={!!selectedClient}
                  />
                  {selectedClient && (
                    <p className="text-xs text-muted-foreground">
                      Phone number from client profile
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Call Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Calling:</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {selectedClientData ? (
                      <>
                        <div className="font-medium">{selectedClientData.company_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedClientData.contact_person}
                        </div>
                        <div className="text-sm">{phoneNumber}</div>
                      </>
                    ) : customPhoneNumber ? (
                      <div className="font-medium">{customPhoneNumber}</div>
                    ) : (
                      <div className="text-muted-foreground">No number selected</div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleMakeCall}
                  disabled={loading || (!selectedClient && !customPhoneNumber)}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>Making Call...</>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Start Call
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default MakeCall;
