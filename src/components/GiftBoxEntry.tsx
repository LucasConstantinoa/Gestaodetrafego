'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift } from 'lucide-react';

export default function GiftBoxEntry({ onOpen }: { onOpen: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (e: React.SyntheticEvent) => {
    if (isOpen) return;
    e.preventDefault();
    setIsOpen(true);
    setTimeout(onOpen, 100);
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          onWheel={handleOpen}
          onTouchMove={handleOpen}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          <motion.div
            className="flex flex-col items-center gap-4 text-emerald-500"
          >
            <Gift className="w-24 h-24" />
            <span className="text-sm font-bold uppercase tracking-[0.2em]">Role para baixo para abrir</span>
            <span className="text-xs text-zinc-400">Diagnóstico de Tráfego Pago</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
