import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getChatUser, clearChatUser, isAdmin } from '@/lib/chatAuth';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MobileSidebar from '@/components/chat/MobileSidebar';
import ChatArea from '@/components/chat/ChatArea';
import CreateChatDialog from '@/components/chat/CreateChatDialog';
import JoinChatDialog from '@/components/chat/JoinChatDialog';
import { Button } from '@/components/ui/button';
import { Loader2, Menu } from 'lucide-react';

export default function ChatList() {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const chatUser = getChatUser();

  useEffect(() => {
    if (!chatUser) {
      navigate('/login');
    }
  }, [chatUser, navigate]);

  const { data: allRooms = [], isLoading } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => base44.entities.ChatRoom.list('-created_date', 100),
    refetchInterval: 5000,
  });

  // Filter rooms where the user is a member
  const userRooms = allRooms.filter(room =>
    room.members?.includes(chatUser?.username)
  );

  const selectedRoom = userRooms.find(r => r.id === selectedRoomId) || null;

  const handleLogout = () => {
    clearChatUser();
    navigate('/login');
  };

  if (!chatUser) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarProps = {
    chatUser,
    rooms: userRooms,
    selectedRoomId,
    onSelectRoom: (id) => { setSelectedRoomId(id); setMobileSidebarOpen(false); },
    onCreateChat: () => setCreateOpen(true),
    onJoinChat: () => setJoinOpen(true),
    onLogout: handleLogout,
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ChatSidebar {...sidebarProps} />
      </div>
      {/* Mobile sidebar */}
      <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} {...sidebarProps} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2 p-3 border-b border-border bg-card">
          <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-sm flex-1">{selectedRoom?.name || 'SecureChat'}</span>
        </div>
        <ChatArea room={selectedRoom} onRoomDeleted={() => setSelectedRoomId(null)} />
      </div>

      {isAdmin(chatUser) && (
        <CreateChatDialog
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
          }}
          adminUsername={chatUser.username}
        />
      )}
      <JoinChatDialog
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoined={() => queryClient.invalidateQueries({ queryKey: ['chatRooms'] })}
      />
    </div>
  );
}
