// Parse data from a MySQL backup without executing its SQL or backed-up PHP.
export function* statements(sql) {
  let start = 0, quote = null, parts = [];
  for (let index = 0; index < sql.length; index++) {
    const char = sql[index], next = sql[index + 1];
    if (quote) {
      if (char === '\\' && quote !== '`') { index++; continue; }
      if (char === quote) { if (next === quote) index++; else quote = null; }
      continue;
    }
    if (char === "'" || char === '"' || char === '`') { quote = char; continue; }
    if ((char === '-' && next === '-' && /\s/.test(sql[index + 2] || '')) || char === '#') {
      parts.push(sql.slice(start, index));
      const end = sql.indexOf('\n', index);
      index = end < 0 ? sql.length : end;
      parts.push(' '); start = index + 1;
    } else if (char === '/' && next === '*') {
      parts.push(sql.slice(start, index));
      const end = sql.indexOf('*/', index + 2);
      if (end < 0) throw new Error('Unterminated SQL comment');
      index = end + 1; parts.push(' '); start = index + 1;
    } else if (char === ';') {
      parts.push(sql.slice(start, index));
      const statement = parts.join('').trim();
      if (statement) yield statement;
      parts = []; start = index + 1;
    }
  }
  if (quote) throw new Error('Unterminated SQL string');
  const remaining = [...parts, sql.slice(start)].join('').trim();
  if (remaining) yield remaining;
}

export function parseRows(input, columns) {
  const rows = []; let cursor = 0;
  const space = () => { while (cursor < input.length && /\s/.test(input[cursor])) cursor++; };
  function value() {
    space();
    if (input.slice(cursor, cursor + 7).toLowerCase() === '_binary') { cursor += 7; space(); }
    const quote = input[cursor];
    if (quote === "'" || quote === '"') {
      cursor++; let result = '';
      while (cursor < input.length) {
        const char = input[cursor++];
        if (char === '\\') {
          const escaped = input[cursor++];
          result += ({ '0': '\0', b: '\b', n: '\n', r: '\r', t: '\t', Z: '\x1a' })[escaped] ?? escaped;
        } else if (char === quote) {
          if (input[cursor] === quote) { result += quote; cursor++; }
          else return result;
        } else result += char;
      }
      throw new Error('Unterminated backup value');
    }
    const start = cursor;
    while (cursor < input.length && ![',', ')'].includes(input[cursor])) cursor++;
    const raw = input.slice(start, cursor).trim();
    if (/^NULL$/i.test(raw)) return null;
    if (/^-?\d+(\.\d+)?([Ee][+-]?\d+)?$/.test(raw)) return raw;
    if (/^0x[0-9a-f]*$/i.test(raw)) return Buffer.from(raw.slice(2), 'hex').toString('utf8');
    throw new Error(`Unsupported SQL value syntax near offset ${start}`);
  }
  while (cursor < input.length) {
    space();
    if (input[cursor] === ',') { cursor++; space(); }
    if (cursor === input.length) break;
    if (input[cursor++] !== '(') throw new Error('Expected an INSERT row');
    const values = [];
    for (;;) {
      values.push(value()); space();
      if (input[cursor] === ')') { cursor++; break; }
      if (input[cursor++] !== ',') throw new Error('Invalid INSERT separator');
    }
    if (values.length !== columns.length) throw new Error(`Column count mismatch: ${values.length} values for ${columns.length} columns`);
    rows.push(Object.fromEntries(columns.map((name, index) => [name, values[index]])));
  }
  return rows;
}

export function readDump(sql, prefix) {
  const wanted = new Set(['posts', 'postmeta', 'terms', 'term_taxonomy', 'term_relationships', 'users', 'options'].map(name => prefix + name));
  const schemas = new Map(), tables = new Map();
  for (const statement of statements(sql)) {
    const create = statement.match(/^CREATE TABLE(?: IF NOT EXISTS)?\s+`([^`]+)`/i);
    if (create && wanted.has(create[1])) {
      const columns = [...statement.matchAll(/^\s*`([^`]+)`\s+\w/gm)].map(match => match[1]);
      if (!columns.length) throw new Error(`No columns in ${create[1]}`);
      schemas.set(create[1], columns);
      tables.set(create[1], []);
      continue;
    }
    const insert = statement.match(/^INSERT(?: IGNORE)? INTO\s+`([^`]+)`\s*(\([^)]*\))?\s*VALUES\s*/i);
    if (insert && wanted.has(insert[1])) {
      const columns = insert[2] ? [...insert[2].matchAll(/`([^`]+)`/g)].map(match => match[1]) : schemas.get(insert[1]);
      if (!columns?.length) throw new Error(`Missing schema for ${insert[1]}`);
      const rows = parseRows(statement.slice(insert[0].length), columns);
      if (!tables.has(insert[1])) tables.set(insert[1], []);
      tables.get(insert[1]).push(...rows);
    }
  }
  return Object.fromEntries([...tables].map(([name, rows]) => [name.slice(prefix.length), rows]));
}
