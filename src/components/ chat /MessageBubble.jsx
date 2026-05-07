import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function MessageBubble({ message, isOwn, isAdmin }) {
  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center py-1">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2 max-w-[75%]', isOwn ? 'ml-auto flex-row-reverse' : '')}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-xs font-bold text-accent-foreground mt-auto">
          {message.sender_username?.[0]?.toUpperCase()}
        </div>
      )}
      <div>
        {!isOwn && (
          <p className="text-xs text-muted-foreground mb-1 ml-1 flex items-center gap-1 flex-wrap">
            <span className="font-medium text-foreground">
              {message.sender_display_name || message.sender_username}
            </span>
            {message.sender_display_name && (
              <span className="text-muted-foreground/70">@{message.sender_username}</span>
            )}
            {message.sender_username === 'Gregory.D' && (
              <span className="text-primary font-medium">· Admin</span>
            )}
          </p>
        )}
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-card border border-border rounded-bl-md'
          )}
        >
          {message.content}
        </div>
        <p className={cn(
          'text-[10px] text-muted-foreground mt-1',
          isOwn ? 'text-right mr-1' : 'ml-1'
        )}>
          {message.created_date ? format(new Date(message.created_date), 'HH:mm') : ''}
        </p>
      </div>
    </div>
  );
}
