
/**
 * This file contains the logic to generate the sandboxed HTML environment.
 * It is self-contained and serves as the "boot" script for the iframe.
 */
import { EnvironmentMode } from "../types";
import { generateDomHtml } from "./templates/dom";
import { generateP5Html } from "./templates/p5";
import { generateReactHtml } from "./templates/react";
import { generateTsHtml } from "./templates/typescript";
import { generateReactTsHtml } from "./templates/react-ts";

export const SANDBOX_ATTRIBUTES = "allow-scripts allow-modals allow-forms";

/**
 * Creates a Blob URL for the sandbox HTML.
 */
export const createSandboxUrl = (mode: EnvironmentMode = 'dom'): string => {
  let html = '';
  
  switch (mode) {
    case 'p5':
      html = generateP5Html();
      break;
    case 'react':
      html = generateReactHtml();
      break;
    case 'typescript':
      html = generateTsHtml();
      break;
    case 'react-ts':
      html = generateReactTsHtml();
      break;
    default:
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
