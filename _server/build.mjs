// Produce one import-free module for Cloudflare's browser code editor.
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const template = await readFile(new URL('../_email/customer-acknowledgement.mjs', root), 'utf8');
const worker = await readFile(new URL('enquiry-worker.mjs', root), 'utf8');
const bundled = '// GENERATED: run node _server/build.mjs; do not put secrets in this file.\n' + template.replace('export function renderAcknowledgement', 'function renderAcknowledgement') + '\n' + worker.replace(/^import \{ renderAcknowledgement \} from .*;\n/m, '');
await writeFile(new URL('worker.upload.mjs', root), bundled);
console.log('Created _server/worker.upload.mjs');
