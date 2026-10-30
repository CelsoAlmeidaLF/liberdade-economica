/**
 * Camada de Domínio: TiposGreve
 * Tipos de greve simulados e os setores de produção que cada um pode parar.
 *
 * pesoPib: participação estimada do setor no valor adicionado (%).
 * cascata: quanto a parada do setor arrasta o resto da economia (1 = não arrasta).
 * recuperacaoPct: parte da produção recuperada depois (hora extra, estoque, serviço atrasado).
 *
 * Os pesos são aproximações das Contas Nacionais (IBGE). As cascatas são estimativas,
 * exceto a do transporte de carga, calibrada para reproduzir a greve de 2018.
 */
export const TIPOS_GREVE = Object.freeze({
  consumo: {
    id: 'consumo',
    nome: 'Consumo',
    titulo: 'Greve de consumo',
    desc: 'As pessoas deixam de comprar. O impacto vem do faturamento e do imposto que deixam de existir.'
  },
  transporte: {
    id: 'transporte',
    nome: 'Transporte',
    titulo: 'Greve de transporte',
    desc: 'Mercadorias e pessoas param de circular. O efeito se espalha para quem depende da entrega ou do deslocamento.'
  },
  geral: {
    id: 'geral',
    nome: 'Geral',
    titulo: 'Greve geral',
    desc: 'Trabalhadores de vários setores param ao mesmo tempo. O impacto sai do PIB por dia multiplicado pela adesão.'
  },
  categoria: {
    id: 'categoria',
    nome: 'Categoria',
    titulo: 'Greve de uma categoria',
    desc: 'Um setor para. O impacto depende do peso dele no PIB e de quanto os outros setores dependem dele.'
  },
  publico: {
    id: 'publico',
    nome: 'Setor público',
    titulo: 'Greve do setor público',
    desc: 'Servidores param. Mede o valor do serviço que a população deixou de receber e a fila que se acumula.'
  }
});

// Cascata do transporte de carga: perda de 0,2% do PIB em 11 dias com 80% de adesão (greve de 2018)
// 0,002 = (11 / 365) × 0,02 × 0,80 × cascata  →  cascata ≈ 4,15
const CASCATA_CARGA_2018 = 0.002 / ((11 / 365) * 0.02 * 0.8);

export const SETORES_PRODUCAO = Object.freeze({
  carga: {
    id: 'carga',
    tipo: 'transporte',
    nome: 'Caminhoneiros (carga)',
    pesoPib: 2.0,
    cascata: Number(CASCATA_CARGA_2018.toFixed(2)),
    recuperacaoPct: 0,
    adesaoPct: 80,
    nota: 'Cerca de 2% do PIB, mas quase tudo depende do caminhão. A cascata foi calibrada para reproduzir a greve de 2018 (0,2% do PIB em 11 dias).'
  },
  urbano: {
    id: 'urbano',
    tipo: 'transporte',
    nome: 'Metrô e ônibus',
    pesoPib: 0.8,
    cascata: 2.0,
    recuperacaoPct: 20,
    adesaoPct: 70,
    nota: 'O transporte urbano pesa pouco no PIB, mas sem ele parte dos trabalhadores não chega ao emprego. Cascata estimada.'
  },
  geral: {
    id: 'geral',
    tipo: 'geral',
    nome: 'Toda a economia',
    pesoPib: 100,
    cascata: 1.0,
    recuperacaoPct: 20,
    adesaoPct: 20,
    nota: 'A adesão é a parte de todos os trabalhadores que parou. Sem cascata, porque a economia inteira já está na conta.'
  },
  petroleo: {
    id: 'petroleo',
    tipo: 'categoria',
    nome: 'Petroleiros',
    pesoPib: 2.5,
    cascata: 1.6,
    recuperacaoPct: 30,
    adesaoPct: 30,
    nota: 'Extração e refino. A Justiça costuma exigir que boa parte da equipe continue trabalhando (em 2020, 90%). Cascata estimada.'
  },
  bancos: {
    id: 'bancos',
    tipo: 'categoria',
    nome: 'Bancários',
    pesoPib: 7.0,
    cascata: 1.1,
    recuperacaoPct: 80,
    adesaoPct: 40,
    nota: 'O setor financeiro pesa muito no PIB, mas aplicativos e caixas eletrônicos seguem funcionando e quase tudo é feito depois.'
  },
  correios: {
    id: 'correios',
    tipo: 'categoria',
    nome: 'Correios',
    pesoPib: 0.15,
    cascata: 1.8,
    recuperacaoPct: 50,
    adesaoPct: 60,
    nota: 'Peso pequeno no PIB, mas o comércio eletrônico e as pequenas empresas dependem das entregas. Cascata estimada.'
  },
  portos: {
    id: 'portos',
    tipo: 'categoria',
    nome: 'Portuários',
    pesoPib: 0.5,
    cascata: 3.0,
    recuperacaoPct: 40,
    adesaoPct: 60,
    nota: 'Quase todo o comércio exterior passa pelos portos: exportação parada e insumos importados que não chegam. Cascata estimada.'
  }
});

/**
 * Setor público: valores de exemplo, ajustáveis nos controles
 */
export const ORGAOS_PUBLICOS = Object.freeze({
  educacao: {
    id: 'educacao',
    nome: 'Universidades e institutos',
    servidores: 100000,
    remuneracaoMensal: 9000,
    atendimentosDia: 20,
    unidade: 'aulas-aluno',
    nota: 'Valores de exemplo. "Atendimentos" aqui são aulas por aluno que deixam de acontecer e precisam ser repostas no calendário.'
  },
  inss: {
    id: 'inss',
    nome: 'INSS',
    servidores: 15000,
    remuneracaoMensal: 10000,
    atendimentosDia: 8,
    unidade: 'pedidos',
    nota: 'Valores de exemplo. Cada dia parado aumenta a fila de pedidos de aposentadoria, perícia e benefícios.'
  },
  saude: {
    id: 'saude',
    nome: 'Saúde pública',
    servidores: 50000,
    remuneracaoMensal: 7000,
    atendimentosDia: 12,
    unidade: 'consultas',
    nota: 'Valores de exemplo. Serviços de urgência devem continuar por lei; o que para são consultas e exames agendados.'
  },
  professores: {
    id: 'professores',
    nome: 'Professores estaduais',
    servidores: 80000,
    remuneracaoMensal: 5500,
    atendimentosDia: 25,
    unidade: 'aulas-aluno',
    nota: 'Valores de exemplo para uma rede estadual. As aulas precisam ser repostas, o que estica o ano letivo.'
  }
});

export const TIPO_PADRAO = 'consumo';

export function obterTipo(id) {
  return TIPOS_GREVE[id] || TIPOS_GREVE[TIPO_PADRAO];
}

export function setoresDoTipo(tipo) {
  return Object.values(SETORES_PRODUCAO).filter(s => s.tipo === tipo);
}

export function obterSetorProducao(id, tipo) {
  const setor = SETORES_PRODUCAO[id];
  if (setor && (!tipo || setor.tipo === tipo)) return setor;
  return setoresDoTipo(tipo)[0] || SETORES_PRODUCAO.carga;
}

export function obterOrgao(id) {
  return ORGAOS_PUBLICOS[id] || ORGAOS_PUBLICOS.educacao;
}
