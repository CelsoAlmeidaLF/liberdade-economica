/**
 * Camada de Infraestrutura: IbgeGateway
 * Conector REST para a estimativa oficial de população do IBGE (SIDRA, tabela 6579, variável 9324).
 * O antigo endpoint /api/v1/projecoes/populacao responde 404.
 */
export class IbgeGateway {
  constructor({ timeoutMs = 6000, onLog = null } = {}) {
    this.timeoutMs = timeoutMs;
    this.onLog = onLog || (() => {});
  }

  log(message, type = 'info') {
    this.onLog({
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      message,
      type
    });
  }

  async fetchPopulacao() {
    const url = 'https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N1[all]';
    this.log('Consultando IBGE SIDRA 6579 (População residente estimada)...', 'info');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const serie = data?.[0]?.resultados?.[0]?.series?.[0]?.serie;
      const ano = serie && Object.keys(serie)[0];
      const pop = ano ? Number(serie[ano]) : NaN;
      if (pop > 0) {
        this.log(`IBGE retornado com sucesso: População ${ano} = ${pop.toLocaleString('pt-BR')} hab`, 'info');
        return { value: pop, date: ano, source: 'IBGE SIDRA 6579' };
      }
      throw new Error('Formato inválido');
    } catch (err) {
      clearTimeout(timer);
      this.log(`IBGE API indisponível ou CORS (${err.message}). Mantendo estimativa de referência de 2026 (214.211.951).`, 'warn');
      return null;
    }
  }
}
