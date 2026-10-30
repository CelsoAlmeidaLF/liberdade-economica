import { CivicState } from '../src/domain/CivicState.js';
import { CivicPressureModel } from '../src/domain/CivicPressureModel.js';
import { SectorDrainageModel } from '../src/domain/SectorDrainageModel.js';
import { IbgeGateway } from '../src/infrastructure/IbgeGateway.js';
import { SETORES, obterSetor } from '../src/domain/SetorConsumo.js';
import { ARRECADACAO_REFERENCIA, classificarFase, posicaoNaEscala } from '../src/domain/ArrecadacaoReferencia.js';
import { CivicPressureService } from '../src/application/CivicPressureService.js';
import { GREVE_CAMINHONEIROS_2018, GREVES, IPCA_2018, compararComGreve, ordenarGreves, custoPorDia, obterGreve, listarReferencias, REFERENCIAS_BASE } from '../src/domain/CasosReais.js';
import { TIPOS_GREVE, SETORES_PRODUCAO, ORGAOS_PUBLICOS, setoresDoTipo, obterSetorProducao } from '../src/domain/TiposGreve.js';
import { GreveProducaoModel } from '../src/domain/GreveProducaoModel.js';
import { DivisaoCusto } from '../src/domain/DivisaoCusto.js';
import { PIB_REFERENCIA, OTICA_RENDA } from '../src/domain/ArrecadacaoReferencia.js';
import { DIREITOS } from '../src/domain/DireitosGreve.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

function assertCloseTo(actual, expected, tolerance = 0.05, message) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, `${message} (Obtido: ${actual}, Esperado: ${expected}, Dif: ${diff.toFixed(4)})`);
}

console.log('--- Executando Testes Unitários: Liberdade Econômica ---');

// 1. Teste de Imutabilidade da Entidade CivicState
console.log('\n1. Teste de CivicState (Imutabilidade & Defaults)');
const state1 = CivicState.createDefault();
assert(state1.participantes === 2500000, 'Participantes padrão deve ser 2.500.000');
assert(state1.retencaoDiaria === 50.0, 'Retenção diária padrão deve ser R$ 50,00');
assert(state1.dias === 14, 'Duração padrão deve ser 14 dias');
assert(Object.isFrozen(state1), 'CivicState deve estar congelado');

const state2 = state1.with({ participantes: 7440000, dias: 30 });
assert(state1.participantes === 2500000, 'state1 original deve permanecer imutável');
assert(state2.participantes === 7440000, 'state2 deve refletir os novos participantes');
assert(state2.dias === 30, 'state2 deve refletir a nova duração');

// 2. Teste Matemático de Pressão Cívica
console.log('\n2. Teste do Modelo de Pressão Cívica (CivicPressureModel)');
const sim = CivicPressureModel.calculate({
  participantes: 2500000,
  retencaoDiaria: 50,
  dias: 14,
  populacaoBase: 212583750,
  taxRatio: 34.20
});

const expectedRetail = 2500000 * 50 * 14; // R$ 1.750.000.000 (1,75 Bi)
const expectedTax = expectedRetail * 0.342; // R$ 598.500.000 (598,5 Mi)
assert(sim.faturamentoRetido === expectedRetail, 'Faturamento retido deve ser R$ 1,75 Bi');
assertCloseTo(sim.drenagemTributaria, expectedTax, 1.0, 'Drenagem tributária indireta deve ser R$ 598,5 Mi');
assert(sim.poupancaRetida === expectedRetail, 'Poupança familiar acumulada deve ser igual ao consumo retido');
assertCloseTo(sim.pctPopulacao, 1.18, 0.05, 'Percentual da população deve ser ~1,18%');
assert(sim.timeline.length === 5, 'Timeline deve gerar 5 marcos');

// 3. Teste do Limiar de Harvard (Erica Chenoweth 3,5%)
console.log('\n3. Teste do Limiar Crítico de 3,5%');
const chenowethSim = CivicPressureModel.calculate({
  participantes: 7440432, // 3,5% de 212.583.750
  retencaoDiaria: 75,
  dias: 30,
  populacaoBase: 212583750,
  taxRatio: 34.20
});
assertCloseTo(chenowethSim.progressoMetaChenoweth, 100.0, 0.5, 'Progresso deve atingir 100% da meta dos 3,5%');
assert(chenowethSim.statusChenoweth.includes('acima da referência de 3,5%'), 'Status deve indicar adesão acima da referência');
assert(!chenowethSim.statusChenoweth.includes('Ruptura'), 'Adesão de 3,5% não é apresentada como ruptura fiscal');

// 4. Teste de Decomposição Federativa (SectorDrainageModel)
console.log('\n4. Teste de Decomposição Federativa (SectorDrainageModel)');
const sector = SectorDrainageModel.decompose(100000000); // 100 Mi
assertCloseTo(sector.tributos.icms, 58000000, 1.0, 'ICMS deve ser 58% (R$ 58 Mi)');
assertCloseTo(sector.tributos.pisCofins, 28000000, 1.0, 'PIS/COFINS deve ser 28% (R$ 28 Mi)');
assertCloseTo(sector.tributos.ipi, 8000000, 1.0, 'IPI deve ser 8% (R$ 8 Mi)');
assertCloseTo(sector.tributos.iss, 6000000, 1.0, 'ISS deve ser 6% (R$ 6 Mi)');
assertCloseTo(sector.federacao.estados, 58000000, 1.0, 'Estados total deve ser R$ 58 Mi');
assertCloseTo(sector.federacao.uniao, 36000000, 1.0, 'União total deve ser R$ 36 Mi');
assertCloseTo(sector.federacao.municipios, 6000000, 1.0, 'Municípios total deve ser R$ 6 Mi');

// 5. Teste de Formatação Monetária
console.log('\n5. Teste de Formatação Monetária BRL');
assert(CivicPressureModel.formatBRL(1500000000).includes('1,50 Bi'), '1.5 Bi deve formatar como 1,50 Bi');
assert(CivicPressureModel.formatBRL(45000000).includes('45,0 Mi'), '45 Mi deve formatar como 45,0 Mi');

// Padrões de referência e leitura do IBGE SIDRA (fetch simulado, sem rede)
console.log('\nTeste de Padrões e do IbgeGateway');
const padrao = CivicState.createDefault();
assert(padrao.taxRatio === 21.8, 'Tributo padrão é a parcela no valor gasto (21,8%), não a carga total sobre o PIB (34,2%)');
assert(padrao.populacao === 214211951, 'População padrão é a estimativa IBGE 2026');
let urlIbge = '';
globalThis.fetch = async (url) => {
  urlIbge = url;
  return { ok: true, status: 200, json: async () => [{ resultados: [{ series: [{ serie: { '2026': '214211951' } }] }] }] };
};
const pop = await new IbgeGateway().fetchPopulacao();
assert(urlIbge.includes('/agregados/6579/') && pop && pop.value === 214211951 && pop.date === '2026', 'População lida do IBGE SIDRA 6579');
globalThis.fetch = async () => { throw new Error('offline'); };
assert(await new IbgeGateway().fetchPopulacao() === null, 'Sem rede, devolve null para manter a referência');

// 6. Gasto adiado: o imposto da parte adiada só atrasa
console.log('\n6. Teste do Gasto Adiado');
const adiadoSim = CivicPressureModel.calculate({
  participantes: 1000000, retencaoDiaria: 100, dias: 10, taxRatio: 20, adiadoPct: 40
});
assertCloseTo(adiadoSim.faturamentoRetido, 1e9, 1, 'Gasto retido no período: R$ 1 Bi');
assertCloseTo(adiadoSim.drenagemTributaria, 2e8, 1, 'Imposto que não entrou no período: R$ 200 Mi');
assertCloseTo(adiadoSim.faturamentoPerdido, 6e8, 1, 'Com 40% adiado, o comércio perde de vez R$ 600 Mi');
assertCloseTo(adiadoSim.drenagemDefinitiva, 1.2e8, 1, 'Imposto perdido de vez: R$ 120 Mi');
assertCloseTo(adiadoSim.drenagemAdiada, 8e7, 1, 'Imposto só atrasado: R$ 80 Mi');
assertCloseTo(adiadoSim.poupancaRetida, 6e8, 1, 'Poupança das famílias é só o que não volta a ser gasto');
const tudoAdiado = CivicPressureModel.calculate({ participantes: 1000, retencaoDiaria: 10, dias: 1, adiadoPct: 150 });
assert(tudoAdiado.drenagemDefinitiva === 0, 'Gasto adiado acima de 100% é limitado a 100% (perda definitiva zero)');

// 7. Peso na arrecadação real e fases fiscais
console.log('\n7. Teste do Peso na Arrecadação e das Fases');
assertCloseTo(adiadoSim.arrecadacaoPeriodo, ARRECADACAO_REFERENCIA.anual / 365 * 10, 1, 'Arrecadação do período = anual / 365 × dias');
assertCloseTo(adiadoSim.pctArrecadacao, 1.2e8 / (ARRECADACAO_REFERENCIA.anual / 365 * 10) * 100, 0.001, 'Peso usa a perda definitiva');
assert(classificarFase(0.1).fase === 1 && classificarFase(0.25).fase === 2, 'Fase 1 abaixo de 0,25%; 0,25% já é Fase 2');
assert(classificarFase(0.99).fase === 2 && classificarFase(1).fase === 3, 'Fase 3 começa em 1%');
assert(classificarFase(2.99).fase === 3 && classificarFase(3).fase === 4 && classificarFase(50).fase === 4, 'Fase 4 a partir de 3%');
const metaSim = CivicPressureModel.calculate({ participantes: 7497418, retencaoDiaria: 75, dias: 30, taxRatio: 21.8, adiadoPct: 40 });
assert(metaSim.progressoMetaChenoweth >= 99.9 && metaSim.faseFiscal.fase === 2, 'Atingir 3,5% de adesão com R$ 75/dia por 30 dias é Fase 2, não ruptura');
assert(metaSim.pctArrecadacao < 1, 'Cenário da meta 3,5% fica abaixo de 1% da arrecadação do período');
assert(posicaoNaEscala(0) === 0 && posicaoNaEscala(0.25) === 25 && posicaoNaEscala(1) === 50 && posicaoNaEscala(3) === 75, 'Cada fase ocupa um quarto da barra');
assert(posicaoNaEscala(99) === 100 && posicaoNaEscala(-1) === 0, 'Barra limitada entre 0 e 100');

// 8. Setores do boicote
console.log('\n8. Teste dos Setores');
Object.values(SETORES).forEach(st => {
  const soma = st.partilha.icms + st.partilha.pisCofins + st.partilha.ipi + st.partilha.iss;
  assert(soma === 100, `Partilha de ${st.nome} soma 100%`);
  assert(st.taxRatio > 0 && st.taxRatio <= 60 && st.adiadoPct >= 0 && st.adiadoPct <= 95, `${st.nome} cabe nos controles`);
});
assert(obterSetor('inexistente').id === 'geral', 'Setor desconhecido cai em consumo em geral');
const secComb = SectorDrainageModel.decompose(1e8, SETORES.combustiveis.partilha);
assert(secComb.tributos.ipi === 0 && secComb.tributos.iss === 0 && secComb.total === 1e8, 'Combustíveis: sem IPI e sem ISS, total preservado');
assert(sector.total === 100000000, 'Decomposição padrão informa o total drenado (não só o ICMS)');

const servico = new CivicPressureService();
const setorEnergia = servico.selecionarSetor('energia');
assert(servico.state.setor === 'energia' && servico.state.taxRatio === setorEnergia.taxRatio && servico.state.adiadoPct === setorEnergia.adiadoPct, 'Escolher setor aplica tributo e gasto adiado dele');
servico.updateParams({ taxRatio: 30 });
assert(servico.state.setor === 'energia' && servico.state.taxRatio === 30, 'Ajuste manual do tributo mantém o setor');
const simEnergia = servico.calculateSimulation();
assert(simEnergia.sector.percentuais.icms === 75, 'Partilha da simulação segue o setor escolhido');
assert(servico.generateExecutiveReport().includes('Energia elétrica'), 'Nota técnica cita o setor atingido');

// 9. Caso real: greve dos caminhoneiros (2018)
console.log('\n9. Teste da Comparação com a Greve dos Caminhoneiros');
const g18 = GREVE_CAMINHONEIROS_2018;
assert(g18.dias === 11 && g18.custoEconomia === 15e9 && g18.custoAcordo === 13.5e9, 'Greve: 11 dias, R$ 15 bi de custo, R$ 13,5 bi de acordo');
assert(g18.custoAcordoSubvencao + g18.custoAcordoTributos === g18.custoAcordo, 'Acordo = subsídio (R$ 9,5 bi) + tributos (R$ 4 bi)');
assert(g18.fontes.length >= 3 && g18.fontes.every(f => f.url.startsWith('https://')), 'Cada número tem fonte com link https');
const igual = compararComGreve(15e9, 11);
assert(igual.pctDoCusto === 100 && igual.diasParaIgualar === 11 && igual.ritmoRelativoPct === 100, 'Perder R$ 15 bi em 11 dias iguala a greve');
const metade = compararComGreve(7.5e9, 30);
assertCloseTo(metade.pctDoCusto, 50, 0.01, 'R$ 7,5 bi é 50% do custo da greve');
assert(metade.diasParaIgualar === 60, 'No ritmo de R$ 250 Mi/dia, levaria 60 dias para igualar');
assert(compararComGreve(0, 10).diasParaIgualar === null, 'Sem perda definitiva, não há prazo para igualar');
const servGreve = new CivicPressureService();
servGreve.updateParams({ participantes: 7440000, retencaoDiaria: 75, dias: 30, adiadoPct: 40 });
const simGreve = servGreve.calculateSimulation();
assert(simGreve.greve.pctDoCusto > 50 && simGreve.greve.pctDoCusto < 80 && simGreve.greve.diasParaIgualar > 30, 'Meta 3,5% em 30 dias fica abaixo do custo de 11 dias de greve');
assert(servGreve.generateExecutiveReport().includes('GREVE DOS CAMINHONEIROS'), 'Nota técnica traz a comparação com a greve');

// 10. Tipos de greve e greves que param a produção
console.log('\n10. Teste dos Tipos de Greve e do Modelo de Produção');
assert(Object.keys(TIPOS_GREVE).join() === 'consumo,transporte,geral,categoria,publico', 'Cinco tipos de greve');
['transporte', 'geral', 'categoria'].forEach(tp => assert(setoresDoTipo(tp).length >= 1, `Tipo ${tp} tem setor`));
assert(obterSetorProducao('bancos', 'transporte').tipo === 'transporte', 'Setor de outro tipo cai no primeiro setor do tipo pedido');
const calib = GreveProducaoModel.calculate({ pesoPib: 2, adesaoPct: 80, dias: 11, cascata: SETORES_PRODUCAO.carga.cascata, recuperacaoPct: 0 });
assertCloseTo(calib.pctPib, 0.2, 0.002, 'Caminhoneiros, 11 dias, 80% de adesão: ~0,2% do PIB (calibrado em 2018)');
const semCascata = GreveProducaoModel.calculate({ pesoPib: 2, adesaoPct: 80, dias: 11, cascata: 4, usarCascata: false });
assert(semCascata.perdaCascata === 0 && semCascata.multiplicador === 1, 'Cascata desligada: só a perda direta');
const geralDia = GreveProducaoModel.calculate({ pesoPib: 100, adesaoPct: 100, dias: 1, cascata: 1, recuperacaoPct: 0 });
assertCloseTo(geralDia.perdaDefinitiva, PIB_REFERENCIA.anual / 365, 1, 'Greve geral total de 1 dia = PIB de um dia');
const recup = GreveProducaoModel.calculate({ pesoPib: 10, adesaoPct: 50, dias: 10, cascata: 2, recuperacaoPct: 25 });
assertCloseTo(recup.perdaDefinitiva, recup.perdaBruta * 0.75, 1, 'Recuperação de 25% reduz a perda definitiva em 25%');
assertCloseTo(recup.perdaCascata, recup.perdaDireta, 1, 'Cascata × 2: outros setores perdem o mesmo que o setor parado');
assertCloseTo(recup.impostoPerdido, recup.perdaDefinitiva * OTICA_RENDA.governo / 100, 1, 'Impostos perdidos = 15,5% da perda (ótica da renda)');

const pub = GreveProducaoModel.calculatePublico({ servidores: 1000, remuneracaoMensal: 3000, atendimentosDia: 10, dias: 30, adesaoPct: 50 });
assert(pub.servidoresParados === 500, 'Setor público: 50% de 1.000 servidores = 500 parados');
assertCloseTo(pub.servicoNaoPrestado, 500 * 100 * 30, 1, 'Serviço não prestado = parados × salário diário × dias');
assert(pub.atendimentosPerdidos === 150000 && pub.diasParaZerarFila === 150, 'Fila: 150 mil atendimentos, 150 dias para zerar com 20% extra');
Object.values(ORGAOS_PUBLICOS).forEach(o => assert(o.servidores > 0 && o.remuneracaoMensal >= 1500 && o.atendimentosDia >= 1, `${o.nome} cabe nos controles`));

// 11. Quem paga a conta
console.log('\n11. Teste da Divisão do Custo');
assertCloseTo(OTICA_RENDA.trabalhadores + OTICA_RENDA.empresas + OTICA_RENDA.governo, 100, 0.01, 'Ótica da renda soma 100%');
const divP = DivisaoCusto.producao(1000);
assertCloseTo(divP.valores.trabalhadores, 392, 0.01, 'Produção: trabalhadores 39,2%');
assertCloseTo(divP.valores.empresas + divP.valores.trabalhadores + divP.valores.governo, 1000, 0.01, 'Produção: divisão soma a perda');
const divC = DivisaoCusto.consumo(1000, 200);
assert(divC.valores.governo === 200 && divC.valores.consumidores === -1000, 'Consumo: governo perde o imposto, consumidor guarda o dinheiro');
assertCloseTo(divC.valores.empresas + divC.valores.trabalhadores, 800, 0.01, 'Consumo: resto do faturamento entre empresas e trabalhadores');
assert(divC.pct.consumidores === 0, 'Consumidor com saldo positivo não entra na barra de quem paga');
const divPub = DivisaoCusto.publico(500);
assert(divPub.valores.consumidores === 500 && divPub.pct.consumidores === 100, 'Setor público: a população fica sem o serviço');

// 12. Biblioteca de greves, linha do tempo e preços
console.log('\n12. Teste da Biblioteca de Greves');
assert(GREVES.length >= 8, 'Pelo menos 8 greves reais');
assert(GREVES.every(g => g.fontes.length >= 1 && g.fontes.every(f => f.url.startsWith('https://'))), 'Toda greve tem fonte com link https');
assert(GREVES.every(g => g.dias >= 1 && /^\d{4}-\d{2}-\d{2}$/.test(g.inicio) && TIPOS_GREVE[g.tipo]), 'Toda greve tem dias, data e tipo válidos');
assert(GREVES.every(g => g.custoEconomia === null ? g.origemCusto === null : !!g.origemCusto), 'Custo sempre acompanhado da origem do número');
const porData = ordenarGreves('data');
assert(porData[0].inicio <= porData[porData.length - 1].inicio && porData[0].id === 'geral-1989', 'Linha do tempo começa em 1989');
const porDuracao = ordenarGreves('duracao');
assert(porDuracao[0].dias >= porDuracao[1].dias && porDuracao[porDuracao.length - 1].dias === 1, 'Ordenação por duração: maior primeiro');
assert(custoPorDia(GREVE_CAMINHONEIROS_2018) === 15e9 / 11 && custoPorDia(obterGreve('correios-2020')) === null, 'Custo por dia só quando há custo');
assert(obterGreve('nao-existe').id === 'caminhoneiros-2018', 'Greve desconhecida cai na de 2018');
assert(IPCA_2018.valores.length === 12 && IPCA_2018.valores[IPCA_2018.mesPico] === 1.26 && IPCA_2018.valores[IPCA_2018.mesGreve] === 0.40, 'IPCA 2018: maio 0,40% e junho 1,26%');
assert(Math.max(...IPCA_2018.valores) === IPCA_2018.valores[IPCA_2018.mesPico], 'Junho é o pico do ano');

// Referências do rodapé da aba de greves
const refs = listarReferencias();
const urlsRefs = refs.flatMap(g => g.itens.map(i => i.url));
assert(refs.map(g => g.grupo).join('|') === 'Greves|Efeito nos preços (IPCA 2018)|Dados usados nos cálculos', 'Referências em três grupos');
assert(new Set(urlsRefs).size === urlsRefs.length, 'Nenhum link repetido nas referências');
const todasFontes = new Set([...GREVES.flatMap(g => g.fontes), ...IPCA_2018.fontes, ...REFERENCIAS_BASE].map(f => f.url));
assert(urlsRefs.length === todasFontes.size && urlsRefs.every(u => todasFontes.has(u)), 'Referências trazem todas as fontes usadas');

// Direitos e limites
assert(DIREITOS.map(d => d.id).join() === 'greve,publico,boicote,estradas', 'Guia cobre greve, setor público, boicote e estradas');
assert(DIREITOS.every(d => d.pode.length && d.naoPode.length && d.consequencia && d.fontes.length && d.fontes.every(f => f.url.startsWith('https://'))), 'Cada tema tem pode, não pode, consequência e fontes https');
assert(DIREITOS.every(d => d.visaoLiberal?.length >= 3), 'Cada tema tem a visão liberal e de direita');
assert(DIREITOS.find(d => d.id === 'greve').visaoLiberal.some(v => v.includes('art. 7º, parágrafo único')), 'Greve: substitutos permitidos na greve abusiva (art. 7º, parágrafo único)');
assert(DIREITOS.find(d => d.id === 'estradas').consequencia.includes('20 vezes') && DIREITOS.find(d => d.id === 'estradas').consequencia.includes('60 vezes'), 'Bloqueio: multa de 20 vezes e 60 vezes para organizadores (CTB 253-A)');
assert(DIREITOS.find(d => d.id === 'greve').exige.some(e => e.includes('48 horas')) && DIREITOS.find(d => d.id === 'greve').exige.some(e => e.includes('72 horas')), 'Lei de Greve: aviso de 48 h e 72 h em serviços essenciais');

// 13. Serviço nos três modos
console.log('\n13. Teste do Serviço por Tipo de Greve');
const sv = new CivicPressureService();
assert(sv.calculateSimulation().modo === 'consumo', 'Começa na greve de consumo');
sv.selecionarTipo('transporte');
let simT = sv.calculateSimulation();
assert(simT.modo === 'producao' && simT.setorProducao.id === 'carga' && sv.state.adesaoPct === 80, 'Transporte começa nos caminhoneiros com 80% de adesão');
sv.updateParams({ dias: 11 });
simT = sv.calculateSimulation();
assertCloseTo(simT.greve.pctDoCusto, (PIB_REFERENCIA.anual * 0.002) / 15e9 * 100, 0.5, 'Caminhoneiros simulados ≈ 0,2% do PIB de hoje, comparado com os R$ 15 bi de 2018');
assert(simT.resumo.faseFiscal && simT.resumo.pctArrecadacao > 0, 'Greve de produção tem peso na arrecadação');
sv.updateParams({ usarCascata: false });
assert(sv.calculateSimulation().producao.perdaCascata === 0, 'Desligar a cascata pelo serviço');
sv.selecionarTipo('categoria');
assert(sv.calculateSimulation().setorProducao.tipo === 'categoria', 'Categoria troca o setor');
sv.selecionarSetorProducao('portos');
assert(sv.state.setorProducao === 'portos' && sv.state.adesaoPct === SETORES_PRODUCAO.portos.adesaoPct, 'Escolher setor aplica a adesão típica');
sv.selecionarTipo('publico');
const simPub = sv.calculateSimulation();
assert(simPub.modo === 'publico' && simPub.publico.servicoNaoPrestado > 0 && simPub.resumo.impostoPerdido === 0, 'Setor público calcula serviço não prestado');
sv.selecionarOrgao('inss');
assert(sv.state.servidores === ORGAOS_PUBLICOS.inss.servidores, 'Escolher órgão aplica os valores de exemplo');
assert(sv.generateExecutiveReport().includes('GREVE DO SETOR PÚBLICO') && sv.generateExecutiveReport().includes('INSS'), 'Nota técnica do setor público');
sv.selecionarTipo('geral');
assert(sv.generateExecutiveReport().includes('Toda a economia') && sv.generateExecutiveReport().includes('QUEM PAGA A CONTA'), 'Nota técnica da greve geral com divisão do custo');
sv.selecionarTipo('consumo');
assert(sv.calculateSimulation().modo === 'consumo' && sv.state.setor === 'geral', 'Volta ao consumo mantendo o setor do boicote');

console.log(`\n========================================`);
console.log(`Total: ${passed + failed} | Passou: ${passed} | Falhou: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
