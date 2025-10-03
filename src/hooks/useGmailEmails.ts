import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useLoadMatching, LoadMatch } from './useLoadMatching';
import { useUser } from '@/contexts/UserContext';

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
  syncStatus?: 'synced' | 'pending' | 'failed';
  createdByUser?: boolean;
  gmailMessageId?: string;
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

// Optimized helper functions
const cleanEmailBody = (body: string): string => {
  if (!body) return '';
  
  const textOnly = body.replace(/<[^>]*>/g, '');
  const lines = textOnly.split('\n');
  
  return lines
    .map(line => line.trim())
    .filter(line => 
      line && 
      !line.startsWith('>') && 
      !line.startsWith('On ') &&
      !line.startsWith('From:') &&
      !line.startsWith('Sent:') &&
      !line.startsWith('To:') &&
      !line.startsWith('Subject:') &&
      !line.includes('-----Original Message-----') &&
      !line.includes('________________________________') &&
      !line.includes('This email was sent from') &&
      !line.includes('Please do not reply to this email')
    )
    .join(' ')
    .trim();
};

const extractLoadNumber = (content: string, loads: any[]): { loadNumber?: string; match?: LoadMatch } => {
  if (!content || !loads.length) return {};
  
  const cleanContent = content.toLowerCase();
  
  for (const load of loads) {
    const loadNumber = load.load_number?.toLowerCase().trim();
    if (!loadNumber) continue;
    
    // Check for exact match first (most common)
    if (cleanContent.includes(loadNumber)) {
      return {
        loadNumber: load.load_number,
        match: {
          loadId: load.id,
          confidence: 1.0,
          matchType: 'exact',
          matchedFields: ['subject', 'body'],
          load: load
        }
      };
    }
    
    // Check for partial match (no spaces)
    const loadNumberNoSpaces = loadNumber.replace(/\s+/g, '');
    if (cleanContent.includes(loadNumberNoSpaces)) {
      return {
        loadNumber: load.load_number,
        match: {
          loadId: load.id,
          confidence: 0.9,
          matchType: 'partial',
          matchedFields: ['subject', 'body'],
          load: load
        }
      };
    }
  }
  
  return {};
};

export const useGmailEmails = () => {
  const { user } = useUser();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [conversations, setConversations] = useState<EmailConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTimeframe, setEmailTimeframe] = useState(30);

  // Memoized conversation grouping
  const groupIntoConversations = useCallback((emails: EmailMessage[]): EmailConversation[] => {
    const conversationMap = new Map<string, EmailConversation>();

    emails.forEach(email => {
      if (!email.threadId) return;

      if (!conversationMap.has(email.threadId)) {
        conversationMap.set(email.threadId, {
          threadId: email.threadId,
          subject: email.subject,
          participants: [email.sender, email.recipient].filter(Boolean),
          emails: [email],
          lastMessage: email,
          messageCount: 1,
          lastTime: new Date(email.receivedAt),
          loadNumber: email.loadNumber || null,
          loadMatch: email.loadMatch
        });
      } else {
        const conversation = conversationMap.get(email.threadId)!;
        conversation.emails.push(email);
        conversation.messageCount++;
        
        // Update participants efficiently
        if (!conversation.participants.includes(email.sender)) {
          conversation.participants.push(email.sender);
        }
        if (!conversation.participants.includes(email.recipient)) {
          conversation.participants.push(email.recipient);
        }
        
        // Update last message and time
        const emailDate = new Date(email.receivedAt);
        if (emailDate > conversation.lastTime) {
          conversation.lastMessage = email;
          conversation.lastTime = emailDate;
        }
        
        // Update load number if needed
        if (email.loadNumber && !conversation.loadNumber) {
          conversation.loadNumber = email.loadNumber;
          conversation.loadMatch = email.loadMatch;
        }
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => 
      b.lastTime.getTime() - a.lastTime.getTime()
    );
  }, []);

  // Optimized cache loading
  const loadFromCache = useCallback(async (days: number = emailTimeframe) => {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const { data: cachedEmails, error } = await supabase
      .from('email_cache')
      .select('*')
      .eq('user_id', user?.id)
      .gte('received_at', cutoffDate.toISOString())
      .order('received_at', { ascending: false });

    if (error) {
      console.error('❌ Error loading from cache:', error);
      return;
    }

    const emails: EmailMessage[] = (cachedEmails || []).map(cacheEmail => ({
      id: cacheEmail.message_id,
      threadId: cacheEmail.thread_id,
      subject: cacheEmail.subject,
      sender: cacheEmail.sender,
      recipient: cacheEmail.recipient,
      body: cacheEmail.body,
      receivedAt: cacheEmail.received_at,
      loadNumber: cacheEmail.load_number || null,
      loadMatch: cacheEmail.load_match,
      syncStatus: cacheEmail.sync_status,
      createdByUser: cacheEmail.created_by_user,
      gmailMessageId: cacheEmail.gmail_message_id
    }));

    setEmails(emails);
    setConversations(groupIntoConversations(emails));
  }, [user?.id, emailTimeframe, groupIntoConversations]);

  // Cache validation and fixing
  const validateAndFixCache = useCallback(async () => {
    const { data: cachedEmails, error } = await supabase
      .from('email_cache')
      .select('*')
      .eq('user_id', user?.id)
      .is('load_number', null);

    if (error || !cachedEmails?.length) return;

    const { data: currentLoads } = await supabase
      .from('loads')
      .select('id, load_number')
      .eq('user_id', user?.id);

    if (!currentLoads) return;

    // Batch process emails
    const updates = [];
    const deletions = [];

    for (const email of cachedEmails) {
      const extractedLoad = extractLoadNumber(email.body + ' ' + email.subject, currentLoads);
      
      if (extractedLoad.loadNumber) {
        updates.push({
          message_id: email.message_id,
          load_number: extractedLoad.loadNumber,
          load_match: extractedLoad.match
        });
      } else {
        const isSystemEmail = email.subject?.toLowerCase().includes('twilio') || 
                             email.subject?.toLowerCase().includes('verification') ||
                             email.sender?.includes('noreply') ||
                             email.sender?.includes('no-reply');
        
        if (!isSystemEmail) {
          deletions.push(email.message_id);
        }
      }
    }

    // Batch update
    if (updates.length > 0) {
      for (const update of updates) {
        await supabase
          .from('email_cache')
          .update({ 
            load_number: update.load_number,
            load_match: update.load_match
          })
          .eq('message_id', update.message_id)
          .eq('user_id', user?.id);
      }
    }

    // Batch delete
    if (deletions.length > 0) {
      await supabase
        .from('email_cache')
        .delete()
        .in('message_id', deletions)
        .eq('user_id', user?.id);
    }
  }, [user?.id]);

  // Optimized email processing
  const processGmailMessage = useCallback(async (message: any, currentLoads: any[]): Promise<EmailMessage | null> => {
    try {
      const headers = message.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const sender = headers.find((h: any) => h.name === 'From')?.value || '';
      const recipient = headers.find((h: any) => h.name === 'To')?.value || '';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';

      // Extract body efficiently
      let body = '';
      if (message.payload?.body?.data) {
        body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (message.payload?.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            break;
          }
        }
      }

      const cleanBody = cleanEmailBody(body);
      const loadMatch = extractLoadNumber(cleanBody + ' ' + subject, currentLoads);
      
      if (!loadMatch.loadNumber) return null;

      return {
        id: message.id,
        threadId: message.threadId,
        subject,
        sender,
        recipient,
        body,
        receivedAt: new Date(date).toISOString(),
        loadNumber: loadMatch.loadNumber,
        loadMatch: loadMatch.match,
        syncStatus: 'synced',
        createdByUser: false,
        gmailMessageId: message.id
      };
    } catch (error) {
      console.error('❌ Error processing Gmail message:', error);
      return null;
    }
  }, []);

  // Optimistic email sending
  const sendEmailReplyOptimistic = useCallback(async (threadId: string, replyText: string) => {
    try {
      const conversation = conversations.find(c => c.threadId === threadId);
      if (!conversation) throw new Error('Conversation not found');

      const now = new Date();
      const optimisticEmail: EmailMessage = {
        id: `temp_${Date.now()}`,
        threadId,
        subject: conversation.subject.startsWith('Re:') ? conversation.subject : `Re: ${conversation.subject}`,
        sender: user?.email || 'unknown@example.com',
        recipient: conversation.participants.find(p => p !== user?.email) || 'unknown@example.com',
        body: replyText,
        receivedAt: now.toISOString(),
        loadNumber: conversation.loadNumber,
        loadMatch: conversation.loadMatch,
        syncStatus: 'pending',
        createdByUser: true,
        gmailMessageId: null
      };

      // Store in cache and operations in parallel
      const [cacheResult, operationResult] = await Promise.allSettled([
        supabase.from('email_cache').insert({
          user_id: user?.id,
          message_id: optimisticEmail.id,
          thread_id: threadId,
          subject: optimisticEmail.subject,
          sender: optimisticEmail.sender,
          recipient: optimisticEmail.recipient,
          body: optimisticEmail.body,
          received_at: optimisticEmail.receivedAt,
          load_number: optimisticEmail.loadNumber,
          load_match: optimisticEmail.loadMatch,
          sync_status: 'pending',
          created_by_user: true,
          gmail_message_id: null
        }),
        supabase.from('email_operations').insert({
          user_id: user?.id,
          operation_type: 'send',
          email_data: { threadId, replyText, optimisticEmail },
          status: 'pending'
        })
      ]);

      if (cacheResult.status === 'rejected') {
        throw cacheResult.reason;
      }

      // Update UI immediately
      const updatedEmails = [...emails, optimisticEmail];
      setEmails(updatedEmails);
      setConversations(groupIntoConversations(updatedEmails));
      
      return optimisticEmail;
    } catch (error: any) {
      console.error('❌ Error in optimistic email send:', error);
      throw error;
    }
  }, [conversations, emails, user?.id, user?.email, groupIntoConversations]);

  // Background sync for pending operations
  const syncPendingOperations = useCallback(async () => {
    try {
      const { data: pendingOps, error } = await supabase
        .from('email_operations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error || !pendingOps?.length) return;

      const { data: emailAccount, error: accountError } = await supabase
        .from('email_accounts')
        .select('access_token, refresh_token, email_address')
        .eq('is_active', true)
        .eq('provider', 'gmail')
        .eq('user_id', user?.id)
        .single();

      if (accountError || !emailAccount) return;

      // Process each pending operation
      for (const operation of pendingOps) {
        try {
          if (operation.operation_type === 'send') {
            await syncSendOperation(operation, emailAccount);
          }
        } catch (error) {
          console.error(`❌ Error syncing operation ${operation.id}:`, error);
          
          await supabase
            .from('email_operations')
            .update({ 
              retry_count: (operation.retry_count || 0) + 1,
              status: (operation.retry_count || 0) >= 3 ? 'failed' : 'pending'
            })
            .eq('id', operation.id);
        }
      }
    } catch (error) {
      console.error('❌ Error in background sync:', error);
    }
  }, [user?.id]);

  // Sync send operation to Gmail
  const syncSendOperation = useCallback(async (operation: any, emailAccount: any) => {
    const { email_data } = operation;
    const { threadId, replyText } = email_data;

    const message = [
      `To: ${email_data.optimisticEmail.recipient}`,
      `Subject: ${email_data.optimisticEmail.subject}`,
      '',
      replyText
    ].join('\n');

    const encodedMessage = btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const sendResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailAccount.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
        threadId: threadId
      })
    });

    if (!sendResponse.ok) {
      throw new Error(`Gmail API error: ${sendResponse.status}`);
    }

    const result = await sendResponse.json();
    const gmailMessageId = result.id;

    // Update cache with Gmail message ID
    await supabase
      .from('email_cache')
      .update({
        gmail_message_id: gmailMessageId,
        sync_status: 'synced'
      })
      .eq('message_id', email_data.optimisticEmail.id);

    // Mark operation as completed
    await supabase
      .from('email_operations')
      .update({ status: 'sent' })
      .eq('id', operation.id);
  }, []);

  // Add full email sync from Gmail
  const performFullSync = useCallback(async (days: number = emailTimeframe) => {
    try {
      const { data: emailAccount, error: accountError } = await supabase
        .from('email_accounts')
        .select('access_token, refresh_token, email_address')
        .eq('is_active', true)
        .eq('provider', 'gmail')
        .eq('user_id', user?.id)
        .single();

      if (accountError || !emailAccount) {
        throw new Error('No connected Gmail account found');
      }

      // Get current loads for matching
      const { data: currentLoads } = await supabase
        .from('loads')
        .select('id, load_number')
        .eq('user_id', user?.id);

      if (!currentLoads?.length) return;

      // Search for emails containing load numbers
      const loadNumbers = currentLoads.map(load => load.load_number).filter(Boolean);
      const searchQueries = loadNumbers.map(loadNumber => 
        `"${loadNumber}" newer_than:${days}d`
      );

      const allMessages = [];
      for (const query of searchQueries) {
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`,
          {
            headers: {
              'Authorization': `Bearer ${emailAccount.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.messages) {
            allMessages.push(...data.messages);
          }
        }
      }

      // Get unique thread IDs
      const uniqueThreadIds = [...new Set(allMessages.map(msg => msg.threadId))];

      // Fetch full threads
      const processedEmails = [];
      for (const threadId of uniqueThreadIds) {
        try {
          const threadResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
            {
              headers: {
                'Authorization': `Bearer ${emailAccount.access_token}`,
              },
            }
          );

          if (threadResponse.ok) {
            const threadData = await threadResponse.json();
            for (const message of threadData.messages || []) {
              const processedEmail = await processGmailMessage(message, currentLoads);
              if (processedEmail) {
                processedEmails.push(processedEmail);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching thread ${threadId}:`, error);
        }
      }

      // Clear existing cache for this user
      await supabase
        .from('email_cache')
        .delete()
        .eq('user_id', user?.id);

      // Insert new emails into cache
      if (processedEmails.length > 0) {
        const cacheInserts = processedEmails.map(email => ({
          user_id: user?.id,
          message_id: email.id,
          thread_id: email.threadId,
          subject: email.subject,
          sender: email.sender,
          recipient: email.recipient,
          body: email.body,
          received_at: email.receivedAt,
          load_number: email.loadNumber,
          load_match: email.loadMatch,
          sync_status: 'synced',
          created_by_user: false,
          gmail_message_id: email.gmailMessageId
        }));

        await supabase
          .from('email_cache')
          .insert(cacheInserts);
      }

      // Reload from cache
      await loadFromCache(days);

    } catch (error) {
      console.error('❌ Error in full sync:', error);
      throw error;
    }
  }, [user?.id, emailTimeframe, processGmailMessage, loadFromCache]);

  // Update main fetch function
  const fetchEmails = useCallback(async (days: number = emailTimeframe) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // First try to load from cache
      await loadFromCache(days);
      
      // If no emails in cache or cache is empty, perform full sync
      if (emails.length === 0) {
        await performFullSync(days);
      }
      
      await syncPendingOperations();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, emailTimeframe, loadFromCache, performFullSync, syncPendingOperations, emails.length]);

  // Memoized return object
  return useMemo(() => ({
    emails,
    conversations,
    loading,
    error,
    emailTimeframe,
    setEmailTimeframe,
    fetchEmails,
    sendEmailReply: sendEmailReplyOptimistic,
    refetch: fetchEmails
  }), [emails, conversations, loading, error, emailTimeframe, fetchEmails, sendEmailReplyOptimistic]);
};