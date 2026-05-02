'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { AGENT_NODES } from './types';

interface AXLMeshProps {
  /** When set, the selected agent ENS is highlighted */
  selectedAgent: string | null;
  /** Fired when a node is clicked */
  onSelectAgent: (ens: string | null) => void;
  /** Pass latest event timestamp to trigger line pulse animation */
  latestEventTimestamp: number;
}

interface NodePos {
  x: number;
  y: number;
  ens: string;
  id: string;
}

export function AXLMeshVisualiser({ selectedAgent, onSelectAgent, latestEventTimestamp }: AXLMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NodePos[]>([]);
  const animFrameRef = useRef<number>(0);
  const pulseRef = useRef(0);
  const lastPulseTs = useRef(0);

  // Calculate node positions on a circle
  const computeNodes = useCallback((width: number, height: number): NodePos[] => {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.35;

    return AGENT_NODES.map((node, i) => {
      const angle = (i / AGENT_NODES.length) * Math.PI * 2 - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        ens: node.ens,
        id: node.id,
      };
    });
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      nodesRef.current = computeNodes(rect.width, rect.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      time += 0.008;

      // Decay pulse
      if (pulseRef.current > 0) {
        pulseRef.current = Math.max(0, pulseRef.current - 0.008);
      }

      // Draw edges (lines between all nodes)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          // Base opacity with slow oscillation
          const baseOpacity = 0.08 + 0.04 * Math.sin(time + i * 0.7 + j * 1.3);
          const pulseBoost = pulseRef.current * 0.4;
          const opacity = Math.min(1, baseOpacity + pulseBoost);

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(201, 168, 76, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Travelling dot along line when pulsing
          if (pulseRef.current > 0.05) {
            const t = (time * 2 + i + j) % 1;
            const dotX = a.x + (b.x - a.x) * t;
            const dotY = a.y + (b.y - a.y) * t;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201, 168, 76, ${pulseRef.current * 0.8})`;
            ctx.fill();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const isSelected = selectedAgent === node.ens;
        const nodeRadius = isSelected ? 8 : 6;
        const glowRadius = isSelected ? 24 : 14;

        // Glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowRadius
        );
        gradient.addColorStop(0, isSelected ? 'rgba(201, 168, 76, 0.4)' : 'rgba(201, 168, 76, 0.15)');
        gradient.addColorStop(1, 'rgba(201, 168, 76, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#c9a84c' : '#1b1c1c';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#e2c47a' : 'rgba(201, 168, 76, 0.5)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Label
        ctx.font = '600 9px "Josefin Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isSelected ? '#e2c47a' : 'rgba(208, 197, 178, 0.7)';
        const shortEns = node.ens.split('.')[0];
        ctx.fillText(shortEns.toUpperCase(), node.x, node.y + nodeRadius + 14);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [computeNodes, selectedAgent]);

  // Trigger pulse when new event arrives
  useEffect(() => {
    if (latestEventTimestamp > lastPulseTs.current) {
      pulseRef.current = 1;
      lastPulseTs.current = latestEventTimestamp;
    }
  }, [latestEventTimestamp]);

  // Click handler
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const clickedNode = nodesRef.current.find((n) => {
      const dist = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2);
      return dist < 20;
    });

    if (clickedNode) {
      onSelectAgent(clickedNode.ens === selectedAgent ? null : clickedNode.ens);
    } else {
      onSelectAgent(null);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="w-full h-full cursor-pointer"
      style={{ minHeight: 280 }}
    />
  );
}
