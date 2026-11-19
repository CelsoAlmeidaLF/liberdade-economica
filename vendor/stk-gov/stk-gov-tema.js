/**
 * STK-GOVERNO-BRAZIL — tema da página (escuro, claro ou o do sistema).
 * Fonte canônica: 8. STK-GOVERNO-BRAZIL/_design-system/stk-gov-tema.js
 * Cada projeto recebe uma cópia em vendor/stk-gov/ (node _design-system/sync.mjs): não edite a cópia.
 *
 * Script comum (não é módulo) e sem defer, antes das folhas de estilo: assim o tema vale
 * desde o primeiro desenho, sem a página piscar em escuro. A CSP dos apps proíbe script inline.
 *   <script src="vendor/stk-gov/stk-gov-tema.js" data-app="nome-do-app"></script>
 */
(function () {
  var script = document.currentScript;
  var chave = ((script && script.dataset.app) || 'stk') + '.tema';
  var PREFERENCIAS = ['escuro', 'claro', 'sistema'];
  var COR_DA_BARRA = { dark: '#1C1C1C', light: '#F7FAF8' };
  var raiz = document.documentElement;
  var sistemaClaro = window.matchMedia('(prefers-color-scheme: light)');

  function lerPreferencia() {
    try {
      var salva = localStorage.getItem(chave);
      return PREFERENCIAS.indexOf(salva) >= 0 ? salva : 'escuro';
    } catch (e) {
      return 'escuro'; // armazenamento bloqueado: vale o padrão
    }
  }

  var preferencia = lerPreferencia();

  function aplicar() {
    var claro = preferencia === 'claro' || (preferencia === 'sistema' && sistemaClaro.matches);
    var tema = claro ? 'light' : 'dark';
    if (raiz.dataset.theme === tema) return;
    var primeiraVez = !raiz.dataset.theme;
    raiz.dataset.theme = tema;
    var barra = document.querySelector('meta[name="theme-color"]');
    if (barra) barra.setAttribute('content', COR_DA_BARRA[tema]);
    if (!primeiraVez) document.dispatchEvent(new CustomEvent('stk:tema', { detail: { tema: tema } }));
  }

  window.StkGovTema = {
    preferencia: function () { return preferencia; },
    /** @param {'escuro'|'claro'|'sistema'} nova */
    definir: function (nova) {
      if (PREFERENCIAS.indexOf(nova) < 0) return;
      preferencia = nova;
      try { localStorage.setItem(chave, nova); } catch (e) { /* vale só nesta visita */ }
      aplicar();
    }
  };

  aplicar();
  sistemaClaro.addEventListener('change', function () {
    if (preferencia === 'sistema') aplicar();
  });
})();
