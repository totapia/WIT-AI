import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface EmailAccount {
  id: string;
  email_address: string;
  provider: string;
  access_token: string | null;
  is_active: boolean;
}

interface ConnectionStatus {
  isConnected: boolean;
  email: string | null;
  isValidToken: boolean;
}

// Global state to prevent multiple instances from making requests
let globalConnectionCheck: Promise<ConnectionStatus> | null = null;
let globalConnectionStatus: ConnectionStatus = {
  isConnected: false,
  email: null,
  isValidToken: false
};

export const useEmailConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    email: null,
    isValidToken: false
  });
  const [isValidating, setIsValidating] = useState(false);

  // Check email connection (simplified)
  const checkEmailConnection = async () => {
    if (isValidating) return; // Prevent multiple calls
    
    setIsValidating(true);
    
    try {
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .match({ is_active: true, provider: 'gmail' })
        .limit(1);

      if (error) {
        console.error('Error fetching email accounts:', error);
        setConnectionStatus({ isConnected: false, email: null, isValidToken: false });
        return;
      }

      if (!accounts || accounts.length === 0) {
        setConnectionStatus({ isConnected: false, email: null, isValidToken: false });
        return;
      }

      const account = accounts[0];

      // If we have an account with a token, consider it connected
      setConnectionStatus({
        isConnected: true,
        email: account.email_address,
        isValidToken: true
      });
      
    } catch (error) {
      console.error('Connection check error:', error);
      setConnectionStatus({ isConnected: false, email: null, isValidToken: false });
    } finally {
      setIsValidating(false);
    }
  };

  // Check connection on mount
  useEffect(() => {
    checkEmailConnection();
  }, []);

  return {
    connectionStatus,
    isValidating,
    checkEmailConnection
  };
};
