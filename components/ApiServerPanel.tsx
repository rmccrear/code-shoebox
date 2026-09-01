import React from 'react';
import { CloudOff } from 'lucide-react';
import type { MockApiConfig, MockApiRoute, ThemeMode } from '../types';

interface ApiServerPanelProps {
  mockApi?: MockApiConfig;
  themeMode: ThemeMode;
}

const getRouteLabel = (route: MockApiRoute): string => {
  if (!route.query) return route.path;
  const query = new URLSearchParams(Object.entries(route.query)).toString();
  return query ? `${route.path}?${query}` : route.path;
};

export const ApiServerPanel: React.FC<ApiServerPanelProps> = ({ mockApi, themeMode }) => {
  const routes = mockApi?.routes ?? [];
  const defaultDelayMs = mockApi?.defaultDelayMs ?? 1000;
  const dark = themeMode === 'dark';

  return (
    <section
      aria-label="Mock API server"
      className={`h-full overflow-auto p-4 ${dark ? 'bg-[#181818] text-gray-200' : 'bg-slate-50 text-slate-800'}`}
    >
      <div className={`mb-4 rounded-lg border p-3 ${dark ? 'border-blue-400/30 bg-blue-400/10' : 'border-blue-200 bg-blue-50'}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CloudOff aria-hidden="true" size={16} />
          <span>Mock API — no network request</span>
        </div>
        <p className="mt-1 text-xs opacity-70">
          Use these relative routes with fetch(). Responses are simulated inside the sandbox.
        </p>
      </div>

      {routes.length === 0 ? (
        <p className="text-sm opacity-60">No mock API routes are configured for this activity.</p>
      ) : (
        <div className="space-y-3">
          {routes.map((route, index) => {
            const delayMs = route.delayMs ?? defaultDelayMs;
            const status = route.networkError ? 'Network error' : route.status ?? 200;
            return (
              <article
                key={`${route.method}-${getRouteLabel(route)}-${index}`}
                className={`rounded-lg border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-500">
                    {route.method}
                  </span>
                  <code className="break-all text-sm font-semibold">{getRouteLabel(route)}</code>
                </div>
                <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-70">
                  <div><dt className="inline font-semibold">Status: </dt><dd className="inline">{status}</dd></div>
                  <div><dt className="inline font-semibold">Delay: </dt><dd className="inline">{delayMs} ms</dd></div>
                </dl>
                {route.requestHeaders !== undefined && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-semibold opacity-70">Required request headers</p>
                    <pre className={`overflow-auto rounded p-3 text-xs ${dark ? 'bg-black/30' : 'bg-slate-100'}`}>
                      {JSON.stringify(route.requestHeaders, null, 2)}
                    </pre>
                  </div>
                )}
                {route.requestBody !== undefined && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-semibold opacity-70">Required JSON request body</p>
                    <pre className={`overflow-auto rounded p-3 text-xs ${dark ? 'bg-black/30' : 'bg-slate-100'}`}>
                      {JSON.stringify(route.requestBody, null, 2)}
                    </pre>
                  </div>
                )}
                {route.networkError ? (
                  <p className="mt-3 font-mono text-xs text-red-400">
                    {route.errorMessage ?? 'Simulated network error'}
                  </p>
                ) : (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-semibold opacity-70">Response JSON</p>
                    <pre className={`overflow-auto rounded p-3 text-xs ${dark ? 'bg-black/30' : 'bg-slate-100'}`}>
                      {JSON.stringify(route.body, null, 2)}
                    </pre>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
