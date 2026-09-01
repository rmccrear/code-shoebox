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

        const jsonEquals = (actual, expected) => {
            if (actual === expected) return true;
            if (Array.isArray(actual) || Array.isArray(expected)) {
                return Array.isArray(actual)
                    && Array.isArray(expected)
                    && actual.length === expected.length
                    && actual.every((value, index) => jsonEquals(value, expected[index]));
            }
            if (!actual || !expected || typeof actual !== 'object' || typeof expected !== 'object') {
                return false;
            }
            const actualKeys = Object.keys(actual);
            const expectedKeys = Object.keys(expected);
            return actualKeys.length === expectedKeys.length
                && expectedKeys.every((key) => (
                    Object.prototype.hasOwnProperty.call(actual, key)
                    && jsonEquals(actual[key], expected[key])
                ));
        };

        const headersMatch = (headers, expected) => {
            const expectedHeaders = new Headers(expected || {});
            return Array.from(expectedHeaders.entries()).every(([name, value]) => headers.get(name) === value);
        };

        const routeSpecificity = (route) => {
            const queryScore = route.query === undefined ? 0 : Math.max(1, Object.keys(route.query || {}).length);
            const headerScore = route.requestHeaders === undefined
                ? 0
                : Math.max(1, Object.keys(route.requestHeaders || {}).length);
            const bodyScore = route.requestBody === undefined ? 0 : 1;
            return queryScore + headerScore + bodyScore;
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

            const hasInitHeaders = init && init.headers !== undefined;
            const headers = new Headers(hasInitHeaders ? init.headers : isRequest ? input.headers : undefined);
            const hasInitBody = !!init && Object.prototype.hasOwnProperty.call(init, 'body');
            let bodyPromise;
            const readJsonBody = () => {
                if (bodyPromise) return bodyPromise;
                bodyPromise = (async () => {
                    let text;
                    if (hasInitBody) {
                        if (init.body === undefined || init.body === null) return { hasJson: false };
                        text = await new Response(init.body).text();
                    } else if (isRequest) {
                        text = await input.clone().text();
                    } else {
                        return { hasJson: false };
                    }
                    if (!text) return { hasJson: false };
                    try { return { hasJson: true, value: JSON.parse(text) }; }
                    catch (e) { return { hasJson: false }; }
                })();
                return bodyPromise;
            };

            return {
                url,
                method: String((init && init.method) || (isRequest && input.method) || 'GET').toUpperCase(),
                signal: (init && init.signal) || (isRequest && input.signal) || null,
                headers,
                readJsonBody
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
                const requestBody = candidates.some((candidate) => candidate.requestBody !== undefined)
                    ? await request.readJsonBody()
                    : { hasJson: false };
                const route = candidates
                    .map((candidate, index) => ({ candidate, index }))
                    .filter(({ candidate }) => (
                        (candidate.query === undefined || queryMatches(request.url.searchParams, candidate.query))
                        && (candidate.requestHeaders === undefined || headersMatch(request.headers, candidate.requestHeaders))
                        && (candidate.requestBody === undefined || (
                            requestBody.hasJson && jsonEquals(requestBody.value, candidate.requestBody)
                        ))
                    ))
                    .sort((left, right) => (
                        routeSpecificity(right.candidate) - routeSpecificity(left.candidate)
                        || left.index - right.index
                    ))[0]?.candidate;

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
