import React from 'react';
import { motion } from 'framer-motion';

export const Loading = ({ fullScreen = false, message = 'Loading...' }) => {
  const containerClass = fullScreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#fbfaff]/95 backdrop-blur-sm dark:bg-slate-950/95' 
    : 'flex items-center justify-center py-16';

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-100 bg-white shadow-lg shadow-primary-900/10 dark:bg-slate-800">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-9 w-9 rounded-full border-[3px] border-primary-100 border-t-primary-600"
          />
          <div className="absolute h-2 w-2 rounded-full bg-primary-500" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-[#302653] dark:text-gray-100">{message}</p>
          <div className="mt-2 flex justify-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-600 [animation-delay:300ms]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Loading;
