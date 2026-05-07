import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { getChatUser, setChatUser } from '@/lib/chatAuth';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsDialog({ open, onClose }) {
  const chatUser = getChatUser();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(chatUser?.display_name || '');
    }
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    const users = await base44.entities.ChatUser.filter({ username: chatUser.username });
    if (users.length > 0) {
      await base44.entities.ChatUser.update(users[0].id, { display_name: displayName.trim() });
    }
    setChatUser({ ...chatUser, display_name: displayName.trim() });
    toast.success('Settings saved!');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={chatUser?.username} disabled className="h-10 opacity-60" />
          </div>
          <div className="space-y-2">
            <Label>Display Name <span className="text-muted-foreground text-xs">(shown in chat)</span></Label>
            <Input
              placeholder="Enter a display name..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-10"
              maxLength={30}
            />
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
