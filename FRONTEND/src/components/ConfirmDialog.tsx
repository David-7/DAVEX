import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }: any) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md bg-[#050505] border border-border p-6 rounded shadow-lg"
          >
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm text-text-dim mb-4">{message}</p>
            <div className="flex justify-end gap-2">
              <button onClick={onCancel} className="px-4 py-2 rounded border border-border text-text-dim">{cancelLabel}</button>
              <button onClick={onConfirm} className="px-4 py-2 rounded bg-primary text-black font-bold">{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
