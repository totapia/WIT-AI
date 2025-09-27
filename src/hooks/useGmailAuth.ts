import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

interface GmailAuthResult {
  success: boolean;
  email?: string;
  error?: string;
}

export const useGmailAuth = () => {
  const { user } = useUser();
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load connected accounts on mount
  useEffect(() => {
    if (user) {
      loadConnectedAccounts();
    }
  }, [user]);

  const loadConnectedAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('email_address')
        .eq('is_active', true)
        .eq('user_id', user?.id);

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
        
        const timeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error('Connection cancelled or timed out'));
          }
        }, 30000);

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
          callback: (response: any) => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(timeout);
              
              if (response.error) {
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

        tokenClient.requestAccessToken();
      });

      console.log('Google OAuth response:', credential);

      // Validate the token first
      if (!(credential as any).access_token) {
        return {
          success: false,
          error: 'No access token received from Google'
        };
      }

      // Get user info with better error handling
      let userData;
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${(credential as any).access_token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('UserInfo response status:', userInfoResponse.status);

        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text();
          console.error('UserInfo error response:', errorText);
          
          if (userInfoResponse.status === 401) {
            return {
              success: false,
              error: 'Google authentication failed. Please try again or check if your Google account has the necessary permissions.'
            };
          }
          
          return {
            success: false,
            error: `Google API error: ${userInfoResponse.status} - ${errorText}`
          };
        }

        userData = await userInfoResponse.json();
        console.log('User data received:', userData);
        
      } catch (fetchError) {
        console.error('Error fetching user info:', fetchError);
        return {
          success: false,
          error: 'Failed to retrieve user information from Google. Please try again.'
        };
      }
      
      if (!userData.email) {
        return {
          success: false,
          error: 'Could not retrieve email address from Google account'
        };
      }

      // Check if email exists for ANY user (not just current user)
      const { data: existingAccount, error: checkError } = await supabase
        .from('email_accounts')
        .select('user_id, email_address, is_active')
        .eq('email_address', userData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine
        console.error('Error checking existing account:', checkError);
        return {
          success: false,
          error: `Database error: ${checkError.message}`
        };
      }

      if (existingAccount) {
        // Email exists in database
        if (existingAccount.user_id === user?.id) {
          // Same user - update the token
          const { error } = await supabase
            .from('email_accounts')
            .update({
              access_token: (credential as any).access_token,
              is_active: true
            })
            .eq('email_address', userData.email)
            .eq('user_id', user?.id);

          if (error) {
            console.error('Database error updating account:', error);
            return {
              success: false,
              error: `Failed to update account: ${error.message}`
            };
          }
        } else {
          // Different user - this email is already connected to another account
          return {
            success: false,
            error: `This Gmail account (${userData.email}) is already connected to another user. Please use a different Gmail account or contact support.`
          };
        }
      } else {
        // Email doesn't exist - insert new account
        const { error } = await supabase
          .from('email_accounts')
          .insert({
            user_id: user?.id,
            email_address: userData.email,
            provider: 'gmail',
            access_token: (credential as any).access_token,
            is_active: true
          });

        if (error) {
          console.error('Database error inserting account:', error);
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
      
      // Handle cancellation gracefully
      if (error.message === 'Connection cancelled' || error.message === 'Connection cancelled or timed out') {
        return {
          success: false,
          error: ''
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to connect Gmail'
      };
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGmail = async (email: string): Promise<GmailAuthResult> => {
    try {
      const { error } = await supabase
        .from('email_accounts')
        .update({ is_active: false })
        .eq('email_address', email)
        .eq('user_id', user?.id);

      if (error) {
        return {
          success: false,
          error: `Failed to disconnect: ${error.message}`
        };
      }

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

declare global {
  interface Window {
    google: any;
  }
}
