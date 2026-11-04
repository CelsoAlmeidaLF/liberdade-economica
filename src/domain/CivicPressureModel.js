/**
 * Camada de Domínio: CivicPressureModel
 * Fundamentação: Gene Sharp (The Politics of Nonviolent Action) e
 * Erica Chenoweth & Maria J. Stephan (Why Civil Resistance Works - Harvard University Press).
 */
import { ARRECADACAO_REFERENCIA, classificarFase } from './ArrecadacaoReferencia.js?v=20261104-1710';

export class CivicPressureModel {
  /**
   * Calcula o impacto econômico e fiscal da ação cívica não violenta
   * @param {Object} params
   * @param {number} params.participantes
   * @param {number} params.retencaoDiaria
   * @param {number} params.dias
   * @param {number} params.populacaoBase
   * @param {number} params.taxRatio Parcela de tributos no valor gasto % (não é a carga tributária total sobre o PIB)
   * @param {number} params.adiadoPct Parte do gasto evitado que é só adiada e volta a ser feita depois %
   * @param {number} params.arrecadacaoAnual Arrecadação anual de União, estados e municípios (BRL)
   */
  static calculate({
    participantes,
    retencaoDiaria,
    dias,
    populacaoBase = 214211951,
    taxRatio = 21.8,
    adiadoPct = 0,
    arrecadacaoAnual = ARRECADACAO_REFERENCIA.anual
  }) {
    const p = Math.max(0, Number(participantes));
    const g = Math.max(0, Number(retencaoDiaria));
    const d = Math.max(1, Number(dias));
    const pop = Number(populacaoBase);
    const taxRate = Number(taxRatio) / 100;
    const adiado = Math.min(100, Math.max(0, Number(adiadoPct))) / 100;

    // Faturamento bruto não consumido durante o boicote
    const faturamentoRetido = p * g * d;
    // Tributos indiretos (ICMS, PIS, COFINS, IPI, ISS) que deixam de entrar no período
    const drenagemTributaria = faturamentoRetido * taxRate;
    // A parte adiada é comprada depois e o imposto entra com atraso; o resto se perde de vez
    const faturamentoPerdido = faturamentoRetido * (1 - adiado);
    const drenagemDefinitiva = faturamentoPerdido * taxRate;
    const drenagemAdiada = drenagemTributaria - drenagemDefinitiva;
    // Poupança familiar: só o que não volta a ser gasto
    const poupancaRetida = faturamentoPerdido;

    // Peso na arrecadação do mesmo período
    const arrecadacaoPeriodo = (Number(arrecadacaoAnual) / 365) * d;
    const pctArrecadacao = (drenagemDefinitiva / arrecadacaoPeriodo) * 100;
    const pctArrecadacaoPeriodo = (drenagemTributaria / arrecadacaoPeriodo) * 100;
    const faseFiscal = classificarFase(pctArrecadacao);

    // Diária média
    const drenagemDiaria = drenagemTributaria / d;
    const faturamentoRetidoDiario = faturamentoRetido / d;

    // Métricas per capita
    const impactoPerHabitante = faturamentoRetido / pop;
    const drenagemPerHabitante = drenagemTributaria / pop;

    // Referência dos 3,5% de Erica Chenoweth: mede adesão, não impacto fiscal
    const chenowethGoal = pop * 0.035; // ~7.497.000 pessoas (estimativa IBGE 2026)
    const pctPopulacao = (p / pop) * 100;
    const progressoMetaChenoweth = Math.min(100, (p / chenowethGoal) * 100);

    let statusChenoweth = "Mobilização inicial";
    let statusDesc = "Adesão ainda distante da referência de 3,5% da população.";
    if (progressoMetaChenoweth >= 100) {
      statusChenoweth = "Adesão acima da referência de 3,5%";
      statusDesc = "Na pesquisa de Chenoweth, campanhas de massa contra governos com esse nível de participação costumaram ter sucesso. É uma referência, não uma garantia, e o estudo não trata de boicotes de consumo.";
    } else if (progressoMetaChenoweth >= 50) {
      statusChenoweth = "Adesão alta";
      statusDesc = "Mais da metade da referência de 3,5% da população.";
    } else if (progressoMetaChenoweth >= 20) {
      statusChenoweth = "Adesão crescente";
      statusDesc = "Entre um quinto e metade da referência de 3,5% da população.";
    }

    // Curva temporal em 5 marcos dinâmicos
    const timeline = [];
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      const stepDay = Math.round((d / steps) * i);
      const factor = i / steps;
      timeline.push({
        day: stepDay,
        label: `Dia ${stepDay}`,
        volumeRetido: Number((faturamentoRetido * factor).toFixed(2)),
        drenagemTributaria: Number((drenagemTributaria * factor).toFixed(2))
      });
    }

    return {
      faturamentoRetido,
      drenagemTributaria,
      faturamentoPerdido,
      drenagemDefinitiva,
      drenagemAdiada,
      arrecadacaoPeriodo,
      pctArrecadacao: Number(pctArrecadacao.toFixed(3)),
      pctArrecadacaoPeriodo: Number(pctArrecadacaoPeriodo.toFixed(3)),
      faseFiscal,
      poupancaRetida,
      drenagemDiaria,
      faturamentoRetidoDiario,
      impactoPerHabitante,
      drenagemPerHabitante,
      pctPopulacao: Number(pctPopulacao.toFixed(2)),
      progressoMetaChenoweth: Number(progressoMetaChenoweth.toFixed(1)),
      chenowethGoal: Math.round(chenowethGoal),
      statusChenoweth,
      statusDesc,
      timeline
    };
  }

  /**
   * Formatação monetária BRL amigável
   */
  static formatBRL(valor) {
    if (valor >= 1e9) {
      return `R$ ${(valor / 1e9).toFixed(2).replace('.', ',')} Bi`;
    }
    if (valor >= 1e6) {
      return `R$ ${(valor / 1e6).toFixed(1).replace('.', ',')} Mi`;
    }
    return `R$ ${Math.round(valor).toLocaleString('pt-BR')}`;
  }
}
