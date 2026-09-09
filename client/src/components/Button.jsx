import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props 
}) => {
  const baseClass = 'btn inline-flex whitespace-nowrap font-semibold transition-all duration-300 items-center justify-center gap-2';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    outline: 'btn-outline',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const sizeClass = sizes[size];
  const variantClass = variants[variant];
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <motion.button
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {Icon && !loading && <Icon size={20} />}
      {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
      {children}
    </motion.button>
  );
};

export default Button;
