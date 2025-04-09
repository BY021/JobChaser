'use client'

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="switch">
      <input 
        type="checkbox" 
        checked={theme === 'dark'} 
        onChange={toggleTheme} 
      />
      <span className="slider"></span>
    </label>
  );
};
