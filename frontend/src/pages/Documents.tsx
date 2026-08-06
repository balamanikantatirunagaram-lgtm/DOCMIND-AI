import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, Plus, Filter, FileText, Download, ChevronDown, ChevronRight, UploadCloud, Loader2, Star, Eye, Trash2, Folder } from 'lucide-react';
import React from 'react';
import { api } from '../services/api';

import { EditEntitiesModal } from '../components/EditEntitiesModal';

interface Entity {
  id: string;
  type: string;
  value: string;
  confidence: number;
}

interface Document {
  id: string;
  title: string;
  fileUrl: string;
  type?: string;
  folder?: string;
  summary?: string;
  isStarred?: boolean;
  createdAt: string;
  entities?: Entity[];
}

export function Documents({ view = 'list' }: { view?: 'list' | 'folders' }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);

    try {
      // Process files in sequence to not overwhelm the backend AI logic
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        await api.post('/documents/upload', formData);
      }
      fetchDocuments();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload some documents');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(docs => docs.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete document');
    }
  };

  const handleToggleStar = async (id: string, currentStatus: boolean) => {
    try {
      const response = await api.patch(`/documents/${id}`, { isStarred: !currentStatus });
      setDocuments(docs => docs.map(doc => doc.id === id ? { ...doc, isStarred: !currentStatus } : doc));
    } catch (error) {
      console.error('Toggle star failed', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Document ID', 'Title', 'Date Uploaded', 'Entity Type', 'Entity Value'];
    const rows: string[][] = [];

    documents.forEach(doc => {
      const baseRow = [doc.id, doc.title, new Date(doc.createdAt).toLocaleDateString()];
      if (doc.entities && doc.entities.length > 0) {
        doc.entities.forEach(ent => {
          rows.push([...baseRow, ent.type, ent.value]);
        });
      } else {
        rows.push([...baseRow, '', '']);
      }
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'documents_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFolder = queryParams.get('folder') || 'All';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterFolder, setFilterFolder] = useState(initialFolder);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  useEffect(() => {
    const currentParam = new URLSearchParams(location.search).get('folder');
    if (currentParam) {
      setFilterFolder(currentParam);
    }
  }, [location.search]);

  const uniqueTypes = Array.from(new Set(documents.map(d => d.type).filter(Boolean))) as string[];
  const uniqueFolders = Array.from(new Set(documents.map(d => d.folder || 'Misc'))) as string[];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (doc.summary && doc.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'All' || doc.type === filterType;
    const matchesFolder = filterFolder === 'All' || (doc.folder || 'Misc') === filterFolder;
    return matchesSearch && matchesType && matchesFolder;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-pixel font-bold">Documents</h1>
          <p className="text-muted text-sm mt-1">Manage and analyze your document repository.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <select 
            value={filterFolder}
            onChange={(e) => setFilterFolder(e.target.value)}
            className="px-4 py-2 border-2 border-border shadow-[2px_2px_0px_0px_#111] focus:outline-none focus:ring-0 text-sm bg-white"
          >
            <option value="All">All Folders</option>
            {uniqueFolders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border-2 border-border shadow-[2px_2px_0px_0px_#111] focus:outline-none focus:ring-0 text-sm bg-white"
          >
            <option value="All">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border-2 border-border shadow-[2px_2px_0px_0px_#111] focus:outline-none focus:ring-0 text-sm w-64"
          />
          <Button onClick={handleExportCSV} className="flex items-center gap-2">
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed border-border cursor-pointer transition-colors ${
          isDragActive ? 'bg-gray-100' : 'bg-card hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {isUploading ? (
            <>
              <Loader2 size={48} className="mb-4 text-blue-600 animate-spin" />
              <h3 className="font-pixel text-lg font-bold">Uploading...</h3>
            </>
          ) : (
            <>
              <UploadCloud size={48} className="mb-4 text-text" />
              <h3 className="font-pixel text-lg font-bold">Upload Documents</h3>
              <p className="text-muted text-sm mt-2 max-w-sm">
                Drag & drop files here, or click to select files. 
              </p>
              <Button className="mt-6">Browse Files</Button>
            </>
          )}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-100 border-b border-border font-pixel">
              <tr>
                <th className="px-6 py-4 border-r border-border">Name</th>
                <th className="px-6 py-4 border-r border-border w-32">Folder</th>
                <th className="px-6 py-4 border-r border-border w-32">Type</th>
                <th className="px-6 py-4 border-r border-border w-32">Date</th>
                <th className="px-6 py-4 border-r border-border w-24">Status</th>
                <th className="px-6 py-4 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted">Loading documents...</td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted">No documents found. Upload one to get started!</td>
                </tr>
              ) : (
                filteredDocuments.map((doc, idx) => (
                  <React.Fragment key={doc.id}>
                    <tr className={`border-b border-border hover:bg-gray-50 ${idx === filteredDocuments.length - 1 && !expandedRows.has(doc.id) ? 'border-b-0' : ''}`}>
                      <td className="px-6 py-4 border-r border-border">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleRow(doc.id)} className="p-1 hover:bg-gray-200 border border-transparent hover:border-border transition-all">
                            {expandedRows.has(doc.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          <FileText size={16} className="text-blue-600 shrink-0" />
                          <p className="font-medium text-gray-900">{doc.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-border">
                        <div className="flex items-center gap-2">
                          <Folder size={14} className="text-yellow-600" />
                          <span className="font-sans text-sm text-gray-700">{doc.folder || 'Misc'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-border">
                        {doc.type ? (
                          <span className="inline-block whitespace-nowrap px-2 py-1 text-xs font-pixel font-bold bg-blue-100 text-blue-800 border border-blue-800 shadow-[2px_2px_0px_0px_rgba(30,64,175,1)]">
                            {doc.type}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 border-r border-border text-sm">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 border-r border-border">
                        {(() => {
                          const hasLowConfidence = doc.entities?.some(e => e.confidence && e.confidence < 0.8) || false;
                          let missingFields: string[] = [];
                          
                          if (doc.entities && doc.type === 'Invoice') {
                            const types = doc.entities.map(e => e.type.toLowerCase());
                            if (!types.some(t => t.includes('total') || t.includes('amount'))) missingFields.push('Total Amount');
                            if (!types.some(t => t.includes('number'))) missingFields.push('Invoice Number');
                          }

                          if (hasLowConfidence || missingFields.length > 0) {
                            return (
                              <span className="inline-block px-2 py-1 text-xs font-bold font-pixel border shadow-[1px_1px_0px_0px_#111] bg-orange-100 text-orange-800 border-orange-800 text-center leading-[1.2]" title={missingFields.length > 0 ? `Missing: ${missingFields.join(', ')}` : 'Low Confidence Items'}>
                                Need<br />Review
                              </span>
                            );
                          }
                          
                          return (
                            <span className="inline-block px-2 py-1 text-xs font-bold font-pixel border shadow-[1px_1px_0px_0px_#111] bg-green-100 text-green-800 border-green-800 text-center leading-[1.2]">
                              Ready
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleToggleStar(doc.id, !!doc.isStarred)} className={`p-1 border border-transparent transition-all inline-flex ${doc.isStarred ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}>
                            <Star size={16} fill={doc.isStarred ? "currentColor" : "none"} />
                          </button>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-200 border border-transparent hover:border-border transition-all inline-flex text-gray-600">
                            <Eye size={16} />
                          </a>
                          <a href={doc.fileUrl} download className="p-1 hover:bg-gray-200 border border-transparent hover:border-border transition-all inline-flex text-gray-600">
                            <Download size={16} />
                          </a>
                          <button onClick={() => handleDelete(doc.id)} className="p-1 hover:bg-red-100 text-red-600 border border-transparent hover:border-red-600 transition-all inline-flex">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(doc.id) && (
                      <tr className={`bg-gray-50 border-b border-border ${idx === filteredDocuments.length - 1 ? 'border-b-0' : ''}`}>
                        <td colSpan={6} className="px-6 py-4">
                          <div className="ml-8">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 font-pixel">AI Analysis</h4>
                            
                            {doc.summary ? (
                              <p className="text-sm text-gray-700 mb-4 bg-white p-3 border border-border shadow-[2px_2px_0px_0px_#111]">{doc.summary}</p>
                            ) : (
                              <p className="text-sm text-gray-400 italic mb-4">No summary available.</p>
                            )}
                            
                            {(() => {
                              let missingFields: string[] = [];
                              if (doc.entities && doc.type === 'Invoice') {
                                const types = doc.entities.map(e => e.type.toLowerCase());
                                if (!types.some(t => t.includes('total') || t.includes('amount'))) missingFields.push('Total Amount');
                                if (!types.some(t => t.includes('number'))) missingFields.push('Invoice Number');
                              }
                              return missingFields.length > 0 ? (
                                <div className="mb-4 bg-orange-50 border border-orange-500 shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] p-3">
                                  <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1 font-pixel">Missing Critical Information</h4>
                                  <p className="text-sm text-orange-900">The AI could not find the following required fields for this document type: <strong>{missingFields.join(', ')}</strong></p>
                                </div>
                              ) : null;
                            })()}

                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-pixel">Extracted Data Points</h4>
                              <Button 
                                variant="outline" 
                                className="text-xs py-1 px-2 flex items-center gap-1 h-auto"
                                onClick={() => setEditingDoc(doc)}
                              >
                                Edit Extractions
                              </Button>
                            </div>
                            
                            {doc.entities && doc.entities.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {doc.entities.map((entity, i) => (
                                  <div key={i} className={`bg-white border shadow-[2px_2px_0px_0px_#111] p-2 flex flex-col ${
                                    entity.confidence && entity.confidence < 0.8 
                                      ? 'border-orange-500' 
                                      : 'border-border'
                                  }`}>
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-bold text-blue-800 font-pixel">{entity.type}</span>
                                      {entity.confidence && (
                                        <span className={`text-[9px] font-pixel px-1 ${
                                          entity.confidence < 0.8 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                          {Math.round(entity.confidence * 100)}%
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-800 break-words">{entity.value}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No structured data found.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingDoc && (
        <EditEntitiesModal 
          document={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSave={async (newEntities) => {
            try {
              const res = await api.put(`/documents/${editingDoc.id}/entities`, { entities: newEntities });
              // Update local state
              setDocuments(docs => docs.map(d => d.id === editingDoc.id ? res.data : d));
              setEditingDoc(null);
            } catch (error) {
              console.error('Failed to save entities', error);
              alert('Failed to save entities');
            }
          }}
        />
      )}
    </div>
  );
}
