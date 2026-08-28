# Fetch API (Mock Server)

- **Engine:** Native browser JavaScript with top-level `await` enabled.
- **Files:** An editable `script.js` tab and a read-only **API Server** tab.
- **Network:** `fetch()` talks only to host-provided relative mock routes. No real network request is made, and external URLs are rejected.
- **Latency:** Responses wait 1000 ms by default so learners can observe asynchronous execution. Authors can override latency per route.
- **Responses:** Mocked HTTP errors such as 404 and 500 resolve to real `Response` objects. Declared network errors and aborted requests reject.
- **Queries:** Routes match by method and pathname. A route can optionally require an exact query-string map; otherwise its match ignores the query string.
- **POST:** Request options and bodies can be written by learners, but v1 responses are canned and request bodies are not inspected.
