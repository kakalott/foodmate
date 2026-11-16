import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={['flex items-end gap-2 mb-3', isUser ? 'flex-row-reverse' : ''].join(' ')}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-fm-primary flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed size={15} className="text-fm-text" />
        </div>
      )}

      <div className={['max-w-[75%] flex flex-col', isUser ? 'items-end' : 'items-start'].join(' ')}>
        <div
          className={[
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-fm-primary text-fm-text rounded-br-sm'
              : 'bg-white border border-gray-100 shadow-soft text-fm-text rounded-bl-sm',
          ].join(' ')}
        >
          {message.content}
        </div>
        <span className="text-xs text-fm-text/40 mt-1 px-1">
          {format(new Date(message.created_at), 'HH:mm', { locale: vi })}
        </span>
      </div>
    </div>
  );
};
