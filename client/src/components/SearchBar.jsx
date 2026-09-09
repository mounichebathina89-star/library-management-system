import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Search...',
  onSubmit
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-3 text-primary-400" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl bg-white/75 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
      />
    </div>
  );
};

export default SearchBar;
