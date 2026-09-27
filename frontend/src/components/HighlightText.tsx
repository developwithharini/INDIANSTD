import React from 'react';

interface HighlightTextProps {
  text: string;
  matchedTerms: string[];
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  matchedTerms,
  className = 'text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap'
}) => {
  if (!text) return null;
  if (!matchedTerms || matchedTerms.length === 0) {
    return <p className={className}>{text}</p>;
  }

  // Escape special regex characters in matched terms
  const escapedTerms = matchedTerms
    .filter(t => t && t.trim().length > 0)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (escapedTerms.length === 0) {
    return <p className={className}>{text}</p>;
  }

  // Build regex pattern matching any term as whole word or phrase
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <p className={className}>
      {parts.map((part, idx) => {
        const isMatch = matchedTerms.some(
          term => term.toLowerCase() === part.toLowerCase()
        );

        if (isMatch) {
          return (
            <mark
              key={idx}
              className="bg-amber-100 text-amber-900 font-semibold px-1 py-0.5 rounded border border-amber-300 inline-block my-0.5"
            >
              {part}
            </mark>
          );
        }

        return <span key={idx}>{part}</span>;
      })}
    </p>
  );
};
