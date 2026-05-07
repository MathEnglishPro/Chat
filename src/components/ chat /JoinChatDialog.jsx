import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { getChatUser, setChatUser } from '@/lib/chatAuth';
import { Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinChatDialog({ open, onClose, onJoined }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      toast.error('Please enter a valid 6-character code');
      return;
    }
    setLoading(true);
    const user = getChatUser();
    const rooms = await base44.entities.ChatRoom.filter({ access_code: code.trim().toUpperCase() });
    if (rooms.length === 0) {
      toast.error('Invalid access code');
      setLoading(false);
      return;
    }
    const room = rooms[0];
    if (room.kicked_users?.includes(user.username)) {
      toast.error('You have been removed from this chat');
      setLoading(false);
      return;
    }
    if (room.members?.includes(user.username)) {
      toast.info('You are already a member of this chat');
      setLoading(false);
      onJoined();
      handleClose();
      return;
    }
    await base44.entities.ChatRoom.update(room.id, {
      members: [...(room.members || []), user.username]
    });
    // Update user's joined_chats
    const users = await base44.entities.ChatUser.filter({ username: user.username });
    if (users.length > 0) {
      const dbUser = users[0];
      await base44.entities.ChatUser.update(dbUser.id, {
        joined_chats: [...(dbUser.joined_chats || []), room.id]
      });
    }
    await base44.entities.Message.create({
      chat_room_id: room.id,
      sender_username: 'System',
      content: `${user.username} joined the chat`,
      message_type: 'system'
    });
    toast.success(`Joined "${room.name}"!`);
    setLoading(false);
    onJoined();
    handleClose();
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Join a Chat
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Enter the 6-character access code provided by the admin.</p>
          <div className="space-y-2">
            <Label>Access Code</Label>
            <Input
              placeholder="e.g. BG694K"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              className="h-12 text-center text-xl font-bold tracking-[0.3em] uppercase"
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleJoin} disabled={loading || code.length !== 6}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Join Chat
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
