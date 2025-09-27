import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Types for our database
export interface Client {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

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
  // New Twilio fields
  call_source?: string;
  twilio_sid?: string;
  recording_sid?: string;
  recording_url?: string;
  integration_config?: any;
  external_call_id?: string;
}

export interface Shipment {
  id: string;
  client_id: string;
  origin: string;
  destination: string;
  cargo_type: string | null;
  weight_kg: number | null;
  volume_cubic_meters: number | null;
  estimated_cost: number | null;
  status: string;
  pickup_date: string | null;
  delivery_date: string | null;
  created_at: string;
}

// Custom hook to fetch clients
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return { clients, loading, error };
};

// Custom hook to fetch calls
export const useCalls = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .order('scheduled_time', { ascending: true });

        if (error) throw error;
        setCalls(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  return { calls, loading, error };
};

// Custom hook to fetch shipments
export const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setShipments(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  return { shipments, loading, error };
};
