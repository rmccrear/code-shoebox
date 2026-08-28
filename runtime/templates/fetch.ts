/**
 * Browser-native fetch mock used only by the fetch tutorial mode.
 *
 * Route data is installed at execution time from a structured-cloned payload;
 * host-authored fixtures are never interpolated into the sandbox document.
 */
export const FETCH_MOCK_SETUP = `
    (() => {
        const DEFAULT_DELAY_MS = 1000;
        const ABSOLUTE_URL = /^[a-zA-Z][a-zA-Z\\d+.-]*:/;

        const safeDelay = (value, fallback) => {
            const number = Number(value);
            return Number.isFinite(number) && number >= 0 ? number : fallback;
        };

        const abortError = () => {
            try { return new DOMException('The operation was aborted.', 'AbortError'); }
            catch (e) {
                const error = new Error('The operation was aborted.');
                error.name = 'AbortError';
                return error;
            }
        };

        const delay = (milliseconds, signals) => new Promise((resolve, reject) => {
            let timer;
            const activeSignals = signals.filter(Boolean);
            const cleanup = () => activeSignals.forEach((signal) => signal.removeEventListener('abort', onAbort));
            const onAbort = () => {
                clearTimeout(timer);
                cleanup();
                reject(abortError());
            };

            if (activeSignals.some((signal) => signal.aborted)) {
                onAbort();
                return;
            }

            activeSignals.forEach((signal) => signal.addEventListener('abort', onAbort, { once: true }));
            timer = setTimeout(() => {
                cleanup();
                resolve();
            }, milliseconds);
        });

        const queryMatches = (searchParams, expected) => {
            const expectedEntries = Object.entries(expected || {});
            const actualEntries = Array.from(searchParams.entries());
            if (actualEntries.length !== expectedEntries.length) return false;
            return expectedEntries.every(([key, value]) => (
                searchParams.getAll(key).length === 1 && searchParams.get(key) === String(value)
            ));
        };

        const parseInput = (input, init) => {
            const isRequest = typeof Request !== 'undefined' && input instanceof Request;
            const isUrl = typeof URL !== 'undefined' && input instanceof URL;
            const rawUrl = isRequest ? input.url : isUrl ? input.href : String(input);
            const baseUrl = new URL(document.baseURI);

            let url;
            if (isRequest || isUrl) {
                url = new URL(rawUrl);
                if (url.origin !== baseUrl.origin) {
                    throw new TypeError('Network access is disabled in Fetch tutorial mode. Use a relative /api/... route.');
                }
            } else {
                if (ABSOLUTE_URL.test(rawUrl) || rawUrl.startsWith('//')) {
                    throw new TypeError('Network access is disabled in Fetch tutorial mode. Use a relative /api/... route.');
                }
                url = new URL(rawUrl, baseUrl);
            }

            return {
                url,
                method: String((init && init.method) || (isRequest && input.method) || 'GET').toUpperCase(),
                signal: (init && init.signal) || (isRequest && input.signal) || null
            };
        };

        const jsonResponse = (route, fallbackBody) => {
            const status = route.status === undefined ? 200 : Number(route.status);
            const headers = new Headers(route.headers || {});
            if (!headers.has('content-type')) headers.set('content-type', 'application/json');
            const body = status === 204 || status === 205 || status === 304
                ? null
                : JSON.stringify(route.body === undefined ? fallbackBody : route.body);
            return new Response(body, { status, headers });
        };

        window.__installFetchMock = (rawConfig, runSignal) => {
            const config = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
            const routes = Array.isArray(config.routes) ? config.routes : [];
            const defaultDelayMs = safeDelay(config.defaultDelayMs, DEFAULT_DELAY_MS);

            window.fetch = async (input, init) => {
                const request = parseInput(input, init);
                const candidates = routes.filter((route) => (
                    route
                    && String(route.method || 'GET').toUpperCase() === request.method
                    && route.path === request.url.pathname
                ));
                const route = candidates.find((candidate) => (
                    candidate.query !== undefined && queryMatches(request.url.searchParams, candidate.query)
                )) || candidates.find((candidate) => candidate.query === undefined);

                if (!route) {
                    await delay(defaultDelayMs, [runSignal, request.signal]);
                    return jsonResponse(
                        { status: 404, body: { error: 'No mock route for ' + request.method + ' ' + request.url.pathname } },
                        null
                    );
                }

                await delay(safeDelay(route.delayMs, defaultDelayMs), [runSignal, request.signal]);
                if (route.networkError === true) {
                    throw new TypeError(route.errorMessage || 'Simulated network error');
                }
                return jsonResponse(route, null);
            };
        };
    })();
`;
