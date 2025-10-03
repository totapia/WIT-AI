import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import type { EmailConversation } from '@/hooks/useGmailEmails';
import { EmailConnection } from "@/components/EmailConnection";
import { useGmailEmails } from '@/hooks/useGmailEmails';
import LoadInput from '@/components/LoadInput';
import { useLoadMatching, LoadMatch } from '@/hooks/useLoadMatching';
import { useEmailConnection } from '@/hooks/useEmailConnection';
import { supabase } from '@/lib/supabase';
import {
  Mail,
  Search,
  Filter,
  Send,
  Plus,
  Calendar,
  Trash2,
  Edit, // Add this
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';

export default function EmailAgent() {
  const [selectedLoad, setSelectedLoad] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showFiltered, setShowFiltered] = useState(false);
  const [filteredThreads, setFilteredThreads] = useState<Set<string>>(new Set());
  const [replyText, setReplyText] = useState('');
  // Add a state for showing the add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLoad, setEditingLoad] = useState<any>(null);

  // Use the load matching hook
  const { loads, loading: loadsLoading, fetchLoads } = useLoadMatching();
  
  // Use the Gmail emails hook
  const { 
    emails, 
    conversations, 
    loading, 
    error, 
    emailTimeframe,        
    setEmailTimeframe,     
    refetch, 
    sendEmailReply 
  } = useGmailEmails();

  // When timeframe changes, refetch with new days
  const handleTimeframeChange = (newTimeframe: 30 | 60 | 90) => {
    setEmailTimeframe(newTimeframe);
    refetch(newTimeframe); // Pass the new timeframe
  };

  // When fetch button is clicked, use current timeframe
  const handleFetchEmails = () => {
    refetch(emailTimeframe); // Use current timeframe
  };

  // Use email connection status
  const { connectionStatus } = useEmailConnection();

  const { user } = useUser();

  // Memoize the filtered conversations to prevent infinite re-renders
  const filteredConversations = useMemo(() => {
    console.log('🔍 Selected load:', selectedLoad);
    console.log('🔍 All conversations:', conversations.length);
    console.log(' First conversation loadNumber:', conversations[0]?.loadNumber);
    
    // Show all conversations if no load is selected, or filter by selected load
    if (!selectedLoad) {
      return conversations.filter(conv => 
        showFiltered ? filteredThreads.has(conv.threadId) : !filteredThreads.has(conv.threadId)
      );
    }
    
    return conversations.filter(conv => {
      const matches = conv.loadNumber === selectedLoad;
      console.log('🔍 Conversation loadNumber:', conv.loadNumber, 'matches:', matches);
      return matches;
    }).filter(conv => showFiltered ? filteredThreads.has(conv.threadId) : !filteredThreads.has(conv.threadId));
  }, [selectedLoad, conversations, showFiltered, filteredThreads]);

  // Update the handleLoadSelect function
  const handleLoadSelect = (loadNumber: string) => {
    setSelectedLoad(loadNumber);
    setSelectedConversation(null);
    // Don't automatically fetch emails here
  };

  // Handle load deletion
  const handleDeleteLoad = async (loadId: string) => {
    try {
      const { error } = await supabase
        .from('loads')
        .delete()
        .eq('id', loadId);

      if (error) throw error;
      
      console.log('✅ Load deleted successfully');
      // Refresh the loads list
      fetchLoads();
      
      // Clear selection if the deleted load was selected
      if (selectedLoad && loads.find(load => load.id === loadId)?.load_number === selectedLoad) {
        setSelectedLoad(null);
        setSelectedConversation(null);
      }
    } catch (error: any) {
      console.error('❌ Error deleting load:', error);
    }
  };

  // Handle adding a new load
  const handleLoadAdded = async (load: any) => {
    console.log('🔍 Adding load:', load);
    console.log('🔍 Current user:', user);
    console.log('🔍 User ID:', user?.id);
    
    // Check for duplicate load number first
    const existingLoad = loads.find(existingLoad => 
      existingLoad.load_number?.toLowerCase().trim() === load.id?.toLowerCase().trim()
    );
    
    if (existingLoad) {
      console.error('❌ Load number already exists:', load.id);
      alert(`Load number "${load.id}" already exists. Please use a different load number.`);
      return;
    }
    
    // Format the load data to match your actual database schema
    const formattedLoad = {
      load_number: load.id, // Your DB uses 'load_number' instead of 'id'
      origin: load.origin,
      destination: load.destination,
      pickup_date: load.pickDate || null,
      delivery_date: load.dropDate || null,
      origin_facility: load.originFacility || null,
      destination_facility: load.destinationFacility || null,
      product_type: load.product || null,
      equipment_type: load.equipment || null,
      rate: load.rate || null,
      status: 'posted',
      user_id: user?.id // Add this line
    };

    try {
      console.log('🔍 Formatted load data:', formattedLoad);
      
      const { data, error } = await supabase
        .from('loads')
        .insert([formattedLoad]);

      console.log(' Supabase insert result:', { data, error });

      if (error) {
        console.error('❌ Detailed error:', error);
        throw error;
      }

      console.log('✅ Load added successfully');
      // Refresh the loads list
      fetchLoads();
    } catch (error: any) {
      console.error('❌ Error adding load:', error);
      // Show user-friendly error message
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        alert(`Load number "${load.id}" already exists. Please use a different load number.`);
      } else {
        alert(`Error adding load: ${error.message}`);
      }
    }
  };

  const handleEditLoad = (load: any) => {
    setEditingLoad(load);
  };

  const handleUpdateLoad = async (updatedLoad: any) => {
    try {
      const { error } = await supabase
        .from('loads')
        .update({
          load_number: updatedLoad.id,
          origin: updatedLoad.origin,
          destination: updatedLoad.destination,
          pickup_date: updatedLoad.pickDate || null,
          delivery_date: updatedLoad.dropDate || null,
          equipment_type: updatedLoad.equipment || null,
          product_type: updatedLoad.product || null,
          rate: updatedLoad.rate || null,
          pallets: updatedLoad.pallets || 0,
          cases: updatedLoad.cases || 0,
          temp: updatedLoad.temp || null,
          origin_facility: updatedLoad.originFacility || null,
          destination_facility: updatedLoad.destinationFacility || null
        })
        .eq('id', editingLoad.id);

      if (error) throw error;

      // Refresh loads
      fetchLoads();
      setEditingLoad(null);
    } catch (error) {
      console.error('Error updating load:', error);
    }
  };

  const toggleThreadFilter = (threadId: string) => {
    setFilteredThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;

    try {
      const conversation = conversations.find(conv => conv.threadId === selectedConversation);
      if (!conversation) return;

      await sendEmailReply(conversation.threadId, replyText);
      setReplyText('');
      refetch(emailTimeframe); // Refresh emails
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {/* Top Navigation - Matching Dashboard style with Email Connection */}
        <header className="border-b bg-card sticky top-0 z-40 h-14">
          <div className="px-3 h-full flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Email Agent</h2>
              </div>
              <EmailConnection />
            </div>
            
            {/* Right side - matching Dashboard buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Search className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Bell className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Settings className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <LogOut className="w-3 h-3" />
              </Button>
              
              <Avatar className="w-6 h-6">
                <AvatarImage src="/avatars/user.jpg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        
        {/* Main Content - Updated height calculation */}
        <div className="flex h-[calc(100vh-3.5rem)] bg-gray-50">
          {/* Left Panel - Active Loads Only */}
          <div className="w-1/4 min-w-[320px] bg-white border-r border-gray-200 flex flex-col">
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Header with border separation */}
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Active Loads</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Load</DialogTitle>
                      </DialogHeader>
                      <LoadInput onLoadAdded={handleLoadAdded} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Content area */}
              <ScrollArea className="flex-1">
                <div className="space-y-2 p-4">
                  {loads.map((load) => (
                    <div
                      key={load.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedLoad === load.load_number
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleLoadSelect(load.load_number)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {load.load_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {load.origin} → {load.destination}
                          </div>
                          {load.equipment_type && (
                            <div className="text-xs text-gray-400">
                              {load.equipment_type}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditLoad(load);
                            }}
                            className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLoad(load.id);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loads.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                      No loads found. Click "Add" to create a new load.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Middle Panel - Email Threads */}
          <div className="w-1/3 min-w-[400px] bg-white border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Email Threads</h2>
                <div className="flex items-center space-x-2">
                  <Select value={emailTimeframe.toString()} onValueChange={(value) => handleTimeframeChange(Number(value) as 30 | 60 | 90)}>
                    <SelectTrigger className="h-7 w-16 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30d</SelectItem>
                      <SelectItem value="60">60d</SelectItem>
                      <SelectItem value="90">90d</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleFetchEmails}
                    disabled={loading}
                    className="h-7 px-2 text-xs"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFiltered(!showFiltered)}
                    className="h-7 px-2 text-xs"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    {showFiltered ? 'Show All' : 'Filtered'}
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 p-4">
                {filteredConversations.length === 0 && selectedLoad ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Press "Refresh" to load emails
                  </div>
                ) : !selectedLoad ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Select a load to view related emails
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.threadId}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedConversation === conversation.threadId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedConversation(conversation.threadId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {conversation.subject}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {conversation.participants.join(', ')}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {conversation.lastMessage.receivedAt ? new Date(conversation.lastMessage.receivedAt).toLocaleString() : 'No date'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Badge variant="secondary" className="text-xs">
                            {conversation.messageCount}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleThreadFilter(conversation.threadId);
                            }}
                            className="p-1 h-6 w-6"
                          >
                            <Filter className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {conversation.loadMatch && (
                        <div className="mt-2 text-xs text-blue-600">
                          Matched to: {conversation.loadMatch.loadId} ({conversation.loadMatch.confidence}%)
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Conversation */}
          <div className="flex-1 min-w-[500px] bg-white flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {(() => {
                      const conversation = conversations.find(conv => conv.threadId === selectedConversation);
                      if (!conversation) return null;
                      
                      // Sort emails by date (oldest first) for proper conversation flow
                      const sortedEmails = [...conversation.emails].sort((a, b) => 
                        new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
                      );
                      
                      return sortedEmails.map((message, index) => {
                        // Better sender detection - check if it's the current user
                        const isCurrentUser = message.sender === user?.email || 
                                             message.sender.includes('workintandemai@gmail.com') ||
                                             message.createdByUser;
                        
                        return (
                          <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <div className="text-xs opacity-70 mb-1">
                                {isCurrentUser ? 'You' : message.sender}
                              </div>
                              <div className="text-sm whitespace-pre-wrap">
                                {message.body}
                              </div>
                              <div className="text-xs opacity-70 mt-1">
                                {new Date(message.receivedAt).toLocaleString()}
                              </div>
                              {/* Show sync status for pending emails */}
                              {message.syncStatus === 'pending' && (
                                <div className="text-xs opacity-50 mt-1 italic">
                                  Sending...
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1"
                      rows={3}
                    />
                    <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
        {/* Edit Load Dialog */}
        <Dialog open={!!editingLoad} onOpenChange={() => setEditingLoad(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Load</DialogTitle>
            </DialogHeader>
            <LoadInput 
              onLoadAdded={handleUpdateLoad}
              initialData={editingLoad}
            />
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </>
  );
}
