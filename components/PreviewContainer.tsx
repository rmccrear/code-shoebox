
import React from 'react';
import { ThemeMode } from '../types';

interface PreviewContainerProps {
  themeMode: ThemeMode;
  isReady: boolean;
  children: React.ReactNode;
  overlayMessage?: string;
}

/**
 * A container component for the sandbox iframe.
 * Handles the border, background, and "Ready" state overlay.
 */
export const PreviewContainer: React.FC<PreviewContainerProps> = ({ 
  themeMode, 
  isReady, 
  children,
  overlayMessage
}) => {
  return (
    <div className={`w-full h-full rounded-md overflow-hidden shadow-inner relative border transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'}`}>
      {children}
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5">
          <p className="text-gray-400 font-medium">
            {overlayMessage || "Click 'Run Code' to execute"}
          </p>
        </div>
      )}
    </div>
  );
};
