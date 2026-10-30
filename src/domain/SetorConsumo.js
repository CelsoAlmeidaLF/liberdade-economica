/**
 * Camada de Domínio: SetorConsumo
 * Catálogo de setores que o boicote pode atingir, cada um com a parcela de tributos
 * embutida no preço, a parte do gasto que costuma ser só adiada e a partilha entre tributos.
 *
 * Valores estimados a partir da legislação vigente em 2026 (antes da troca pelo IBS/CBS)
 * e de estudos de carga tributária por produto. Servem de ponto de partida: o usuário
 * ajusta tributo e gasto adiado nos controles.
 */
export const SETORES = Object.freeze({
  geral: {
    id: 'geral',
    nome: 'Consumo em geral',
    taxRatio: 21.8,
    adiadoPct: 40,
    partilha: { icms: 58, pisCofins: 28, ipi: 8, iss: 6 },
    nota: 'Média do consumo das famílias: tributos sobre bens e serviços (13,91% do PIB, Tesouro 2024) ÷ consumo das famílias (~63,8% do PIB, IBGE).'
  },
  combustiveis: {
    id: 'combustiveis',
    nome: 'Combustíveis',
    taxRatio: 37.0,
    adiadoPct: 60,
    partilha: { icms: 62, pisCofins: 38, ipi: 0, iss: 0 },
    nota: 'Gasolina: ICMS fixo por litro, PIS/COFINS e CIDE (somada a PIS/COFINS) ficam em torno de um terço do preço. Boa parte das viagens só é adiada.'
  },
  energia: {
    id: 'energia',
    nome: 'Energia elétrica',
    taxRatio: 28.0,
    adiadoPct: 10,
    partilha: { icms: 75, pisCofins: 25, ipi: 0, iss: 0 },
    nota: 'ICMS (17% a 20% conforme o estado) e PIS/COFINS na conta de luz. Energia economizada não volta a ser consumida depois.'
  },
  bebidas: {
    id: 'bebidas',
    nome: 'Bebidas alcoólicas',
    taxRatio: 45.0,
    adiadoPct: 20,
    partilha: { icms: 50, pisCofins: 25, ipi: 25, iss: 0 },
    nota: 'Cerveja e destilados têm ICMS e IPI acima da média. Pouco do consumo evitado volta depois.'
  },
  eletronicos: {
    id: 'eletronicos',
    nome: 'Eletrônicos e eletrodomésticos',
    taxRatio: 40.0,
    adiadoPct: 80,
    partilha: { icms: 50, pisCofins: 25, ipi: 25, iss: 0 },
    nota: 'ICMS, IPI e PIS/COFINS pesam no preço, mas a compra costuma ser só adiada: a pessoa ainda precisa da geladeira ou do celular.'
  },
  alimentos: {
    id: 'alimentos',
    nome: 'Alimentos',
    taxRatio: 17.0,
    adiadoPct: 90,
    partilha: { icms: 85, pisCofins: 15, ipi: 0, iss: 0 },
    nota: 'A cesta básica tem PIS/COFINS zerado e ICMS reduzido. Quase tudo é comprado depois: ninguém deixa de comer.'
  },
  lazer: {
    id: 'lazer',
    nome: 'Lazer, bares e restaurantes',
    taxRatio: 30.0,
    adiadoPct: 20,
    partilha: { icms: 45, pisCofins: 30, ipi: 0, iss: 25 },
    nota: 'Mistura ICMS (refeições e bebidas) e ISS (serviços). O passeio que não aconteceu raramente é compensado.'
  }
});

export const SETOR_PADRAO = 'geral';

export function obterSetor(id) {
  return SETORES[id] || SETORES[SETOR_PADRAO];
}
