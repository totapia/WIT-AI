import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useState, useEffect, createElement, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  User,
  Bot,
  Clock,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Target,
  Brain,
  Zap,
  FileText,
  Settings,
  LogOut,
  Bell,
  Search,
  Send,
  ChevronDown,
  MapPin,
  Mail,
  Building
} from "lucide-react";
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { useTwilioCalls } from '@/hooks/useTwilioCalls';
import { useTwilioVoice } from '@/hooks/useTwilioVoice';

const CallDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const [displayedTranscript, setDisplayedTranscript] = useState<Array<{speaker: string, name: string, time: string, message: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiChatInput, setAiChatInput] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastReadMessageCountRef = useRef(0);

  // NEW: Add database state
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [qaRecords, setQARecords] = useState<any[]>([]);
  const [callTranscripts, setCallTranscripts] = useState<any[]>([]);
  const [customPhoneNumber, setCustomPhoneNumber] = useState('');

  // Call state
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<string>('idle');
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);

  // Add this hook to get real-time call data
  const { calls, refreshCalls } = useTwilioCalls();
  
  // Add Twilio Voice SDK
  const {
    call,
    isConnected,
    isMuted: voiceMuted,
    isOnHold,
    initializeDevice,
    makeCall: makeVoiceCall,
    muteCall,
    holdCall,
    hangupCall
  } = useTwilioVoice();

  // Enhanced debugging - CLEAN VERSION (reduced noise)
  const logUIEvent = (event: string, details?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`��️ [${timestamp}] ${event}`, details ? details : '');
  };

  const logUIState = (state: string, value: any) => {
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] ${state} =`, value);
  };

  // Fetch clients and Q&A data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch clients
        const { data: clientsData } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id);
        
        if (clientsData) {
          setClients(clientsData);
        }
        
        // Fetch Q&A records
        const { data: qaData } = await supabase
          .from('qa_knowledge_base')
          .select('*')
          .eq('created_by', user.id);
        
        if (qaData) {
          setQARecords(qaData);
        }

        // Fetch transcripts for current call
        if (currentCall?.call_sid) {
          const { data: transcriptData } = await supabase
            .from('call_transcripts')
            .select('*')
            .eq('call_sid', currentCall.call_sid)
            .order('created_at', { ascending: true });
          
          if (transcriptData) {
            setCallTranscripts(transcriptData);
            // Convert to display format
            const formattedTranscripts = transcriptData.map(t => ({
              speaker: t.speaker || 'customer',
              name: t.speaker === 'agent' ? 'You' : t.speaker === 'ai' ? 'AI Assistant' : 'Customer',
              time: new Date(t.timestamp || t.created_at).toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              message: t.transcript_text || t.message || ''
            }));
            setDisplayedTranscript(formattedTranscripts);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    
    // Refresh transcripts every 5 seconds during active call
    const interval = setInterval(() => {
      if (currentCall?.call_sid) {
        fetchData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, currentCall?.call_sid]);

  // Replace the existing timer useEffect with this enhanced version
  useEffect(() => {
    const interval = setInterval(() => {
      if (callStartTime && callStatus === 'in-progress') {
        setCallDuration(prev => prev + 1);
      }
      }, 1000);

    return () => clearInterval(interval);
  }, [callStartTime, callStatus]);

  // Add this useEffect to monitor for new calls
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCalls();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [refreshCalls]);

  // Add this useEffect to update current call status
  useEffect(() => {
    if (calls && calls.length > 0) {
      const latestCall = calls[0];
      
      // Only update call status from database if we don't have an active voice call
      // This prevents database status from overriding local voice call status
      if (!call) {
        setCurrentCall(latestCall);
        setCallStatus(latestCall.status || 'idle');
        
        if (latestCall.status === 'in-progress' && !callStartTime) {
          setCallStartTime(new Date());
        }
      } else {
        // We have an active voice call, only update currentCall but not callStatus
        setCurrentCall(latestCall);
      }
    }
  }, [calls, callStartTime, call]); // Add call to dependencies

  // Simulate progressive conversation
  useEffect(() => {
    if (!isCallActive) return;
    
    let messageIndex = 0;
    const addNextMessage = () => {
      if (messageIndex < transcript.length) {
        // Show typing indicator
        setIsTyping(true);
        
        setTimeout(() => {
          setDisplayedTranscript(prev => [...prev, transcript[messageIndex]]);
          setIsTyping(false);
          messageIndex++;
          
          // Schedule next message
          if (messageIndex < transcript.length) {
            setTimeout(addNextMessage, Math.random() * 3000 + 2000); // 2-5 seconds between messages
          }
        }, Math.random() * 2000 + 1000); // 1-3 seconds typing time
      }
    };

    // Start the conversation after a short delay
    const timer = setTimeout(addNextMessage, 1000);
    
    return () => clearTimeout(timer);
  }, [isCallActive]);

  // Reset call state when call object is cleared
  useEffect(() => {
    // Only log if we have meaningful state (not just initial load)
    if (call || callStatus !== 'idle') {
      logUIEvent('CALL_RESET_USEEFFECT_TRIGGERED', { 
        hasCall: !!call,
        callStatus,
        callSid: (call as any)?.sid || 'unknown'
      });
    }

    if (!call && (callStatus === 'in-progress' || callStatus === 'ringing')) {
      // Call object was cleared (disconnected), reset UI after a delay
      logUIEvent('CALL_RESET_SCHEDULED', { delay: 500 });
      
      const timer = setTimeout(() => {
        logUIEvent('CALL_RESET_EXECUTED');
        logUIState('callStatus', 'idle');
        logUIState('callStartTime', null);
        logUIState('callDuration', 0);
        logUIState('currentCall', null);
        
        setCallStatus('idle');
        setCallStartTime(null);
        setCallDuration(0);
        setCurrentCall(null);
      }, 500);
      
      return () => {
        logUIEvent('CALL_RESET_TIMER_CLEARED');
        clearTimeout(timer);
      };
    }
  }, [call, callStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // REPLACE: Mock transcript to show AI recommendations instead
  const transcript = [
    { speaker: "ai", name: "AI Assistant", time: "14:32", message: "💡 Great opportunity! Ask about their current pain points with existing providers." },
    { speaker: "ai", name: "AI Assistant", time: "14:34", message: "🎯 Perfect! Highlight our real-time tracking and transparent pricing model." },
    { speaker: "ai", name: "AI Assistant", time: "14:36", message: "📊 Consider asking about their budget range for logistics solutions." },
    { speaker: "ai", name: "AI Assistant", time: "14:38", message: "🤝 Suggest scheduling a demo to show our capabilities in action." },
  ];

  // REPLACE: Mock questions with real data (when available)  
  const questions = qaRecords.length > 0 ? qaRecords.map(qa => ({
    question: qa.question,
    answer: qa.answer,
    confidence: qa.confidence_score,
    suggested: true
  })) : [
    {
      question: "What's your average shipping cost per container?",
      answer: "Based on similar companies, typical costs range from $2,500-$4,000 per container depending on routes and requirements.",
      confidence: 95,
      suggested: true
    },
    {
      question: "Do you handle hazardous materials?",
      answer: "Yes, we're fully certified for hazmat shipping with specialized tracking and safety protocols.",
      confidence: 100,
      suggested: false
    },
    {
      question: "What's your typical delivery timeframe?",
      answer: "Standard domestic delivery is 3-5 business days, with expedited options available for urgent shipments.",
      confidence: 98,
      suggested: true
    }
  ];





  const handleSendAiMessage = async () => {
    if (aiChatInput.trim()) {
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Add the agent's message to the transcript
      const newMessage = {
        speaker: "agent",
        name: "You",
        time: currentTime,
        message: aiChatInput.trim()
      };
      
      setDisplayedTranscript(prev => [...prev, newMessage]);
      
      // Save to database
      if (currentCall?.id) {
        try {
          await supabase
            .from('call_transcripts')
            .insert({
              call_id: currentCall.id,
              speaker: 'agent',
              message: aiChatInput.trim(),
              timestamp: new Date().toISOString()
            });
        } catch (error) {
          console.error('Error saving message:', error);
        }
      }
      
      // Simulate AI response after a delay
      setTimeout(async () => {
        const aiResponse = {
          speaker: "ai",
          name: "AI Assistant",
          time: currentTime,
          message: "Thanks for your message! I'm analyzing the conversation and will provide insights based on what we've discussed so far."
        };
        setDisplayedTranscript(prev => [...prev, aiResponse]);
        
        // Save AI response to database
        if (currentCall?.id) {
          try {
            await supabase
              .from('call_transcripts')
              .insert({
                call_id: currentCall.id,
                speaker: 'ai',
                message: aiResponse.message,
                timestamp: new Date().toISOString()
              });
          } catch (error) {
            console.error('Error saving AI response:', error);
          }
        }
      }, 1000);
      
      setAiChatInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendAiMessage();
    }
  };

  const handleQuickCall = async () => {
    if (isInitiatingCall) return; // Prevent duplicate calls
    
    try {
      setIsInitiatingCall(true); // Set loading state
      
      // Get access token
      const tokenResponse = await fetch('http://localhost:3001/api/twilio/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get access token');
      }
      
      const { accessToken } = await tokenResponse.json();
      await initializeDevice(accessToken);
      
      // Set call status BEFORE making the call
      setCallStatus('ringing');
      setCurrentCall({ phoneNumber: customPhoneNumber });
      
      const call = await makeVoiceCall(customPhoneNumber);
      logUIEvent('VOICE_CALL_CREATED', { callSid: (call as any)?.sid || 'unknown' });
      setCustomPhoneNumber('');
      
      // Update status when call is accepted
      call?.on('accept', () => {
        logUIEvent('CALL_ACCEPTED_UI', { callSid: (call as any)?.sid || 'unknown' });
        logUIState('callStatus', 'in-progress');
        logUIState('callStartTime', new Date());
        setCallStatus('in-progress');
        setCallStartTime(new Date());
      });

      // Update status when call disconnects
      call?.on('disconnect', (reason: any) => {
        logUIEvent('CALL_DISCONNECTED_UI', { 
          callSid: (call as any)?.sid || 'unknown',
          reason: reason 
        });
        // Don't immediately reset callStatus - let the useEffect handle it with delay
        setCallStartTime(null);
        setCallDuration(0);
        setCurrentCall(null);
      });
      
    } catch (error) {
      console.error('Error making call:', error);
      // Reset state on error
      setCallStatus('idle');
      setCurrentCall(null);
    } finally {
      setIsInitiatingCall(false); // Reset loading state
    }
  };

  // Scroll management functions
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        setIsAtBottom(true);
        setShowScrollButton(false);
        setUnreadCount(0);
        lastReadMessageCountRef.current = displayedTranscript.length;
      }
    }
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
        
        setIsAtBottom(isAtBottom);
        setShowScrollButton(!isAtBottom);

        // Reset unread count when user scrolls to bottom
        if (isAtBottom) {
          setUnreadCount(0);
          lastReadMessageCountRef.current = displayedTranscript.length;
        }

        // Clear existing timeout
        if (autoScrollTimeoutRef.current) {
          clearTimeout(autoScrollTimeoutRef.current);
        }

        // Set new timeout to auto-scroll after 5 seconds of no scrolling
        if (!isAtBottom) {
          autoScrollTimeoutRef.current = setTimeout(() => {
            scrollToBottom();
          }, 5000);
        }
      }
    }
  };

  // Track unread messages when new messages arrive
  useEffect(() => {
    if (displayedTranscript.length > lastReadMessageCountRef.current) {
      if (!isAtBottom) {
        const newUnreadCount = displayedTranscript.length - lastReadMessageCountRef.current;
        setUnreadCount(newUnreadCount);
      } else {
        lastReadMessageCountRef.current = displayedTranscript.length;
      }
    }
  }, [displayedTranscript, isAtBottom]);

  // Auto-scroll to bottom when new messages arrive and attach scroll listener
  useEffect(() => {
    if (isAtBottom) {
      setTimeout(scrollToBottom, 100);
    }

    // Attach scroll listener to the ScrollArea's viewport
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => {
          scrollContainer.removeEventListener('scroll', handleScroll);
        };
      }
    }
  }, [displayedTranscript, isAtBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, []);

  // Add debugging to hangup button
  const handleHangup = () => {
    logUIEvent('HANGUP_BUTTON_CLICKED', { 
      hasCall: !!call,
      callSid: (call as any)?.sid || 'unknown',
      currentCallStatus: callStatus 
    });
    
    hangupCall();
    setCallStatus('idle');
    setCallStartTime(null);
    setCallDuration(0);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />
      <SidebarInset className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-1 text-sm"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Dashboard</span>
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <h1 className="text-lg font-semibold">Live Call</h1>
            </div>

            <div className="flex items-center space-x-2">
              {/* Call Timer */}
              <div className="flex items-center gap-1.5 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  callStatus === 'in-progress' ? 'bg-green-500 animate-pulse' : 
                  callStatus === 'ringing' ? 'bg-yellow-500 animate-pulse' :
                  callStatus === 'initiated' ? 'bg-blue-500 animate-pulse' :
                  'bg-gray-400'
                }`} />
                <span className="font-mono text-xs">
                  {callStatus === 'in-progress' ? formatTime(callDuration) : 
                   callStatus === 'ringing' ? 'Ringing...' :
                   callStatus === 'initiated' ? 'Connecting...' :
                   callStatus === 'completed' ? 'Call Ended' :
                   '00:00'}
                </span>
              </div>

              {/* Add call info display */}
              {currentCall && (
                <div className="text-xs text-muted-foreground ml-2">
                  {currentCall.integration_config?.phoneNumber && (
                    <span>To: {currentCall.integration_config.phoneNumber}</span>
                  )}
                </div>
              )}

              {/* Call Controls */}
              <div className="flex items-center gap-1">
                {/* Add Make Call Link */}
                <Button variant="outline" size="sm" onClick={() => navigate('/make-call')} className="text-xs px-1.5 py-0.5 h-6">
                  <Phone className="w-2.5 h-2.5 mr-0.5" />
                  Make Call
                </Button>
                
                {/* Keep Volume button - hook it up to call functionality */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="w-6 h-6"
                  disabled={callStatus !== 'in-progress'}
                >
                  {isMuted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                </Button>

                {/* Show End Call button only when call is active */}
                {isCallActive && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsCallActive(false)} 
                    className="px-2 text-xs h-6"
                  >
                    <PhoneOff className="w-2.5 h-2.5 mr-0.5" />
                    End Call
                  </Button>
                )}
              </div>

              {/* Keep Bell button */}
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Bell className="w-3 h-3" />
              </Button>
              
              {/* Keep Settings button */}
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Settings className="w-3 h-3" />
              </Button>
              
              {/* Keep LogOut button */}
              <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="w-6 h-6">
                <LogOut className="w-2.5 h-2.5" />
              </Button>
              
              <Avatar className="w-6 h-6">
                <AvatarImage src="/avatars/user.jpg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Main Content */}
          <div className="min-h-screen bg-background animate-fade-in w-full">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 p-3 h-[calc(100vh-60px)]">
              {/* Left Column - Live Transcript */}
              <div className="col-span-1 lg:col-span-4">
              <Card className="border-0 shadow-lg h-[calc(100vh-80px)] flex flex-col">
                <CardHeader className="pb-1.5 px-3 py-2 flex-shrink-0">
                  <CardTitle className="flex items-center gap-1.5 text-xs">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    Live Transcript
                    {isCallActive && <Badge variant="default" className="ml-auto text-xs px-1.5 py-0">Live</Badge>}
                  </CardTitle>
                </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                <ScrollArea 
                  ref={scrollAreaRef} 
                  className="flex-1 px-3 pt-3 relative"
                >
                  <div className="space-y-2">
                    {displayedTranscript.map((message, index) => (
                      <div key={index} className={`flex gap-1.5 message-slide-in ${
                        message.speaker === 'agent' ? 'flex-row-reverse' : ''
                      }`} style={{animationDelay: `${0.1 * index}s`}}>
                        <Avatar className="w-5 h-5 flex-shrink-0">
                          <AvatarFallback className={`text-xs ${
                            message.speaker === 'agent' ? 'bg-primary text-primary-foreground' :
                            message.speaker === 'ai' ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground' :
                            'bg-muted'
                          }`}>
                            {message.speaker === 'agent' ? 'Y' :
                             message.speaker === 'ai' ? <Bot className="w-2.5 h-2.5" /> :
                             message.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 min-w-0 ${
                          message.speaker === 'agent' ? 'text-right' : ''
                        }`}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-medium truncate">{message.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{message.time}</span>
                          </div>
                          <div className={`p-1.5 rounded-lg text-xs hover-scale break-words ${
                            message.speaker === 'agent' ? 'bg-primary text-primary-foreground ml-4' :
                            message.speaker === 'ai' ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20' :
                            'bg-muted mr-4'
                          }`}>
                            {message.message}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex gap-1.5 message-slide-in">
                        <Avatar className="w-5 h-5 flex-shrink-0">
                          <AvatarFallback className="bg-muted text-xs">
                            ...
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-medium text-muted-foreground">Typing...</span>
                          </div>
                          <div className="p-1.5 rounded-lg text-xs bg-muted/50 mr-4">
                            <div className="flex gap-0.5">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Spacer for chat input */}
                  <div className="h-4"></div>
                  
                  {/* Unread Messages Indicator - Center Bottom */}
                  {unreadCount > 0 && (
                    <div 
                      onClick={scrollToBottom}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
                    >
                      <div className="flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg backdrop-blur-sm hover:bg-primary transition-all duration-200">
                        <span>{unreadCount} new message{unreadCount > 1 ? 's' : ''}</span>
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  
                  {/* Floating Scroll to Bottom Button */}
                  {showScrollButton && (
                    <Button
                      size="icon"
                      onClick={scrollToBottom}
                      className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-primary/80 hover:bg-primary backdrop-blur-sm z-10 transition-all duration-200"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  )}
                </ScrollArea>
                
                {/* AI Chat Input */}
                <div className="p-3 border-t bg-card">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask AI assistant..."
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 text-xs min-h-5 max-h-32 resize-none"
                      rows={3}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSendAiMessage}
                      disabled={!aiChatInput.trim()}
                      className="px-2"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Client Intelligence */}
          <div className="col-span-1 lg:col-span-3">
              <Card className="border-0 shadow-lg h-[calc(100vh-80px)] flex flex-col">
                <CardHeader className="pb-1.5 px-3 py-3 flex-shrink-0">
                  <CardTitle className="flex items-center gap-1.5 text-xs">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Client Intelligence
                    <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0.5">Active</Badge>
                  </CardTitle>
                  
                  {/* Client Selector Dropdown */}
                  <div className="mt-2">
                    <Select value={selectedClient?.id || ''} onValueChange={(clientId) => {
                      const client = clients.find(c => c.id === clientId);
                      setSelectedClient(client || null);
                    }}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select a client..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id} className="text-xs">
                            {client.company_name} - {client.contact_person}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-3 space-y-4">
                      {selectedClient ? (
                        <>
                          {/* Contact & Company - Real Data */}
                          <div className="space-y-2">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <span className="font-semibold">{selectedClient.contact_person}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{selectedClient.company_name}</span>
                              </div>
                              {selectedClient.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{selectedClient.email}</span>
                                </div>
                              )}
                              {selectedClient.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{selectedClient.phone}</span>
                                </div>
                              )}
                              {selectedClient.industry && (
                                <div className="flex items-center gap-2">
                                  <Building className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Industry: {selectedClient.industry}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status & Additional Info */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-foreground">Status & Details</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={selectedClient.status === 'active' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0.5">
                                  {selectedClient.status || 'prospect'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Created:</span>
                                <span>{new Date(selectedClient.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-muted-foreground text-xs py-8">
                          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Select a client to view their information</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

          {/* Right Column - Phone Controls & Q&A Stacked */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-3">
            {/* Phone/Call Controls Panel - Top 50% */}
            <div className="h-[calc((100vh-80px)/2-6px)]">
              <Card className="border-0 shadow-lg h-full flex flex-col">
                <CardHeader className="pb-1.5 px-3 py-2 flex-shrink-0">
                  <CardTitle className="flex items-center gap-1.5 text-xs">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    Call Controls
                    {callStatus === 'in-progress' && <Badge variant="default" className="ml-auto text-xs px-1.5 py-0">Active</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 flex-1 overflow-hidden flex flex-col">
                  {/* Active Call Display */}
                  {(callStatus === 'in-progress' || callStatus === 'ringing' || call) ? (
                    <div className="space-y-3 flex-[2]">
                      {/* Caller Info */}
                      <div className="text-center space-y-2">
                        <Avatar className="w-16 h-16 mx-auto">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {currentCall?.phoneNumber?.slice(-4) || customPhoneNumber?.slice(-4) || '####'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{currentCall?.phoneNumber || customPhoneNumber || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {callStatus === 'ringing' ? 'Ringing...' : callStatus === 'in-progress' ? 'Connected' : 'Disconnecting...'}
                          </p>
                        </div>
                      </div>

                      {/* Call Timer - only show during in-progress */}
                      {callStatus === 'in-progress' && (
                        <div className="text-center">
                          <p className="text-2xl font-mono font-bold">{formatTime(callDuration)}</p>
                        </div>
                      )}

                      {/* Call Controls */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={isMuted ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            muteCall();
                            setIsMuted(!isMuted);
                          }}
                          className="flex flex-col items-center gap-1 h-auto py-2"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
                        </Button>
                        
                        <Button
                          variant={isPaused ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            holdCall();
                            setIsPaused(!isPaused);
                          }}
                          className="flex flex-col items-center gap-1 h-auto py-2"
                        >
                          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          <span className="text-xs">{isPaused ? 'Resume' : 'Hold'}</span>
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleHangup}
                          className="flex flex-col items-center gap-1 h-auto py-2"
                        >
                          <PhoneOff className="w-4 h-4" />
                          <span className="text-xs">End</span>
                        </Button>
                      </div>

                      {/* Headphone Status */}
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Headphones Connected</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-[2]">
                      {/* No Active Call - Show Dialer */}
                      <div className="space-y-3">
                        <div className="text-center text-muted-foreground text-xs">
                          <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No active call</p>
                        </div>
                        
                        {/* Quick Dial Input */}
                        <div className="space-y-2">
                          <Input
                            type="tel"
                            placeholder="Enter phone number..."
                            value={customPhoneNumber}
                            onChange={(e) => setCustomPhoneNumber(e.target.value)}
                            className="text-sm"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleQuickCall}
                            disabled={!customPhoneNumber.trim() || isInitiatingCall}
                            className="w-full"
                          >
                            {isInitiatingCall ? (
                              <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <>
                                <Phone className="w-3 h-3 mr-1" />
                                Call Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Calls - Takes 1/3 of panel */}
                  <Separator className="my-2" />
                  <div className="space-y-2 flex-1 min-h-0">
                    <h4 className="text-xs font-medium">Recent Calls</h4>
                    <ScrollArea className="h-[calc(100%-24px)]">
                      <div className="space-y-1">
                        {calls?.map((call: any, index: number) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => setCustomPhoneNumber(call.integration_config?.phoneNumber || call.to_number || '')}
                          >
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <div>
                                <p className="text-xs font-medium">{call.integration_config?.phoneNumber || call.to_number || 'Unknown'}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(call.created_at).toLocaleTimeString()}</p>
                              </div>
                            </div>
                            <Badge variant={call.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                              {call.duration || '0'}s
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Smart Q&A Panel - Bottom 50% */}
            <div className="h-[calc((100vh-80px)/2-6px)]">
              <Card className="border-0 shadow-lg h-full flex flex-col">
                <CardHeader className="pb-1.5 px-3 py-3 flex-shrink-0">
                  <CardTitle className="flex items-center gap-1.5 text-xs">
                    <Brain className="w-3.5 h-3.5 text-primary" />
                    Smart Q&A
                    <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0.5">
                      Live
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-3 space-y-3">
                      {questions.map((qa, index) => (
                        <div key={index} className="space-y-2 pb-3 border-b border-border/50 last:border-0">
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-foreground leading-relaxed">
                                {qa.question}
                              </p>
                              <div className="mt-2 p-2 rounded bg-muted/50">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {qa.answer}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge 
                                    variant={qa.confidence >= 85 ? "default" : qa.confidence >= 70 ? "secondary" : "outline"}
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    {qa.confidence}% confidence
                                  </Badge>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    Use Answer
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>  
        </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default CallDashboard;