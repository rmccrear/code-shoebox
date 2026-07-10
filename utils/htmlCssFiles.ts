export const HTML_CSS_CODE_VERSION = "codeshoebox/html-css/v1";

export interface HtmlCssFiles {
  html: string;
  css: string;
}

interface HtmlCssBundle extends HtmlCssFiles {
  version: typeof HTML_CSS_CODE_VERSION;
}

const EMPTY_FILES: HtmlCssFiles = {
  html: "",
  css: ""
};

export const serializeHtmlCssFiles = (files: HtmlCssFiles): string => {
  const bundle: HtmlCssBundle = {
    version: HTML_CSS_CODE_VERSION,
    html: files.html,
    css: files.css
  };

  return JSON.stringify(bundle, null, 2);
};

export const parseHtmlCssFiles = (code: string): HtmlCssFiles => {
  if (!code.trim()) return EMPTY_FILES;

  try {
    const parsed = JSON.parse(code);
    if (
      parsed &&
      parsed.version === HTML_CSS_CODE_VERSION &&
      typeof parsed.html === "string" &&
      typeof parsed.css === "string"
    ) {
      return {
        html: parsed.html,
        css: parsed.css
      };
    }
  } catch {
    // Fall through to the beginner-friendly raw HTML parser below.
  }

  const styleMatch = code.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  if (!styleMatch) {
    return {
      html: code,
      css: ""
    };
  }

  return {
    html: code.replace(styleMatch[0], "").trim(),
    css: styleMatch[1].trim()
  };
};
