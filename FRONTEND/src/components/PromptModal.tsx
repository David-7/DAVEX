import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromptModal({ open, title, placeholder, initial = '', onCancel, onConfirm }: any) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => { setValue(initial || ''); }, [initial, open]);
  useEffect(() => { if (open) ref.current?.focus(); }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => onCancel?.()} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md bg-[#050505] border border-border p-6 rounded shadow-lg"
          >
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 bg-black border border-border rounded h-28 mb-4"
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { onConfirm?.(value); } }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => onCancel?.()} className="px-4 py-2 rounded border border-border text-text-dim">Cancel</button>
              <button onClick={() => onConfirm?.(value)} className="px-4 py-2 rounded bg-primary text-black font-bold">Confirm</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
