/**
 * Service Worker da Liberdade Econômica (PWA).
 * Pré-carrega o app para abrir offline. Páginas: rede primeiro. Demais arquivos: cache e atualização em segundo plano.
 * Sem telemetria. CACHE_VERSION e APP_SHELL são gerados por scripts/versionar.mjs: não edite à mão.
 */
// <versionar>
const CACHE_VERSION = 'liberdade-economica-20261104-1710';
const APP_SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-32.png",
  "icons/icon-192.png",
  "icons/apple-touch-icon.png",
  "css/fonts.css?v=20261104-1710",
  "vendor/stk-gov/stk-gov.css?v=20261104-1710",
  "css/style.css?v=20261104-1710",
  "css/liberdade.css?v=20261104-1710",
  "vendor/chart.js/chart.umd.js",
  "icons/icon-64.png",
  "src/Program.js?v=20261104-1710",
  "src/application/CivicPressureService.js?v=20261104-1710",
  "src/domain/ArrecadacaoReferencia.js?v=20261104-1710",
  "src/domain/CasosReais.js?v=20261104-1710",
  "src/domain/CivicPressureModel.js?v=20261104-1710",
  "src/domain/CivicState.js?v=20261104-1710",
  "src/domain/DireitosGreve.js?v=20261104-1710",
  "src/domain/DivisaoCusto.js?v=20261104-1710",
  "src/domain/GreveProducaoModel.js?v=20261104-1710",
  "src/domain/SectorDrainageModel.js?v=20261104-1710",
  "src/domain/SetorConsumo.js?v=20261104-1710",
  "src/domain/TiposGreve.js?v=20261104-1710",
  "src/infrastructure/ChartAdapter.js?v=20261104-1710",
  "src/infrastructure/CsvExporter.js?v=20261104-1710",
  "src/infrastructure/IbgeGateway.js?v=20261104-1710",
  "src/ui/CenarioUrl.js?v=20261104-1710",
  "src/ui/CivicView.js?v=20261104-1710",
  "src/ui/SvgIcons.js?v=20261104-1710",
  "vendor/fonts/ibm-plex-mono-latin-400-normal.woff2",
  "vendor/fonts/ibm-plex-mono-latin-500-normal.woff2",
  "vendor/fonts/ibm-plex-mono-latin-600-normal.woff2",
  "vendor/fonts/inter-latin-400-normal.woff2",
  "vendor/fonts/inter-latin-500-normal.woff2",
  "vendor/fonts/inter-latin-600-normal.woff2",
  "vendor/fonts/inter-latin-700-normal.woff2",
  "vendor/fonts/space-grotesk-latin-ext.woff2",
  "vendor/fonts/space-grotesk-latin.woff2",
  "vendor/stk-gov/stk-gov-shell.js?v=20261104-1710",
  "vendor/stk-gov/stk-gov-pwa.js?v=20261104-1710",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png"
];
// </versionar>

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação: rede primeiro (HTML sempre atual); sem rede, abre o index.html do shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('index.html', { cacheName: CACHE_VERSION }))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then(async cache => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then(response => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
