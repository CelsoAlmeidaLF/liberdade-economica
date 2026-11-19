import * as modulo from '../../vendor/stk-gov/stk-gov-parametros.js?v=20261119-1404';

/**
 * Camada de Infraestrutura: adaptador do ParametrosPort sobre o módulo comum gerado (ADR-001, D5)
 *
 * Porta (consumida pela aplicação):
 *   vigencia(id, data) → vigência em vigor na data, ou undefined
 *   valor(id, data)    → valor da vigência, ou undefined
 *   insumo(id, data)   → { id, valor, tipo, status, periodo }, formato de Resultado.insumos
 *   selo(insumos, formulaExata) → 'exato' | 'estimativa'
 * Quando a data não vem, vale a de hoje.
 */
export class ParametrosVendor {
  /** @param {Object} [fonte] Módulo de parâmetros (injetável nos testes) */
  constructor(fonte = modulo) {
    this.fonte = fonte;
  }

  vigencia(id, data = new Date()) { return this.fonte.vigencia(id, data); }

  valor(id, data = new Date()) { return this.fonte.valor(id, data); }

  insumo(id, data = new Date()) { return this.fonte.insumo(id, data); }

  selo(insumos, formulaExata = true) { return this.fonte.selo(insumos, formulaExata); }
}
