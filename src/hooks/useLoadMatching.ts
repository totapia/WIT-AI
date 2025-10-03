import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

export interface Load {
  id: string; // UUID from database
  load_number: string; // This is the actual load number (LN0012345)
  origin: string;
  destination: string;
  pickup_date?: string;
  delivery_date?: string;
  rate?: string;
  equipment_type?: string; // Your DB uses equipment_type, not equipment
  product_type?: string; // Your DB uses product_type, not product
  status: string;
  // Add the missing fields from your database
  user_id?: string;
  origin_facility?: string;
  destination_facility?: string;
  product?: string; // This exists in your DB
  equipment?: string; // This exists in your DB
  temp?: string;
  pallets?: number;
  cases?: number;
  created_at?: string;
  // Add the duplicate fields that exist in your DB
  pick_date?: string; // This exists in your DB
  drop_date?: string; // This exists in your DB
}

export interface LoadMatch {
  loadId: string;
  confidence: number;
  matchType: 'exact' | 'partial' | 'contextual';
  matchedFields: string[];
  load: Load;
}

// Load matching patterns
const loadPatterns = [
  // Load number patterns
  /load\s*#?(\w+)/gi,
  /ln\s*#?(\w+)/gi,
  /shipment\s*#?(\w+)/gi,
  /quote\s*#?(\w+)/gi,
  /order\s*#?(\w+)/gi,
  /pro\s*#?(\w+)/gi,
  /bol\s*#?(\w+)/gi,
  // Route patterns
  /from\s+([^,\n]+)\s+to\s+([^,\n]+)/gi,
  /([^,\n]+)\s+to\s+([^,\n]+)/gi,
  /pickup\s+([^,\n]+)/gi,
  /delivery\s+([^,\n]+)/gi,
  // Equipment patterns
  /(dry\s+van|reefer|flatbed|container)/gi,
  // Rate patterns
  /\$([0-9,]+)/g,
  // Date patterns
  /(pickup|pick)\s+(date|on)?\s*:?\s*([0-9\/\-]+)/gi,
  /(delivery|deliver|drop)\s+(date|on)?\s*:?\s*([0-9\/\-]+)/gi,
];

export const useLoadMatching = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Fetch loads from Supabase
  const fetchLoads = async () => {
    if (!user) {
      console.log('🔍 No user for fetchLoads');
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching loads for user:', user.id);
      
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('🔍 Fetched loads:', data?.length || 0);
      setLoads(data || []);
    } catch (error: any) {
      console.error('❌ Error fetching loads:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update the matchEmailToLoads function to use the correct property name
  const matchEmailToLoads = (emailContent: string, subject: string): LoadMatch[] => {
    const matches: LoadMatch[] = [];
    const combinedText = `${subject} ${emailContent}`.toLowerCase();

    loads.forEach(load => {
      let confidence = 0;
      const matchedFields: string[] = [];
      let matchType: 'exact' | 'partial' | 'contextual' = 'contextual';

      // 1. Exact Load Number match (highest confidence) - ONLY match if load number is found
      const trimmedLoadNumber = load.load_number?.trim(); // Use load_number (snake_case)
      if (!trimmedLoadNumber) return; // Skip if no load number
      
      const loadNumberPattern = new RegExp(trimmedLoadNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const hasLoadNumber = loadNumberPattern.test(combinedText);
      
      if (hasLoadNumber) {
        confidence += 100;
        matchedFields.push('loadNumber');
        matchType = 'exact';
        
        // Only add other matching criteria if we have a load number match
        // 2. Route matching
        const originMatch = load.origin && combinedText.includes(load.origin.toLowerCase());
        const destMatch = load.destination && combinedText.includes(load.destination.toLowerCase());
        
        if (originMatch && destMatch) {
          confidence += 80;
          matchedFields.push('route');
          matchType = 'partial';
        } else if (originMatch || destMatch) {
          confidence += 40;
          matchedFields.push('location');
        }

        // 3. Equipment matching
        if (load.equipment_type && combinedText.includes(load.equipment_type.toLowerCase())) {
          confidence += 30;
          matchedFields.push('equipment_type');
        }

        // 4. Product matching
        if (load.product_type && combinedText.includes(load.product_type.toLowerCase())) {
          confidence += 25;
          matchedFields.push('product_type');
        }

        // 5. Rate matching
        if (load.rate && combinedText.includes(load.rate.toString())) {
          confidence += 35;
          matchedFields.push('rate');
        }

        // Only include matches with load number found
        matches.push({
          loadId: load.load_number, // Use load_number (snake_case)
          confidence,
          matchType,
          matchedFields,
          load
        });
      }
    });

    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence);
  };

  // Add debugging to the getBestMatch function
  const getBestMatch = (emailContent: string, subject: string): LoadMatch | null => {
    const matches = matchEmailToLoads(emailContent, subject);
    
    return matches.length > 0 ? matches[0] : null;
  };

  useEffect(() => {
    if (user) {
      fetchLoads();
    }
  }, [user]);

  return {
    loads,
    loading,
    error,
    fetchLoads,
    matchEmailToLoads,
    getBestMatch
  };
};
