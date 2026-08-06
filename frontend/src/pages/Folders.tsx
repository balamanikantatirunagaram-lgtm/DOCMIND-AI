import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { api } from '../services/api';
import { Folder, FileText, ChevronRight } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setIsLoading(false);
    }
  };

  const folders = Array.from(new Set(documents.map(d => d.folder || 'Misc')));

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-pixel font-bold">Folders</h1>
        <p className="text-muted text-sm mt-1">AI-organized directories based on document content.</p>
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
    </div>
  );
}
