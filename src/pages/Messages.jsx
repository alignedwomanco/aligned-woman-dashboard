import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search } from "lucide-react";

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      // Check URL params for user
      const params = new URLSearchParams(window.location.search);
      const userEmail = params.get("user");
      if (userEmail) {
        const users = await base44.entities.User.list();
        const user = users.find(u => u.email === userEmail);
        if (user) setSelectedUser(user);
      }
    };
    loadUser();
  }, []);

  const { data: allMessages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!currentUser) return [];
      const sent = await base44.entities.DirectMessage.list("-created_date");
      const received = await base44.entities.DirectMessage.filter(
        { recipientEmail: currentUser.email },
        "-created_date"
      );
      return [...sent, ...received].sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      );
    },
    enabled: !!currentUser,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message) => 
      base44.entities.DirectMessage.create({
        recipientEmail: selectedUser.email,
        message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setMessageText("");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    },
  });

  // Group messages into conversations
  const conversations = {};
  allMessages.forEach(msg => {
    const partner = msg.created_by === currentUser?.email 
      ? msg.recipientEmail 
      : msg.created_by;
    if (!conversations[partner]) {
      conversations[partner] = [];
    }
    conversations[partner].push(msg);
  });

  const conversationPartners = Object.keys(conversations)
    .map(email => {
      const user = users.find(u => u.email === email);
      const lastMsg = conversations[email][conversations[email].length - 1];
      const unreadCount = conversations[email].filter(
        m => m.recipientEmail === currentUser?.email && !m.isRead
      ).length;
      return { user, email, lastMsg, unreadCount };
    })
    .filter(c => {
      if (!searchQuery) return true;
      return c.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             c.email?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.lastMsg.created_date) - new Date(a.lastMsg.created_date));

  const currentConversation = selectedUser 
    ? conversations[selectedUser.email] || []
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation]);

  return (
    <div className="h-[calc(100vh-120px)] bg-gray-50">
      <div className="h-full max-w-7xl mx-auto flex gap-0 overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversationPartners.map(({ user, email, lastMsg, unreadCount }) => (
              <button
                key={email}
                onClick={() => setSelectedUser(user || { email, full_name: email })}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b ${
                  selectedUser?.email === email ? "bg-pink-50" : ""
                }`}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user?.profile_picture} />
                  <AvatarFallback className="bg-[#6B1B3D] text-white">
                    {user?.full_name?.[0] || email[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium truncate">{user?.full_name || email}</p>
                    {unreadCount > 0 && (
                      <span className="bg-[#6B1B3D] text-white text-xs rounded-full px-2 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{lastMsg.message}</p>
                </div>
              </button>
            ))}

            {conversationPartners.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedUser.profile_picture} />
                  <AvatarFallback className="bg-[#6B1B3D] text-white">
                    {selectedUser.full_name?.[0] || selectedUser.email[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedUser.full_name || selectedUser.email}</p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentConversation.map((msg) => {
                  const isMe = msg.created_by === currentUser?.email;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-[#6B1B3D] text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-gray-500"}`}>
                          {new Date(msg.created_date).toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-3">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                        e.preventDefault();
                        sendMessageMutation.mutate(messageText);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => sendMessageMutation.mutate(messageText)}
                    disabled={!messageText.trim() || sendMessageMutation.isLoading}
                    className="bg-[#6B1B3D] hover:bg-[#4A1228]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}