import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Send, Bot, User, Paperclip, Plus, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatHistory {
  id: string;
  updatedAt: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      loadChat(activeChatId);
    } else {
      setMessages([{ 
        id: '1', 
        role: 'assistant', 
        content: 'Hello! I am DocMind AI. You can ask me questions about your uploaded documents or upload a new one right here.' 
      }]);
    }
  }, [activeChatId]);

  const fetchChats = async () => {
    try {
      const res = await api.get('/ai/chats');
      setChats(res.data);
    } catch (err) {
      console.error('Failed to fetch chats', err);
    }
  };

  const loadChat = async (id: string) => {
    try {
      const res = await api.get(`/ai/chats/${id}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Failed to load chat', err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const content = input;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);

    try {
      const payload: any = { message: content };
      if (activeChatId) payload.chatId = activeChatId;

      const res = await api.post('/ai/chat', payload);
      
      if (!activeChatId) {
        setActiveChatId(res.data.chatId);
        fetchChats();
      }

      setMessages(prev => [...prev, { 
        id: res.data.message.id, 
        role: 'assistant', 
        content: res.data.message.content
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Error communicating with AI server. Please make sure you are logged in.'
      }]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      // Upload document first
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Inject a system message or user message representing the upload
      const systemMsg: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: `Document "${file.name}" has been uploaded successfully. How can I help you analyze it?` 
      };
      setMessages(prev => [...prev, systemMsg]);
    } catch (error) {
      alert('Failed to upload document in chat.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar for History */}
      <Card className="w-64 flex flex-col p-0 overflow-hidden shrink-0">
        <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
          <h2 className="font-pixel font-bold">History</h2>
          <button 
            onClick={() => setActiveChatId(null)}
            className="p-1 hover:bg-gray-200 border border-transparent hover:border-border transition-all"
            title="New Chat"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full text-left px-3 py-2 text-sm font-sans truncate border flex items-center gap-2 ${
                activeChatId === chat.id 
                  ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-pixel-sm' 
                  : 'border-transparent hover:bg-gray-100'
              }`}
            >
              <MessageSquare size={14} className="shrink-0" />
              Chat {new Date(chat.updatedAt).toLocaleDateString()}
            </button>
          ))}
          {chats.length === 0 && (
            <p className="text-xs text-muted text-center py-4">No recent chats.</p>
          )}
        </div>
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-pixel font-bold">Document Chat</h1>
        </div>

        <Card className="flex-1 flex flex-col p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-8 h-8 flex items-center justify-center border border-border shadow-[2px_2px_0px_0px_#111] ${
                  msg.role === 'user' ? 'bg-blue-100' : 'bg-black text-white'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] p-4 border border-border shadow-[2px_2px_0px_0px_#111] bg-white`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-card">
            <form onSubmit={handleSend} className="flex gap-4">
              <div className="relative flex-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                  title="Upload Document"
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something about your documents..."
                  className="w-full pl-10 pr-4 py-3 border border-border bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans text-sm shadow-[2px_2px_0px_0px_#111]"
                />
              </div>
              <Button type="submit" className="flex items-center gap-2 px-6">
                Send <Send size={16} />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
