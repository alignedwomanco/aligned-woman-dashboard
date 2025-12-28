import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Bell, Heart, MessageSquare, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const iconMap = {
  comment: MessageSquare,
  mention: MessageSquare,
  reply: MessageSquare,
  like: Heart,
  follow: Heart,
  tool_complete: Sparkles,
  module_unlock: Sparkles,
};

export default function NotificationsDropdown({ onClose }) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const allNotifs = await base44.entities.Notification.list("-created_date", 50);
      return allNotifs.filter(n => new Date(n.created_date) > sevenDaysAgo);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { isRead: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleClick = (notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.linkTo) {
      window.location.href = notification.linkTo;
    }
    onClose();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <Card className="fixed top-16 right-6 z-50 w-96 max-h-[500px] overflow-hidden shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notif) => {
                const Icon = iconMap[notif.type] || Bell;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b ${
                      !notif.isRead ? "bg-pink-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        !notif.isRead ? "bg-[#2F1B3E]/10" : "bg-gray-100"
                      }`}>
                        <Icon className={`w-4 h-4 ${!notif.isRead ? "text-[#2F1B3E]" : "text-gray-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-[#2F1B3E] rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </>
  );
}