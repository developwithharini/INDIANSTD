import React, { useEffect, useRef } from 'react';

interface StandardsCorpusCanvasProps {
  isSearching?: boolean;
  totalStandards?: number;
}

export const StandardsCorpusCanvas: React.FC<StandardsCorpusCanvasProps> = ({
  isSearching = false,
  totalStandards = 2631
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 120 node points representing the indexed corpus
    const nodes = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.5 + 1.5,
      alpha: Math.random() * 0.5 + 0.3,
      isHighlighted: Math.random() > 0.85
    }));

    let pulseRadius = 0;
    let pulseX = width / 2;
    let pulseY = height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint technical grid lines
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Expand pulse when searching
      if (isSearching) {
        pulseRadius = (pulseRadius + 3) % (Math.max(width, height) * 0.8);
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw nodes & connections
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.isHighlighted || isSearching
          ? 'rgba(217, 119, 6, 0.9)'
          : `rgba(30, 58, 138, ${node.alpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(node.x - n2.x, node.y - n2.y);
          if (dist < 75) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.2 * (1 - dist / 75)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSearching]);

  return (
    <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-700/60 font-mono text-xs text-slate-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>INDIAN STANDARDS INDEXED</span>
      </div>
      <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded border border-slate-700/60 font-mono text-[10px] text-emerald-400">
        BGE-M3 + BM25 HYBRID SEARCH FIELD
      </div>
    </div>
  );
};
