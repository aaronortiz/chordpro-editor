import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_MODEL = 'claude-opus-4-8';
const PROMPT_PATH = 'prompts/ultimate-guitar-to-gigperformer.md';

/**
 * Deterministic clean-up applied on top of the model output so the format is
 * guaranteed regardless of small model variations.
 */
function normalize(text) {
  return text
    // Guarantee exactly one space after "cb:" — e.g. {cb:VERSE 1:} -> {cb: VERSE 1:}
    .replace(/\{cb:\s*/g, '{cb: ')
    // Strip trailing whitespace on every line (never affects chord column alignment,
    // which depends on leading/internal spaces only)
    .replace(/[ \t]+$/gm, '')
    // Collapse 3+ consecutive blank lines down to 2
    .replace(/\n{4,}/g, '\n\n\n')
    .trimEnd() + '\n';
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error('Request body too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

/**
 * Vite plugin: adds a POST /api/convert endpoint to the dev server.
 * Accepts { text } (raw Ultimate Guitar chord sheet), returns { pro, model, usage }.
 * The Anthropic API key lives in env (ANTHROPIC_API_KEY) and never reaches the browser.
 */
export function ugConvertPlugin(env) {
  // Prefer .env, fall back to a key exported in the shell environment.
  const apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const model = env.UG_CONVERT_MODEL || process.env.UG_CONVERT_MODEL || DEFAULT_MODEL;

  return {
    name: 'ug-convert-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/convert', async (req, res) => {
        if (req.method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }
        try {
          if (!apiKey) {
            return sendJson(res, 500, {
              error: 'ANTHROPIC_API_KEY is not set. Add it to a .env file in the project root and restart the dev server.',
            });
          }

          const { text } = JSON.parse((await readBody(req)) || '{}');
          if (!text || !text.trim()) {
            return sendJson(res, 400, { error: 'No text to convert. Paste an Ultimate Guitar chord sheet first.' });
          }

          const systemPrompt = readFileSync(resolve(server.config.root, PROMPT_PATH), 'utf8');
          const { default: Anthropic } = await import('@anthropic-ai/sdk');
          const client = new Anthropic({ apiKey });

          const response = await client.messages.create({
            model,
            max_tokens: 8192,
            system: systemPrompt,
            messages: [{ role: 'user', content: text }],
          });

          const raw = response.content
            .filter((block) => block.type === 'text')
            .map((block) => block.text)
            .join('');

          sendJson(res, 200, {
            pro: normalize(raw),
            model: response.model,
            usage: response.usage,
          });
        } catch (err) {
          const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
          sendJson(res, status, { error: err?.message || String(err) });
        }
      });
    },
  };
}
