/**
 * STK-GOVERNO-BRAZIL — PWA comum: registro do Service Worker e convite de instalação do navegador.
 * Fonte canônica: 8. STK-GOVERNO-BRAZIL/_design-system/stk-gov-pwa.js.
 * Cada projeto recebe uma cópia em vendor/stk-gov/ (node _design-system/sync.mjs): não edite a cópia.
 * A UI só recebe "pode instalar?" e "instalar()".
 */
export class StkGovPwa {
  /** @param {string} [swUrl] Caminho do service worker, relativo ao index.html */
  constructor(swUrl = 'sw.js') {
    this._swUrl = swUrl;
    this._deferredPrompt = null;
    this._listeners = new Set();
  }

  init() {
    // Service Worker só funciona em HTTPS ou localhost
    if ('serviceWorker' in navigator && window.isSecureContext) {
      const registrar = () => navigator.serviceWorker.register(this._swUrl).catch(err => {
        console.warn('[STK-GOVERNO-BRAZIL] Service Worker não registrado:', err);
      });
      if (document.readyState === 'complete') registrar();
      else window.addEventListener('load', registrar);
    }

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this._deferredPrompt = e;
      this._notify();
    });

    window.addEventListener('appinstalled', () => {
      this._deferredPrompt = null;
      this._notify();
    });
  }

  /** Executa o callback sempre que a disponibilidade de instalação mudar */
  onInstallAvailabilityChange(callback) {
    this._listeners.add(callback);
    callback(this.canInstall());
  }

  canInstall() {
    return this._deferredPrompt !== null;
  }

  async install() {
    if (!this._deferredPrompt) return false;
    const prompt = this._deferredPrompt;
    this._deferredPrompt = null;
    this._notify();
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    return outcome === 'accepted';
  }

  /**
   * Liga um botão "Instalar" (fica escondido até o navegador oferecer a instalação)
   * @param {HTMLElement|null} botao
   */
  ligarBotao(botao) {
    if (!botao) return;
    this.onInstallAvailabilityChange(pode => { botao.hidden = !pode; });
    botao.addEventListener('click', () => this.install());
  }

  /**
   * Procura uma versão nova do app no servidor. Com versão nova, o service worker assume sozinho
   * (skipWaiting) e esta função resolve depois disso: quem chamou recarrega a página.
   * @returns {Promise<'atualizado'|'em-dia'|'sem-rede'|'indisponivel'>}
   */
  async procurarAtualizacao() {
    if (!('serviceWorker' in navigator)) return 'indisponivel';
    const registro = await navigator.serviceWorker.getRegistration();
    if (!registro) return 'indisponivel';
    try {
      await registro.update();
    } catch {
      return 'sem-rede';
    }
    const novo = registro.installing || registro.waiting;
    if (!novo) return 'em-dia';
    await new Promise(pronto => {
      novo.addEventListener('statechange', () => {
        if (novo.state === 'activated' || novo.state === 'redundant') pronto();
      });
    });
    return novo.state === 'activated' ? 'atualizado' : 'em-dia';
  }

  _notify() {
    this._listeners.forEach(cb => cb(this.canInstall()));
  }
}
