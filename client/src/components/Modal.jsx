import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = 'max-w-md'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 pointer-events-none sm:p-5">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${maxWidth} my-auto w-full max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-2xl bg-white shadow-xl pointer-events-auto dark:bg-slate-800 sm:max-h-[calc(100vh-2.5rem)]`}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {children}
              </div>

              {footer && (
                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 p-6 dark:border-slate-700">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
