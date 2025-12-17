import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LoadingSplash({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 2500); // 2.5 seconds splash duration
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#00f5d4] via-[#ff6ec7] to-[#4f46e5] text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4 tracking-widest drop-shadow-lg">
          RinaWarp
        </h1>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
        <p className="mt-4 text-lg opacity-80">
          Initializing holographic systems...
        </p>
      </motion.div>
    </div>
  );
}
