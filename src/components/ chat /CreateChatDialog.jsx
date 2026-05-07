import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { generateAccessCode } from '@/lib/chatAuth';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateChatDialog({ open, onClose, adminUsername }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a chat name');
      return;
    }
    setLoading(true);
    const code = generateAccessCode();
    await base44.entities.ChatRoom.create({
      name: name.trim(),
      access_code: code,
      created_by: adminUsername,
      members: [adminUsername],
      kicked_users: []
    });
    setCreatedCode(code);
    setLoading(false);
    toast.success('Chat room created!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setName('');
    setCreatedCode(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{createdCode ? 'Chat Created!' : 'Create New Chat'}</DialogTitle>
        </DialogHeader>
        {!createdCode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chat Name</Label>
              <Input
                placeholder="Enter chat room name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Share this access code with users you want to invite:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-accent rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-bold tracking-[0.3em] text-primary">{createdCode}</span>
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
