import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, CheckSquare, Square, BrainCircuit } from 'lucide-react';

export function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] } | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDocsLoading, setIsDocsLoading] = useState(true);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get('/documents');
        setDocuments(res.data);
      } catch (err) {
        console.error('Failed to fetch documents for graph', err);
      } finally {
        setIsDocsLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (graphData && fgRef.current) {
      // Tweak physics to prevent label overlapping
      fgRef.current.d3Force('charge').strength(-1500);
      fgRef.current.d3Force('link').distance(250);
    }
  }, [graphData]);

  const toggleDoc = (id: string) => {
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerateGraph = async () => {
    if (selectedDocIds.size === 0) return;
    
    setIsLoading(true);
    setGraphData(null);
    try {
      const response = await api.post('/documents/graph/ai', {
        documentIds: Array.from(selectedDocIds)
      });
      setGraphData(response.data);
    } catch (error) {
      console.error('Failed to generate AI graph data', error);
      alert('Failed to generate graph. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-9rem)] w-full">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold font-pixel mb-2">AI Knowledge Graph</h1>
        <p className="text-muted">Select specific documents and our AI will analyze their deep connections and shared concepts.</p>
      </div>

      <div className="flex flex-1 min-h-0 gap-6">
        
        {/* Document Selection Sidebar */}
        <Card className="w-80 flex flex-col p-0 shrink-0">
          <div className="p-4 border-b-4 border-border bg-gray-50 flex justify-between items-center shrink-0">
            <h2 className="font-pixel font-bold">Select Documents</h2>
            <span className="text-xs font-sans font-bold bg-blue-100 text-blue-800 px-2 py-1 border-2 border-border shadow-[2px_2px_0px_0px_#111]">
              {selectedDocIds.size} Selected
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isDocsLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted" /></div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted font-sans text-center">No documents available.</p>
            ) : (
              documents.map(doc => (
                <div 
                  key={doc.id} 
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-3 border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    selectedDocIds.has(doc.id) 
                      ? 'border-border bg-blue-50 shadow-[4px_4px_0px_0px_#111]' 
                      : 'border-transparent hover:border-border hover:shadow-[2px_2px_0px_0px_#111] bg-white'
                  }`}
                >
                  <div className="mt-0.5 text-blue-600">
                    {selectedDocIds.has(doc.id) ? <CheckSquare size={16} /> : <Square size={16} className="text-gray-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-pixel text-sm truncate font-bold">{doc.title}</p>
                    <p className="font-sans text-xs text-muted truncate">{doc.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t-4 border-border bg-white shrink-0">
            <Button 
              onClick={handleGenerateGraph}
              disabled={selectedDocIds.size === 0 || isLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
              Analyze with AI
            </Button>
          </div>
        </Card>

        {/* Graph Area */}
        <Card className="flex-1 p-0 overflow-hidden relative min-h-0 bg-white" ref={containerRef}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-6 p-8 bg-white border-4 border-border shadow-[8px_8px_0px_0px_#111] max-w-sm text-center">
                <BrainCircuit className="animate-pulse text-blue-600" size={48} />
                <div>
                  <h3 className="font-pixel font-bold text-lg mb-2">AI is Thinking...</h3>
                  <p className="text-sm font-sans text-gray-600">Analyzing documents, cross-referencing entities, and discovering hidden relationships.</p>
                </div>
              </div>
            </div>
          ) : !graphData ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 border-4 border-transparent p-6 text-center">
              <BrainCircuit size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 font-pixel font-bold text-lg mb-2">No Graph Generated</p>
              <p className="text-gray-400 font-sans max-w-md">Select documents from the sidebar and click "Analyze with AI" to generate a relationship graph.</p>
            </div>
          ) : graphData.nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <p className="text-gray-500 font-pixel">AI could not find any relationships.</p>
            </div>
          ) : (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeLabel="name"
              nodeRelSize={6}
              linkColor={() => '#111111'}
              linkWidth={2}
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              onNodeDragEnd={node => {
                node.fx = node.x;
                node.fy = node.y;
              }}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name || 'Unknown';
                const isDocument = node.type === 'Document';
                
                const fontSize = isDocument ? 14 / globalScale : 11 / globalScale;
                ctx.font = `bold ${fontSize}px "Space Mono", monospace`;
                const textWidth = ctx.measureText(label).width;
                const bgDimensions = [textWidth + 12, fontSize + 12]; 

                ctx.fillStyle = isDocument ? '#1e40af' : '#f97316'; 
                ctx.fillRect(node.x - bgDimensions[0] / 2, node.y - bgDimensions[1] / 2, bgDimensions[0], bgDimensions[1]);

                ctx.strokeStyle = '#111111';
                ctx.lineWidth = 2 / globalScale;
                ctx.strokeRect(node.x - bgDimensions[0] / 2, node.y - bgDimensions[1] / 2, bgDimensions[0], bgDimensions[1]);

                ctx.fillStyle = '#111111';
                ctx.fillRect(node.x - bgDimensions[0] / 2 + (3/globalScale), node.y - bgDimensions[1] / 2 + (3/globalScale), bgDimensions[0], bgDimensions[1]);
                
                ctx.fillStyle = isDocument ? '#eff6ff' : '#fff7ed'; 
                ctx.fillRect(node.x - bgDimensions[0] / 2, node.y - bgDimensions[1] / 2, bgDimensions[0], bgDimensions[1]);
                ctx.strokeRect(node.x - bgDimensions[0] / 2, node.y - bgDimensions[1] / 2, bgDimensions[0], bgDimensions[1]);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#111111';
                ctx.fillText(label, node.x, node.y);
              }}
              linkLabel="label"
              linkCanvasObjectMode={() => 'after'}
              linkCanvasObject={(link: any, ctx, globalScale) => {
                const MAX_FONT_SIZE = 4;
                const LABEL_NODE_MARGIN = 12;
                
                const start = link.source;
                const end = link.target;
                
                if (typeof start !== 'object' || typeof end !== 'object') return;

                const textPos = Object.assign(
                  {...start}, 
                  { x: start.x + (end.x - start.x) / 2, y: start.y + (end.y - start.y) / 2 }
                );

                const relLink = { x: end.x - start.x, y: end.y - start.y };
                let textAngle = Math.atan2(relLink.y, relLink.x);
                if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
                if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);
                
                const label = link.label;
                const fontSize = 10 / globalScale;
                ctx.font = `bold ${fontSize}px "Space Mono", monospace`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth + 4, fontSize + 4];

                ctx.save();
                ctx.translate(textPos.x, textPos.y);
                ctx.rotate(textAngle);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(- bckgDimensions[0] / 2, - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                ctx.strokeStyle = '#111111';
                ctx.lineWidth = 1 / globalScale;
                ctx.strokeRect(- bckgDimensions[0] / 2, - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#111111';
                ctx.fillText(label, 0, 0);
                ctx.restore();
              }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
