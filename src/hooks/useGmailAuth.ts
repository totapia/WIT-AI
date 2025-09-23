import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface EmailAccount {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook';
  isConnected: boolean;
}

interface GmailAuthResult {
  success: boolean;
  email?: string;
  error?: string;
}

export const useGmailAuth = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load connected accounts on mount
  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('email_address')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading email accounts:', error);
        return;
      }

      setConnectedAccounts(data?.map(account => account.email_address) || []);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    }
  };

  const connectGmail = async (): Promise<GmailAuthResult> => {
    setIsConnecting(true);
    
    try {
      // Check if Google Identity Services is loaded
      if (!window.google) {
        return {
          success: false,
          error: 'Google Identity Services not loaded. Please refresh the page.'
        };
      }

      // Initialize Google Identity Services
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        return {
          success: false,
          error: 'Google Client ID not configured'
        };
      }

      // Create credential token with popup detection
      const credential = await new Promise((resolve, reject) => {
        let isResolved = false;
        
        // Set a timeout to handle popup cancellation
        const timeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error('Connection cancelled or timed out'));
          }
        }, 30000); // 30 second timeout (shorter for better UX)

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
          callback: (response: any) => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeout);
              
              if (response.error) {
                // Handle specific error cases
                if (response.error === 'popup_closed_by_user') {
                  reject(new Error('Connection cancelled'));
                } else {
                  reject(new Error(response.error));
                }
              } else {
                resolve(response);
              }
            }
          },
        });

        // Request access token (this opens the popup)
        tokenClient.requestAccessToken();
      });

      // Get user info
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${(credential as any).access_token}`
        }
      });

      const userData = await userInfo.json();
      
      if (!userData.email) {
        return {
          success: false,
          error: 'Could not retrieve email address'
        };
      }

      // Check if email already exists
      const { data: existingAccount } = await supabase
        .from('email_accounts')
        .select('email_address')
        .eq('email_address', userData.email)
        .single();

      if (existingAccount) {
        // Update existing account
        const { error } = await supabase
          .from('email_accounts')
          .update({
            access_token: (credential as any).access_token,
            is_active: true
          })
          .eq('email_address', userData.email);

        if (error) {
          console.error('Database error:', error);
          return {
            success: false,
            error: `Failed to update account: ${error.message}`
          };
        }
      } else {
        // Insert new account
        const { error } = await supabase
          .from('email_accounts')
          .insert({
            email_address: userData.email,
            provider: 'gmail',
            access_token: (credential as any).access_token,
            is_active: true
          });

        if (error) {
          console.error('Database error:', error);
          return {
            success: false,
            error: `Failed to save account: ${error.message}`
          };
        }
      }

      // Update local state
      setConnectedAccounts(prev => [...prev.filter(email => email !== userData.email), userData.email]);
      
      return {
        success: true,
        email: userData.email
      };

    } catch (error: any) {
      console.error('Gmail connection error:', error);
      
      // Handle cancellation gracefully - don't show error message
      if (error.message === 'Connection cancelled' || error.message === 'Connection cancelled or timed out') {
        return {
          success: false,
          error: '' // Empty error means user cancelled, no need to show error
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to connect Gmail'
      };
    } finally {
      setIsConnecting(false); // This will now always run
    }
  };

  const disconnectGmail = async (email: string): Promise<GmailAuthResult> => {
    try {
      // Update database
      const { error } = await supabase
        .from('email_accounts')
        .update({ is_active: false })
        .eq('email_address', email);

      if (error) {
        return {
          success: false,
          error: `Failed to disconnect: ${error.message}`
        };
      }

      // Update local state
      setConnectedAccounts(prev => prev.filter(e => e !== email));
      
      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to disconnect'
      };
    }
  };

  return {
    connectGmail,
    disconnectGmail,
    connectedAccounts,
    isConnecting
  };
};

// Add Google types to window
declare global {
  interface Window {
    google: any;
  }
}
