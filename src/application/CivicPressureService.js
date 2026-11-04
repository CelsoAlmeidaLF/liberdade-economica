import { CivicState } from '../domain/CivicState.js?v=20261104-1710';
import { CivicPressureModel } from '../domain/CivicPressureModel.js?v=20261104-1710';
import { SectorDrainageModel } from '../domain/SectorDrainageModel.js?v=20261104-1710';
import { GreveProducaoModel } from '../domain/GreveProducaoModel.js?v=20261104-1710';
import { DivisaoCusto } from '../domain/DivisaoCusto.js?v=20261104-1710';
import { obterSetor } from '../domain/SetorConsumo.js?v=20261104-1710';
import { obterTipo, obterSetorProducao, obterOrgao } from '../domain/TiposGreve.js?v=20261104-1710';
import { ARRECADACAO_REFERENCIA, PIB_REFERENCIA, OTICA_RENDA, classificarFase } from '../domain/ArrecadacaoReferencia.js?v=20261104-1710';
import { GREVE_CAMINHONEIROS_2018, compararComGreve } from '../domain/CasosReais.js?v=20261104-1710';
import { CsvExporter } from '../infrastructure/CsvExporter.js?v=20261104-1710';

/**
 * Camada de Aplicação: CivicPressureService
 * Orquestrador de simulações, agregação de dados e emissão de notas técnicas.
 */
export class CivicPressureService {
  constructor({ ibgeGateway, initialState = null } = {}) {
    this.ibgeGateway = ibgeGateway;
    this.state = initialState || CivicState.createDefault();
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  async syncPopulacao() {
    if (!this.ibgeGateway) return;
    const res = await this.ibgeGateway.fetchPopulacao();
    if (res && !isNaN(res.value)) {
      this.state = this.state.with({
        populacao: res.value,
        lastSync: new Date().toLocaleTimeString('pt-BR')
      });
      this.notify();
      return res;
    }
    return null;
  }

  updateParams(params) {
    const campos = [
      'participantes', 'retencaoDiaria', 'dias', 'taxRatio', 'adiadoPct',
      'adesaoPct', 'recuperacaoPct', 'servidores', 'remuneracaoMensal', 'atendimentosDia'
    ];
    const changes = {};
    campos.forEach(c => {
      if (params[c] !== undefined) changes[c] = Number(params[c]);
    });
    if (params.usarCascata !== undefined) changes.usarCascata = Boolean(params.usarCascata);
    this.state = this.state.with(changes);
    this.notify();
  }

  /**
   * Troca o setor atingido pelo boicote e aplica o tributo e o gasto adiado típicos dele
   */
  selecionarSetor(id) {
    const setor = obterSetor(id);
    this.state = this.state.with({
      setor: setor.id,
      taxRatio: setor.taxRatio,
      adiadoPct: setor.adiadoPct
    });
    this.notify();
    return setor;
  }

  /**
   * Troca o tipo de greve e aplica os valores típicos do primeiro setor (ou órgão) dele
   */
  selecionarTipo(id) {
    const tipo = obterTipo(id);
    let changes = { tipoGreve: tipo.id };
    if (tipo.id === 'publico') {
      changes = { ...changes, ...valoresDoOrgao(obterOrgao(this.state.orgao)) };
    } else if (tipo.id !== 'consumo') {
      changes = { ...changes, ...valoresDoSetor(obterSetorProducao(this.state.setorProducao, tipo.id)) };
    }
    this.state = this.state.with(changes);
    this.notify();
    return tipo;
  }

  selecionarSetorProducao(id) {
    const setor = obterSetorProducao(id, this.state.tipoGreve);
    this.state = this.state.with(valoresDoSetor(setor));
    this.notify();
    return setor;
  }

  selecionarOrgao(id) {
    const orgao = obterOrgao(id);
    this.state = this.state.with(valoresDoOrgao(orgao));
    this.notify();
    return orgao;
  }

  calculateSimulation() {
    const s = this.state;
    const tipo = obterTipo(s.tipoGreve);
    const arrecadacaoPeriodo = (ARRECADACAO_REFERENCIA.anual / 365) * Math.max(1, s.dias);

    if (tipo.id === 'publico') {
      const orgao = obterOrgao(s.orgao);
      const publico = GreveProducaoModel.calculatePublico({
        servidores: s.servidores,
        remuneracaoMensal: s.remuneracaoMensal,
        atendimentosDia: s.atendimentosDia,
        dias: s.dias,
        adesaoPct: s.adesaoPct
      });
      return {
        modo: 'publico',
        tipo,
        orgao,
        publico,
        divisao: DivisaoCusto.publico(publico.servicoNaoPrestado),
        greve: compararComGreve(publico.servicoNaoPrestado, s.dias),
        resumo: {
          perdaEconomia: publico.servicoNaoPrestado,
          perdaDiaria: publico.perdaDiaria,
          impostoPerdido: 0,
          timeline: publico.timeline
        },
        state: s
      };
    }

    if (tipo.id !== 'consumo') {
      const setorProducao = obterSetorProducao(s.setorProducao, tipo.id);
      const producao = GreveProducaoModel.calculate({
        pesoPib: setorProducao.pesoPib,
        adesaoPct: s.adesaoPct,
        dias: s.dias,
        cascata: setorProducao.cascata,
        usarCascata: s.usarCascata,
        recuperacaoPct: s.recuperacaoPct
      });
      const pctArrecadacao = (producao.impostoPerdido / arrecadacaoPeriodo) * 100;
      return {
        modo: 'producao',
        tipo,
        setorProducao,
        producao,
        divisao: DivisaoCusto.producao(producao.perdaDefinitiva),
        greve: compararComGreve(producao.perdaDefinitiva, s.dias),
        resumo: {
          perdaEconomia: producao.perdaDefinitiva,
          perdaDiaria: producao.perdaDiaria,
          impostoPerdido: producao.impostoPerdido,
          arrecadacaoPeriodo,
          pctArrecadacao: Number(pctArrecadacao.toFixed(3)),
          faseFiscal: classificarFase(pctArrecadacao),
          timeline: producao.timeline
        },
        state: s
      };
    }

    const civic = CivicPressureModel.calculate({
      participantes: s.participantes,
      retencaoDiaria: s.retencaoDiaria,
      dias: s.dias,
      populacaoBase: s.populacao,
      taxRatio: s.taxRatio,
      adiadoPct: s.adiadoPct
    });

    const setor = obterSetor(s.setor);
    const sector = SectorDrainageModel.decompose(civic.drenagemTributaria, setor.partilha);
    const greve = compararComGreve(civic.faturamentoPerdido, s.dias);

    return {
      modo: 'consumo',
      tipo,
      civic,
      sector,
      setor,
      greve,
      divisao: DivisaoCusto.consumo(civic.faturamentoPerdido, civic.drenagemDefinitiva),
      resumo: {
        perdaEconomia: civic.faturamentoPerdido,
        perdaDiaria: civic.faturamentoPerdido / Math.max(1, s.dias),
        impostoPerdido: civic.drenagemDefinitiva,
        arrecadacaoPeriodo: civic.arrecadacaoPeriodo,
        pctArrecadacao: civic.pctArrecadacao,
        faseFiscal: civic.faseFiscal,
        timeline: civic.timeline
      },
      state: s
    };
  }

  generateExecutiveReport() {
    const sim = this.calculateSimulation();
    const s = this.state;
    const pct = v => v.toFixed(2).replace('.', ',');
    const brl = CivicPressureModel.formatBRL;
    const g18 = GREVE_CAMINHONEIROS_2018;
    const d = sim.divisao.valores;

    let corpo;
    if (sim.modo === 'consumo') {
      const c = sim.civic;
      const sec = sim.sector;
      corpo = `1. PARÂMETROS DO BOICOTE:
• Setor atingido: ${sim.setor.nome}
• População de Referência (IBGE): ${s.populacao.toLocaleString('pt-BR')} habitantes
• Cidadãos em Adesão: ${s.participantes.toLocaleString('pt-BR')} (${pct(c.pctPopulacao)}% da população)
• Gasto Evitado por Cidadão: R$ ${pct(s.retencaoDiaria)} / dia
• Duração: ${s.dias} dias
• Tributos Embutidos no Preço (estimativa): ${pct(s.taxRatio)}%
• Parte do Gasto Só Adiada: ${s.adiadoPct}%

2. IMPACTO ECONÔMICO:
• Gasto que Deixou de Circular no Período: ${brl(c.faturamentoRetido)}
• Gasto Perdido de Vez pelo Comércio: ${brl(c.faturamentoPerdido)}
• Poupança que Fica com as Famílias: ${brl(c.poupancaRetida)}

3. IMPACTO NA ARRECADAÇÃO:
• Imposto que Deixou de Entrar no Período: ${brl(c.drenagemTributaria)} (${brl(c.drenagemDiaria)} / dia)
• Imposto Só Atrasado (gasto adiado): ${brl(c.drenagemAdiada)}
• Imposto Perdido de Vez: ${brl(c.drenagemDefinitiva)}
• Arrecadação de União, Estados e Municípios no Período: ${brl(c.arrecadacaoPeriodo)}
• Peso do Boicote: ${pct(c.pctArrecadacao)}% da arrecadação do período (perda definitiva)
• ${c.faseFiscal.titulo}: ${c.faseFiscal.desc}

4. QUEM DEIXA DE ARRECADAR (IMPOSTO DO PERÍODO):
• Estados (ICMS - ${sec.percentuais.icms}%): ${brl(sec.tributos.icms)}
• União (PIS/COFINS & IPI - ${sec.percentuais.pisCofins + sec.percentuais.ipi}%): ${brl(sec.federacao.uniao)}
• Municípios (ISS - ${sec.percentuais.iss}%): ${brl(sec.tributos.iss)}`;
    } else if (sim.modo === 'producao') {
      const p = sim.producao;
      corpo = `1. PARÂMETROS DA GREVE:
• Setor parado: ${sim.setorProducao.nome} (${String(sim.setorProducao.pesoPib).replace('.', ',')}% do PIB)
• Adesão: ${s.adesaoPct}% dos trabalhadores
• Duração: ${s.dias} dias
• Efeito cascata: ${s.usarCascata ? `ligado (× ${String(p.multiplicador.toFixed(2)).replace('.', ',')})` : 'desligado'}
• Produção recuperada depois: ${s.recuperacaoPct}%

2. IMPACTO ECONÔMICO:
• Perda direta no setor: ${brl(p.perdaDireta)}
• Perda nos outros setores (cascata): ${brl(p.perdaCascata)}
• Perda total no período: ${brl(p.perdaBruta)} (${brl(p.perdaDiaria)} / dia)
• Recuperado depois: ${brl(p.perdaRecuperada)}
• Perda definitiva: ${brl(p.perdaDefinitiva)} (${pct(p.pctPib)}% do PIB anual)

3. IMPACTO NA ARRECADAÇÃO:
• Impostos sobre produção perdidos: ${brl(p.impostoPerdido)}
• Peso: ${pct(sim.resumo.pctArrecadacao)}% da arrecadação do período
• ${sim.resumo.faseFiscal.titulo}: ${sim.resumo.faseFiscal.desc}`;
    } else {
      const pb = sim.publico;
      corpo = `1. PARÂMETROS DA GREVE:
• Órgão: ${sim.orgao.nome}
• Servidores parados: ${pb.servidoresParados.toLocaleString('pt-BR')} (${s.adesaoPct}% de ${s.servidores.toLocaleString('pt-BR')})
• Remuneração média: R$ ${s.remuneracaoMensal.toLocaleString('pt-BR')} / mês
• Duração: ${s.dias} dias

2. IMPACTO:
• Serviço não prestado à população: ${brl(pb.servicoNaoPrestado)} (${brl(pb.perdaDiaria)} / dia)
• ${sim.orgao.unidade.charAt(0).toUpperCase() + sim.orgao.unidade.slice(1)} que não aconteceram: ${pb.atendimentosPerdidos.toLocaleString('pt-BR')}
• Dias para zerar a fila com ${pb.capacidadeExtraPct}% de atendimento extra: ${pb.diasParaZerarFila}`;
    }

    return `NOTA TÉCNICA: LIBERDADE ECONÔMICA — ${sim.tipo.titulo.toUpperCase()}
----------------------------------------------------------------------
${corpo}

QUEM PAGA A CONTA:
• Empresas: ${brl(Math.max(0, d.empresas))}
• Trabalhadores: ${brl(Math.max(0, d.trabalhadores))}
• Governo: ${brl(Math.max(0, d.governo))}
• Consumidores / população: ${d.consumidores < 0 ? `guardam ${brl(-d.consumidores)}` : brl(d.consumidores)}

COMPARAÇÃO: ${g18.titulo.toUpperCase()}
• Custo da greve (${g18.dias} dias, Fazenda): ${brl(g18.custoEconomia)} (${String(g18.custoEconomiaPctPib).replace('.', ',')}% do PIB)
• Custo do acordo para o governo: ${brl(g18.custoAcordo)}
• Esta simulação equivale a ${sim.greve.pctDoCusto.toFixed(1).replace('.', ',')}% do custo da greve${sim.greve.diasParaIgualar ? ` (igualaria em ${sim.greve.diasParaIgualar.toLocaleString('pt-BR')} dias)` : ''}
${sim.modo === 'consumo' ? `
ADESÃO (REFERÊNCIA DOS 3,5% - ERICA CHENOWETH / HARVARD):
• Referência (3,5% da População): ${sim.civic.chenowethGoal.toLocaleString('pt-BR')} cidadãos
• Progresso: ${sim.civic.progressoMetaChenoweth.toFixed(1).replace('.', ',')}% (${sim.civic.statusChenoweth})
` : ''}----------------------------------------------------------------------
Referências: ${ARRECADACAO_REFERENCIA.fonte}; ${PIB_REFERENCIA.fonte}; ${OTICA_RENDA.fonte}.
Pesos, cascatas e valores por setor são estimativas ajustáveis.
Emissão: Liberdade Econômica (Systekna / STK-GOVERNO-BRAZIL).`;
  }

  exportCsv() {
    const sim = this.calculateSimulation();
    const s = this.state;
    const d = sim.divisao.valores;
    const texto = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows = [
      ["Tipo_De_Greve", texto(sim.tipo.titulo), "tipo", "Liberdade Economica"],
      ["Duracao", s.dias, "dias", "Periodo da greve"]
    ];

    if (sim.modo === 'consumo') {
      const c = sim.civic;
      const sec = sim.sector;
      rows.push(
        ["Populacao_Referencia", s.populacao, "habitantes", "IBGE"],
        ["Cidadaos_Adesao_Ativa", s.participantes, "cidadaos", "Mobilizacao Nao Violenta"],
        ["Retencao_Diaria_Por_Cidadao", s.retencaoDiaria, "BRL/dia", "Gasto Nao Realizado"],
        ["Setor_Atingido", texto(sim.setor.nome), "setor", "Catalogo de setores (estimativa)"],
        ["Tributos_No_Preco", s.taxRatio, "% do valor gasto", "Estimativa por setor"],
        ["Gasto_So_Adiado", s.adiadoPct, "% do gasto evitado", "Estimativa por setor"],
        ["Total_Faturamento_Retido", c.faturamentoRetido, "BRL", "Comercio e Servicos no periodo"],
        ["Faturamento_Perdido_De_Vez", c.faturamentoPerdido, "BRL", "Retido menos a parte adiada"],
        ["Total_Drenagem_Tributaria", c.drenagemTributaria, "BRL", "Imposto que deixou de entrar no periodo"],
        ["Drenagem_Definitiva", c.drenagemDefinitiva, "BRL", "Imposto perdido de vez"],
        ["Poupanca_Familiar_Preservada", c.poupancaRetida, "BRL", "Liquidez das Familias"],
        ["Arrecadacao_Do_Periodo", c.arrecadacaoPeriodo, "BRL", "Carga tributaria bruta 2024 x PIB 2024"],
        ["Peso_Na_Arrecadacao", c.pctArrecadacao, "% da arrecadacao do periodo", "Drenagem definitiva / arrecadacao"],
        ["Fase_Fiscal", texto(c.faseFiscal.titulo), "Status", "Faixas do simulador"],
        ["Drenagem_ICMS_Estados", sec.tributos.icms, "BRL", `${sec.percentuais.icms}% dos Tributos Indiretos`],
        ["Drenagem_PIS_COFINS_Uniao", sec.tributos.pisCofins, "BRL", `${sec.percentuais.pisCofins}% dos Tributos Indiretos`],
        ["Drenagem_IPI_Uniao", sec.tributos.ipi, "BRL", `${sec.percentuais.ipi}% dos Tributos Indiretos`],
        ["Drenagem_ISS_Municipios", sec.tributos.iss, "BRL", `${sec.percentuais.iss}% dos Tributos Indiretos`],
        ["Adesao_Percentual_Populacao", c.pctPopulacao, "%", "Participantes / Populacao Total"],
        ["Progresso_Rumo_Aos_3_5", c.progressoMetaChenoweth, "% da Meta", "Erica Chenoweth (Harvard)"]
      );
    } else if (sim.modo === 'producao') {
      const p = sim.producao;
      rows.push(
        ["Setor_Parado", texto(sim.setorProducao.nome), "setor", "Catalogo de setores (estimativa)"],
        ["Peso_Do_Setor_No_PIB", sim.setorProducao.pesoPib, "% do PIB", "Contas Nacionais (aproximacao)"],
        ["Adesao", s.adesaoPct, "% dos trabalhadores", "Parametro"],
        ["Multiplicador_Cascata", p.multiplicador, "vezes", s.usarCascata ? "Estimativa por setor" : "Desligado"],
        ["Producao_Recuperada", s.recuperacaoPct, "%", "Parametro"],
        ["Perda_Direta", p.perdaDireta, "BRL", "PIB/dia x peso x adesao x dias"],
        ["Perda_Cascata", p.perdaCascata, "BRL", "Outros setores"],
        ["Perda_Definitiva", p.perdaDefinitiva, "BRL", "Total menos o recuperado"],
        ["Perda_Percentual_PIB", p.pctPib, "% do PIB anual", PIB_REFERENCIA.fonte],
        ["Impostos_Perdidos", p.impostoPerdido, "BRL", "15,5% do valor (otica da renda)"],
        ["Peso_Na_Arrecadacao", sim.resumo.pctArrecadacao, "% da arrecadacao do periodo", "Impostos / arrecadacao"],
        ["Fase_Fiscal", texto(sim.resumo.faseFiscal.titulo), "Status", "Faixas do simulador"]
      );
    } else {
      const pb = sim.publico;
      rows.push(
        ["Orgao", texto(sim.orgao.nome), "orgao", "Valores de exemplo"],
        ["Servidores_Parados", pb.servidoresParados, "servidores", "Servidores x adesao"],
        ["Remuneracao_Media", s.remuneracaoMensal, "BRL/mes", "Parametro"],
        ["Servico_Nao_Prestado", pb.servicoNaoPrestado, "BRL", "Valor medido pelo salario"],
        ["Atendimentos_Perdidos", pb.atendimentosPerdidos, sim.orgao.unidade, "Parados x atendimentos/dia x dias"],
        ["Dias_Para_Zerar_Fila", pb.diasParaZerarFila, "dias", `Com ${pb.capacidadeExtraPct}% de atendimento extra`]
      );
    }

    rows.push(
      ["Custo_Empresas", Math.max(0, d.empresas), "BRL", OTICA_RENDA.fonte],
      ["Custo_Trabalhadores", Math.max(0, d.trabalhadores), "BRL", OTICA_RENDA.fonte],
      ["Custo_Governo", Math.max(0, d.governo), "BRL", OTICA_RENDA.fonte],
      ["Consumidores", d.consumidores, "BRL", "Negativo = dinheiro guardado"],
      ["Percentual_Do_Custo_Greve_2018", sim.greve.pctDoCusto, "%", "Greve dos caminhoneiros (R$ 15 bi)"]
    );

    CsvExporter.export(rows);
  }
}

function valoresDoSetor(setor) {
  return {
    setorProducao: setor.id,
    adesaoPct: setor.adesaoPct,
    recuperacaoPct: setor.recuperacaoPct
  };
}

function valoresDoOrgao(orgao) {
  return {
    orgao: orgao.id,
    servidores: orgao.servidores,
    remuneracaoMensal: orgao.remuneracaoMensal,
    atendimentosDia: orgao.atendimentosDia,
    adesaoPct: 60
  };
}
