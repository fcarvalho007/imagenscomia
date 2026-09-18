// Runs the real edge handlers with only the Deno/Supabase network boundaries mocked.
// No credentials, network calls, participant records or provider actions are used.
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
let checks = 0;
for (const name of ['send-invoice-request', 'send-video-confirmation', 'send-video-recursos-access', 'send-video-recursos-single']) {
  let handler, writes = 0, network = 0;
  const database = {
    auth: { getUser: async () => ({ error: new Error('Invalid test JWT') }) },
    from: () => { writes++; throw new Error('Unexpected database access'); },
    rpc: () => { writes++; throw new Error('Unexpected RPC'); },
  };
  const context = vm.createContext({
    Request, Response, URL, console, atob, setTimeout, clearTimeout,
    fetch: () => { network++; throw new Error('Network forbidden in this test'); },
    Deno: { env: { get: key => ({ SUPABASE_URL: 'https://test.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-service', CRON_SECRET: 'test-cron' })[key] } },
  });
  const cache = new Map();
  async function load(url) {
    if (cache.has(url)) return cache.get(url);
    let mod;
    if (url.startsWith('https://deno.land/')) {
      mod = new vm.SyntheticModule(['serve'], function () { this.setExport('serve', fn => { handler = fn; }); }, { context });
    } else if (url.startsWith('https://esm.sh/@supabase/')) {
      mod = new vm.SyntheticModule(['createClient'], function () { this.setExport('createClient', () => database); }, { context });
    } else {
      const code = (await transform(await readFile(fileURLToPath(url), 'utf8'), { loader: 'ts', format: 'esm', target: 'es2022' })).code;
      mod = new vm.SourceTextModule(code, { context, identifier: url });
    }
    cache.set(url, mod);
    await mod.link((specifier, parent) => load(new URL(specifier, parent.identifier).href));
    return mod;
  }
  const module = await load(new URL(`../supabase/functions/${name}/index.ts`, import.meta.url).href);
  await module.evaluate();
  for (const authorization of ['', 'Bearer public-anon', 'Bearer fabricated-long-token']) {
    const response = await handler(new Request('https://test.invalid', {
      method: 'POST', headers: { authorization, 'x-crm-admin-email': 'fredericodigital@gmail.com', 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.invalid', dry_run: false }),
    }));
    assert.equal(response.status, 401, `${name}: rejects ${authorization || 'missing auth'}`);
    assert.equal(writes, 0); assert.equal(network, 0); checks++;
  }
  const preflight = await handler(new Request('https://test.invalid', { method: 'OPTIONS' }));
  assert.equal(preflight.status, 200); assert.equal(writes, 0); assert.equal(network, 0); checks++;
}
console.log(`${checks} delivery authorization checks passed; zero database/provider operations.`);
