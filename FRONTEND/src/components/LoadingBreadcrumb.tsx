import React from 'react';

export default function LoadingBreadcrumb({ text = 'Working...' }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-black/60 border border-border px-3 py-1 rounded text-[12px] font-mono">
      <svg className="animate-spin w-4 h-4 text-primary" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeOpacity="0.2"></circle>
        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none"></path>
      </svg>
      <span className="text-text-dim">{text}</span>
    </div>
  );
}
