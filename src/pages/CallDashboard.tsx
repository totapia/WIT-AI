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
  Mail
} from "lucide-react";

const CallDashboard = () => {
  const navigate = useNavigate();
  const [isCallActive, setIsCallActive] = useState(true);
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

  // Simulate call duration
  useEffect(() => {
    if (isCallActive && !isPaused) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCallActive, isPaused]);



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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const transcript = [
    { speaker: "client", name: "Sarah Johnson", time: "14:32", message: "Hi John, thanks for taking the time to call today. I've been looking into logistics solutions for our expanding operations." },
    { speaker: "agent", name: "You", time: "14:33", message: "Absolutely, Sarah. I'm excited to learn more about GlobalShip Corp's needs. Can you tell me about your current shipping volume?" },
    { speaker: "client", name: "Sarah Johnson", time: "14:34", message: "We're currently shipping about 200 containers monthly, but we're projecting 40% growth over the next quarter." },
    { speaker: "ai", name: "AI Assistant", time: "14:34", message: "💡 Great opportunity! Ask about their current pain points with existing providers." },
    { speaker: "agent", name: "You", time: "14:35", message: "That's impressive growth! What challenges are you facing with your current logistics providers?" },
    { speaker: "client", name: "Sarah Johnson", time: "14:36", message: "Honestly, we're struggling with visibility and cost predictability. Our current providers don't give us real-time tracking." },
    { speaker: "ai", name: "AI Assistant", time: "14:36", message: "🎯 Perfect! Highlight our real-time tracking and transparent pricing model." },
  ];

  const questions = [
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





  const handleSendAiMessage = () => {
    if (aiChatInput.trim()) {
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Add the broker's message to the transcript
      const newMessage = {
        speaker: "agent",
        name: "You",
        time: currentTime,
        message: aiChatInput.trim()
      };
      
      setDisplayedTranscript(prev => [...prev, newMessage]);
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const aiResponse = {
          speaker: "ai",
          name: "AI Assistant",
          time: currentTime,
          message: "Thanks for your message! I'm analyzing the conversation and will provide insights based on what we've discussed so far."
        };
        setDisplayedTranscript(prev => [...prev, aiResponse]);
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

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {/* Top Navigation Bar */}
        <header className="border-b bg-card sticky top-0 z-40 h-14">
          <div className="px-3 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Avatar className="animate-pulse w-6 h-6">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">SJ</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-xs">Sarah Johnson</h2>
                  <p className="text-xs text-muted-foreground">GlobalShip Corp • Discovery Call</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Call Timer */}
              <div className="flex items-center gap-1.5 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${isCallActive ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                <span className="font-mono text-xs">{formatTime(callDuration)}</span>
              </div>

              {/* Call Controls */}
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => navigate('/forms')} className="text-xs px-1.5 py-0.5 h-6">
                  <FileText className="w-2.5 h-2.5 mr-0.5" />
                  Forms
                </Button>
                
                <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)} className={`w-6 h-6 ${isMuted ? 'bg-destructive text-destructive-foreground' : ''}`}>
                  {isMuted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                </Button>
                
                <Button variant="outline" size="icon" onClick={() => setIsPaused(!isPaused)} className="w-6 h-6">
                  {isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                </Button>

                <Button variant={isCallActive ? "destructive" : "success"} onClick={() => setIsCallActive(!isCallActive)} className="px-2 text-xs h-6">
                  {isCallActive ? (
                    <>
                      <PhoneOff className="w-2.5 h-2.5 mr-0.5" />
                      End
                    </>
                  ) : (
                    <>
                      <Phone className="w-2.5 h-2.5 mr-0.5" />
                      Start
                    </>
                  )}
                </Button>
              </div>

              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Search className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Bell className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Settings className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="w-6 h-6">
                <LogOut className="w-2.5 h-2.5" />
              </Button>
              
              <Avatar className="w-6 h-6">
                <AvatarImage src="/avatars/user.jpg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

                {/* Main Content */}
        <div className="min-h-screen bg-background animate-fade-in w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 h-[calc(100vh-60px)]">
            {/* Left Column - Live Transcript */}
            <div className="col-span-1 lg:col-span-5">
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

        {/* Right Column - Client Intelligence & Q&A Side by Side */}
        <div className="col-span-1 lg:col-span-7 flex gap-3">
          {/* Client Intelligence Panel - Left */}
          <div className="flex-1">
            <Card className="border-0 shadow-lg h-[calc(100vh-80px)] flex flex-col">
              <CardHeader className="pb-1.5 px-3 py-3 flex-shrink-0">
                <CardTitle className="flex items-center gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Client Intelligence
                  <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0.5">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-4">
                    {/* Contact & Company */}
                    <div className="space-y-2">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="font-semibold">Sarah Johnson</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Operations Manager</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">GlobalShip Corp</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">sarah.johnson@globalship.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Boston, MA</span>
                        </div>
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-foreground">Personal Details</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Background:</span>
                          <span>8+ years in logistics, MBA from MIT</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Family:</span>
                          <span>Married, 2 kids (ages 8 & 11)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Interests:</span>
                          <span>Running, cooking, Red Sox fan</span>
                        </div>
                      </div>
                    </div>

                    {/* Business Context */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-foreground">Business Context</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Industry:</span>
                          <span>E-commerce & Retail</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Pain Points:</span>
                          <span>Real-time tracking, cost predictability</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Goals:</span>
                          <span>40% growth, expand to West Coast</span>
                        </div>
                      </div>
                    </div>

                    {/* Previous Call Notes */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-foreground">Previous Call Notes</h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 bg-muted/30 rounded border-l-2 border-primary">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium">Dec 15, 2024</span>
                            <Badge variant="secondary" className="text-xs px-1 py-0">Discovery</Badge>
                          </div>
                          <p className="text-muted-foreground">Initial meeting. Sarah interested in real-time tracking solutions. Budget: $50K-100K.</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded border-l-2 border-blue-500">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium">Dec 22, 2024</span>
                            <Badge variant="secondary" className="text-xs px-1 py-0">Demo</Badge>
                          </div>
                          <p className="text-muted-foreground">Shared demo of tracking dashboard. Sarah excited about real-time visibility features.</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Preferences */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-foreground">Personal Preferences</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Communication:</span>
                          <span>Prefers email summaries, calls for complex topics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Timing:</span>
                          <span>Best: 10 AM - 2 PM EST, avoid Mondays</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Style:</span>
                          <span>Direct, data-driven, appreciates personal touch</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Insights */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-foreground">Key Insights</h4>
                      <div className="space-y-1 text-xs">
                        <div className="p-2 bg-blue-50 rounded">
                          <span className="text-blue-700">🎯 Decision maker with budget authority</span>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <span className="text-green-700">💡 Values innovation and efficiency</span>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <span className="text-purple-700">🏠 Family-oriented, work-life balance important</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Smart Q&A Panel - Right */}
          <div className="flex-1">
            <Card className="border-0 shadow-lg h-[calc(100vh-80px)] flex flex-col">
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
      </SidebarInset>
    </>
  );
};

export default CallDashboard;