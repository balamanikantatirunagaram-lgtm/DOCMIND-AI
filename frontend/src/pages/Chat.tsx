import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Send, Bot, User, Paperclip, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatHistory {
  id: string;
  title?: string;
  updatedAt: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
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
    if (!input.trim() || isThinking) return;

    const content = input;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

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
    } finally {
      setIsThinking(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    setIsThinking(true);
    try {
      await api.post('/documents/upload', formData);
      
      const systemMsg: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: `Document "${file.name}" has been uploaded successfully. How can I help you analyze it?` 
      };
      setMessages(prev => [...prev, systemMsg]);
    } catch (error) {
      alert('Failed to upload document in chat.');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-6">
      {/* Sidebar for History */}
      <Card className="w-64 flex flex-col p-0 overflow-hidden shrink-0">
        <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
          <h2 className="font-pixel font-bold">History</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveChatId(null)}
              className="p-1 hover:bg-gray-200 border border-transparent hover:border-border transition-all"
              title="New Chat"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map(chat => (
            <div key={chat.id} className="relative group">
              <button
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left px-3 py-2 text-sm font-sans border flex items-center gap-2 pr-8 ${
                  activeChatId === chat.id 
                    ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-[2px_2px_0px_0px_#111]' 
                    : 'border-transparent hover:bg-gray-100'
                }`}
              >
                <MessageSquare size={14} className="shrink-0" />
                <span className="truncate flex-1 min-w-0">
                  {chat.title || `Chat ${new Date(chat.updatedAt).toLocaleDateString()}`}
                </span>
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if(confirm('Are you sure you want to delete this chat?')) {
                    try {
                      await api.delete(`/ai/chats/${chat.id}`);
                      if (activeChatId === chat.id) setActiveChatId(null);
                      fetchChats();
                    } catch (error) {
                      alert('Failed to delete chat.');
                    }
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:bg-red-50 hidden group-hover:block border border-transparent hover:border-red-200 transition-all bg-white"
                title="Delete Chat"
              >
                ✕
              </button>
            </div>
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
                  <ReactMarkdown className="prose prose-sm max-w-none prose-p:leading-snug prose-pre:bg-gray-100 prose-pre:text-gray-900 font-sans">
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 flex items-center justify-center border border-border shadow-[2px_2px_0px_0px_#111] bg-black text-white">
                  <Bot size={16} />
                </div>
                <div className="p-4 border border-border shadow-[2px_2px_0px_0px_#111] bg-white flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-muted" />
                  <span className="text-sm text-muted font-pixel">AI is analyzing...</span>
                </div>
              </div>
            )}
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors disabled:opacity-50"
                  title="Upload Document"
                  disabled={isThinking}
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something about your documents..."
                  disabled={isThinking}
                  className="w-full pl-10 pr-4 py-3 border border-border bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans text-sm shadow-[2px_2px_0px_0px_#111] disabled:opacity-50"
                />
              </div>
              <Button type="submit" disabled={isThinking} className="flex items-center gap-2 px-6">
                Send <Send size={16} />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
