import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

interface ConnectionStatus {
  isConnected: boolean;
  email: string | null;
  isValidToken: boolean;
}

export const useEmailConnection = () => {
  const { user } = useUser();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    email: null,
    isValidToken: false
  });
  const [isValidating, setIsValidating] = useState(false);

  // Check email connection
  const checkEmailConnection = async () => {
    if (isValidating || !user) return; // Prevent multiple calls and ensure user is logged in
    
    setIsValidating(true);
    
    try {
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('is_active', true)
        .eq('provider', 'gmail')
        .eq('user_id', user.id) // Use the current user's ID
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

  // Check connection on mount and when user changes
  useEffect(() => {
    if (user) {
      checkEmailConnection();
    }
  }, [user]);

  return {
    connectionStatus,
    isValidating,
    checkEmailConnection
  };
};
