/**
 * Camada de Domínio: CasosReais
 * Greves brasileiras com impacto documentado, usadas como régua para a simulação.
 *
 * origemCusto diz de onde vem o número de custo: 'oficial' (governo), 'estudo',
 * 'imprensa', 'empresa' ou null quando não há estimativa consolidada.
 */
export const GREVE_CAMINHONEIROS_2018 = Object.freeze({
  id: 'caminhoneiros-2018',
  titulo: 'Greve dos caminhoneiros (2018)',
  tipo: 'transporte',
  inicio: '2018-05-21',
  periodo: '21 a 31 de maio de 2018',
  dias: 11,
  participantes: 'Caminhoneiros autônomos e de empresas em todo o país',
  resumo: 'Paralisação contra a alta do diesel que bloqueou estradas e travou o abastecimento de combustível, alimentos e insumos. Diferente de um boicote de consumo: a mercadoria deixou de chegar.',
  // Estimativa da equipe econômica (Ministério da Fazenda), junho de 2018
  custoEconomia: 15e9,
  custoEconomiaPctPib: 0.2,
  origemCusto: 'oficial',
  quedaIndustriaPct: 10.9,
  // Acordo para encerrar a greve: subvenção de R$ 0,30/L + corte de PIS/COFINS e CIDE de R$ 0,16/L no diesel
  custoAcordo: 13.5e9,
  custoAcordoSubvencao: 9.5e9,
  custoAcordoTributos: 4e9,
  destaques: [
    { label: 'Produção Industrial', valor: '-10,9%', sub: 'maio/2018 frente a abril · IBGE' },
    { label: 'Custo do Acordo', valor: 'R$ 13,50 Bi', sub: 'R$ 9,50 Bi de subsídio + R$ 4,00 Bi de tributos no diesel' }
  ],
  resultado: 'O governo cedeu em 11 dias: reduziu o diesel em R$ 0,46 por litro (MP 838/2018), criou a tabela de frete mínimo e isentou eixos suspensos de pedágio.',
  conquistou: 'sim',
  fontes: [
    {
      titulo: 'Fazenda: greve custou R$ 15 bi, 0,2% do PIB (jun/2018)',
      url: 'https://www.coad.com.br/home/noticias-detalhe/86960/greve-dos-caminhoneiros-teve-impacto-de-r-15-bi-na-economia-calcula-fazenda'
    },
    {
      titulo: 'IBGE: indústria recua 10,9% de abril para maio de 2018',
      url: 'https://agenciabrasil.ebc.com.br/economia/noticia/2018-07/greve-dos-caminhoneiros-fez-industria-recuar-109-de-abril-para-maio'
    },
    {
      titulo: 'Redução do diesel custará R$ 13,5 bi aos cofres públicos',
      url: 'https://www.poder360.com.br/governo/reducao-do-preco-do-diesel-custara-r-135-bi-aos-cofres-publicos-em-2018/'
    },
    {
      titulo: 'MP 838/2018: subvenção ao diesel (Agência Câmara)',
      url: 'https://www.camara.leg.br/noticias/542704-nova-medida-provisoria-mantem-subsidio-ao-diesel-de-caminhoes-onibus-e-maquinas-agricolas/'
    }
  ]
});

export const GREVES = Object.freeze([
  {
    id: 'geral-1989',
    titulo: 'Greve geral (1989)',
    tipo: 'geral',
    inicio: '1989-03-14',
    periodo: '14 e 15 de março de 1989',
    dias: 2,
    participantes: '35 milhões, segundo a CUT (sem confirmação independente)',
    resumo: 'Convocada pela CUT e pela CGT contra o Plano Verão, a recessão e as perdas salariais com a inflação.',
    custoEconomia: null,
    origemCusto: null,
    resultado: 'Marcou a oposição ao Plano Verão; não há estimativa consolidada de custo.',
    conquistou: 'parcial',
    fontes: [
      { titulo: 'Sete paralisações que marcaram a história do Brasil (Vermelho)', url: 'https://vermelho.org.br/2019/06/14/sete-paralisacoes-que-marcaram-a-historia-do-brasil/' }
    ]
  },
  {
    id: 'petroleiros-1995',
    titulo: 'Greve dos petroleiros (1995)',
    tipo: 'categoria',
    inicio: '1995-05-03',
    periodo: 'Maio e junho de 1995',
    dias: 32,
    participantes: 'Petroleiros da Petrobras em todo o país',
    resumo: 'A greve mais longa da categoria. O Exército ocupou refinarias e faltou gás de cozinha; o TCU depois atribuiu a falta de gás às distribuidoras.',
    custoEconomia: null,
    origemCusto: null,
    resultado: 'O TST julgou a greve abusiva e aplicou multas pesadas aos sindicatos; dirigentes foram demitidos.',
    conquistou: 'nao',
    fontes: [
      { titulo: 'Greve histórica dos petroleiros completa 15 anos (FUP/CUT, fonte sindical)', url: 'https://www.cut.org.br/noticias/greve-historica-dos-petroleiros-completa-15-anos-3b60' }
    ]
  },
  {
    id: 'bancarios-2016',
    titulo: 'Greve dos bancários (2016)',
    tipo: 'categoria',
    inicio: '2016-09-06',
    periodo: 'Setembro e outubro de 2016',
    dias: 31,
    participantes: 'Bancários de bancos públicos e privados',
    resumo: 'Uma das greves mais longas da categoria. Agências fechadas, mas aplicativos e caixas eletrônicos seguiram funcionando.',
    custoEconomia: null,
    origemCusto: null,
    resultado: 'Reajuste de 8% e abono de R$ 3,5 mil, acordo de dois anos e anistia dos 31 dias parados.',
    conquistou: 'sim',
    fontes: [
      { titulo: 'Bancários voltam ao trabalho após 31 dias (Congresso em Foco)', url: 'https://congressoemfoco.com.br/noticia/36734/bancarios-voltam-ao-trabalho-apos-segunda-greve-mais-longa-da-historia' }
    ]
  },
  {
    id: 'geral-2017',
    titulo: 'Greve geral (2017)',
    tipo: 'geral',
    inicio: '2017-04-28',
    periodo: '28 de abril de 2017',
    dias: 1,
    participantes: '35 milhões, segundo a CUT (estimativa sindical)',
    resumo: 'Paralisação contra as reformas trabalhista e da Previdência. Transporte público parado nas grandes cidades.',
    custoEconomia: 5e9,
    origemCusto: 'imprensa',
    custoNota: 'Só o faturamento do comércio, estimativa citada pela imprensa',
    resultado: 'A reforma trabalhista foi aprovada três meses depois (Lei 13.467/2017).',
    conquistou: 'nao',
    fontes: [
      { titulo: 'Greve geral provocou rombo de R$ 5 bi no comércio (Correio Braziliense)', url: 'https://www.correiobraziliense.com.br/app/noticia/politica/2017/04/29/interna_politica,592261/greve-geral-provocou-rombo-de-r-5-bilhoes-no-comercio-brasileiro.shtml' }
    ]
  },
  GREVE_CAMINHONEIROS_2018,
  {
    id: 'petroleiros-2020',
    titulo: 'Greve dos petroleiros (2020)',
    tipo: 'categoria',
    inicio: '2020-02-01',
    periodo: '1º a 21 de fevereiro de 2020',
    dias: 20,
    participantes: 'Petroleiros da Petrobras (com 90% de efetivo mínimo determinado pelo TST)',
    resumo: 'Contra demissões na fábrica de fertilizantes do Paraná. O TST exigiu 90% dos trabalhadores em atividade, o que limitou o impacto na produção.',
    custoEconomia: 50e6,
    origemCusto: 'imprensa',
    custoNota: 'Custo para a Petrobras, segundo a imprensa',
    resultado: 'O TST declarou a greve ilegal; acordo mediado no TST encerrou o movimento.',
    conquistou: 'parcial',
    fontes: [
      { titulo: 'Acordo no TST encerra greve dos petroleiros (A Gazeta)', url: 'https://www.agazeta.com.br/economia/acordo-no-tst-encerra-definitivamente-greve-dos-petroleiros-0220' },
      { titulo: 'TST ordena que 90% dos petroleiros trabalhem (Poder360)', url: 'https://www.poder360.com.br/brasil/tst-ordena-que-90-dos-petroleiros-trabalhem-durante-greve/' }
    ]
  },
  {
    id: 'correios-2020',
    titulo: 'Greve dos Correios (2020)',
    tipo: 'categoria',
    inicio: '2020-08-17',
    periodo: '17 de agosto a 22 de setembro de 2020',
    dias: 35,
    participantes: 'Funcionários dos Correios',
    resumo: 'Contra a privatização e a retirada de cláusulas do acordo coletivo, em plena alta das compras on-line na pandemia.',
    custoEconomia: null,
    origemCusto: null,
    resultado: 'O TST julgou a greve não abusiva, deu reajuste de 2,6% e mandou descontar metade dos dias parados.',
    conquistou: 'parcial',
    fontes: [
      { titulo: 'TST determina fim da greve nos Correios (Agência Brasil)', url: 'https://agenciabrasil.ebc.com.br/justica/noticia/2020-09/tst-determina-fim-da-greve-nos-correios' }
    ]
  },
  {
    id: 'educacao-federal-2024',
    titulo: 'Greve da educação federal (2024)',
    tipo: 'publico',
    inicio: '2024-04-15',
    periodo: '15 de abril a fim de junho de 2024 (cerca de 70 dias para os docentes)',
    dias: 70,
    participantes: 'Professores e técnicos de universidades e institutos federais',
    resumo: 'Técnicos pararam em março e docentes em 15 de abril. Para os técnicos, a Fasubra contou 113 dias.',
    custoEconomia: null,
    origemCusto: null,
    resultado: 'Acordo assinado em 27 de junho: sem reajuste em 2024, com aumentos em 2025 e 2026.',
    conquistou: 'parcial',
    fontes: [
      { titulo: 'Sindicatos assinam acordo e greve chega ao fim (Jornal Opção)', url: 'https://www.jornalopcao.com.br/educacao/entidades-sindicais-assinam-acordo-com-governo-e-greve-chega-ao-fim-nas-universidades-e-institutos-federais-615256/' }
    ]
  }
]);

/**
 * Efeito nos preços: IPCA mensal de 2018 (IBGE). Junho teve a maior alta para o mês desde 1995.
 */
export const IPCA_2018 = Object.freeze({
  meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  valores: [0.29, 0.32, 0.09, 0.22, 0.40, 1.26, 0.33, -0.09, 0.48, 0.45, -0.21, 0.15],
  mesGreve: 4, // maio (índice 0)
  mesPico: 5,  // junho
  atribuidoGreve: 0.48, // p.p. do IPCA de junho atribuídos à greve (ABC Brasil)
  alimentosJunho: 3.09, // alimentação no domicílio em junho (Ipea)
  fontes: [
    { titulo: 'Inflação sobe 1,26% em junho, maior para o mês desde 1995 (Poder360)', url: 'https://www.poder360.com.br/economia/inflacao-acelera-126-em-junho-e-e-a-maior-para-o-mes-desde-1995/' },
    { titulo: 'Ipea: alimentação no domicílio sobe 3,09% em junho de 2018', url: 'https://repositorio.ipea.gov.br/bitstream/11058/9257/1/Carta_Conjuntura_n40_nt_alimentos.pdf' },
    { titulo: 'IPCA mensal de 2018', url: 'https://www.numerando.com.br/indices/ipca/2018' }
  ]
});

/**
 * Dados de base usados nos cálculos (PIB, arrecadação e divisão da renda)
 */
export const REFERENCIAS_BASE = Object.freeze([
  { titulo: 'Tesouro Nacional: carga tributária bruta do Governo Geral atinge 32,32% do PIB em 2024', url: 'https://www.gov.br/tesouronacional/pt-br/noticias/carga-tributaria-bruta-do-governo-geral-atinge-32-32-do-pib-em-2024' },
  { titulo: 'IBGE: PIB cresce 3,4% em 2024 e fecha o ano em R$ 11,7 trilhões (SBT News)', url: 'https://sbtnews.sbt.com.br/noticia/economia/pib-cresce-3-4-em-2024-e-fecha-o-ano-em-r-11-7-trilhoes-diz-ibge' },
  { titulo: 'IBGE: Contas Nacionais 2021, PIB pela ótica da renda (cópia do Poder360)', url: 'https://static.poder360.com.br/2023/11/pib-2021-ibge-48.pdf' }
]);

/**
 * Todas as fontes da aba de greves, agrupadas e sem links repetidos
 */
export function listarReferencias() {
  const vistos = new Set();
  const unicas = fontes => fontes.filter(f => !vistos.has(f.url) && vistos.add(f.url));
  return [
    { grupo: 'Greves', itens: unicas(ordenarGreves('data').flatMap(g => g.fontes.map(f => ({ ...f, contexto: g.titulo })))) },
    { grupo: 'Efeito nos preços (IPCA 2018)', itens: unicas(IPCA_2018.fontes) },
    { grupo: 'Dados usados nos cálculos', itens: unicas(REFERENCIAS_BASE) }
  ].filter(g => g.itens.length > 0);
}

export const ORIGEM_CUSTO = Object.freeze({
  oficial: 'estimativa oficial',
  estudo: 'estudo',
  imprensa: 'imprensa',
  empresa: 'empresa',
  null: 'sem estimativa consolidada'
});

export function obterGreve(id) {
  return GREVES.find(g => g.id === id) || GREVE_CAMINHONEIROS_2018;
}

/**
 * Greves ordenadas por data ou por duração (para a linha do tempo e a comparação)
 */
export function ordenarGreves(criterio = 'data') {
  const lista = [...GREVES];
  if (criterio === 'duracao') return lista.sort((a, b) => b.dias - a.dias || a.inicio.localeCompare(b.inicio));
  return lista.sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export function custoPorDia(greve) {
  return greve.custoEconomia ? greve.custoEconomia / greve.dias : null;
}

/**
 * Compara a perda definitiva da simulação com o custo da greve de 2018.
 * É uma régua aproximada: a greve parou a produção; o boicote reduz o consumo.
 */
export function compararComGreve(faturamentoPerdido, dias, caso = GREVE_CAMINHONEIROS_2018) {
  const perda = Math.max(0, Number(faturamentoPerdido));
  const d = Math.max(1, Number(dias));
  const pctDoCusto = (perda / caso.custoEconomia) * 100;
  const perdaDiariaSim = perda / d;
  const perdaDiariaGreve = caso.custoEconomia / caso.dias;
  return {
    pctDoCusto: Number(pctDoCusto.toFixed(1)),
    // Quantos dias, no ritmo simulado, igualariam o custo da greve
    diasParaIgualar: perdaDiariaSim > 0 ? Math.ceil(caso.custoEconomia / perdaDiariaSim) : null,
    ritmoRelativoPct: Number(((perdaDiariaSim / perdaDiariaGreve) * 100).toFixed(1))
  };
}
