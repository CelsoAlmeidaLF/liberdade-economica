/**
 * Camada de Domínio: GreveProducaoModel
 * Impacto de greves que param a produção (transporte, geral, categoria) e do setor público.
 */
import { PIB_REFERENCIA, OTICA_RENDA } from './ArrecadacaoReferencia.js?v=20261104-1745';

export class GreveProducaoModel {
  /**
   * Perda = PIB por dia × peso do setor × adesão × dias × cascata, menos o que é recuperado depois
   * @param {Object} params
   * @param {number} params.pesoPib Participação do setor no PIB %
   * @param {number} params.adesaoPct Trabalhadores do setor que pararam %
   * @param {number} params.dias Duração da greve
   * @param {number} params.cascata Multiplicador sobre os outros setores (1 = sem efeito)
   * @param {boolean} params.usarCascata Liga ou desliga o efeito cascata
   * @param {number} params.recuperacaoPct Produção recuperada depois %
   * @param {number} params.pibAnual PIB anual em BRL
   */
  static calculate({
    pesoPib,
    adesaoPct,
    dias,
    cascata = 1,
    usarCascata = true,
    recuperacaoPct = 0,
    pibAnual = PIB_REFERENCIA.anual
  }) {
    const peso = Math.max(0, Number(pesoPib)) / 100;
    const adesao = Math.min(100, Math.max(0, Number(adesaoPct))) / 100;
    const d = Math.max(1, Number(dias));
    const mult = usarCascata ? Math.max(1, Number(cascata)) : 1;
    const recuperacao = Math.min(100, Math.max(0, Number(recuperacaoPct))) / 100;
    const pibDiario = Number(pibAnual) / 365;

    const perdaDireta = pibDiario * peso * adesao * d;
    const perdaBruta = perdaDireta * mult;
    const perdaCascata = perdaBruta - perdaDireta;
    const perdaRecuperada = perdaBruta * recuperacao;
    const perdaDefinitiva = perdaBruta - perdaRecuperada;
    // Impostos sobre produção e importação embutidos no valor perdido (ótica da renda)
    const impostoPerdido = perdaDefinitiva * OTICA_RENDA.governo / 100;

    const timeline = [];
    for (let i = 1; i <= 5; i++) {
      const fator = i / 5;
      timeline.push({
        day: Math.round(d * fator),
        label: `Dia ${Math.round(d * fator)}`,
        volumeRetido: Number((perdaBruta * fator).toFixed(2)),
        drenagemTributaria: Number((impostoPerdido * fator).toFixed(2))
      });
    }

    return {
      perdaDireta,
      perdaCascata,
      perdaBruta,
      perdaRecuperada,
      perdaDefinitiva,
      perdaDiaria: perdaBruta / d,
      impostoPerdido,
      pctPib: Number(((perdaDefinitiva / Number(pibAnual)) * 100).toFixed(3)),
      multiplicador: mult,
      timeline
    };
  }

  /**
   * Setor público: valor do serviço não prestado (pago em salário) e fila acumulada
   * @param {number} params.capacidadeExtraPct Atendimento além do normal depois da greve, para zerar a fila %
   */
  static calculatePublico({
    servidores,
    remuneracaoMensal,
    atendimentosDia,
    dias,
    adesaoPct = 100,
    capacidadeExtraPct = 20
  }) {
    const parados = Math.max(0, Number(servidores)) * Math.min(100, Math.max(0, Number(adesaoPct))) / 100;
    const d = Math.max(1, Number(dias));
    // O governo mede o próprio produto pelo custo: o serviço vale o que custa em salário
    const servicoNaoPrestado = parados * (Number(remuneracaoMensal) / 30) * d;
    const atendimentosPerdidos = parados * Math.max(0, Number(atendimentosDia)) * d;
    const extra = Math.max(1, Number(capacidadeExtraPct)) / 100;
    const diasParaZerarFila = Math.ceil(d / extra);

    const timeline = [];
    for (let i = 1; i <= 5; i++) {
      const fator = i / 5;
      timeline.push({
        day: Math.round(d * fator),
        label: `Dia ${Math.round(d * fator)}`,
        volumeRetido: Number((servicoNaoPrestado * fator).toFixed(2)),
        drenagemTributaria: 0
      });
    }

    return {
      servidoresParados: Math.round(parados),
      servicoNaoPrestado,
      perdaDiaria: servicoNaoPrestado / d,
      atendimentosPerdidos: Math.round(atendimentosPerdidos),
      diasParaZerarFila,
      capacidadeExtraPct: Number(capacidadeExtraPct),
      timeline
    };
  }
}
