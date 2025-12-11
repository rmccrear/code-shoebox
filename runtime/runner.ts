/**
 * This file contains the logic to generate the sandboxed HTML environment.
 * It is self-contained and serves as the "boot" script for the iframe.
 */
import { EnvironmentMode } from "../types";
import { generateDomHtml } from "./templates/dom";
import { generateP5Html } from "./templates/p5";
import { generateReactHtml } from "./templates/react";

export const SANDBOX_ATTRIBUTES = "allow-scripts allow-modals allow-forms";

/**
 * Creates a Blob URL for the sandbox HTML.
 */
export const createSandboxUrl = (mode: EnvironmentMode = 'dom'): string => {
  let html = '';
  
  if (mode === 'p5') {
    html = generateP5Html();
  } else if (mode === 'react') {
    html = generateReactHtml();
  } else {
    html = generateDomHtml();
  }

  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
};

/**
 * Sends code to the iframe for execution.
 */
export const executeCodeInSandbox = (iframeContentWindow: Window, code: string) => {
  iframeContentWindow.postMessage({ type: 'EXECUTE', code }, '*');
};