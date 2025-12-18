
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
import { generateExpressHtml } from "./templates/express";
import { generateExpressTsHtml } from "./templates/express-ts";
import { generateHeadlessJsHtml, generateHeadlessTsHtml } from "./templates/headless";

export const SANDBOX_ATTRIBUTES = "allow-scripts allow-modals allow-forms";

/**
 * Creates a Blob URL for the sandbox HTML.
 */
export const createSandboxUrl = (mode: EnvironmentMode = 'dom', isPredictionMode: boolean = false): string => {
  let html = '';
  // If in prediction mode, we do NOT want to show the placeholder text
  const showPlaceholder = !isPredictionMode;
  
  switch (mode) {
    case 'p5':
      html = generateP5Html(showPlaceholder);
      break;
    case 'react':
      html = generateReactHtml(showPlaceholder);
      break;
    case 'typescript':
      html = generateTsHtml(showPlaceholder);
      break;
    case 'react-ts':
      html = generateReactTsHtml(showPlaceholder);
      break;
    case 'express':
      html = generateExpressHtml(showPlaceholder);
      break;
    case 'express-ts':
      html = generateExpressTsHtml(showPlaceholder);
      break;
    case 'node-js':
      html = generateHeadlessJsHtml();
      break;
    case 'node-ts':
      html = generateHeadlessTsHtml();
      break;
    default:
      html = generateDomHtml(showPlaceholder);
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
