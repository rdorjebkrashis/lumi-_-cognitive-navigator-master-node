import React, { useState, useMemo, useEffect } from 'react';
import { StarNode, ConstellationEdge } from '../types';

// Typewriter hook for retro effect
const useTypewriter = (text: string, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    if (!text) return;

    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return displayedText;
};

interface AlayaStarMapViewProps {
  nodes: StarNode[];
  edges: ConstellationEdge[];
  width?: number;
  height?: number;
  onClose?: () => void;
}

export const AlayaStarMapView: React.FC<AlayaStarMapViewProps> = ({ 
  nodes, 
  edges, 
  width = window.innerWidth, 
  height = window.innerHeight,
  onClose
}) => {
  const [hoveredNode, setHoveredNode] = useState<StarNode | null>(null);

  const typedTheme = useTypewriter(hoveredNode?.theme || '', 20);
  const typedInsight = useTypewriter(hoveredNode?.insight || '', 15);

  // [FIRST PRINCIPLE: PERSPECTIVE PROJECTION]
  const FOCAL_LENGTH = 300;
  const SCALE = 400;
  const CENTER_X = width / 2;
  const CENTER_Y = height / 2;

  // Calculate 2D coordinates with depth mapping
  const projectedNodes = useMemo(() => {
    return nodes.map(node => {
      // Ensure z doesn't cause division by zero or negative flip if too close
      const coords = node.coordinates || { x: 0, y: 0, z: 0 };
      const z = coords.z || 0;
      const adjustedZ = Math.max(z + FOCAL_LENGTH, 1); 
      
      const x2d = ((coords.x || 0) / adjustedZ) * SCALE + CENTER_X;
      const y2d = ((coords.y || 0) / adjustedZ) * SCALE + CENTER_Y;
      
      // Depth mapping for opacity and size
      const depthRatio = FOCAL_LENGTH / adjustedZ;
      const opacity = Math.max(0.15, Math.min(1, depthRatio));
      const scale = Math.max(0.4, Math.min(2.5, depthRatio));

      return {
        ...node,
        x2d,
        y2d,
        opacity,
        scale
      };
    });
  }, [nodes, width, height]);

  const getNodeSymbol = (mass: number) => {
    if (mass > 7) return '@';
    if (mass > 4) return 'O';
    if (mass > 2) return 'o';
    return '.';
  };

  const getNodeColor = (entropy: number) => {
    return entropy < 0.4 ? '#10B981' : '#F59E0B'; // Emerald for low entropy, Amber for high
  };

  return (
    <div 
      className="absolute inset-0 bg-[#050505] overflow-hidden z-50 flex items-center justify-center"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white z-50 text-xs tracking-widest uppercase border border-white/20 px-4 py-2 hover:bg-white/10"
        >
          [RETURN_TO_TERMINAL]
        </button>
      )}

      {/* SVG Edges Layer (Constellation Edges) */}
      <svg className="absolute inset-0 pointer-events-none w-full h-full">
        {edges.map((edge, idx) => {
          const source = projectedNodes.find(n => n.id === edge.source_id);
          const target = projectedNodes.find(n => n.id === edge.target_id);
          
          if (!source || !target) return null;

          const isStrong = edge.resonance_strength > 0.7;
          
          return (
            <line 
              key={idx}
              x1={source.x2d}
              y1={source.y2d}
              x2={target.x2d}
              y2={target.y2d}
              stroke={isStrong ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}
              strokeWidth={isStrong ? 2 : 1}
              strokeDasharray={isStrong ? 'none' : '4 4'}
            />
          );
        })}
      </svg>

      {/* HTML Nodes Layer (Terminal Nodes) */}
      {projectedNodes.map(node => (
        <span
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair hover:scale-150 hover:z-50"
          style={{
            left: node.x2d,
            top: node.y2d,
            opacity: node.opacity,
            transform: `translate(-50%, -50%) scale(${node.scale})`,
            color: getNodeColor(node.entropy || 0),
            textShadow: (node.crystalline_index || 0) >= 1.0 ? `0 0 10px ${getNodeColor(node.entropy || 0)}` : 'none'
          }}
          onMouseEnter={() => setHoveredNode(node)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {getNodeSymbol(node.mass || 1)}
        </span>
      ))}

      {/* Hover Info Panel (Typewriter Effect Simulation) */}
      {hoveredNode && (
        <div className="absolute bottom-8 left-8 max-w-md bg-black/90 border border-white/30 p-6 text-xs text-white/80 pointer-events-none z-40 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          <div className="text-[#10B981] mb-3 font-bold tracking-widest uppercase border-b border-white/20 pb-2">
            NODE_ID: {hoveredNode.id}
          </div>
          <div className="mb-2 leading-relaxed min-h-[1.5rem]">
            <span className="opacity-50">THEME:</span> {typedTheme}
            <span className="animate-pulse opacity-50">_</span>
          </div>
          <div className="mb-4 leading-relaxed min-h-[3rem]">
            <span className="opacity-50">INSIGHT:</span> {typedInsight}
            <span className="animate-pulse opacity-50">_</span>
          </div>
          <div className="grid grid-cols-2 gap-3 opacity-60 text-[10px] uppercase tracking-widest border-t border-white/10 pt-3">
            <div>MASS: {hoveredNode.mass || 1}</div>
            <div>ENTROPY: {(hoveredNode.entropy || 0).toFixed(2)}</div>
            <div>COORD: ({hoveredNode.coordinates?.x || 0}, {hoveredNode.coordinates?.y || 0}, {hoveredNode.coordinates?.z || 0})</div>
            <div>CRYSTAL: {(hoveredNode.crystalline_index || 0) >= 1.0 ? 'STABLE' : 'FLICKERING'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
