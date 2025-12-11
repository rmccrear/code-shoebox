import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { ThemeMode, EnvironmentMode } from '../types';
import { getDocsForMode } from '../docs';
import { Button } from './Button';

interface HelpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  environmentMode: EnvironmentMode;
}

export const HelpSidebar: React.FC<HelpSidebarProps> = ({
  isOpen,
  onClose,
  themeMode,
  environmentMode
}) => {
  const docs = getDocsForMode(environmentMode);

  if (!isOpen) return null;

  return (
    <aside 
      className={`
        flex flex-col border-l w-full md:w-80 shrink-0 h-full overflow-hidden transition-colors duration-300
        ${themeMode === 'dark' ? 'bg-[#1e1e1e] border-white/10' : 'bg-gray-50 border-gray-200'}
      `}
    >
      {/* Header */}
      <div className={`
        flex items-center justify-between px-4 h-12 shrink-0 border-b
        ${themeMode === 'dark' ? 'border-white/10 bg-[#252526]' : 'border-gray-200 bg-white'}
      `}>
        <div className="flex items-center gap-2">
          <BookOpen className={`w-4 h-4 ${themeMode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className="font-semibold text-sm">Documentation</h2>
        </div>
        <Button variant="ghost" onClick={onClose} className="!p-1 h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {docs ? (
          docs.map((section, idx) => (
            <div key={idx}>
              <h3 className={`
                text-xs font-bold uppercase tracking-wider mb-3
                ${themeMode === 'dark' ? 'text-gray-500' : 'text-gray-500'}
              `}>
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <div key={i} className={`
                    p-3 rounded-md text-sm
                    ${themeMode === 'dark' ? 'bg-black/20 hover:bg-black/40' : 'bg-white shadow-sm border border-gray-100'}
                  `}>
                    <code className={`
                      font-mono text-xs block mb-1
                      ${themeMode === 'dark' ? 'text-blue-300' : 'text-blue-700'}
                    `}>
                      {item.name}
                    </code>
                    <p className={`
                      leading-relaxed text-xs opacity-90
                      ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}
                    `}>
                      {item.desc}
                    </p>
                    {item.example && (
                      <div className={`
                        mt-2 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre
                        ${themeMode === 'dark' ? 'bg-black/30 text-gray-400' : 'bg-gray-50 text-gray-600'}
                      `}>
                        {item.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 opacity-60 text-sm">
            <p>No documentation available for this mode.</p>
          </div>
        )}
      </div>
    </aside>
  );
};