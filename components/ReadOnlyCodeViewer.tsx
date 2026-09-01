import React from 'react';
import type { ThemeMode } from '../types';

interface ReadOnlyCodeViewerProps {
  code: string;
  filename: string;
  language: string;
  themeMode: ThemeMode;
}

/**
 * Lightweight source display for prediction activities.
 *
 * Prediction source is host-owned and immutable, so mounting Monaco here would
 * advertise editing features that the activity intentionally does not offer.
 */
export const ReadOnlyCodeViewer: React.FC<ReadOnlyCodeViewerProps> = ({
  code,
  filename,
  language,
  themeMode,
}) => (
  <pre
    aria-label={`Read-only code: ${filename}`}
    className={`m-0 h-full w-full overflow-auto select-text p-4 font-mono text-sm leading-6 whitespace-pre ${
      themeMode === 'dark'
        ? 'bg-[#1e1e1e] text-gray-100'
        : 'bg-white text-gray-900'
    }`}
    data-filename={filename}
    data-language={language}
    tabIndex={0}
  >
    <code>{code}</code>
  </pre>
);
