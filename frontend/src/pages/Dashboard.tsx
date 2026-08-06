import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, Plus, FileText, Users, Activity, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

// Mock data will be replaced by state

export function Dashboard() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [chats, setChats] = React.useState<any[]>([]);
  const totalMessages = React.useMemo(() => {
    return chats.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0);
  }, [chats]);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [docsRes, chatsRes] = await Promise.all([
          api.get('/documents'),
          api.get('/ai/chats')
        ]);
        setDocuments(docsRes.data || []);
        setChats(chatsRes.data || []);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      }
    }
    loadData();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      await api.post('/documents/upload', formData);
      navigate('/chat');
    } catch (error) {
      alert('Failed to upload document.');
    }
  };

  // Generate chart data grouped by day for the last 7 days
  const chartData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(name => ({ name, documents: 0, aiUsage: 0 }));
    
    documents.forEach(doc => {
      const d = new Date(doc.createdAt);
      if (Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000) {
        data[d.getDay()].documents += 1;
      }
    });

    chats.forEach(chat => {
      chat.messages?.forEach((msg: any) => {
        const d = new Date(msg.createdAt);
        if (Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000) {
          data[d.getDay()].aiUsage += 1;
        }
      });
    });

    // Reorder array so today is last
    const today = new Date().getDay();
    return [...data.slice(today + 1), ...data.slice(0, today + 1)];
  }, [documents, chats]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-pixel font-bold">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Welcome back, Admin. Here's what's happening.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/documents')}>
            <Search size={16} /> Search
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <Button onClick={handleUploadClick} className="flex items-center gap-2">
            <Plus size={16} /> Upload Document
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-pixel text-muted">Total Documents</p>
              <h3 className="text-3xl font-bold mt-2">{documents.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 border border-border shadow-[2px_2px_0px_0px_#111111]">
              <FileText size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <span>All time</span>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-pixel text-muted">AI Chats</p>
              <h3 className="text-3xl font-bold mt-2">{chats.length}</h3>
            </div>
            <div className="p-3 bg-purple-100 border border-border shadow-[2px_2px_0px_0px_#111111]">
              <Activity size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <span>All time</span>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-pixel text-muted">Storage Used</p>
              <h3 className="text-3xl font-bold mt-2">{(documents.length * 0.4).toFixed(1)} MB</h3>
            </div>
            <div className="p-3 bg-orange-100 border border-border shadow-[2px_2px_0px_0px_#111111]">
              <BarChart2 size={20} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-muted font-medium">
            <span>Estimated size</span>
          </div>
          <div className="w-full bg-gray-200 h-2 mt-2 border border-border">
            <div className="bg-text h-full" style={{ width: `${Math.min(100, documents.length * 2)}%` }}></div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-pixel text-muted">Total Messages</p>
              <h3 className="text-3xl font-bold mt-2">{totalMessages}</h3>
            </div>
            <div className="p-3 bg-green-100 border border-border shadow-[2px_2px_0px_0px_#111111]">
              <Users size={20} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <span>Across all chats</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-pixel font-bold">Activity Overview (Last 7 Days)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #111',
                    boxShadow: '4px 4px 0px 0px #111',
                    borderRadius: '0px',
                    fontFamily: 'monospace'
                  }} 
                />
                <Area type="step" dataKey="documents" stroke="#111" fill="#f3f4f6" strokeWidth={2} />
                <Area type="step" dataKey="aiUsage" stroke="#2563eb" fill="#eff6ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Documents */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-pixel font-bold">Recent Uploads</h3>
            <button onClick={() => navigate('/documents')} className="text-xs font-bold underline hover:text-blue-600">View All</button>
          </div>
          <div className="space-y-4">
            {documents.slice(0, 4).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border border-border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-gray-100 border border-border shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold truncate">{doc.title}</p>
                    <p className="text-xs text-muted font-mono mt-1">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-sm text-muted text-center py-8">No documents uploaded yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
