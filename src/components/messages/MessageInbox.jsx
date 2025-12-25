import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image as ImageIcon, Search } from "lucide-react";
import moment from "moment";

export default function MessageInbox({ currentUser }) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: allMessages = [] } = useQuery({
    queryKey: ["directMessages"],
    queryFn: () => base44.entities.DirectMessage.list("-created_date"),
    refetchInterval: 5000, // Poll every 5 seconds for real-time feel
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      const message = await base44.entities.DirectMessage.create(data);
      
      // Create notification for recipient
      await base44.entities.Notification.create({
        type: "message",
        message: `${currentUser.full_name} sent you a message`,
        linkTo: "/messages",
        source_user_email: currentUser.email,
      });
      
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directMessages"] });
      setMessageText("");
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    sendMessageMutation.mutate({
      recipientEmail: selectedConversation,
      message: "",
      imageUrl: file_url,
    });
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      recipientEmail: selectedConversation,
      message: messageText,
    });
  };

  // Group messages into conversations
  const myMessages = allMessages.filter(
    m => m.created_by === currentUser?.email || m.recipientEmail === currentUser?.email
  );

  const conversations = {};
  myMessages.forEach(msg => {
    const otherUser = msg.created_by === currentUser?.email 
      ? msg.recipientEmail 
      : msg.created_by;
    
    if (!conversations[otherUser]) {
      conversations[otherUser] = [];
    }
    conversations[otherUser].push(msg);
  });

  // Sort conversations by last message
  const sortedConversations = Object.entries(conversations)
    .map(([email, messages]) => {
      const lastMessage = messages.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      )[0];
      
      const unreadCount = messages.filter(
        m => m.recipientEmail === currentUser?.email && !m.isRead
      ).length;
      
      return { email, messages, lastMessage, unreadCount };
    })
    .sort((a, b) => new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date));

  const filteredConversations = sortedConversations.filter(conv => {
    const user = allUsers.find(u => u.email === conv.email);
    return user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const currentMessages = selectedConversation
    ? conversations[selectedConversation]?.sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      ) || []
    : [];

  const getUserByEmail = (email) => allUsers.find(u => u.email === email);

  return (
    <div className="grid lg:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Messages</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-4">
            {filteredConversations.map(({ email, lastMessage, unreadCount }) => {
              const user = getUserByEmail(email);
              return (
                <button
                  key={email}
                  onClick={() => setSelectedConversation(email)}
                  className={`w-full p-3 rounded-lg transition-all text-left ${
                    selectedConversation === email
                      ? "bg-pink-50 border-2 border-[#6B1B3D]"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.profile_picture} />
                      <AvatarFallback className="bg-[#6B1B3D] text-white">
                        {user?.full_name?.[0] || email[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">
                          {user?.full_name || email}
                        </p>
                        {unreadCount > 0 && (
                          <Badge className="bg-[#6B1B3D] text-white h-5 min-w-5 px-1">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {lastMessage.message || "📷 Image"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {moment(lastMessage.created_date).fromNow()}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredConversations.length === 0 && (
              <p className="text-center text-gray-500 py-8 text-sm">No conversations yet</p>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={getUserByEmail(selectedConversation)?.profile_picture} />
                  <AvatarFallback className="bg-[#6B1B3D] text-white">
                    {getUserByEmail(selectedConversation)?.full_name?.[0] || selectedConversation[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {getUserByEmail(selectedConversation)?.full_name || selectedConversation}
                  </p>
                  <p className="text-xs text-gray-500">{selectedConversation}</p>
                </div>
              </div>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentMessages.map((msg) => {
                  const isMine = msg.created_by === currentUser?.email;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isMine
                            ? "bg-[#6B1B3D] text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Shared"
                            className="rounded mb-2 max-w-full"
                          />
                        )}
                        {msg.message && <p className="text-sm">{msg.message}</p>}
                        <p className={`text-xs mt-1 ${isMine ? "text-white/70" : "text-gray-500"}`}>
                          {moment(msg.created_date).format("h:mm A")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" size="icon" type="button" asChild>
                    <span>
                      <ImageIcon className="w-4 h-4" />
                    </span>
                  </Button>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-[#6B1B3D]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No conversation selected</p>
              <p className="text-sm">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}