import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface StandardCardSpotlightProps {
  children: React.ReactNode;
  className?: string;
  isPrimary?: boolean;
}

export const StandardCardSpotlight: React.FC<StandardCardSpotlightProps> = ({
  children,
  className = '',
  isPrimary = false
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
        isPrimary
          ? 'border-navy-900 shadow-lg bg-white ring-1 ring-navy-900/10'
          : 'border-slate-200 bg-white shadow-2xs hover:border-slate-400'
      } ${className}`}
    >
      {/* Spotlight Cursor-Aware Light Layer */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(30, 58, 138, 0.06), transparent 80%)`
          }}
        />
      )}

      {/* Technical Corner Accents on Primary Card */}
      {isPrimary && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-navy-900" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-navy-900" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-navy-900" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-navy-900" />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
