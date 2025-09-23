import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLoadMatching, LoadMatch } from './useLoadMatching';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mail, Filter } from 'lucide-react';
import { useEmailConnection } from './useEmailConnection';

export interface EmailMessage {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  body: string;
  receivedAt: string;
  loadNumber?: string;
  threadId: string;
  loadMatch?: LoadMatch;
}

export interface EmailConversation {
  threadId: string;
  subject: string;
  participants: string[];
  lastMessage: EmailMessage;
  messageCount: number;
  loadNumber?: string;
  loadMatch?: LoadMatch;
  emails: EmailMessage[];
  lastTime: Date;
}

// Helper function to clean email body and extract only new content
const cleanEmailBody = (body: string): string => {
  if (!body) return '';
  
  let cleanBody = body;
  
  // Remove HTML tags
  cleanBody = cleanBody.replace(/<[^>]*>/g, '');
  
  // Remove URLs
  cleanBody = cleanBody.replace(/https?:\/\/[^\s]+/g, '');
  
  // Remove image placeholders
  cleanBody = cleanBody.replace(/\[image\]|\[img\]|\[picture\]/gi, '');
  
  // Split into lines for better processing
  const lines = cleanBody.split('\n');
  const newContentLines: string[] = [];
  let foundQuoteStart = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for common quote patterns
    if (isQuoteLine(line)) {
      foundQuoteStart = true;
      continue;
    }
    
    // If we found a quote, skip the rest
    if (foundQuoteStart) {
      continue;
    }
    
    // Add non-empty lines
    if (line) {
      newContentLines.push(line);
    }
  }
  
  // If no new content was found, return the original cleaned body (fallback)
  const result = newContentLines.length > 0 
    ? newContentLines.join(' ').trim()
    : cleanBody.trim();
    
  return result || '';
};

// Helper function to detect quote lines
const isQuoteLine = (line: string): boolean => {
  const quotePatterns = [
    /^On .* wrote:$/,
    /^From:.*$/,
    /^Sent:.*$/,
    /^To:.*$/,
    /^Subject:.*$/,
    /^Date:.*$/,
    /^-----Original Message-----/,
    /^From:.*<.*>$/,
    /^Sent:.*<.*>$/,
    /^To:.*<.*>$/,
    /^On .* at .* <.*> wrote:$/,
    /^On .* PM .* wrote:$/,
    /^On .* AM .* wrote:$/,
    /^.*<.*> wrote:$/,
  ];
  
  return quotePatterns.some(pattern => pattern.test(line));
};

// Helper function to extract load number from text
const extractLoadNumber = (text: string): string | undefined => {
  const loadNumberPatterns = [
    /\b(LN\d{4,})\b/gi, // Specific pattern for LN followed by digits
    /\b([A-Z]{2,3}\d{4,})\b/gi, // General pattern like LN0012345
    /load\s*#?\s*(LN\d{4,})/gi,
    /ln\s*#?\s*(LN\d{4,})/gi,
    /shipment\s*#?\s*(LN\d{4,})/gi,
    /quote\s*#?\s*(LN\d{4,})/gi,
    /order\s*#?\s*(LN\d{4,})/gi,
    /pro\s*#?\s*(LN\d{4,})/gi,
    /bol\s*#?\s*(LN\d{4,})/gi,
  ];
  
  for (const pattern of loadNumberPatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }
  
  return undefined;
};

export const useGmailEmails = () => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [conversations, setConversations] = useState<EmailConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTimeframe, setEmailTimeframe] = useState<30 | 60 | 90>(30);

  const { loads, getBestMatch } = useLoadMatching();
  const { checkEmailConnection } = useEmailConnection();

  const fetchEmails = async (days: number = 30) => {
    setLoading(true);
    setError(null);

    try {
      // Get the connected email account with refresh token
      const { data: emailAccount, error: accountError } = await supabase
        .from('email_accounts')
        .select('access_token, refresh_token, email_address')
        .eq('is_active', true)
        .eq('provider', 'gmail')
        .single();

      if (accountError || !emailAccount) {
        throw new Error('No connected Gmail account found');
      }

      // Fetch recent email threads
      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads?q=in:inbox newer_than:${days}d&maxResults=50`, {
        headers: {
          'Authorization': `Bearer ${emailAccount.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is expired/invalid, mark as inactive
          await supabase
            .from('email_accounts')
            .update({ is_active: false })
            .eq('email_address', emailAccount.email_address);
          
          // Re-check the connection status to update the UI
          await checkEmailConnection();
          
          throw new Error('Your Gmail connection has expired. Please reconnect your email account.');
        }
        throw new Error(`Gmail API error: ${response.status}`);
      }

      const threadsData = await response.json();

      if (!threadsData.threads || threadsData.threads.length === 0) {
        setConversations([]);
        setEmails([]);
        return;
      }

      // Process threads (limit to first 20 for faster processing)
      const threadsToProcess = threadsData.threads.slice(0, 20);
      const allEmails: EmailMessage[] = [];
      
      for (const thread of threadsToProcess) {
        try {
          // Fetch full thread details
          const threadResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${thread.id}`, {
            headers: {
              'Authorization': `Bearer ${emailAccount.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!threadResponse.ok) continue;

          const threadData = await threadResponse.json();
          
          if (!threadData.messages || threadData.messages.length === 0) continue;

          // Process messages in this thread
          const threadEmails = threadData.messages.map((message: any) => {
            const headers = message.payload.headers;
            const subjectHeader = headers.find((h: any) => h.name === 'Subject');
            const fromHeader = headers.find((h: any) => h.name === 'From');
            const toHeader = headers.find((h: any) => h.name === 'To');
            const dateHeader = headers.find((h: any) => h.name === 'Date');

            const subject = subjectHeader?.value || 'No Subject';
            const sender = fromHeader?.value || 'Unknown Sender';
            const recipient = toHeader?.value || '';
            const receivedAt = dateHeader?.value ? new Date(dateHeader.value).toISOString() : new Date().toISOString();

            // Extract email body
            let body = '';
            if (message.payload.body?.data) {
              body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } else if (message.payload.parts) {
              const textPart = message.payload.parts.find((part: any) => 
                part.mimeType === 'text/plain' || part.mimeType === 'text/html'
              );
              if (textPart?.body?.data) {
                body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              }
            }

            const cleanBody = cleanEmailBody(body);
            
            // Process with load matching
            const emailContent = `${subject} ${cleanBody}`;
            const loadMatch = loads.length > 0 ? getBestMatch(emailContent, subject) : null;
            const loadNumber = loadMatch?.load?.load_number || extractLoadNumber(`${subject} ${cleanBody}`);

            return {
              id: message.id,
              threadId: thread.id,
              subject,
              sender,
              recipient,
              body: cleanBody,
              receivedAt,
              loadNumber,
              loadMatch
            } as EmailMessage;
          });

          allEmails.push(...threadEmails);
        } catch (error) {
          console.warn(`Failed to process thread ${thread.id}:`, error);
          continue;
        }
      }

      // Group emails into conversations
      const conversationMap = new Map<string, EmailConversation>();
      
      allEmails.forEach(email => {
        if (!conversationMap.has(email.threadId)) {
          conversationMap.set(email.threadId, {
            threadId: email.threadId,
            subject: email.subject,
            participants: [email.sender, email.recipient],
            lastMessage: email,
            messageCount: 1,
            lastTime: new Date(email.receivedAt),
            loadNumber: email.loadNumber,
            loadMatch: email.loadMatch,
            emails: [email]
          });
        } else {
          const conversation = conversationMap.get(email.threadId)!;
          if (!conversation.participants.includes(email.sender)) {
            conversation.participants.push(email.sender);
          }
          if (!conversation.participants.includes(email.recipient)) {
            conversation.participants.push(email.recipient);
          }
          conversation.messageCount++;
          const emailTime = new Date(email.receivedAt);
          if (emailTime > conversation.lastTime) {
            conversation.lastTime = emailTime;
            conversation.lastMessage = email;
          }
          conversation.emails.push(email);
        }
      });

      // Convert to array and sort by last message time
      const conversationList = Array.from(conversationMap.values())
        .sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime());

      setEmails(allEmails);
      setConversations(conversationList);

    } catch (error: any) {
      console.error('❌ Error fetching emails:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendEmailReply = async (threadId: string, replyText: string) => {
    try {
      const { data: emailAccount, error: accountError } = await supabase
        .from('email_accounts')
        .select('access_token, email_address')
        .eq('is_active', true)
        .eq('provider', 'gmail')
        .single();

      if (accountError || !emailAccount) {
        throw new Error('No connected Gmail account found');
      }

      // Get the original thread to reply to
      const threadResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${emailAccount.access_token}`,
        },
      });

      if (!threadResponse.ok) {
        throw new Error('Failed to get thread details');
      }

      const threadData = await threadResponse.json();
      const originalMessage = threadData.messages[0];
      const headers = originalMessage.payload.headers;
      
      const subjectHeader = headers.find((h: any) => h.name === 'Subject');
      const toHeader = headers.find((h: any) => h.name === 'From');
      
      const subject = subjectHeader?.value || 'Re: No Subject';
      const to = toHeader?.value || '';

      // Create the reply message
      const message = [
        `To: ${to}`,
        `Subject: ${subject.startsWith('Re:') ? subject : `Re: ${subject}`}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        replyText
      ].join('\n');

      const encodedMessage = btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      // Send the reply
      const sendResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailAccount.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
          threadId: threadId
        }),
      });

      if (!sendResponse.ok) {
        throw new Error('Failed to send reply');
      }

      return true;
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  };

  return {
    emails,
    conversations,
    loading,
    error,
    refetch: fetchEmails,
    sendEmailReply
  };
};
