import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import TwilioService from '@/lib/twilio';
import { useUser } from '@/contexts/UserContext';

export interface Call {
  id: string;
  client_id: string;
  user_id: string;
  call_type: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  status: string;
  notes: string | null;
  outcome: string | null;
  created_at: string;
  call_source?: string;
  twilio_sid?: string;
  recording_sid?: string;
  recording_url?: string;
  integration_config?: any;
  external_call_id?: string;
}

export interface TwilioCall extends Call {}

export const useTwilioCalls = () => {
  const [calls, setCalls] = useState<TwilioCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Initialize Twilio service
  const twilioService = new TwilioService({
    accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
    authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
    phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
    webhookUrl: import.meta.env.VITE_TWILIO_WEBHOOK_URL || '',
  });

  // Fetch calls from database
  const fetchCalls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalls(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Make a new call
  const makeCall = async (clientId: string, phoneNumber: string) => {
    try {
      setLoading(true);
      
      // Start the call via Twilio
      const callSid = await twilioService.makeCall(phoneNumber, clientId);
      
      // Create call record in database
      const { data: call, error } = await supabase
        .from('calls')
        .insert({
          client_id: clientId,
          user_id: user?.id,
          call_type: 'outbound',
          status: 'initiated',
          call_source: 'twilio',
          twilio_sid: callSid,
          integration_config: {
            phoneNumber,
            startTime: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh calls list
      await fetchCalls();
      
      return call;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make call');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update call status (called by webhook)
  const updateCallStatus = async (callSid: string, status: string, recordingUrl?: string) => {
    try {
      const updates: any = { status };
      
      if (recordingUrl) {
        updates.recording_url = recordingUrl;
      }

      const { error } = await supabase
        .from('calls')
        .update(updates)
        .eq('twilio_sid', callSid);

      if (error) throw error;
      
      // Refresh calls
      await fetchCalls();
    } catch (err) {
      console.error('Error updating call status:', err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCalls();
    }
  }, [user?.id]);

  return {
    calls,
    loading,
    error,
    makeCall,
    updateCallStatus,
    refreshCalls: fetchCalls
  };
};
