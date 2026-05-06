import React from 'react';
import toast from 'react-hot-toast';

export default function CodeModal({ open, code, onClose }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-[#050505] border border-border p-6 rounded">
        <h3 className="text-lg font-bold mb-2">Redeem Code Generated</h3>
        <p className="text-sm text-text-dim mb-4">Share this code with the learner so they can redeem and activate PREMIUM.</p>
        <div className="flex items-center justify-between bg-black/40 border border-border p-3 rounded mb-4">
          <div className="font-mono text-lg">{code}</div>
          <button
            onClick={() => {
              if (!code) return toast.error('No code to copy');
              navigator.clipboard?.writeText(code);
              toast.success('Copied');
            }}
            className="px-3 py-1 bg-primary text-black rounded"
          >
            Copy
          </button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded border border-border text-text-dim">Close</button>
        </div>
      </div>
    </div>
  );
}
