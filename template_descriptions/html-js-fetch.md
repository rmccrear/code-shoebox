# HTML, JavaScript & Fetch (Mock API)

Use this mode for lessons where learners build page markup and fetch deterministic JSON into it.

- Editable files: `index.html` and `script.js`
- Read-only host UI: **API Server**
- Required link: `<script src="script.js"></script>`
- JavaScript: native browser syntax with top-level `await`
- Data: host-authored `mockApi` routes, delayed by 1000 ms by default
- Request matching: exact queries, required header subsets, and deep-equal JSON bodies
- Network: real API connections are disabled

The `code` value is the standard version-1 two-file bundle. Keep route fixtures in the `mockApi` prop, never in the learner code envelope. Mock API keys are visible teaching fixtures and must not be real secrets.
