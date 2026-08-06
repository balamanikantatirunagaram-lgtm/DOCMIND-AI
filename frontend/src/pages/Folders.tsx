import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { Folder, FileText, ChevronRight, Plus, X, Square, CheckSquare, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  title: string;
  type?: string;
  folder?: string;
  summary?: string;
  createdAt: string;
}

export function Folders() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [serverFolders, setServerFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docRes, foldRes] = await Promise.all([
        api.get('/documents'),
        api.get('/folders')
      ]);
      setDocuments(docRes.data);
      setServerFolders(foldRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const docFolders = documents.map(d => d.folder).filter(Boolean) as string[];
  const dbFolders = serverFolders.map(f => f.name);
  const folders = Array.from(new Set([...docFolders, ...dbFolders, 'Misc'])).filter(f => f !== '');

  const toggleDoc = (id: string) => {
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsSaving(true);
    
    try {
      // 1. Create the folder in the db so it exists even if empty
      await api.post('/folders', { name: newFolderName.trim() });
      
      // 2. Assign any selected documents to this folder
      if (selectedDocIds.size > 0) {
        const docIdsArray = Array.from(selectedDocIds);
        await Promise.all(
          docIdsArray.map(id => api.patch(`/documents/${id}`, { folder: newFolderName.trim() }))
        );
      }
      
      setIsModalOpen(false);
      setNewFolderName('');
      setSelectedDocIds(new Set());
      await fetchData();
    } catch (error) {
      console.error('Failed to create folder', error);
      alert('Error creating folder');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-pixel font-bold">Folders</h1>
          <p className="text-muted text-sm mt-1">AI-organized directories and custom folders.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} /> New Folder
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <span className="font-pixel text-muted animate-pulse">Loading folders...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map(folder => {
            const docsInFolder = documents.filter(d => (d.folder || 'Misc') === folder);
            return (
              <Card key={folder} className="flex flex-col h-full hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#111] transition-all cursor-pointer bg-[#FAFAFA]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_0px_#111]">
                    <Folder size={24} className="text-yellow-700" />
                  </div>
                  <div>
                    <h3 className="font-pixel font-bold text-lg">{folder}</h3>
                    <p className="text-sm font-sans text-muted">{docsInFolder.length} items</p>
                  </div>
                </div>
                
                <div className="flex-1 bg-white border-t-2 border-border p-4 space-y-2">
                  {docsInFolder.slice(0, 3).map(doc => (
                    <div key={doc.id} className="flex items-center gap-2 text-sm font-sans truncate">
                      <FileText size={14} className="text-blue-500 shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </div>
                  ))}
                  {docsInFolder.length > 3 && (
                    <div className="text-xs font-sans text-muted mt-2">
                      + {docsInFolder.length - 3} more
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t-2 border-border flex justify-end">
                  <button 
                    className="flex items-center gap-1 font-pixel text-xs font-bold hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/documents?folder=${encodeURIComponent(folder)}`)}
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>
              </Card>
            );
          })}
          {folders.length === 0 && (
            <div className="col-span-full text-center text-muted p-12 font-pixel">
              No folders found.
            </div>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-border shadow-[8px_8px_0px_0px_#111] max-w-lg w-full flex flex-col max-h-[90vh]">
            <div className="p-4 border-b-4 border-border flex justify-between items-center bg-gray-50">
              <h2 className="font-pixel font-bold text-xl">Create New Folder</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:text-red-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 border-b-4 border-border">
              <label className="block font-sans font-bold text-sm mb-2">Folder Name</label>
              <input 
                type="text"
                className="w-full border-2 border-border p-2 font-sans focus:outline-none focus:shadow-[4px_4px_0px_0px_#111] transition-shadow"
                placeholder="e.g. Legal Documents"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
              />
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
              <label className="block font-sans font-bold text-sm mb-3">Select Files to Add</label>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div 
                    key={doc.id} 
                    onClick={() => toggleDoc(doc.id)}
                    className={`p-3 border-2 cursor-pointer transition-all flex items-start gap-3 bg-white ${
                      selectedDocIds.has(doc.id) 
                        ? 'border-border bg-blue-50 shadow-[4px_4px_0px_0px_#111]' 
                        : 'border-transparent hover:border-border hover:shadow-[2px_2px_0px_0px_#111]'
                    }`}
                  >
                    <div className="mt-0.5 text-blue-600">
                      {selectedDocIds.has(doc.id) ? <CheckSquare size={16} /> : <Square size={16} className="text-gray-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-pixel text-sm truncate font-bold">{doc.title}</p>
                      <p className="font-sans text-xs text-muted truncate">Current: {doc.folder || 'Misc'}</p>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-sm text-muted text-center py-4">No documents available.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t-4 border-border flex justify-end gap-4 bg-white">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateFolder} 
                disabled={!newFolderName.trim() || isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Folder size={16} />}
                {selectedDocIds.size > 0 ? 'Create & Move Files' : 'Create Empty Folder'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
