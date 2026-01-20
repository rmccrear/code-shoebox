
import { BASE_HTML_WRAPPER } from "./common";

const SQL_CDN = '<script src="https://cdn.jsdelivr.net/npm/alasql@4.4.0/dist/alasql.min.js"></script>';

const SQL_STYLES = `
    /* SQL Table Styling */
    .sql-result-title {
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 5px;
        color: #666;
        font-family: sans-serif;
        font-size: 0.9rem;
    }
    body.dark .sql-result-title {
        color: #aaa;
    }

    table.sql-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        border: 1px solid #e5e7eb;
    }
    
    table.sql-table th, table.sql-table td {
        border: 1px solid #e5e7eb;
        padding: 8px 12px;
        text-align: left;
    }
    
    table.sql-table th {
        background-color: #f9fafb;
        font-weight: 600;
        color: #374151;
    }
    
    table.sql-table tr:nth-child(even) {
        background-color: #f9fafb;
    }

    /* Dark Mode Overrides */
    body.dark table.sql-table {
        border-color: #374151;
    }
    body.dark table.sql-table th, body.dark table.sql-table td {
        border-color: #374151;
        color: #e5e7eb;
    }
    body.dark table.sql-table th {
        background-color: #1f2937;
        color: #f3f4f6;
    }
    body.dark table.sql-table tr:nth-child(even) {
        background-color: #1f2937;
    }
    body.dark table.sql-table tr:nth-child(odd) {
        background-color: #111827;
    }
`;

const SQL_EXECUTION_LOGIC = `
    function renderResults(results, root) {
        // Normalize to array
        if (!Array.isArray(results)) {
            results = [results];
        }

        let hasVisualOutput = false;

        results.forEach((res, index) => {
            // Determine if this result is worth showing
            if (Array.isArray(res) && res.length > 0) {
                    hasVisualOutput = true;
                    const title = document.createElement('div');
                    title.className = 'sql-result-title';
                    title.innerText = 'Result Set ' + (index + 1);
                    root.appendChild(title);
                    root.appendChild(createTable(res));
            } 
            else if (Array.isArray(res) && res.length === 0) {
                    hasVisualOutput = true;
                    const msg = document.createElement('div');
                    msg.style.color = '#888';
                    msg.style.padding = '10px 0';
                    msg.innerText = 'Query executed (0 rows returned)';
                    root.appendChild(msg);
            }
        });
        
        if (!hasVisualOutput) {
                const div = document.createElement('div');
                div.innerText = '✅ SQL executed successfully.';
                div.style.color = '#10b981'; // green-500
                div.style.padding = '10px 0';
                div.style.fontFamily = 'sans-serif';
                root.appendChild(div);
        }
    }

    function createTable(data) {
        const table = document.createElement('table');
        table.className = 'sql-table';
        
        // Headers
        const keys = Object.keys(data[0]);
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');
        
        keys.forEach(k => {
            const th = document.createElement('th');
            th.textContent = k;
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        data.forEach((row) => {
            const tr = document.createElement('tr');
            keys.forEach(k => {
                const td = document.createElement('td');
                td.textContent = row[k];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        return table;
    }

    window.runMode = async function(code, root) {
        root.innerHTML = '';
        
        try {
            // Reset Database for a clean run each time 'Run' is clicked
            alasql('DROP DATABASE IF EXISTS main');
            alasql('CREATE DATABASE main');
            alasql('USE main');
            
            // Heuristic: Check if code is likely JS (contains await, or is valid JS)
            // or if it should be treated as pure SQL.
            let isJs = false;
            
            // 1. Try to compile as Async Function (JS)
            try {
                const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                new AsyncFunction(code); 
                isJs = true;
            } catch(e) {
                isJs = false;
            }

            if (isJs) {
                 // Run as Scriptable SQL (JS)
                 const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                 const fn = new AsyncFunction('root', code);
                 await fn(root);
                 
                 if (root.innerHTML === '' && document.getElementById('console-output').innerHTML === '') {
                     const div = document.createElement('div');
                     div.innerHTML = '<i>Script executed. Use <b>console.log()</b> or append to <b>root</b> to see results.</i>';
                     div.style.color = '#888';
                     root.appendChild(div);
                 }
            } else {
                 // Run as Standard SQL
                 let results = alasql(code);
                 renderResults(results, root);
            }

        } catch (err) {
            console.error(err);
            const errDiv = document.createElement('div');
            errDiv.style.color = '#ef4444'; // red-500
            errDiv.style.marginTop = '10px';
            errDiv.style.fontFamily = 'monospace';
            errDiv.innerText = 'Error: ' + err.message;
            root.appendChild(errDiv);
        }
    };
`;

export const generateSqlHtml = (showPlaceholder: boolean = true) => {
    // Fixed: BASE_HTML_WRAPPER expects a single object argument with cdns as string[]
    const headContent = `${SQL_CDN}<style>${SQL_STYLES}</style>`;
    return BASE_HTML_WRAPPER({ cdns: [headContent], logic: SQL_EXECUTION_LOGIC, showPlaceholder });
};