import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  RefreshCw,
  Search,
  Download,
  Info,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Loader2,
  Layers,
  X,
  FileText
} from 'lucide-react';

export const InteractiveMindMap = ({
  document,
  onAskAIAboutConcept
}) => {
  const [mindMap, setMindMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('mindmap');
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [nodePositions, setNodePositions] = useState({});

  const containerRef = useRef(null);

  const visualTypes = [
    { id: 'mindmap', label: 'Mind Map' },
    { id: 'conceptmap', label: 'Concept Map' },
    { id: 'tree', label: 'Tree Diagram' },
    { id: 'flowchart', label: 'Flowchart' },
    { id: 'process', label: 'Process Diagram' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'comparison', label: 'Comparison' },
    { id: 'chaptermap', label: 'Chapter Map' },
    { id: 'knowledgegraph', label: 'Knowledge Graph' }
  ];

  const fetchGraph = async (typeToFetch, regenerate = false) => {
    if (!document) return;
    setLoading(true);
    try {
      const res = await api.getMindMap(document.id || document._id, typeToFetch || selectedType, regenerate);
      setMindMap(res.mindMap);
      
      // Initialize position state
      const posMap = {};
      (res.mindMap.nodes || []).forEach((n) => {
        posMap[n.id] = { ...n.position };
      });
      setNodePositions(posMap);

      // Default select root node
      if (res.mindMap.nodes && res.mindMap.nodes.length > 0) {
        setSelectedNode(res.mindMap.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load mind map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph(selectedType, false);
  }, [document, selectedType]);

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.45));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Canvas Panning
  const handleMouseDown = (e) => {
    // Only pan if not clicking directly on a node
    if (e.target.closest('.interactive-node')) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDraggingCanvas) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (draggedNodeId) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - pan.x) / zoom;
      const newY = (e.clientY - rect.top - pan.y) / zoom;

      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: { x: Math.round(newX), y: Math.round(newY) }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNodeId(null);
  };

  // Node Dragging
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
  };

  // SVG / PNG Export
  const handleExportGraph = (format) => {
    if (!mindMap) return;
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mindMap, null, 2));
      const downloadAnchor = window.document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `NexoraAI_${selectedType}_${document?.originalName || 'map'}.json`);
      window.document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      alert(`Exporting ${selectedType.toUpperCase()} as vector diagram. Check download directory.`);
    }
  };

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400">
        <Share2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Please select a document from your dashboard to view its visual mind map.</p>
      </div>
    );
  }

  const filteredNodes = (mindMap?.nodes || []).filter((n) =>
    searchQuery ? n.label.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
            <Share2 className="w-3.5 h-3.5" />
            Interactive Knowledge Topologies
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Visual Knowledge Map
          </h2>
        </div>

        {/* 9 Topology Mode Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {visualTypes.slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === t.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
          >
            {visualTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Regenerate Button */}
          <button
            onClick={() => fetchGraph(selectedType, true)}
            title="Regenerate layout"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas + Side Panel Layout */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Canvas Area */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 rounded-3xl bg-slate-950 border border-slate-800 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Floating Canvas Controls (Zoom, Reset, Search) */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-xl p-1.5 shadow-xl">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500 w-36"
              />
            </div>

            <button
              onClick={() => handleExportGraph('json')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm z-30">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-2" />
              <span className="text-xs font-bold text-white">Synthesizing {selectedType}...</span>
            </div>
          ) : (
            /* Graph Surface with Zoom & Pan */
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isDraggingCanvas || draggedNodeId ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              {/* SVG Edges */}
              <svg className="absolute inset-0 w-[2000px] h-[2000px] pointer-events-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
                  </marker>
                </defs>
                {(mindMap?.edges || []).map((edge) => {
                  const sourcePos = nodePositions[edge.source];
                  const targetPos = nodePositions[edge.target];
                  if (!sourcePos || !targetPos) return null;

                  const sx = sourcePos.x + 85;
                  const sy = sourcePos.y + 25;
                  const tx = targetPos.x + 85;
                  const ty = targetPos.y + 25;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={sx}
                        y1={sy}
                        x2={tx}
                        y2={ty}
                        stroke={edge.isInferred ? '#a855f7' : '#4f46e5'}
                        strokeWidth="2"
                        strokeDasharray={edge.isInferred ? '4 4' : 'none'}
                        opacity="0.65"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* HTML Nodes */}
              {(mindMap?.nodes || []).map((node) => {
                const pos = nodePositions[node.id] || { x: 100, y: 100 };
                const isSelected = selectedNode?.id === node.id;
                const isRoot = node.id === 'node-root' || node.category === 'root';
                const isMatch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());

                return (
                  <div
                    key={node.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                    style={{
                      transform: `translate(${pos.x}px, ${pos.y}px)`,
                      width: 170
                    }}
                    className={`interactive-node absolute p-3 rounded-2xl border backdrop-blur-md cursor-pointer transition-shadow ${
                      isRoot
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-400/50'
                        : isSelected
                        ? 'bg-teal-600/30 border-teal-400 text-white shadow-xl shadow-teal-500/25 ring-2 ring-teal-400/60'
                        : isMatch
                        ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-75 truncate">
                        {node.category}
                      </span>
                      {node.isInferred && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                          AI Inferred
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold truncate">{node.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Node Details Slide-Over Panel */}
        {selectedNode && (
          <div className="w-80 sm:w-96 rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-2xl shrink-0 overflow-y-auto">
            <div>
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                    {selectedNode.category} Node
                  </span>
                  <h3 className="text-lg font-black text-white leading-snug">
                    {selectedNode.label}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedNode.isInferred && (
                <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  AI Inferred Relationship
                </div>
              )}

              {/* Simple & Detailed Explanations */}
              <div className="space-y-4 text-xs text-slate-300 mb-6">
                <div>
                  <span className="font-bold text-slate-400 block mb-1">Overview:</span>
                  <p className="leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {selectedNode.simpleExplanation}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-400 block mb-1">Detailed Context:</span>
                  <p className="leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-slate-400">
                    {selectedNode.detailedExplanation}
                  </p>
                </div>

                {/* Source Citation */}
                {selectedNode.source && (
                  <div>
                    <span className="font-bold text-cyan-400 block mb-1">Source Grounding:</span>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <p className="font-semibold text-white truncate">{selectedNode.source.documentName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Page {selectedNode.source.page} • Section: {selectedNode.source.section}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* "Ask AI About This" Action Button */}
            <button
              onClick={() => {
                if (onAskAIAboutConcept) {
                  onAskAIAboutConcept(selectedNode.label);
                }
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-teal-500/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Ask AI About "{selectedNode.label}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
