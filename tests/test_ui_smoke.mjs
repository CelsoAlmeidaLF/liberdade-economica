/**
 * Teste de fumaça da tela, num Chrome de verdade (headless), sem dependências npm.
 * Sobe um servidor local e confere: sem erros de JavaScript nem bloqueios da CSP, abas, endereço
 * da aba, celular sem rolagem lateral, atalho de teclado, service worker e abertura sem internet.
 *
 * Uso: node --experimental-websocket tests/test_ui_smoke.mjs   (Node 22+ dispensa a flag)
 * Sem Chrome instalado, o teste é pulado (sai com código 0 e avisa).
 */
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const chromeBin = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']
  .find(b => spawnSync('which', [b]).status === 0);
if (!chromeBin || typeof WebSocket === 'undefined') {
  console.log(`[PULADO] ${!chromeBin ? 'Chrome não encontrado' : 'WebSocket indisponível (use --experimental-websocket no Node 20)'}`);
  process.exit(0);
}

let passou = 0;
let falhou = 0;
const assert = (cond, msg) => {
  if (cond) { passou++; console.log(`  [PASS] ${msg}`); } else { falhou++; console.error(`  [FAIL] ${msg}`); }
};

// Servidor estático mínimo (o service worker e os módulos ES exigem http)
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const servidor = createServer(async (req, res) => {
  const caminho = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    const corpo = await readFile(join(raiz, caminho === '/' ? 'index.html' : caminho));
    res.writeHead(200, { 'Content-Type': TIPOS[extname(caminho)] || 'application/octet-stream' });
    res.end(corpo);
  } catch {
    res.writeHead(404); res.end();
  }
});
await new Promise(r => servidor.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${servidor.address().port}/index.html`;

const perfil = await mkdtemp(join(tmpdir(), 'liberdade-ui-'));
const porta = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(chromeBin, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
const esperar = ms => new Promise(r => setTimeout(r, ms));

let ws;
for (let i = 0; i < 30 && !ws; i++) {
  try {
    const abas = await (await fetch(`http://127.0.0.1:${porta}/json`)).json();
    ws = new WebSocket(abas.find(t => t.type === 'page').webSocketDebuggerUrl);
  } catch { await esperar(200); }
}
await new Promise(r => ws.addEventListener('open', r));
let seq = 0;
const pendentes = {};
const erros = [];
ws.addEventListener('message', m => {
  const d = JSON.parse(m.data);
  if (d.method === 'Log.entryAdded' && /Content Security Policy/i.test(d.params.entry.text)) erros.push(d.params.entry.text);
  if (d.method === 'Runtime.exceptionThrown') erros.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
  if (pendentes[d.id]) { pendentes[d.id](d); delete pendentes[d.id]; }
});
const cdp = (method, params = {}) => new Promise(r => { pendentes[++seq] = r; ws.send(JSON.stringify({ id: seq, method, params })); });
const avaliar = async expr => {
  const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result.exceptionDetails ? `ERRO ${r.result.exceptionDetails.exception?.description}` : r.result.result.value;
};
const tela = (largura, celular = false) => cdp('Emulation.setDeviceMetricsOverride', { width: largura, height: 900, deviceScaleFactor: 1, mobile: celular });
const abrir = async (url = base) => { await cdp('Page.navigate', { url }); await esperar(2000); };
const visivel = id => avaliar(`!document.getElementById('${id}').hidden && document.getElementById('${id}').offsetHeight > 0`);
const semRolagemLateral = () => avaliar('document.documentElement.scrollWidth <= document.documentElement.clientWidth');

try {
  await cdp('Runtime.enable');
  await cdp('Log.enable');
  await cdp('Page.enable');

  console.log('\n1. Desktop (1400 px): abas');
  await tela(1400);
  await abrir();
  assert(await visivel('abaSimulador') && !(await visivel('abaGreves')), 'Abre no simulador');
  assert(await avaliar('document.querySelectorAll("[data-icon] svg").length > 5'), 'Ícones SVG desenhados');
  await avaliar('abaBtnGreves.click()'); await esperar(300);
  assert(await visivel('abaGreves') && await avaliar('location.hash === "#greves"'), 'Aba Greves reais abre e fica no endereço');
  await avaliar('abaBtnDireitos.click()'); await esperar(300);
  assert(await visivel('abaDireitos'), 'Aba Direitos e limites abre');

  console.log('\n2. Link direto e endereço inválido');
  await cdp('Page.navigate', { url: 'about:blank' }); await esperar(300);
  await abrir(`${base}#direitos`);
  assert(await visivel('abaDireitos'), 'Link #direitos abre a aba certa');
  await cdp('Page.navigate', { url: 'about:blank' }); await esperar(300);
  await abrir(`${base}#naoexiste`);
  assert(await visivel('abaSimulador'), 'Endereço desconhecido cai no simulador');

  console.log('\n3. Celular (400 px)');
  await tela(400, true);
  await cdp('Page.navigate', { url: 'about:blank' }); await esperar(300);
  await abrir();
  assert(await semRolagemLateral(), 'Simulador sem rolagem lateral');
  await avaliar('abaBtnGreves.click()'); await esperar(300);
  assert(await visivel('abaGreves') && await semRolagemLateral(), 'Greves reais sem rolagem lateral');
  await tela(1400);

  console.log('\n4. Acessibilidade');
  await avaliar('abaBtnSimulador.click()'); await esperar(200);
  await avaliar('document.querySelector(".skip-link").click()');
  assert(await avaliar('document.activeElement === document.querySelector("main") && !abaSimulador.hidden'), 'Atalho leva o foco ao conteúdo sem trocar de aba');

  console.log('\n5. PWA');
  await avaliar('navigator.serviceWorker.ready.then(() => true)');
  await esperar(1500);
  assert(await avaliar('navigator.serviceWorker.getRegistration().then(r => !!(r && r.active))'), 'Service worker ativo');
  servidor.close(); servidor.closeAllConnections();
  await abrir();
  assert(await avaliar('document.querySelectorAll("[data-icon] svg").length > 5 && !!window.Chart'), 'Abre sem internet, com ícones e gráficos');

  assert(erros.length === 0, `Nenhum erro de JavaScript nem bloqueio da CSP${erros.length ? `: ${erros.join(' | ')}` : ''}`);
} finally {
  ws.close();
  chrome.kill();
  servidor.close();
  await rm(perfil, { recursive: true, force: true }).catch(() => {});
}

console.log(`\n========================================\nTotal: ${passou + falhou} | Passou: ${passou} | Falhou: ${falhou}\n========================================\n`);
process.exit(falhou ? 1 : 0);
