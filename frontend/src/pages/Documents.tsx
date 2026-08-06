import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UploadCloud, FileText, Download, Eye, Loader2, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface Entity {
  id: string;
  type: string;
  value: string;
}

interface Document {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
  entities?: Entity[];
}

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      await api.post('/documents/upload', formData);
      fetchDocuments();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload document');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-pixel font-bold">Documents</h1>
          <p className="text-muted text-sm mt-1">Manage and analyze your document repository.</p>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </Button>
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
                <th className="px-6 py-4 border-r border-border">Date Uploaded</th>
                <th className="px-6 py-4 border-r border-border">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">Loading documents...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">No documents found. Upload one to get started!</td>
                </tr>
              ) : (
                documents.map((doc, idx) => (
                  <tr key={doc.id} className={`border-b border-border hover:bg-gray-50 ${idx === documents.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 py-4 border-r border-border font-medium flex items-center gap-2">
                      <FileText size={16} className="text-blue-600" />
                      {doc.title}
                    </td>
                    <td className="px-6 py-4 border-r border-border">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 border-r border-border">
                      <span className="px-2 py-1 text-xs font-bold font-pixel border shadow-[1px_1px_0px_0px_#111] bg-green-100 text-green-800 border-green-800">
                        Ready
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-200 border border-transparent hover:border-border transition-all inline-flex">
                          <Eye size={16} />
                        </a>
                        <a href={doc.fileUrl} download className="p-1 hover:bg-gray-200 border border-transparent hover:border-border transition-all inline-flex">
                          <Download size={16} />
                        </a>
                        <button onClick={() => handleDelete(doc.id)} className="p-1 hover:bg-red-100 text-red-600 border border-transparent hover:border-red-600 transition-all inline-flex">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
