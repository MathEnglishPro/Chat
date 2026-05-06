import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';
import { Shield, UserX, Ban, Copy, Check, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ModerationPanel({ open, onClose, room, onUpdate }) {
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const handleKick = async (username) => {
    const newMembers = room.members.filter(m => m !== username);
    const newKicked = [...(room.kicked_users || []), username];
    await base44.entities.ChatRoom.update(room.id, {
      members: newMembers,
      kicked_users: newKicked
    });
    await base44.entities.Message.create({
      chat_room_id: room.id,
      sender_username: 'System',
      content: `${username} was removed from the chat`,
      message_type: 'system'
    });
    toast.success(`${username} has been kicked`);
    onUpdate();
  };

  const handleBan = async (username) => {
    // Kick from chat
    const newMembers = room.members.filter(m => m !== username);
    const newKicked = [...(room.kicked_users || []), username];
    await base44.entities.ChatRoom.update(room.id, {
      members: newMembers,
      kicked_users: newKicked
    });
    // Ban from platform
    const users = await base44.entities.ChatUser.filter({ username });
    if (users.length > 0) {
      await base44.entities.ChatUser.update(users[0].id, { is_banned: true });
    }
    await base44.entities.Message.create({
      chat_room_id: room.id,
      sender_username: 'System',
      content: `${username} was banned from the platform`,
      message_type: 'system'
    });
    toast.success(`${username} has been banned`);
    onUpdate();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room.access_code);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteGroup = async () => {
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
    await base44.entities.ChatRoom.delete(room.id);
    toast.success('Group deleted');
    onClose();
    onUpdate();
  };

  const nonAdminMembers = room.members?.filter(m => m !== 'Gregory.D') || [];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Manage Chat
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Access Code */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Access Code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-accent rounded-lg px-3 py-2 text-center">
                <span className="font-bold tracking-[0.2em] text-primary">{room.access_code}</span>
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={copyCode}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Members ({room.members?.length || 0})
              </p>
            </div>
            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {/* Admin first */}
                {room.members?.includes('Gregory.D') && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        G
                      </div>
                      <div>
                        <p className="text-sm font-medium">Gregory.D</p>
                        <Badge variant="secondary" className="text-[10px] h-4">Admin</Badge>
                      </div>
                    </div>
                  </div>
                )}
                {nonAdminMembers.map((username) => (
                  <div key={username} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                        {username[0]?.toUpperCase()}
                      </div>
                      <p className="text-sm font-medium">{username}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleKick(username)}
                        title="Kick user"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleBan(username)}
                        title="Ban user"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          {/* Danger Zone */}
          <div className="border-t border-border pt-4">
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={handleDeleteGroup}
            >
              <Trash2 className="w-4 h-4" />
              Delete Group
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
