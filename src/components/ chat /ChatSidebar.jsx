import React, { useState } from 'react';
import { MessageCircle, Plus, KeyRound, LogOut, Shield, Settings } from 'lucide-react';
import SettingsDialog from './SettingsDialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { isAdmin } from '@/lib/chatAuth';

export default function ChatSidebar({
  chatUser,
  rooms,
  selectedRoomId,
  onSelectRoom,
  onCreateChat,
  onJoinChat,
  onLogout
}) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const admin = isAdmin(chatUser);

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SecureChat</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
            {chatUser?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {chatUser?.display_name && (
              <p className="text-sm font-medium truncate">{chatUser.display_name}</p>
            )}
            <p className={cn('truncate', chatUser?.display_name ? 'text-xs text-muted-foreground' : 'text-sm font-medium')}>
              @{chatUser?.username}
            </p>
            {admin && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <Shield className="w-3 h-3" />
                Admin
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-1">
        {admin && (
          <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm" onClick={onCreateChat}>
            <Plus className="w-4 h-4" />
            Create Chat Room
          </Button>
        )}
        <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm" onClick={onJoinChat}>
          <KeyRound className="w-4 h-4" />
          Join with Code
        </Button>
      </div>

      {/* Chat list */}
      <div className="px-3 mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Chats</p>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {rooms.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              No chats yet.{admin ? ' Create one!' : ' Join with a code!'}
            </p>
          )}
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl transition-all text-sm',
                selectedRoomId === room.id
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'hover:bg-accent text-foreground'
              )}
            >
              <p className="font-medium truncate">{room.name}</p>
              <p className={cn(
                'text-xs truncate mt-0.5',
                selectedRoomId === room.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
                {room.members?.length || 0} member{(room.members?.length || 0) !== 1 ? 's' : ''}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
