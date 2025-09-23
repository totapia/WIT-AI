import React from 'react';
import { useClients, useCalls, useShipments } from '@/hooks/useSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export const SupabaseTest = () => {
  const { clients, loading: clientsLoading, error: clientsError } = useClients();
  const { calls, loading: callsLoading } = useCalls();
  const { shipments, loading: shipmentsLoading } = useShipments();

  // Add debug info
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log('Clients data:', clients);
  console.log('Clients loading:', clientsLoading);
  console.log('Clients error:', clientsError);

  // Test direct connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('count')
        .limit(1);
      
      console.log('Direct test result:', { data, error });
    } catch (err) {
      console.error('Direct test error:', err);
    }
  };

  // Run test on component mount
  React.useEffect(() => {
    testConnection();
  }, []);

  if (clientsError) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-red-600">Connection Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{clientsError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Supabase Connection Test</h2>
      
      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p>URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}</p>
          <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
          <p>Loading: {clientsLoading ? 'Yes' : 'No'}</p>
          <p>Error: {clientsError || 'None'}</p>
        </CardContent>
      </Card>
      
      {/* Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Clients ({clientsLoading ? 'Loading...' : clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <p>Loading clients...</p>
          ) : (
            <div className="space-y-2">
              {clients.length === 0 ? (
                <p className="text-red-500">No clients found</p>
              ) : (
                clients.map((client) => (
                  <div key={client.id} className="p-2 border rounded">
                    <strong>{client.company_name}</strong> - {client.status}
                    <br />
                    <small>Contact: {client.contact_person}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Calls ({callsLoading ? 'Loading...' : calls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {callsLoading ? (
            <p>Loading calls...</p>
          ) : (
            <div className="space-y-2">
              {calls.map((call) => (
                <div key={call.id} className="p-2 border rounded">
                  <strong>{call.call_type}</strong> - {call.status}
                  <br />
                  <small>{new Date(call.created_at).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipments */}
      <Card>
        <CardHeader>
          <CardTitle>Shipments ({shipmentsLoading ? 'Loading...' : shipments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {shipmentsLoading ? (
            <p>Loading shipments...</p>
          ) : (
            <div className="space-y-2">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="p-2 border rounded">
                  <strong>{shipment.origin} → {shipment.destination}</strong>
                  <br />
                  <small>{shipment.cargo_type} - ${shipment.estimated_cost}</small>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
