import React from 'react';
import { Button } from './Button';
import { ThemeMode } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  themeMode: ThemeMode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  themeMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-xl shadow-2xl border p-6 transform transition-all scale-100 ${
          themeMode === 'dark' 
            ? 'bg-[#1e1e1e] border-white/10 text-gray-100' 
            : 'bg-white border-black/10 text-gray-800'
        }`}
      >
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className={`mb-6 text-sm leading-relaxed ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};