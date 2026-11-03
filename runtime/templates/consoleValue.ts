/**
 * Console value serializer that runs inside the sandbox (kernel and html-js
 * page bridge). It is a string because iframe code cannot import modules.
 *
 * It copies how Chrome DevTools prints console arguments:
 * - `text` is Chrome's one-line rendering (`(3) [1, 2, 3]`, `{qty: '1'}`,
 *   `<input id="tickets">`), joined into the plain-text `payload`.
 * - `value` is an eager, JSON-safe snapshot of an object's tree, taken at log
 *   time, so the host can show a click-to-expand tree without anything
 *   non-cloneable crossing postMessage.
 *
 * Written with String.raw so regex and string escapes reach the iframe
 * unchanged. Keep it free of backticks, "${", "<!--" and "</script".
 */
export const CONSOLE_VALUE_SOURCE = String.raw`
    var CS_CONSOLE_LIMITS = {
        props: 5,         // object properties in a one-line preview (Chrome)
        indexes: 100,     // array items in a one-line preview (Chrome)
        entries: 5,       // Map/Set entries in a one-line preview (Chrome)
        previewString: 100,
        treeString: 10000,
        inlineText: 80,   // an element whose only child is short text prints inline
        depth: 6,         // tree levels below the logged value
        nodes: 2000,      // tree nodes per console call
        accessors: 200    // prototype accessors read per object
    };
    var CS_ELLIPSIS = '…';
    var CS_ESCAPES = { '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t', '\v': '\\v', "'": "\\'", '\\': '\\\\' };

    function csSeg(kind, text) { return { kind: kind, text: text }; }
    function csSegText(segs) {
        var text = '';
        for (var i = 0; i < segs.length; i++) text += segs[i].text;
        return text;
    }
    function csTrimEnd(text, max) {
        return text.length <= max ? text : text.slice(0, max - 1) + CS_ELLIPSIS;
    }

    // Chrome's formatAsJSLiteral: single quotes unless the text has one.
    function csJsLiteral(text) {
        var quote = "'";
        var pattern = /[\\\x00-\x1f\x7f-\x9f]|<(?:!--|\/?script)/gi;
        if (text.indexOf("'") !== -1) {
            if (text.indexOf('"') === -1) quote = '"';
            else if (text.indexOf('\x60') === -1 && text.indexOf('$' + '{') === -1) quote = '\x60';
            else pattern = /['\\\x00-\x1f\x7f-\x9f]|<(?:!--|\/?script)/gi;
        }
        return quote + text.replace(pattern, function (match) {
            if (match.charAt(0) === '<') return '\\x3C' + match.slice(1);
            if (CS_ESCAPES[match]) return CS_ESCAPES[match];
            var code = match.charCodeAt(0).toString(16);
            return '\\x' + (code.length < 2 ? '0' + code : code);
        }) + quote;
    }

    function csSymbolText(symbol) {
        try { return symbol.toString(); } catch (e) { return 'Symbol()'; }
    }

    function csPrimitiveSegs(value, style) {
        if (value === null) return [csSeg('null', 'null')];
        var type = typeof value;
        if (type === 'string') {
            if (style === 'top') return [csSeg('text', value)];
            if (style === 'tree') return [csSeg('string', JSON.stringify(csTrimEnd(value, CS_CONSOLE_LIMITS.treeString)))];
            return [csSeg('string', csJsLiteral(csTrimEnd(value, CS_CONSOLE_LIMITS.previewString)))];
        }
        if (type === 'number') return [csSeg('number', Object.is(value, -0) ? '-0' : String(value))];
        if (type === 'bigint') return [csSeg('bigint', String(value) + 'n')];
        if (type === 'boolean') return [csSeg('boolean', String(value))];
        if (type === 'undefined') return [csSeg('undefined', 'undefined')];
        if (type === 'symbol') return [csSeg('symbol', csSymbolText(value))];
        return null;
    }

    function csTag(value) {
        try { return Object.prototype.toString.call(value).slice(8, -1); } catch (e) { return 'Object'; }
    }

    function csClassName(value) {
        try {
            var proto = Object.getPrototypeOf(value);
            if (!proto) return 'Object';
            var ctor = Object.getOwnPropertyDescriptor(proto, 'constructor');
            var name = ctor && typeof ctor.value === 'function' ? ctor.value.name : '';
            return typeof name === 'string' && name ? name : 'Object';
        } catch (e) { return 'Object'; }
    }

    function csIsNode(value) {
        try {
            return typeof value.nodeType === 'number' && typeof value.nodeName === 'string'
                && typeof value.cloneNode === 'function';
        } catch (e) { return false; }
    }

    function csKindOf(value) {
        if (typeof value === 'function') return 'function';
        if (Array.isArray(value)) return 'array';
        var tag = csTag(value);
        if (tag === 'Error' || tag === 'DOMException' || value instanceof Error) return 'error';
        if (tag === 'Map') return 'map';
        if (tag === 'Set') return 'set';
        if (tag === 'Date') return 'date';
        if (tag === 'RegExp') return 'regexp';
        if (tag === 'Promise') return 'promise';
        if (csIsNode(value)) return 'node';
        if (tag === 'NodeList' || tag === 'HTMLCollection' || tag === 'Arguments' || /Array$/.test(tag)) {
            try { if (typeof value.length === 'number') return 'array'; } catch (e) {}
        }
        return 'object';
    }

    function csErrorText(error) {
        try { return String(error.name) + ': ' + String(error.message); } catch (e) { return 'Error'; }
    }

    // Chrome's function description: prefix ("ƒ", "async ƒ", "class"), the
    // source body, and an abbreviation like "ƒ greet(name)".
    function csFunctionInfo(fn, defaultName) {
        var text;
        try { text = Function.prototype.toString.call(fn); } catch (e) { text = 'function () { [native code] }'; }
        text = text.replace(/^function [gs]et /, 'function ').replace(/^function [gs]et\(/, 'function(').replace(/^[gs]et /, '');
        defaultName = defaultName || '';
        var nameAndArgs = function (body) {
            var start = body.indexOf('(');
            var end = body.match(/\)\s*{/);
            if (start !== -1 && end && end.index > start) {
                return (body.slice(0, start).trim() || defaultName) + body.slice(start, end.index + 1);
            }
            return defaultName + '()';
        };
        var asyncMatch = text.match(/^(async\s+function)/);
        if (text.indexOf('class ') === 0 || text.indexOf('class{') === 0) {
            var classBody = text.slice(5);
            var className = /^[^{\s]+/.exec(classBody.trim());
            return { prefix: 'class', body: classBody, abbreviation: className ? className[0] : defaultName };
        }
        if (asyncMatch) {
            var asyncBody = text.slice(asyncMatch[1].length);
            return { prefix: 'async ƒ', body: asyncBody, abbreviation: nameAndArgs(asyncBody) };
        }
        if (text.indexOf('function*') === 0) {
            var genBody = text.slice(9);
            return { prefix: 'ƒ*', body: genBody, abbreviation: nameAndArgs(genBody) };
        }
        if (text.indexOf('function') === 0) {
            var body = text.slice(8);
            return { prefix: 'ƒ', body: body, abbreviation: nameAndArgs(body) };
        }
        var arrow = text.indexOf('=>');
        if (arrow > 0) {
            var abbreviation = text;
            if (defaultName) abbreviation = defaultName + '()';
            else if (text.length > 60) abbreviation = text.slice(0, arrow + 2) + ' {' + CS_ELLIPSIS + '}';
            return { prefix: '', body: text, abbreviation: abbreviation };
        }
        return { prefix: 'ƒ', body: text, abbreviation: nameAndArgs(text) };
    }

    function csFunctionSegs(fn, full, defaultName) {
        var info = csFunctionInfo(fn, defaultName);
        var rest = full ? info.body.replace(/^\s+/, '') : info.abbreviation;
        if (!info.prefix) return [csSeg('function', rest)];
        return [csSeg('fnprefix', info.prefix), csSeg('function', ' ' + rest)];
    }

    function csNodeTitle(node) {
        try {
            if (node.nodeType === 9) return '#document';
            if (node.nodeType === 11) return '#document-fragment';
            if (node.nodeType === 3) return '"' + String(node.nodeValue) + '"';
            if (node.nodeType !== 1) return String(node.nodeName).toLowerCase();
            var title = String(node.localName || node.nodeName).toLowerCase();
            if (node.id) title += '#' + node.id;
            var classes = typeof node.getAttribute === 'function' ? node.getAttribute('class') : '';
            if (classes && classes.trim()) title += '.' + classes.trim().split(/\s+/).join('.');
            return title;
        } catch (e) { return 'node'; }
    }

    // Start and end tags taken from the element's own outerHTML.
    function csElementTags(element) {
        var outer = String(element.outerHTML);
        var inner = String(element.innerHTML);
        var name = String(element.localName || element.nodeName).toLowerCase();
        var end = '<' + '/' + name + '>';
        var hasEnd = outer.slice(-end.length).toLowerCase() === end;
        var startLength = outer.length - inner.length - (hasEnd ? end.length : 0);
        return {
            outer: outer,
            start: outer.slice(0, Math.max(startLength, 0)),
            end: hasEnd ? outer.slice(-end.length) : ''
        };
    }

    function csElementInline(element) {
        var children = element.childNodes;
        if (!children || children.length === 0) return true;
        return children.length === 1 && children[0].nodeType === 3
            && String(children[0].nodeValue).length <= CS_CONSOLE_LIMITS.inlineText;
    }

    // Short description of a value nested inside a preview: Array(2), {…}, 'Ash'.
    function csNestedSegs(value) {
        var primitive = csPrimitiveSegs(value, 'preview');
        if (primitive) return primitive;
        var kind = csKindOf(value);
        if (kind === 'function') return [csSeg('function', 'ƒ')];
        if (kind === 'array') {
            var name = Array.isArray(value) ? 'Array' : csClassName(value);
            return [csSeg('subtle', name + '(' + value.length + ')')];
        }
        if (kind === 'map' || kind === 'set') return [csSeg('subtle', (kind === 'map' ? 'Map' : 'Set') + '(' + value.size + ')')];
        if (kind === 'error') return [csSeg('text', csErrorText(value))];
        if (kind === 'node') return [csSeg('node', csNodeTitle(value))];
        if (kind === 'date') return [csSeg('text', String(value))];
        if (kind === 'regexp') return [csSeg('regexp', String(value))];
        if (kind === 'promise') return [csSeg('subtle', 'Promise')];
        var className = csClassName(value);
        return [csSeg('subtle', className === 'Object' ? '{' + CS_ELLIPSIS + '}' : className)];
    }

    function csKeyName(key) {
        if (typeof key === 'symbol') return '[' + csSymbolText(key) + ']';
        return /^\s|\s$|^$|\n/.test(key) ? '"' + key.replace(/\n/g, '↵') + '"' : key;
    }

    function csIsIndex(key, length) {
        if (typeof key !== 'string') return false;
        var index = Number(key) >>> 0;
        return String(index) === key && index < length;
    }

    function csDescriptor(value, key) {
        try { return Object.getOwnPropertyDescriptor(value, key); } catch (e) { return undefined; }
    }

    function csOwnKeys(value) {
        try { return Reflect.ownKeys(value); } catch (e) { return []; }
    }

    function csIsNativeFunction(fn) {
        try { return typeof fn === 'function' && /\{\s*\[native code\]\s*\}\s*$/.test(Function.prototype.toString.call(fn)); } catch (e) { return false; }
    }

    function csIsWindow(value) {
        try { return csTag(value) === 'Window' || (value.window === value && value.self === value); } catch (e) { return false; }
    }

    // A plain object's properties as Chrome lists them: own properties first,
    // then accessors from the prototype chain (nearest first, stopping before
    // Object.prototype). Native getters, like Response.status or
    // Event.isTrusted, are read; user-defined getters never run.
    // Each row: { key, enumerable, state: 'value' | 'getter', value }.
    function csObjectRows(value, withPrototypes) {
        var rows = [];
        var seen = new Set();
        var addAccessor = function (key, desc, enumerable) {
            if (csIsNativeFunction(desc.get)) {
                try {
                    rows.push({ key: key, enumerable: enumerable, state: 'value', value: desc.get.call(value) });
                    return;
                } catch (e) { /* a throwing getter shows (...) */ }
            }
            rows.push({ key: key, enumerable: enumerable, state: 'getter' });
        };
        var keys = csOwnKeys(value);
        for (var i = 0; i < keys.length; i++) {
            var desc = csDescriptor(value, keys[i]);
            if (!desc) continue;
            seen.add(keys[i]);
            if ('value' in desc) rows.push({ key: keys[i], enumerable: desc.enumerable, state: 'value', value: desc.value });
            else if (desc.get) addAccessor(keys[i], desc, desc.enumerable || csIsNativeFunction(desc.get));
            else rows.push({ key: keys[i], enumerable: desc.enumerable, state: 'getter' });
        }
        if (!withPrototypes) return rows;
        var proto;
        try { proto = Object.getPrototypeOf(value); } catch (e) { proto = null; }
        var read = 0;
        while (proto && proto !== Object.prototype && read < CS_CONSOLE_LIMITS.accessors) {
            var protoKeys = csOwnKeys(proto);
            for (var j = 0; j < protoKeys.length && read < CS_CONSOLE_LIMITS.accessors; j++) {
                var key = protoKeys[j];
                if (key === 'constructor' || typeof key === 'symbol' || seen.has(key)) continue;
                var protoDesc = csDescriptor(proto, key);
                if (!protoDesc || !protoDesc.get) continue;
                seen.add(key);
                read++;
                addAccessor(key, protoDesc, true);
            }
            try { proto = Object.getPrototypeOf(proto); } catch (e) { proto = null; }
        }
        return rows;
    }

    function csPushItem(segs, count) { if (count > 0) segs.push(csSeg('text', ', ')); }

    // Chrome's one-line preview of an object, array, Map, Set, or element.
    function csPreviewSegs(value) {
        var kind = csKindOf(value);
        var segs = [];
        var count = 0;
        var overflow = false;
        if (kind === 'function') return csFunctionSegs(value, true);
        if (kind === 'error' || kind === 'date' || kind === 'regexp') return csNestedSegs(value);
        if (kind === 'promise') {
            return [csSeg('text', 'Promise '), csSeg('text', '{'), csSeg('subtle', '<pending>'), csSeg('text', '}')];
        }
        if (kind === 'node') {
            if (value.nodeType !== 1) return [csSeg('node', csNodeTitle(value))];
            var tags = csElementTags(value);
            if (csElementInline(value)) return [csSeg('node', tags.outer)];
            return [csSeg('node', tags.start), csSeg('subtle', CS_ELLIPSIS), csSeg('node', tags.end)];
        }
        if (kind === 'array') {
            var length = value.length;
            var arrayName = Array.isArray(value) ? 'Array' : csClassName(value);
            var lengthText = length > 1 ? '(' + length + ')' : '';
            var description = arrayName === 'Array' ? lengthText : arrayName + lengthText;
            if (description) segs.push(csSeg('subtle', description + ' '));
            segs.push(csSeg('text', '['));
            var keys = csOwnKeys(value);
            var indexes = [];
            var others = [];
            for (var i = 0; i < keys.length; i++) {
                if (csIsIndex(keys[i], length)) indexes.push(Number(keys[i]));
                else if (keys[i] !== 'length') {
                    var otherDesc = csDescriptor(value, keys[i]);
                    if (otherDesc && otherDesc.enumerable) others.push(keys[i]);
                }
            }
            indexes.sort(function (a, b) { return a - b; });
            overflow = indexes.length > CS_CONSOLE_LIMITS.indexes || others.length > CS_CONSOLE_LIMITS.props;
            var shown = indexes.slice(0, CS_CONSOLE_LIMITS.indexes);
            var gap = function (n) { return csSeg('undefined', n === 1 ? 'empty' : 'empty × ' + n); };
            var previous = -1;
            for (var j = 0; j < shown.length; j++) {
                var index = shown[j];
                if (!overflow && index - previous > 1) { csPushItem(segs, count++); segs.push(gap(index - previous - 1)); }
                csPushItem(segs, count++);
                if (overflow && index !== j) segs.push(csSeg('subtle', index + ': '));
                var itemDesc = csDescriptor(value, String(index));
                if (itemDesc && !('value' in itemDesc)) segs.push(csSeg('subtle', '(...)'));
                else Array.prototype.push.apply(segs, csNestedSegs(itemDesc ? itemDesc.value : value[index]));
                previous = index;
            }
            if (!overflow && length - previous > 1 && length - previous - 1 > 0) { csPushItem(segs, count++); segs.push(gap(length - previous - 1)); }
            var otherShown = others.slice(0, CS_CONSOLE_LIMITS.props);
            for (var k = 0; k < otherShown.length; k++) {
                var od = csDescriptor(value, otherShown[k]);
                if (od && !('value' in od)) continue;
                csPushItem(segs, count++);
                segs.push(csSeg('subtle', csKeyName(otherShown[k])), csSeg('text', ': '));
                Array.prototype.push.apply(segs, csNestedSegs(od ? od.value : undefined));
            }
            if (overflow) segs.push(csSeg('text', count > 0 ? ', ' + CS_ELLIPSIS : CS_ELLIPSIS));
            segs.push(csSeg('text', ']'));
            return segs;
        }
        if (kind === 'map' || kind === 'set') {
            segs.push(csSeg('subtle', (kind === 'map' ? 'Map' : 'Set') + '(' + value.size + ') '), csSeg('text', '{'));
            var entries = kind === 'map' ? Map.prototype.entries.call(value) : Set.prototype.values.call(value);
            for (var step = entries.next(); !step.done; step = entries.next()) {
                if (count >= CS_CONSOLE_LIMITS.entries) { overflow = true; break; }
                csPushItem(segs, count++);
                if (kind === 'map') {
                    Array.prototype.push.apply(segs, csNestedSegs(step.value[0]));
                    segs.push(csSeg('text', ' => '));
                    Array.prototype.push.apply(segs, csNestedSegs(step.value[1]));
                } else {
                    Array.prototype.push.apply(segs, csNestedSegs(step.value));
                }
            }
            if (overflow) segs.push(csSeg('text', ', ' + CS_ELLIPSIS));
            segs.push(csSeg('text', '}'));
            return segs;
        }
        if (csIsWindow(value)) return [csSeg('subtle', 'Window')];
        var className = csClassName(value);
        if (className !== 'Object') segs.push(csSeg('subtle', className + ' '));
        segs.push(csSeg('text', '{'));
        var objectRows = csObjectRows(value, true);
        var picked = [];
        for (var m = 0; m < objectRows.length; m++) {
            var objectRow = objectRows[m];
            // Chrome leaves user getters out of the preview; the tree shows (...).
            if (!objectRow.enumerable || objectRow.state !== 'value') continue;
            if (picked.length >= CS_CONSOLE_LIMITS.props) { overflow = true; break; }
            picked.push({ key: objectRow.key, value: objectRow.value });
        }
        // Chrome lists functions after other properties.
        var ordered = picked.filter(function (p) { return typeof p.value !== 'function'; })
            .concat(picked.filter(function (p) { return typeof p.value === 'function'; }));
        for (var n = 0; n < ordered.length; n++) {
            csPushItem(segs, count++);
            segs.push(csSeg('subtle', csKeyName(ordered[n].key)), csSeg('text', ': '));
            Array.prototype.push.apply(segs, csNestedSegs(ordered[n].value));
        }
        if (overflow) segs.push(csSeg('text', count > 0 ? ', ' + CS_ELLIPSIS : CS_ELLIPSIS));
        segs.push(csSeg('text', '}'));
        return segs;
    }

    // Chrome's natural order, with names starting "_" last.
    function csCompareNames(a, b) {
        if (a.charAt(0) === '_' && b.charAt(0) !== '_') return 1;
        if (b.charAt(0) === '_' && a.charAt(0) !== '_') return -1;
        var chunk = /(\d+|\D+)/g;
        var ca = a.match(chunk) || [];
        var cb = b.match(chunk) || [];
        for (var i = 0; i < Math.min(ca.length, cb.length); i++) {
            if (ca[i] === cb[i]) continue;
            var na = /^\d/.test(ca[i]);
            var nb = /^\d/.test(cb[i]);
            if (na && nb && Number(ca[i]) !== Number(cb[i])) return Number(ca[i]) - Number(cb[i]);
            return ca[i] < cb[i] ? -1 : 1;
        }
        return ca.length - cb.length;
    }

    function csChildValue(value, ctx, depth, name) {
        var primitive = csPrimitiveSegs(value, 'tree');
        if (primitive) return { preview: primitive };
        var kind = csKindOf(value);
        if (kind === 'function') return { preview: csFunctionSegs(value, false, name) };
        // A node held in a property reads as Chrome's title (input#tickets).
        if (kind === 'node' && name !== undefined) return { preview: [csSeg('node', csNodeTitle(value))] };
        return csValueNode(value, ctx, depth);
    }

    // Reserve a tree node before building it, so the per-call budget counts
    // exactly what reaches the host.
    function csReserve(node, ctx) {
        if (ctx.nodes >= CS_CONSOLE_LIMITS.nodes) { node.truncated = true; return false; }
        ctx.nodes++;
        return true;
    }

    function csPropertyChildren(value, node, ctx, depth) {
        var isArray = csKindOf(value) === 'array';
        var rows = csObjectRows(value, !isArray);
        rows.sort(function (a, b) {
            if (a.enumerable !== b.enumerable) return a.enumerable ? -1 : 1;
            var sa = typeof a.key === 'symbol';
            var sb = typeof b.key === 'symbol';
            if (sa !== sb) return sa ? 1 : -1;
            if (sa) return 0;
            return csCompareNames(a.key, b.key);
        });
        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            if (!csReserve(node, ctx)) return;
            var label = typeof row.key === 'symbol' ? '[' + csSymbolText(row.key) + ']' : csKeyName(row.key);
            var child = { name: label, value: null };
            if (!row.enumerable) child.subtle = true;
            if (row.state === 'value') {
                child.value = csChildValue(row.value, ctx, depth + 1, typeof row.key === 'string' && !isArray ? row.key : undefined);
            } else {
                child.value = { preview: [csSeg('subtle', '(...)')] };
            }
            node.children.push(child);
        }
    }

    function csEntriesChild(value, kind, ctx, depth) {
        var entriesNode = { preview: [], children: [] };
        var iterator = kind === 'map' ? Map.prototype.entries.call(value) : Set.prototype.values.call(value);
        var index = 0;
        for (var step = iterator.next(); !step.done; step = iterator.next()) {
            if (!csReserve(entriesNode, ctx)) break;
            var entryValue;
            if (kind === 'map') {
                var key = step.value[0];
                var mapped = step.value[1];
                entryValue = {
                    preview: [csSeg('text', '{')].concat(csNestedSegs(key), [csSeg('text', ' => ')], csNestedSegs(mapped), [csSeg('text', '}')]),
                    children: []
                };
                if (csReserve(entryValue, ctx)) entryValue.children.push({ name: 'key', value: csChildValue(key, ctx, depth + 3) });
                if (csReserve(entryValue, ctx)) entryValue.children.push({ name: 'value', value: csChildValue(mapped, ctx, depth + 3) });
            } else {
                entryValue = csChildValue(step.value, ctx, depth + 2);
            }
            entriesNode.children.push({ name: String(index++), value: entryValue });
        }
        return entriesNode;
    }

    function csNodeChildren(value, node, ctx, depth) {
        var children = value.childNodes || [];
        for (var i = 0; i < children.length; i++) {
            var childNode = children[i];
            if (childNode.nodeType === 3 && !String(childNode.nodeValue).trim()) continue;
            if (!csReserve(node, ctx)) return;
            var child;
            if (childNode.nodeType === 3) {
                var text = String(childNode.nodeValue);
                child = { value: { preview: [csSeg('text', '"' + text.trim().replace(/\s+/g, ' ') + '"')] } };
            } else if (childNode.nodeType === 8) {
                child = { value: { preview: [csSeg('subtle', '<' + '!--' + String(childNode.nodeValue) + '--' + '>')] } };
            } else if (childNode.nodeType === 10) {
                child = { value: { preview: [csSeg('node', '<' + '!DOCTYPE ' + String(childNode.nodeName) + '>')] } };
            } else {
                child = { value: csValueNode(childNode, ctx, depth + 1) };
            }
            node.children.push(child);
        }
    }

    function csExpandable(value, kind) {
        if (kind === 'object') return !csIsWindow(value);
        if (kind === 'array' || kind === 'map' || kind === 'set') return true;
        if (kind === 'node') {
            try {
                if (value.nodeType === 1) return !csElementInline(value);
                return !!(value.childNodes && value.childNodes.length);
            } catch (e) { return false; }
        }
        return false;
    }

    // One object in the tree: its preview plus one child row per property.
    function csValueNode(value, ctx, depth) {
        var kind = csKindOf(value);
        var node = { preview: csPreviewSegs(value) };
        if (!csExpandable(value, kind)) return node;
        if (ctx.stack.indexOf(value) !== -1) {
            node.preview = node.preview.concat([csSeg('subtle', ' [circular]')]);
            return node;
        }
        node.children = [];
        if (kind === 'node' && value.nodeType === 1) {
            var tags = csElementTags(value);
            node.open = [csSeg('node', tags.start)];
            if (tags.end) node.close = [csSeg('node', tags.end)];
        }
        if (depth >= CS_CONSOLE_LIMITS.depth) { node.truncated = true; return node; }
        ctx.stack.push(value);
        try {
            if (kind === 'node') csNodeChildren(value, node, ctx, depth);
            else if (kind === 'map' || kind === 'set') {
                if (csReserve(node, ctx)) node.children.push({ name: '[[Entries]]', subtle: true, value: csEntriesChild(value, kind, ctx, depth) });
                if (csReserve(node, ctx)) node.children.push({ name: 'size', subtle: true, value: { preview: [csSeg('number', String(value.size))] } });
            } else csPropertyChildren(value, node, ctx, depth);
        } finally {
            ctx.stack.pop();
        }
        if (!node.children.length && !node.truncated) delete node.children;
        return node;
    }

    function csSafeString(value) {
        try { return String(value); } catch (e) { return Object.prototype.toString.call(value); }
    }

    // One part per console argument: { kind, text, value? } (issue #29 follow-up).
    function describeRuntimeValue(value, ctx) {
        if (!ctx || typeof ctx !== 'object') ctx = { nodes: 0, stack: [] };
        try {
            var primitive = csPrimitiveSegs(value, 'top');
            if (primitive) {
                var primitiveKind = value === null ? 'null' : typeof value;
                return { kind: primitiveKind, text: csSegText(primitive) };
            }
            var kind = csKindOf(value);
            if (kind === 'error') return { kind: 'error', text: csErrorText(value) };
            if (kind === 'function') {
                var fnSegs = csFunctionSegs(value, true);
                return { kind: 'function', text: csSegText(fnSegs), value: { preview: fnSegs } };
            }
            var node = csValueNode(value, ctx, 0);
            return { kind: 'object', text: csSegText(node.preview), value: node };
        } catch (e) {
            return { kind: 'object', text: csSafeString(value) };
        }
    }

    // The console hook's message body: Chrome's one-line text and the parts.
    function describeConsoleArgs(args) {
        var ctx = { nodes: 0, stack: [] };
        var parts = [];
        for (var i = 0; i < args.length; i++) parts.push(describeRuntimeValue(args[i], ctx));
        return { payload: parts.map(function (part) { return part.text; }).join(' '), parts: parts };
    }
`;
