/**
 * Teste de fumaça da tela, num Chrome de verdade (headless), sem dependências npm.
 * Sobe um servidor local e confere: sem erros de JavaScript nem bloqueios da CSP, abas, endereço
 * da aba e do cenário, botão Compartilhar, celular sem rolagem lateral, atalho de teclado, service worker e abertura sem internet.
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
  // avaliar() devolve o texto "ERRO ..." quando a expressão quebra: isso é falha, não valor verdadeiro
  if (cond && !String(cond).startsWith('ERRO')) { passou++; console.log(`  [PASS] ${msg}`); } else { falhou++; console.error(`  [FAIL] ${msg}`); }
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

  console.log('\n3. Cenário no endereço');
  const trocarPara = async url => { await cdp('Page.navigate', { url: 'about:blank' }); await esperar(300); await abrir(url); };
  await trocarPara(`${base}#tipo=publico&orgao=inss&servidores=20000&adesao=35&atendimentos=45&dias=30`);
  assert(await avaliar('document.querySelector("#tipoChips [aria-pressed=true]").dataset.id === "publico" && document.querySelector("#orgaoChips [aria-pressed=true]").dataset.id === "inss"'), 'Link marca o tipo e o órgão');
  assert(await avaliar('cInputServidores.value === "20000" && cInputAdesaoPub.value === "35" && cInputAtendimentos.value === "40" && cInputDays.value === "30"'), 'Link acerta os controles e os números vencem os valores do órgão');
  await trocarPara(`${base}#tipo=transporte&setor=carga&adesao=55&recuperacao=20&cascata=0&aba=greves`);
  assert(await visivel('abaGreves') && await avaliar('cInputAdesao.value === "55" && cInputRecuperacao.value === "20" && !cInputCascata.checked'), 'Link abre a aba e aplica o cenário de produção');
  await avaliar('abaBtnDireitos.click()'); await esperar(200);
  assert(await avaliar('location.hash.includes("aba=direitos") && location.hash.includes("adesao=55")'), 'Trocar de aba mantém o cenário no endereço');
  await avaliar('abaBtnSimulador.click()'); await esperar(200);
  assert(await avaliar('!location.hash.includes("aba=") && location.hash.includes("adesao=55")'), 'Voltar ao simulador tira só a aba do endereço');
  await avaliar('location.hash = "tipo=geral&dias=9"'); await esperar(300);
  assert(await avaliar('document.querySelector("#tipoChips [aria-pressed=true]").dataset.id === "geral" && cInputDays.value === "9"'), 'Colar outro link na mesma página aplica o cenário');

  console.log('\n4. Botão Compartilhar');
  await trocarPara(base);
  const copiar = 'new Promise(r => { window.__copia = null; Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async t => { window.__copia = t; r(t); } } }); btnShareCenario.click(); })';
  await avaliar('document.querySelector("#tipoChips [data-id=categoria]").click()'); await esperar(200);
  await avaliar('(() => { cInputDays.value = 37; cInputDays.dispatchEvent(new Event("input")); cInputAdesao.value = 44; cInputAdesao.dispatchEvent(new Event("input")); })()');
  await avaliar('abaBtnGreves.click()'); await esperar(200);
  const link = await avaliar(copiar);
  assert(/tipo=categoria/.test(link) && /dias=37/.test(link) && /adesao=44/.test(link) && /aba=greves/.test(link), 'Copia o link com o cenário e a aba atuais');
  await esperar(100);
  assert(await avaliar('btnShareCenario.querySelector(".action-btn-label").textContent === "Copiado!" && toastNotification.classList.contains("show")'), 'Botão e aviso confirmam a cópia');
  await esperar(2200);
  assert(await avaliar('btnShareCenario.querySelector(".action-btn-label").textContent === "Copiar link"'), 'Botão volta ao texto normal');
  await avaliar('Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined }); btnShareCenario.click()'); await esperar(200);
  assert(await avaliar('location.hash.includes("dias=37") && /barra de endereço/.test(toastMessage.textContent)'), 'Sem área de transferência, o link vai para a barra de endereço');
  await trocarPara(link);
  assert(await visivel('abaGreves') && await avaliar('document.querySelector("#tipoChips [aria-pressed=true]").dataset.id === "categoria" && cInputDays.value === "37" && cInputAdesao.value === "44"'), 'O link copiado reabre o mesmo cenário');

  console.log('\n5. Celular (400 e 320 px)');
  await tela(400, true);
  await cdp('Page.navigate', { url: 'about:blank' }); await esperar(300);
  await abrir();
  assert(await semRolagemLateral(), 'Simulador sem rolagem lateral');
  await avaliar('abaBtnGreves.click()'); await esperar(300);
  assert(await visivel('abaGreves') && await semRolagemLateral(), 'Greves reais sem rolagem lateral');
  assert(await avaliar('getComputedStyle(appBottomNav).display !== "none" && getComputedStyle(appSidebar).position !== "static"'), 'Barra inferior aparece no celular');
  await avaliar('document.querySelector(".bottom-nav-item[data-aba=direitos]").click()'); await esperar(300);
  assert(await visivel('abaDireitos') && await avaliar('document.querySelector(".bottom-nav-item[data-aba=direitos]").classList.contains("active")'), 'Barra inferior troca de aba e marca a ativa');
  assert(await avaliar('!!document.getElementById("btnSyncIbge").offsetParent && !!document.querySelector("[data-action=export-csv]").offsetParent'), 'IBGE e CSV continuam ao alcance no celular');

  console.log('\n3b. Tablet (900 px): gaveta');
  await tela(900);
  await avaliar('btnToggleSidebar.click()'); await esperar(400);
  assert(await avaliar('appSidebar.classList.contains("sidebar-open")'), 'Menu abre a gaveta');
  await avaliar('abaBtnGreves.click()'); await esperar(400);
  assert(await visivel('abaGreves') && await avaliar('!appSidebar.classList.contains("sidebar-open")'), 'Escolher a aba fecha a gaveta');
  await tela(320, true); await esperar(300);
  assert(await avaliar('document.querySelector(".action-menu").offsetHeight > 0') && await semRolagemLateral(), 'Em 320 px o menu Compartilhar continua no topo, sem rolagem lateral');
  await avaliar('document.querySelector(".action-menu [aria-haspopup]").click()'); await esperar(200);
  assert(await avaliar('btnShareCenario.offsetHeight > 0'), 'Menu Compartilhar mostra Copiar link');
  await avaliar('document.body.click()');
  await tela(1400);

  console.log('\n6. Acessibilidade');
  await avaliar('abaBtnSimulador.click()'); await esperar(200);
  await avaliar('document.querySelector(".skip-link").click()');
  assert(await avaliar('document.activeElement === document.querySelector("main") && !abaSimulador.hidden'), 'Atalho leva o foco ao conteúdo sem trocar de aba');

  console.log('\n7. PWA');
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
