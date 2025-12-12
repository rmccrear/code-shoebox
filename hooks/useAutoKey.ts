
import { useMemo } from 'react';

/**
 * Generates a deterministic persistence key based on:
 * 1. The current browser URL path.
 * 2. A unique identifier (e.g., the prompt/question text).
 * 3. The initial code (optional, to distinguish exercises with identical prompts).
 * 
 * @param identifier The unique text identifying this specific editor (e.g., the prompt).
 * @param initialCode Optional code snippet to ensure uniqueness if prompts are identical.
 * @param prefix Optional prefix to namespace the key (default: 'auto').
 * @returns A unique hash string to be passed to useSandboxState.
 */
export const useAutoKey = (identifier: string, initialCode: string = '', prefix: string = 'auto'): string => {
  const key = useMemo(() => {
    // Server-side rendering guard
    if (typeof window === 'undefined') {
      return `${prefix}_server`; 
    }

    const path = window.location.pathname;
    
    // Normalize prompt/id: trim and collapse whitespace
    const normalizedId = identifier.trim().replace(/\s+/g, ' ');
    
    // Normalize code: trim only (preserve internal whitespace structure)
    const normalizedCode = initialCode.trim();
    
    // Create composite string: URL + Identifier + Code
    const input = `${path}::${normalizedId}::${normalizedCode}`;
    
    // DJB2 Hash Algorithm
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) + hash) + input.charCodeAt(i);
      hash = hash | 0; // Force 32-bit integer
    }

    // Convert to Base36 for compactness and URL safety
    const hashString = (hash >>> 0).toString(36);

    return `${prefix}_${hashString}`;
  }, [identifier, initialCode, prefix]);

  return key;
};
