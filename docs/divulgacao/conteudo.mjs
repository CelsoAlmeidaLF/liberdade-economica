/**
 * Conteúdo editorial do PDF de divulgação que não existe no app:
 * matérias da imprensa liberal e de direita (links conferidos em outubro de 2026) e glossário.
 */
const GAZETA = 'https://www.gazetadopovo.com.br';

export const IMPRENSA_GREVES = Object.freeze({
  'caminhoneiros-2018': [
    { titulo: 'Greve dos caminhoneiros: prejuízo de grandes empresas passa de R$ 1 bi (Gazeta do Povo)', url: `${GAZETA}/economia/greve-caminhoneiros-prejuizo-grandes-empresas-1-bilhao/` },
    { titulo: 'Prejuízo da agropecuária com greve dos caminhoneiros passa de R$ 4,2 bi (Gazeta do Povo)', url: `${GAZETA}/agronegocio/prejuizo-da-agropecuaria-com-greve-dos-caminhoneiros-passa-de-r-42-bi-2s29a0uouxa7ejbm7aoamac5l/` },
    { titulo: 'Após greve, renda dos caminhoneiros autônomos despencou (Gazeta do Povo)', url: `${GAZETA}/ideias/apos-greve-renda-dos-caminhoneiros-despencou/` },
    { titulo: 'Por que o Brasil para quando os caminhoneiros entram em greve? (Gazeta do Povo)', url: `${GAZETA}/economia/por-que-o-brasil-para-quando-os-caminhoneiros-entram-em-greve/` }
  ],
  'geral-2017': [
    { titulo: 'Falta de ônibus, bloqueios de estradas e confrontos na greve geral (Gazeta do Povo)', url: `${GAZETA}/politica/republica/falta-de-onibus-bloqueios-de-estradas-e-confrontos-greve-geral-e-a-maior-do-seculo-b2ioudz5qgdmh4gipgi7wghec/` }
  ],
  'petroleiros-2020': [
    { titulo: 'Greve de petroleiros é ideológica: privatize já! (Rodrigo Constantino, Gazeta do Povo)', url: `${GAZETA}/rodrigo-constantino/greve-de-petroleiros-e-ideologica-privatize-ja/` },
    { titulo: 'TRT suspende demissões de petroleiros em fábrica da Petrobras (Gazeta do Povo)', url: `${GAZETA}/republica/breves/trt-suspende-demissoes-de-petroleiros-petrobras/` }
  ],
  'correios-2020': [
    { titulo: 'TST limita adesão à greve dos Correios: 70% dos funcionários devem trabalhar (Gazeta do Povo)', url: `${GAZETA}/economia/breves/tst-limita-adesao-greve-dos-correios/` }
  ],
  'educacao-federal-2024': [
    { titulo: 'Sindicato chega a acordo com governo Lula e encerra greve de professores federais (Revista Oeste)', url: 'https://revistaoeste.com/politica/sindicato-chega-a-acordo-com-governo-lula-e-encerra-greve-de-professores-federais/' }
  ]
});

export const IMPRENSA_DIREITOS = Object.freeze({
  greve: [
    { titulo: 'STF mantém fim da obrigatoriedade do imposto sindical (Gazeta do Povo)', url: `${GAZETA}/justica/derrota-para-os-sindicatos-stf-mantem-fim-da-obrigatoriedade-do-imposto-sindical-brlyug4c0pohewig7rdf0s0iy/` },
    { titulo: 'Contribuição sindical despenca 98% em cinco anos (Revista Oeste)', url: 'https://revistaoeste.com/brasil/contribuicao-sindical-despenca-98-em-cinco-anos/' },
    { titulo: 'STF forma maioria para limitar cobrança de contribuição assistencial (Gazeta do Povo)', url: `${GAZETA}/economia/stf-maioria-limitar-cobranca-contribuicao-assistencial/` }
  ],
  publico: [
    { titulo: 'Poder público deve cortar o ponto de servidores grevistas, decide STF (Gazeta do Povo)', url: `${GAZETA}/vida-publica/justica-e-direito/poder-publico-deve-cortar-o-ponto-de-servidores-grevistas-decide-stf-ezk91vix4m986n9j5fkjcwsr6/` },
    { titulo: 'STF proíbe que policiais civis e todos os servidores da segurança façam greve (Gazeta do Povo)', url: `${GAZETA}/vida-publica/justica-e-direito/stf-proibe-que-policiais-civis-e-todos-os-servidores-da-seguranca-facam-greve-7yw2ujzvjdudf4uwyz4l5hbfo/` }
  ],
  boicote: [
    { titulo: 'STF decide que campanhas de boicote são liberdade de expressão (Gazeta do Povo)', url: `${GAZETA}/vida-e-cidadania/havaianas-e-rodeios-stf-campanhas-de-boicote-sao-liberdade-de-expressao/` },
    { titulo: 'Em defesa do boicote social (Instituto Mises Brasil)', url: 'https://mises.org.br/artigos/1023/emdefesadoboicotesocial/' }
  ],
  estradas: [
    { titulo: 'Moraes estende para todo o Brasil a multa de R$ 100 mil por bloqueio de vias públicas (Gazeta do Povo)', url: `${GAZETA}/republica/moraes-estende-para-todo-brasil-a-multa-de-r-100-mil-em-caso-de-bloqueio-de-vias-publicas/` }
  ]
});

// Análises de fundo sobre greves e sindicatos
export const IMPRENSA_GERAL = Object.freeze([
  { titulo: 'Sindicatos, badernas, greves nos setores público e privado, e coerções (Instituto Mises Brasil)', url: 'https://mises.org.br/artigos/2771/sindicatosbadernasgrevesnossetorespublicoeprivadoecoercoes/' },
  { titulo: 'O que a história pode nos ensinar sobre greves e sindicatos (Instituto Liberal)', url: 'https://www.institutoliberal.org.br/blog/o-que-a-historia-pode-nos-ensinar-sobre-greves-e-sindicatos/' }
]);

export const GLOSSARIO = Object.freeze([
  ['Adesão', 'Parte dos trabalhadores de um setor que de fato parou. No simulador, multiplica o impacto.'],
  ['ADI', 'Ação Direta de Inconstitucionalidade: ação no STF que pede para declarar uma lei contrária à Constituição. A ADI 5794 confirmou o fim da contribuição sindical obrigatória.'],
  ['ADPF', 'Arguição de Descumprimento de Preceito Fundamental: ação no STF contra atos do poder público ou de particulares que violem a Constituição. A ADPF 519 tratou dos bloqueios de rodovias.'],
  ['Arrecadação', 'Total de tributos recebido por União, estados e municípios. Em 2024, cerca de 32,3% do PIB.'],
  ['Boicote', 'Decisão voluntária de deixar de comprar de uma empresa ou setor. É livre manifestação de pensamento, desde que sem mentira, ameaça ou impedimento físico.'],
  ['Carga tributária', 'Tudo o que se paga de tributos dividido pelo PIB.'],
  ['Cascata (efeito)', 'Quanto a parada de um setor arrasta os demais. Uma cascata de 4 significa que cada real parado no setor derruba quatro reais na economia.'],
  ['CIDE', 'Contribuição de Intervenção no Domínio Econômico. No caso dos combustíveis, tributo federal cobrado por litro.'],
  ['Contribuição assistencial', 'Valor fixado em acordo ou convenção coletiva para custear o sindicato. O STF admite a cobrança de não filiados, mas garante o direito de oposição (Tema 935).'],
  ['Contribuição sindical', 'O antigo "imposto sindical", um dia de salário por ano. Deixou de ser obrigatória com a Reforma Trabalhista de 2017.'],
  ['Greve abusiva', 'Greve que descumpre a Lei 7.783/1989 ou continua depois de acordo ou decisão da Justiça. Libera desconto dos dias, demissão e contratação de substitutos.'],
  ['ICMS', 'Imposto estadual sobre circulação de mercadorias e alguns serviços. É o maior tributo sobre consumo no Brasil.'],
  ['Interdito proibitório', 'Ação para proteger a posse antes de uma ameaça. Na greve, garante a entrada de quem quer trabalhar (Súmula Vinculante 23).'],
  ['IPCA', 'Índice oficial de inflação, calculado pelo IBGE.'],
  ['IPI', 'Imposto federal sobre produtos industrializados.'],
  ['ISS', 'Imposto municipal sobre serviços.'],
  ['Lei de Liberdade Econômica', 'Lei 13.874/2019. Garante, entre outros pontos, exercer atividade de baixo risco sem licença prévia e definir preços livremente.'],
  ['Libertarianismo', 'Corrente que defende a liberdade individual e a propriedade, com Estado mínimo ou nenhum. Aceita toda associação voluntária e rejeita a compulsória.'],
  ['Liberalismo econômico', 'Defesa do livre mercado, da propriedade privada e de um Estado limitado, que garante contratos e regras gerais.'],
  ['Ótica da renda', 'Forma de medir o PIB pela soma das rendas: salários, lucros e rendimentos de autônomos, e impostos sobre a produção.'],
  ['PIB', 'Produto Interno Bruto: valor de tudo o que o país produz no ano. Em 2024, R$ 11,7 trilhões.'],
  ['PIS/COFINS', 'Contribuições federais sobre o faturamento das empresas, embutidas no preço.'],
  ['Princípio da não agressão', 'Ideia central do libertarianismo: ninguém pode iniciar o uso da força ou da ameaça contra a pessoa ou a propriedade de outro.'],
  ['Repercussão geral (Tema)', 'Mecanismo do STF que fixa uma tese aplicada a todos os casos iguais. Exemplos: Tema 531 (desconto dos dias de servidores) e Tema 541 (greve na segurança pública).'],
  ['Serviços essenciais', 'Atividades listadas no art. 10 da Lei de Greve, como água, energia, hospitais e transporte coletivo. Exigem aviso de 72 horas e atendimento mínimo.'],
  ['Soberania do consumidor', 'Ideia de que, num mercado livre, quem decide o que é produzido é o consumidor, com o próprio dinheiro.'],
  ['STF', 'Supremo Tribunal Federal, guarda da Constituição.'],
  ['Subvenção', 'Pagamento do governo para baixar um preço. Em 2018, R$ 0,30 por litro de diesel.'],
  ['Súmula vinculante', 'Entendimento do STF que todos os juízes e a administração pública são obrigados a seguir.'],
  ['TST', 'Tribunal Superior do Trabalho, última instância da Justiça do Trabalho. Julga greves de alcance nacional.']
]);
