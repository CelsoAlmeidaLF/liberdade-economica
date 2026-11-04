/**
 * Camada de infraestrutura: PwaRegistrar
 * Registra o service worker, que deixa o app abrir sem internet. Só funciona em HTTPS ou localhost.
 */
export class PwaRegistrar {
  /**
   * @param {Object} [opcoes]
   * @param {Object} [opcoes.nav] navigator (injetado nos testes)
   * @param {boolean} [opcoes.seguro] window.isSecureContext
   * @param {string} [opcoes.swUrl]
   */
  constructor({ nav = globalThis.navigator, seguro = globalThis.isSecureContext, swUrl = 'sw.js' } = {}) {
    this.nav = nav;
    this.seguro = seguro;
    this.swUrl = swUrl;
  }

  /** @returns {Promise<boolean>} true se registrou; uma falha aqui nunca impede o app de abrir */
  async registrar() {
    if (!this.seguro || !this.nav?.serviceWorker) return false;
    try {
      await this.nav.serviceWorker.register(this.swUrl);
      return true;
    } catch (erro) {
      console.warn('[Liberdade Econômica] Service worker não registrado:', erro);
      return false;
    }
  }
}
