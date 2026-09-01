# Fetch API (Mock Server)

- **Engine:** Native browser JavaScript with top-level `await` enabled.
- **Files:** An editable `script.js` tab and a read-only **API Server** tab.
- **Network:** `fetch()` talks only to host-provided relative mock routes. No real network request is made, and external URLs are rejected.
- **Latency:** Responses wait 1000 ms by default so learners can observe asynchronous execution. Authors can override latency per route.
- **Responses:** Mocked HTTP errors such as 404 and 500 resolve to real `Response` objects. Declared network errors and aborted requests reject.
- **Queries:** Routes match by method and pathname. A route can optionally require an exact query-string map; otherwise its match ignores the query string.
- **Request matching:** Routes can require a deep-equal JSON `requestBody` and a case-insensitive subset of `requestHeaders`, such as `x-api-key`. Extra headers are allowed. The most specific route wins, with author order breaking ties.
- **POST:** Request matching selects a canned response. It does not execute callbacks, echo arbitrary data, or create persistent state.
- **Credentials:** Mock API keys are visible teaching fixtures. Never use real secrets.
