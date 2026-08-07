import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { Loader2, FileText, CheckSquare, Square, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useRef } from 'react';

export function AIReport() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await api.get('/documents');
      setDocuments(res.data);
      // Select all by default
      setSelectedIds(new Set(res.data.map((d: any) => d.id)));
    } catch (e) {
      console.error('Failed to fetch documents', e);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleToggleDoc = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleGenerate = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one document.');
      return;
    }
    
    setIsGenerating(true);
    setReportContent(null);
    try {
      const res = await api.post('/ai/report', {
        documentIds: Array.from(selectedIds)
      });
      setReportContent(res.data.report);
    } catch (e) {
      alert('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    
    const opt = {
      margin:       10,
      filename:     'AI-Executive-Report.pdf',
      image:        { type: 'jpeg' as 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
    };
    
    html2pdf().set(opt).from(reportRef.current).save();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-pixel font-bold">Custom AI Report</h1>
          <p className="text-muted text-sm mt-1">Select documents to generate an executive brief in under 30s.</p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || selectedIds.size === 0} 
          variant="primary" 
          className="flex items-center gap-2"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {isGenerating ? 'Generating...' : `Generate Report (${selectedIds.size} selected)`}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 max-h-[70vh] overflow-y-auto">
          <h3 className="font-pixel font-bold mb-4 border-b-2 border-border pb-2">Select Documents</h3>
          {loadingDocs ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : documents.length === 0 ? (
            <div className="text-center p-6 text-muted text-sm border-2 border-dashed border-border">
              <FileText className="mx-auto mb-2 opacity-50" size={24} />
              No documents found. Please upload documents first.
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full text-xs py-1 mb-2"
                onClick={() => setSelectedIds(selectedIds.size === documents.length ? new Set() : new Set(documents.map(d => d.id)))}
              >
                {selectedIds.size === documents.length ? 'Deselect All' : 'Select All'}
              </Button>
              {documents.map(doc => (
                <div 
                  key={doc.id} 
                  onClick={() => handleToggleDoc(doc.id)}
                  className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-colors ${
                    selectedIds.has(doc.id) ? 'border-blue-600 bg-blue-50' : 'border-border hover:bg-gray-50'
                  }`}
                >
                  <div className="text-blue-600">
                    {selectedIds.has(doc.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{doc.title}</p>
                    <p className="text-xs text-muted truncate">{doc.type || 'Unknown Type'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2 min-h-[50vh] flex flex-col relative">
          {reportContent && (
            <div className="absolute top-4 right-4 z-10">
              <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
                <Download size={16} /> Download PDF
              </Button>
            </div>
          )}
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
              <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
              <p className="font-pixel font-bold animate-pulse">AI is reading selected documents...</p>
              <p className="text-sm mt-2">This usually takes less than 30 seconds.</p>
            </div>
          ) : reportContent ? (
            <div className="prose max-w-none prose-sm sm:prose-base font-sans leading-relaxed pt-12" ref={reportRef}>
              <ReactMarkdown>{reportContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <FileText size={48} className="mb-4 opacity-50" />
              <p className="font-pixel font-bold text-center">No report generated yet</p>
              <p className="text-sm text-center mt-2 max-w-sm">Select the documents you want to include on the left, then click Generate to create a custom executive brief.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
