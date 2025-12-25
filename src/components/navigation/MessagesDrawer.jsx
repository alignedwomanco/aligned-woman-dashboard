import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MessagesDrawer({ onClose }) {
  const { data: messages = [] } = useQuery({
    queryKey: ["recentMessages"],
    queryFn: async () => {
      const sent = await base44.entities.DirectMessage.list("-created_date", 10);
      const received = await base44.entities.DirectMessage.filter(
        { recipientEmail: (await base44.auth.me()).email },
        "-created_date",
        10
      );
      
      // Group by conversation partner
      const conversations = {};
      [...sent, ...received].forEach(msg => {
        const partner = msg.created_by === (base44.auth.me()).email 
          ? msg.recipientEmail 
          : msg.created_by;
        if (!conversations[partner] || new Date(msg.created_date) > new Date(conversations[partner].created_date)) {
          conversations[partner] = msg;
        }
      });
      
      return Object.values(conversations).sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      ).slice(0, 5);
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const getUserByEmail = (email) => {
    return users.find(u => u.email === email);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <Card className="fixed top-16 right-6 z-50 w-96 max-h-[500px] overflow-hidden shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Messages</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[380px]">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            <div>
              {messages.map((msg) => {
                const partnerEmail = msg.created_by !== (base44.auth.me()).email 
                  ? msg.created_by 
                  : msg.recipientEmail;
                const partner = getUserByEmail(partnerEmail);
                
                return (
                  <Link
                    key={msg.id}
                    to={createPageUrl("Messages") + `?user=${partnerEmail}`}
                    onClick={onClose}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={partner?.profile_picture} />
                      <AvatarFallback className="bg-[#6B1B3D] text-white">
                        {partner?.full_name?.[0] || partnerEmail[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{partner?.full_name || partnerEmail}</p>
                      <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                    </div>
                    {!msg.isRead && msg.recipientEmail === (base44.auth.me()).email && (
                      <div className="w-2 h-2 bg-[#6B1B3D] rounded-full flex-shrink-0 mt-2" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <Link to={createPageUrl("Messages")} onClick={onClose}>
            <Button className="w-full bg-[#6B1B3D] hover:bg-[#4A1228]">
              View All Messages
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}