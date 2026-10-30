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
    visaoLiberal: [
      'Sem trabalho, sem salário: o contrato fica suspenso, e a regra é descontar os dias parados. Pagar depende de acordo (art. 7º).',
      'Greve abusiva ou mantida depois de decisão da Justiça libera a empresa para demitir e contratar substitutos (art. 7º, parágrafo único, e art. 14).',
      'Se os grevistas não mantiverem máquinas e serviços indispensáveis, a empresa pode contratar quem faça esse trabalho (art. 9º, parágrafo único).',
      'Quem quer trabalhar tem esse direito garantido. A empresa pode pedir à Justiça do Trabalho um interdito proibitório para proteger a entrada (Súmula Vinculante 23).',
      'Desde a Reforma Trabalhista, ninguém é obrigado a pagar contribuição sindical (Lei 13.467/2017; STF, ADI 5794). Quem não é sindicalizado pode se opor à contribuição assistencial (STF, Tema 935).'
    ],
    consequencia: 'Descumprir a lei torna a greve abusiva (art. 14), o que abre caminho para desconto dos dias, multa ao sindicato e punições. Mesmo numa greve legal, o contrato fica suspenso e o pagamento dos dias parados depende de acordo ou da Justiça do Trabalho (art. 7º).',
    fontes: [
      { titulo: 'Lei 7.783/1989, Lei de Greve (Planalto)', url: `${PLANALTO}/leis/l7783.htm` },
      { titulo: 'TST considera abusiva greve em atividade essencial sem aviso prévio (FINDES)', url: 'https://findes.com.br/wp-content/uploads/2024/09/Informe-Estrategico-–-TST-considera-abusiva-greve-em-atividade-essencial-sem-comunicacao-previa.pdf' },
      { titulo: 'Lei 13.467/2017, Reforma Trabalhista (Planalto)', url: `${PLANALTO}/_ato2015-2018/2017/lei/l13467.htm` },
      { titulo: 'STF, Tema 935: contribuição assistencial e direito de oposição (Teses e Súmulas)', url: 'https://tesesesumulas.com.br/tese/stf/935' }
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
    visaoLiberal: [
      'O salário do servidor vem do imposto de todos. Por isso o desconto dos dias parados é a regra, e não uma punição (STF, Tema 531).',
      'Servidor tem estabilidade, o que o trabalhador privado não tem. A greve no serviço público pesa sobre o cidadão, que não tem outra opção de atendimento.',
      'Policiais civis e demais carreiras de segurança pública não podem fazer greve (STF, Tema 541, 2017). Policiais militares e bombeiros seguem a mesma proibição dos militares (Constituição, art. 42, § 1º, e art. 142, § 3º, IV).'
    ],
    consequencia: 'O governo deve descontar os dias parados, a não ser que haja acordo de compensação ou que a greve tenha sido provocada por conduta ilegal do próprio poder público (STF, Tema 531, RE 693.456, 2016).',
    fontes: [
      { titulo: 'STF, Tema 531: desconto dos dias parados de servidores (Teses e Súmulas)', url: 'https://tesesesumulas.com.br/tese/stf/531' },
      { titulo: 'STF, Tema 541: proibição de greve na segurança pública (Teses e Súmulas)', url: 'https://tesesesumulas.com.br/tese/stf/541' },
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
    visaoLiberal: [
      'O boicote é o voto do consumidor: cada um decide com o próprio dinheiro, sem pedir lei, proibição ou subsídio.',
      'A empresa também é livre para definir seus preços e seu negócio, sem pedir licença ao Estado para atividade de baixo risco (Lei 13.874/2019, art. 3º, I e III). Quem discorda responde no mercado.',
      'O limite é o mesmo para todos os lados: verdade nas acusações e nada de ameaça ou impedimento físico.'
    ],
    consequencia: 'O boicote em si não tem punição. Os problemas vêm da forma: mentira, ameaça ou impedimento podem virar processo criminal e indenização por dano moral.',
    fontes: [
      { titulo: 'Constituição Federal, art. 5º (Planalto)', url: `${PLANALTO}/constituicao/constituicao.htm` },
      { titulo: 'Código Penal, arts. 138 e 139 (Planalto)', url: `${PLANALTO}/decreto-lei/del2848compilado.htm` },
      { titulo: 'Lei 13.874/2019, Declaração de Direitos de Liberdade Econômica (Planalto)', url: `${PLANALTO}/_ato2019-2022/2019/lei/l13874.htm` }
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
    visaoLiberal: [
      'Manifestar é direito; fechar a via tira o direito de ir e vir de quem não tem nada com a disputa (Constituição, art. 5º, XV).',
      'Estrada bloqueada para ambulância, carga de alimentos e combustível. O custo cai sobre terceiros, não sobre quem está sendo cobrado.',
      'Na greve dos caminhoneiros de 2018, o STF autorizou a desobstrução das rodovias e multa às entidades organizadoras (ADPF 519).'
    ],
    consequencia: 'Infração gravíssima: multa de 20 vezes o valor básico, suspensão do direito de dirigir por 12 meses e remoção do veículo. Quem organiza paga multa de 60 vezes, e a reincidência em 12 meses dobra a multa.',
    fontes: [
      { titulo: 'Código de Trânsito Brasileiro, art. 253-A (Planalto)', url: `${PLANALTO}/leis/l9503compilado.htm` },
      { titulo: 'Lei 13.281/2016, que criou o art. 253-A (Planalto)', url: `${PLANALTO}/_ato2015-2018/2016/lei/l13281.htm` },
      { titulo: 'Comentário ao art. 253-A (CTB Digital)', url: 'https://ctbdigital.com.br/artigo-comentarista/632/' }
    ]
  }
]);

export const AVISO_DIREITOS = 'Guia informativo, com base na lei e em decisões dos tribunais. Não substitui a orientação de um advogado ou do sindicato.';
