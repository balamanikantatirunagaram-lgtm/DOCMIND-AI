import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Loader2 } from 'lucide-react';

export function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await api.get('/documents/graph');
        setGraphData(response.data);
      } catch (error) {
        console.error('Failed to fetch graph data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGraph();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-full h-[calc(100vh-9rem)]">
      <div>
        <h1 className="text-3xl font-bold font-pixel mb-2">Knowledge Graph</h1>
        <p className="text-muted">A visual map connecting documents and extracted entities across your organization.</p>
      </div>

      <Card className="flex-1 p-0 overflow-hidden relative" ref={containerRef}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-sm font-pixel text-gray-500">Mapping Entity Relationships...</p>
            </div>
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <p className="text-gray-500 font-sans">No data available to build graph.</p>
          </div>
        ) : (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="name"
            nodeRelSize={6}
            linkColor={() => '#111111'}
            linkWidth={1.5}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name;
              const isDocument = node.type === 'Document';
              
              const fontSize = isDocument ? 12 / globalScale : 10 / globalScale;
              ctx.font = `bold ${fontSize}px "Space Mono", monospace`;
              const textWidth = ctx.measureText(label).width;
              const bgDimensions = [textWidth + 8, fontSize + 8]; // width, height

              // Background box
              ctx.fillStyle = isDocument ? '#1e40af' : '#f97316'; // Blue for docs, Orange for entities
              ctx.fillRect(node.x - bgDimensions[0] / 2, node.y - bgDimensions[1] / 2, bgDimensions[0], bgDimensions[1]);

              // Border
              ctx.strokeStyle = '#111111';
              ctx.lineWidth = 1.5 / globalScale;
              ctx.strokeRect(node.x - bgDimensions[0] / 2, node.y - bgDimensions[1] / 2, bgDimensions[0], bgDimensions[1]);

              // Shadow
              ctx.fillStyle = '#111111';
              ctx.fillRect(node.x - bgDimensions[0] / 2 + 2, node.y - bgDimensions[1] / 2 + 2, bgDimensions[0], bgDimensions[1]);
              
              // Redraw background box over shadow
              ctx.fillStyle = isDocument ? '#eff6ff' : '#fff7ed'; // Light backgrounds
              ctx.fillRect(node.x - bgDimensions[0] / 2, node.y - bgDimensions[1] / 2, bgDimensions[0], bgDimensions[1]);
              ctx.strokeRect(node.x - bgDimensions[0] / 2, node.y - bgDimensions[1] / 2, bgDimensions[0], bgDimensions[1]);

              // Text
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#111111';
              ctx.fillText(label, node.x, node.y);
            }}
          />
        )}
      </Card>
    </div>
  );
}
