import React, { useId, useState } from 'react';
import { Lock } from 'lucide-react';
import { MediaAsset, ThemeMode } from '../types';

interface MediaPanelProps {
  mediaAssets: readonly MediaAsset[];
  themeMode: ThemeMode;
}

interface Snippet {
  language: 'HTML' | 'CSS' | 'JavaScript';
  code: string;
}

const escapeHtmlAttribute = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\r/g, '&#13;')
  .replace(/\n/g, '&#10;');

const escapeCssString = (value: string): string => value
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\r\n|\r|\n/g, '\\a ');

const getSnippets = (asset: MediaAsset): Snippet[] => {
  switch (asset.kind) {
    case 'image':
      return [
        { language: 'HTML', code: `<img src="${escapeHtmlAttribute(asset.src)}" alt="${escapeHtmlAttribute(asset.alt)}">` },
        { language: 'CSS', code: `.media-image { background-image: url("${escapeCssString(asset.src)}"); }` },
      ];
    case 'audio':
      return [
        { language: 'HTML', code: `<audio controls src="${escapeHtmlAttribute(asset.src)}"></audio>` },
        { language: 'JavaScript', code: `const audio = new Audio(${JSON.stringify(asset.src)});\nvoid audio.play();` },
      ];
    case 'video':
      return [
        { language: 'HTML', code: `<video id="media-video" controls src="${escapeHtmlAttribute(asset.src)}"></video>` },
        { language: 'JavaScript', code: "const video = document.querySelector('#media-video');\nvoid video?.play();" },
      ];
  }
};

const SnippetBlock: React.FC<Snippet> = ({ language, code }) => (
  <div>
    <h3 className="mb-1 text-xs font-bold uppercase tracking-wide">{language}</h3>
    <pre className="overflow-x-auto rounded bg-black/20 p-3 text-xs"><code>{code}</code></pre>
  </div>
);

const getAssetKey = (asset: MediaAsset, index: number): string => (
  `${index}:${asset.kind}:${asset.name}:${asset.src}`
);

export const MediaPanel: React.FC<MediaPanelProps> = ({ mediaAssets, themeMode }) => {
  const panelId = useId();
  const visibleAssets = mediaAssets.slice(0, 3);
  const [selectedAssetKey, setSelectedAssetKey] = useState<string | null>(null);
  const [failedAssetKey, setFailedAssetKey] = useState<string | null>(null);
  const selectedIndex = visibleAssets.findIndex((item, index) => (
    getAssetKey(item, index) === selectedAssetKey
  ));
  const effectiveSelectedIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const asset = visibleAssets[effectiveSelectedIndex];

  if (!asset) {
    return (
      <section className={`flex h-full items-center justify-center p-6 ${themeMode === 'dark' ? 'bg-[#1e1e1e] text-gray-300' : 'bg-white text-gray-600'}`}>
        <p className="rounded-lg border border-dashed border-current/25 px-5 py-4 text-center text-sm">
          No media assets supplied.
        </p>
      </section>
    );
  }

  const snippets = getSnippets(asset);
  const activeAssetKey = getAssetKey(asset, effectiveSelectedIndex);

  return (
    <section className={`h-full overflow-auto p-4 ${themeMode === 'dark' ? 'bg-[#1e1e1e] text-gray-100' : 'bg-white text-gray-900'}`}>
      <div role="tablist" aria-label="Media assets" className="mb-4 flex gap-1 overflow-x-auto">
        {visibleAssets.map((item, index) => (
          <button
            key={`${index}-${item.name}`}
            id={`${panelId}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === effectiveSelectedIndex}
            aria-controls={`${panelId}-panel`}
            onClick={() => {
              setSelectedAssetKey(getAssetKey(item, index));
              setFailedAssetKey(null);
            }}
            className={`shrink-0 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              index === effectiveSelectedIndex
                ? themeMode === 'dark' ? 'bg-white/10 text-blue-300' : 'bg-blue-50 text-blue-700'
                : 'opacity-60 hover:opacity-90'
            }`}
          >
            {item.name}
            <Lock aria-hidden="true" className="ml-1 inline h-3 w-3" />
          </button>
        ))}
      </div>
      {mediaAssets.length > visibleAssets.length && (
        <p className="mb-4 text-xs opacity-70">Only the first 3 assets are shown.</p>
      )}

      <div
        id={`${panelId}-panel`}
        role="tabpanel"
        aria-labelledby={`${panelId}-tab-${effectiveSelectedIndex}`}
      >
        <div className={`flex min-h-40 items-center justify-center rounded-lg border p-3 ${themeMode === 'dark' ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-gray-50'}`}>
          {asset.kind === 'image' && (
            <img src={asset.src} alt={asset.alt} onError={() => setFailedAssetKey(activeAssetKey)} className="max-h-64 max-w-full rounded object-contain" />
          )}
          {asset.kind === 'audio' && (
            <audio src={asset.src} controls preload="metadata" aria-label={`Audio preview: ${asset.name}`} onError={() => setFailedAssetKey(activeAssetKey)} className="w-full" />
          )}
          {asset.kind === 'video' && (
            <video src={asset.src} controls preload="metadata" aria-label={`Video preview: ${asset.name}`} onError={() => setFailedAssetKey(activeAssetKey)} className="max-h-64 max-w-full rounded" />
          )}
        </div>
        {failedAssetKey === activeAssetKey && (
          <p role="alert" className="mt-3 text-sm text-red-500">Could not load {asset.name}.</p>
        )}

        <div className="mt-5 space-y-4">
          {snippets.map((snippet) => <SnippetBlock key={snippet.language} {...snippet} />)}
        </div>
      </div>
    </section>
  );
};
