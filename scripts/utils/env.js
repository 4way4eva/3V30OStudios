const fs = require('fs');
const path = require('path');

function parseLine(line) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!match) return null;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key: match[1], value };
}

function config(options = {}) {
  const envPath = options.path ? path.resolve(options.path) : path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return { parsed: {} };
  }

  const contents = fs.readFileSync(envPath, 'utf-8');
  const parsed = {};

  contents.split(/\r?\n/).forEach((line) => {
    if (!line || /^\s*#/.test(line)) {
      return;
    }
    const result = parseLine(line);
    if (result) {
      if (typeof process.env[result.key] === 'undefined') {
        process.env[result.key] = result.value;
      }
      parsed[result.key] = result.value;
    }
  });

  return { parsed };
}

module.exports = { config };
