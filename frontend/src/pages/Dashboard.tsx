import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  FileText, Upload, Zap, HardDrive, Search, Plus, 
  Activity, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', documents: 40, aiUsage: 24 },
  { name: 'Tue', documents: 30, aiUsage: 13 },
  { name: 'Wed', documents: 20, aiUsage: 98 },
  { name: 'Thu', documents: 27, aiUsage: 39 },
  { name: 'Fri', documents: 18, aiUsage: 48 },
  { name: 'Sat', documents: 23, aiUsage: 38 },
  { name: 'Sun', documents: 34, aiUsage: 43 },
];

const recentDocs = [
  { id: 1, name: 'Q3_Financial_Report.pdf', status: 'Processed', time: '10 mins ago', type: 'PDF' },
  { id: 2, name: 'Vendor_Contract_Acme.docx', status: 'Processing', time: '1 hr ago', type: 'DOCX' },
  { id: 3, name: 'Patient_Records_Batch1.zip', status: 'Failed', time: '3 hrs ago', type: 'ZIP' },
  { id: 4, name: 'Employee_Handbook_2026.pdf', status: 'Processed', time: '5 hrs ago', type: 'PDF' },
];

export function Dashboard() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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
      // Assuming api is imported from '../services/api'
      const { api } = await import('../services/api');
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Document uploaded successfully!');
    } catch (error) {
      alert('Failed to upload document.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-pixel font-bold">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Welcome back, Admin. Here's what's happening.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
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
              <h3 className="text-3xl font-bold mt-2">1,284</h3>
            </div>
            <div className="p-3 bg-blue-100 border border-border shadow-[2px_2px_0px_0px_#111111]">
              <FileText size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            <span>12% from last week</span>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-pixel text-muted">AI Queries</p>
              <h3 className="text-3xl font-bold mt-2">8,593</h3>
            </div>
            <div className="p-3 bg-purple-100 border border-border shadow-[2px_2px_0px_0px_#111111]">
              <Zap size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            <span>24% from last week</span>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-pixel text-muted">Storage Used</p>
              <h3 className="text-3xl font-bold mt-2">45.2 GB</h3>
            </div>
            <div className="p-3 bg-orange-100 border border-border shadow-[2px_2px_0px_0px_#111111]">
              <HardDrive size={20} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-muted font-medium">
            <span>45% of 100 GB</span>
          </div>
          <div className="w-full bg-gray-200 h-2 mt-2 border border-border">
            <div className="bg-text h-full" style={{ width: '45%' }}></div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-pixel text-muted">Success Rate</p>
              <h3 className="text-3xl font-bold mt-2">99.2%</h3>
            </div>
            <div className="p-3 bg-green-100 border border-border shadow-[2px_2px_0px_0px_#111111]">
              <Activity size={20} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600 font-medium">
            <ArrowDownRight size={16} className="mr-1" />
            <span>0.1% from last week</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-pixel font-bold">Activity Overview</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <button className="text-xs font-bold underline hover:text-blue-600">View All</button>
          </div>
          <div className="space-y-4">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border border-border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-gray-100 border border-border shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold truncate">{doc.name}</p>
                    <p className="text-xs text-muted font-mono mt-1">{doc.time}</p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  {doc.status === 'Processed' && <CheckCircle2 size={16} className="text-green-600" />}
                  {doc.status === 'Processing' && <Clock size={16} className="text-blue-600 animate-spin" />}
                  {doc.status === 'Failed' && <Activity size={16} className="text-red-600" />}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
