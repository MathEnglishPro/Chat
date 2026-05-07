import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import ChatSidebar from './ChatSidebar';

export default function MobileSidebar({ open, onClose, ...sidebarProps }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-72">
        <ChatSidebar {...sidebarProps} />
      </SheetContent>
    </Sheet>
  );
}
