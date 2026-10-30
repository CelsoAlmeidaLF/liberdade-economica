/**
 * Camada de Domínio: DireitosGreve
 * Guia curto do que a lei permite e proíbe em greves, boicotes e manifestações.
 * Conteúdo informativo, com fontes; não substitui orientação jurídica.
 */
const PLANALTO = 'https://www.planalto.gov.br/ccivil_03';

export const DIREITOS = Object.freeze([
  {
    id: 'greve',
    titulo: 'Greve de trabalhadores',
    lei: 'Lei 7.783/1989 (Lei de Greve)',
    icone: 'users',
    resumo: 'A greve é um direito: os trabalhadores decidem quando fazer e o que reivindicar. A lei exige negociação antes, aviso prévio e paralisação pacífica.',
    pode: [
      'Parar de forma coletiva, temporária e pacífica, total ou parcial (art. 2º).',
      'Convencer colegas por meios pacíficos, arrecadar fundos e divulgar o movimento (art. 6º, I e II).',
      'Durante a greve, a empresa não pode forçar ninguém a trabalhar, demitir grevistas nem contratar substitutos (art. 6º, § 2º, e art. 7º).'
    ],
    exige: [
      'Tentar negociar antes de parar (art. 3º).',
      'Avisar o empregador com 48 horas de antecedência (art. 3º, parágrafo único).',
      'Em serviços essenciais (água, energia, hospitais, controle aéreo e outros do art. 10), avisar empregadores e usuários com 72 horas (art. 13) e manter o atendimento indispensável (art. 11).'
    ],
    naoPode: [
      'Impedir o acesso de quem quer trabalhar, ameaçar pessoas ou causar dano a bens (art. 6º, § 3º).',
      'Violar direitos fundamentais de colegas ou de terceiros (art. 6º, § 1º).',
      'Continuar parado depois de acordo ou decisão da Justiça (art. 14).'
    ],
    consequencia: 'Descumprir a lei torna a greve abusiva (art. 14), o que abre caminho para desconto dos dias, multa ao sindicato e punições. Mesmo numa greve legal, o contrato fica suspenso e o pagamento dos dias parados depende de acordo ou da Justiça do Trabalho (art. 7º).',
    fontes: [
      { titulo: 'Lei 7.783/1989, Lei de Greve (Planalto)', url: `${PLANALTO}/leis/l7783.htm` },
      { titulo: 'TST considera abusiva greve em atividade essencial sem aviso prévio (FINDES)', url: 'https://findes.com.br/wp-content/uploads/2024/09/Informe-Estrategico-–-TST-considera-abusiva-greve-em-atividade-essencial-sem-comunicacao-previa.pdf' }
    ]
  },
  {
    id: 'publico',
    titulo: 'Greve no setor público',
    lei: 'Constituição, art. 37, VII e art. 142 · STF, Tema 531',
    icone: 'shield',
    resumo: 'Servidores civis podem fazer greve. Sem lei específica, o STF manda aplicar as regras da Lei de Greve. Militares não podem.',
    pode: [
      'Servidores civis podem fazer greve, seguindo as regras da Lei de Greve, inclusive aviso prévio e serviços mínimos.',
      'Negociar a compensação dos dias parados em vez do desconto.'
    ],
    exige: [
      'Manter os serviços essenciais à população funcionando.'
    ],
    naoPode: [
      'Militares das Forças Armadas não podem fazer greve (Constituição, art. 142, § 3º, IV).'
    ],
    consequencia: 'O governo deve descontar os dias parados, a não ser que haja acordo de compensação ou que a greve tenha sido provocada por conduta ilegal do próprio poder público (STF, Tema 531, RE 693.456, 2016).',
    fontes: [
      { titulo: 'STF, Tema 531: desconto dos dias parados de servidores (Teses e Súmulas)', url: 'https://tesesesumulas.com.br/tese/stf/531' },
      { titulo: 'Constituição Federal (Planalto)', url: `${PLANALTO}/constituicao/constituicao.htm` }
    ]
  },
  {
    id: 'boicote',
    titulo: 'Boicote de consumo',
    lei: 'Constituição, art. 5º, IV e XVI',
    icone: 'dollarSign',
    resumo: 'Deixar de comprar é uma escolha de cada pessoa, e convocar um boicote é livre manifestação de pensamento.',
    pode: [
      'Deixar de comprar de qualquer empresa ou setor.',
      'Convocar e divulgar o boicote, inclusive nas redes sociais (art. 5º, IV).',
      'Fazer reunião pacífica em local público, avisando antes a autoridade (art. 5º, XVI).'
    ],
    exige: [],
    naoPode: [
      'Espalhar informação falsa sobre empresa ou pessoa: pode ser calúnia ou difamação (Código Penal, arts. 138 e 139) e gerar indenização.',
      'Impedir fisicamente quem quer comprar ou ameaçar comerciantes e funcionários.'
    ],
    consequencia: 'O boicote em si não tem punição. Os problemas vêm da forma: mentira, ameaça ou impedimento podem virar processo criminal e indenização por dano moral.',
    fontes: [
      { titulo: 'Constituição Federal, art. 5º (Planalto)', url: `${PLANALTO}/constituicao/constituicao.htm` },
      { titulo: 'Código Penal, arts. 138 e 139 (Planalto)', url: `${PLANALTO}/decreto-lei/del2848compilado.htm` }
    ]
  },
  {
    id: 'estradas',
    titulo: 'Bloqueio de estradas e ruas',
    lei: 'Código de Trânsito, art. 253-A (Lei 13.281/2016)',
    icone: 'truck',
    resumo: 'Manifestar é permitido; usar veículo para fechar a via sem autorização é infração gravíssima, com punição maior para quem organiza.',
    pode: [
      'Fazer manifestação pacífica, avisando antes a autoridade (Constituição, art. 5º, XVI).',
      'Parar o próprio caminhão em local permitido, sem bloquear a circulação.'
    ],
    exige: [
      'Autorização do órgão de trânsito para ocupar ou restringir a via.'
    ],
    naoPode: [
      'Usar qualquer veículo para interromper, restringir ou perturbar a circulação sem autorização (CTB, art. 253-A).'
    ],
    consequencia: 'Infração gravíssima: multa de 20 vezes o valor básico, suspensão do direito de dirigir por 12 meses e remoção do veículo. Quem organiza paga multa de 60 vezes, e a reincidência em 12 meses dobra a multa.',
    fontes: [
      { titulo: 'Código de Trânsito Brasileiro, art. 253-A (Planalto)', url: `${PLANALTO}/leis/l9503compilado.htm` },
      { titulo: 'Lei 13.281/2016, que criou o art. 253-A (Planalto)', url: `${PLANALTO}/_ato2015-2018/2016/lei/l13281.htm` },
      { titulo: 'Comentário ao art. 253-A (CTB Digital)', url: 'https://ctbdigital.com.br/artigo-comentarista/632/' }
    ]
  },
  {
    id: 'demissao',
    titulo: 'Demissão ou ameaça por opinião política',
    lei: 'Constituição, art. 5º, VIII · Convenção 111 da OIT · Lei 9.029/1995 · Código Eleitoral',
    icone: 'scale',
    resumo: 'Ninguém pode perder direitos por convicção política. Isso vale para qualquer lado: protege o trabalhador de esquerda e o de direita.',
    pode: [
      'Ter, defender e divulgar qualquer opinião política, no trabalho e fora dele.',
      'Denunciar ameaça ou demissão por voto ao Ministério Público do Trabalho, inclusive de forma anônima.'
    ],
    exige: [],
    naoPode: [
      'Demitir, deixar de contratar ou punir alguém pela opinião política ou pelo voto (Constituição, art. 5º, VIII; Convenção 111 da OIT, Decreto 10.088/2019).',
      'Ameaçar empregados de demissão para influenciar o voto: é assédio eleitoral e pode ser crime (Código Eleitoral).'
    ],
    consequencia: 'Na demissão discriminatória, o trabalhador escolhe entre voltar ao emprego recebendo todo o período afastado ou receber em dobro a remuneração desse período (Lei 9.029/1995, art. 4º), além de possível indenização por dano moral. Nas eleições de 2026, o MPT recebeu 1.937 denúncias de assédio eleitoral até 26 de outubro.',
    fontes: [
      { titulo: 'Lei 9.029/1995: práticas discriminatórias no trabalho (Planalto)', url: `${PLANALTO}/leis/l9029.htm` },
      { titulo: 'Decreto 10.088/2019, que consolida a Convenção 111 da OIT (Planalto)', url: `${PLANALTO}/_ato2019-2022/2019/decreto/d10088.htm` },
      { titulo: 'Código Eleitoral (Planalto)', url: `${PLANALTO}/leis/l4737compilado.htm` },
      { titulo: 'MPT recebe 1.937 denúncias de assédio eleitoral no trabalho (JB, out/2026)', url: 'https://www.jb.com.br/brasil/justica/2026/10/1061368-mpt-recebe-1-937-denuncias-de-assedio-eleitoral-no-trabalho.html' }
    ]
  }
]);

export const AVISO_DIREITOS = 'Guia informativo, com base na lei e em decisões dos tribunais. Não substitui a orientação de um advogado ou do sindicato.';
