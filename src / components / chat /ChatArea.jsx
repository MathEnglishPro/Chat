import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getChatUser, isAdmin } from '@/lib/chatAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Settings, MessageCircle, Loader2, Shield } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ModerationPanel from './ModerationPanel';
import SettingsDialog from './SettingsDialog';

export default function ChatArea({ room, onRoomDeleted }) {
  const [message, setMessage] = useState('');
  const [modOpen, setModOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const chatUser = getChatUser();
  const admin = isAdmin(chatUser);
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const prevMessageCount = useRef(0);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', room?.id],
    queryFn: () => base44.entities.Message.filter({ chat_room_id: room.id }, 'created_date', 200),
    enabled: !!room?.id,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (messages.length > prevMessageCount.current && scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
    prevMessageCount.current = messages.length;
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (content) => base44.entities.Message.create({
      chat_room_id: room.id,
      sender_username: chatUser.username,
      sender_display_name: chatUser.display_name || '',
      content,
      message_type: 'text'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', room.id] });
      setMessage('');
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Select a Chat</h2>
          <p className="text-sm text-muted-foreground">Choose a chat room from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header - desktop only */}
      <div className="hidden md:flex h-16 border-b border-border items-center justify-between px-5 bg-card">
        <div>
          <h2 className="font-semibold text-foreground">{room.name}</h2>
          <p className="text-xs text-muted-foreground">{room.members?.length || 0} members</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4" />
          </Button>
          {admin && (
            <Button variant="ghost" size="icon" onClick={() => setModOpen(true)}>
              <Shield className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-5">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_username === chatUser?.username}
                isAdmin={msg.sender_username === 'Gregory.D'}
              />
            ))}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-11 rounded-xl"
          />
          <Button type="submit" size="icon" className="h-11 w-11 rounded-xl shrink-0" disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {admin && (
        <ModerationPanel
          open={modOpen}
          onClose={() => setModOpen(false)}
          room={room}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
            queryClient.invalidateQueries({ queryKey: ['messages', room?.id] });
            if (onRoomDeleted) onRoomDeleted();
          }}
        />
      )}
    </div>
  );
}
