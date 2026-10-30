/**
 * Camada de Domínio: CivicState
 * Entidade imutável de estado para a Liberdade Econômica.
 */
export class CivicState {
  /**
   * @param {Object} params
   * @param {number} params.populacao População residente estimada (IBGE SIDRA 6579, 2026)
   * @param {number} params.participantes Cidadãos em adesão ativa
   * @param {number} params.retencaoDiaria Retenção de consumo por cidadão/dia em BRL
   * @param {number} params.dias Duração contínua em dias
   * @param {number} params.taxRatio Parcela de tributos no valor gasto pelas famílias % (estimativa: 13,91% do PIB em tributos sobre bens e serviços ÷ ~63,8% do PIB em consumo das famílias)
   * @param {string} params.setor Setor atingido pelo boicote (ver SetorConsumo.js)
   * @param {number} params.adiadoPct Parte do gasto evitado que é só adiada %
   * @param {string} params.tipoGreve consumo | transporte | geral | categoria | publico (ver TiposGreve.js)
   * @param {string} params.setorProducao Setor parado nas greves de produção
   * @param {number} params.adesaoPct Trabalhadores do setor (ou servidores) que pararam %
   * @param {number} params.recuperacaoPct Produção recuperada depois da greve %
   * @param {boolean} params.usarCascata Liga o efeito cascata sobre os outros setores
   * @param {string} params.orgao Órgão parado nas greves do setor público
   * @param {number} params.servidores Servidores do órgão
   * @param {number} params.remuneracaoMensal Remuneração média mensal do servidor (BRL)
   * @param {number} params.atendimentosDia Atendimentos por servidor por dia
   * @param {number} params.alvoChenowethPct Limiar crítico de Harvard (3,5%)
   * @param {string|null} params.lastSync Timestamp da última sincronização com IBGE
   */
  constructor({
    populacao = 214211951,
    participantes = 2500000,
    retencaoDiaria = 50.0,
    dias = 14,
    taxRatio = 21.8,
    setor = 'geral',
    adiadoPct = 40,
    tipoGreve = 'consumo',
    setorProducao = 'carga',
    adesaoPct = 80,
    recuperacaoPct = 0,
    usarCascata = true,
    orgao = 'educacao',
    servidores = 100000,
    remuneracaoMensal = 9000,
    atendimentosDia = 20,
    alvoChenowethPct = 3.5,
    lastSync = null
  } = {}) {
    this.populacao = Number(populacao);
    this.participantes = Number(participantes);
    this.retencaoDiaria = Number(retencaoDiaria);
    this.dias = Number(dias);
    this.taxRatio = Number(taxRatio);
    this.setor = String(setor);
    this.adiadoPct = Number(adiadoPct);
    this.tipoGreve = String(tipoGreve);
    this.setorProducao = String(setorProducao);
    this.adesaoPct = Number(adesaoPct);
    this.recuperacaoPct = Number(recuperacaoPct);
    this.usarCascata = Boolean(usarCascata);
    this.orgao = String(orgao);
    this.servidores = Number(servidores);
    this.remuneracaoMensal = Number(remuneracaoMensal);
    this.atendimentosDia = Number(atendimentosDia);
    this.alvoChenowethPct = Number(alvoChenowethPct);
    this.lastSync = lastSync;

    Object.freeze(this);
  }

  with(changes) {
    return new CivicState({
      populacao: changes.populacao ?? this.populacao,
      participantes: changes.participantes ?? this.participantes,
      retencaoDiaria: changes.retencaoDiaria ?? this.retencaoDiaria,
      dias: changes.dias ?? this.dias,
      taxRatio: changes.taxRatio ?? this.taxRatio,
      setor: changes.setor ?? this.setor,
      adiadoPct: changes.adiadoPct ?? this.adiadoPct,
      tipoGreve: changes.tipoGreve ?? this.tipoGreve,
      setorProducao: changes.setorProducao ?? this.setorProducao,
      adesaoPct: changes.adesaoPct ?? this.adesaoPct,
      recuperacaoPct: changes.recuperacaoPct ?? this.recuperacaoPct,
      usarCascata: changes.usarCascata ?? this.usarCascata,
      orgao: changes.orgao ?? this.orgao,
      servidores: changes.servidores ?? this.servidores,
      remuneracaoMensal: changes.remuneracaoMensal ?? this.remuneracaoMensal,
      atendimentosDia: changes.atendimentosDia ?? this.atendimentosDia,
      alvoChenowethPct: changes.alvoChenowethPct ?? this.alvoChenowethPct,
      lastSync: changes.lastSync ?? this.lastSync
    });
  }

  static createDefault() {
    return new CivicState();
  }
}
