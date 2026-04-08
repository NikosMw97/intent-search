'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  provider: { name: string; logo: string };
  offer: { name: string; price: number };
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ProviderChatModal({ provider, offer, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm from ${provider.name}. I see you're interested in ${offer.name} at €${offer.price}. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    // Add empty assistant message to stream into
    setMessages([...newMessages, { role: 'assistant', content: '' }]);

    try {
      // Anthropic requires conversations to start with a user message.
      // Skip the synthetic greeting (first assistant message) before sending.
      const apiMessages = newMessages.filter((_, i) => !(i === 0 && newMessages[0].role === 'assistant'));

      const res = await fetch('/api/provider-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerName: provider.name,
          providerLogo: provider.logo,
          offerName: offer.name,
          offerPrice: offer.price,
          messages: apiMessages,
        }),
      });

      const { text } = await res.json() as { text: string };
      setMessages([...newMessages, { role: 'assistant', content: text }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md h-[90vh] sm:h-[560px] flex flex-col rounded-t-2xl sm:rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black/60 overflow-hidden animate-slide-in-up">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/25 flex items-center justify-center text-lg">
              {provider.logo}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{provider.name}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-xs text-white/40">Sales representative</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Offer context banner */}
        <div className="px-4 py-2 bg-purple-500/8 border-b border-purple-500/15 flex-shrink-0">
          <p className="text-xs text-purple-300/70">
            Discussing: <span className="font-medium text-purple-300">{offer.name}</span>
            <span className="text-white/30 mx-1">·</span>
            <span className="font-semibold text-white">€{offer.price.toLocaleString()}</span>
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-sm flex-shrink-0 mb-0.5">
                  {provider.logo}
                </div>
              )}
              <div
                className={`max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600/80 rounded-2xl rounded-tr-sm text-white'
                    : 'bg-white/8 rounded-2xl rounded-tl-sm text-white/85'
                }`}
              >
                {msg.content || (
                  <span className="text-white/30 italic text-xs">…</span>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && messages[messages.length - 1]?.content === '' && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-sm flex-shrink-0">
                {provider.logo}
              </div>
              <div className="px-3.5 py-3 bg-white/8 rounded-2xl rounded-tl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this offer…"
              disabled={isTyping}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center"
            >
              ↑
            </button>
          </div>
          <p className="text-xs text-white/20 text-center mt-2">
            You can negotiate — up to 10% discount possible
          </p>
        </div>
      </div>
    </div>
  );
}
