import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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

  // Fetch calls from database
  const fetchCalls = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalls(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Make a new call via server API
  const makeCall = async (phoneNumber: string, clientId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3001/api/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          clientId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to make call');
      }

      const result = await response.json();
      
      // Refresh calls list
      await fetchCalls();
      
      return result;
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
