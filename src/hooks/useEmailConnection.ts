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

  // Validate Gmail token by making a test API call
  const validateGmailToken = async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      console.log('🔍 Token validation response:', response.status);
      return response.ok;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  };

  // Check email connection
  const checkEmailConnection = async () => {
    if (isValidating || !user) return;
    
    setIsValidating(true);
    
    try {
      console.log('🔍 Checking email connection for user:', user.id);
      
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('is_active', true)
        .eq('provider', 'gmail')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('❌ Error fetching email accounts:', error);
        setConnectionStatus({ isConnected: false, email: null, isValidToken: false });
        return;
      }

      if (!accounts || accounts.length === 0) {
        console.log('🔍 No Gmail accounts found');
        setConnectionStatus({ isConnected: false, email: null, isValidToken: false });
        return;
      }

      const account = accounts[0];
      console.log('🔍 Found Gmail account:', account.email_address);

      // Validate the token by making a test API call
      const isValidToken = await validateGmailToken(account.access_token);
      console.log('🔍 Token validation result:', isValidToken);

      if (!isValidToken) {
        // Mark as inactive if token is invalid
        await supabase
          .from('email_accounts')
          .update({ is_active: false })
          .eq('id', account.id);
        
        setConnectionStatus({ isConnected: false, email: null, isValidToken: false });
        return;
      }

      setConnectionStatus({
        isConnected: true,
        email: account.email_address,
        isValidToken: true
      });
      
    } catch (error) {
      console.error('❌ Connection check error:', error);
      setConnectionStatus({ isConnected: false, email: null, isValidToken: false });
    } finally {
      setIsValidating(false);
    }
  };

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
