import React from 'react';
import { motion } from 'framer-motion';

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  message,
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      {Icon && (
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-4"
        >
          <Icon size={64} className="text-gray-400 dark:text-gray-600" />
        </motion.div>
      )}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        {message}
      </p>
      {children}
    </motion.div>
  );
};

export default EmptyState;
