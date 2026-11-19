/**
 * Camada de Domínio: ArrecadacaoReferencia
 * Arrecadação anual de União, estados e municípios, usada para medir o peso do boicote.
 */
// Valores de referência do módulo comum de parâmetros (carga_tributaria_bruta_gg e pib_nominal_anual, ADR-001).
// O serviço lê os parâmetros e passa os números aos modelos; estes servem de padrão dos modelos e o teste confere que são iguais.
const CARGA_TRIBUTARIA_2024_PCT = 32.22; // Tesouro Nacional, Boletim CTB 2025 (revisão de abr/2026); a prévia de mar/2025 dizia 32,32
const PIB_2024 = 11.779251e12;           // IBGE, Contas Nacionais Anuais, SIDRA 6784 (R$ 11.779.251 milhões)

export const ARRECADACAO_REFERENCIA = Object.freeze({
  anual: PIB_2024 * CARGA_TRIBUTARIA_2024_PCT / 100,
  fonte: 'Carga tributária bruta 2024 (32,22% do PIB, Tesouro Nacional) × PIB 2024 (R$ 11,78 tri, IBGE)'
});

export const PIB_REFERENCIA = Object.freeze({
  anual: PIB_2024,
  fonte: 'PIB de 2024 (R$ 11,78 tri, IBGE)'
});

/**
 * Para onde vai cada real do PIB (ótica da renda, Contas Nacionais do IBGE, 2021)
 */
export const OTICA_RENDA = Object.freeze({
  trabalhadores: 39.2, // remuneração dos empregados (salários + contribuições)
  empresas: 45.3,      // excedente operacional bruto + rendimento misto (lucro e autônomos)
  governo: 15.5,       // impostos sobre produção e importação, líquidos de subsídios
  fonte: 'PIB pela ótica da renda, 2021 (Contas Nacionais, IBGE)'
});

/**
 * Faixas do simulador pela parte da arrecadação do período perdida de vez.
 * São referências de leitura, não uma regra científica.
 */
export const FASES_FISCAIS = Object.freeze([
  {
    limite: 0.25,
    fase: 1,
    titulo: 'Fase 1: Sinal simbólico',
    desc: 'Perda pequena demais para aparecer nos números de arrecadação. O efeito é de mensagem.'
  },
  {
    limite: 1,
    fase: 2,
    titulo: 'Fase 2: Pressão perceptível',
    desc: 'A queda aparece nos boletins mensais de arrecadação da Receita Federal e das secretarias de Fazenda.'
  },
  {
    limite: 3,
    fase: 3,
    titulo: 'Fase 3: Pressão forte',
    desc: 'Perda grande o bastante para obrigar governos a rever previsões e bloquear gastos.'
  },
  {
    limite: Infinity,
    fase: 4,
    titulo: 'Fase 4: Choque fiscal',
    desc: 'Queda de arrecadação do porte de uma recessão, mantida por toda a duração da paralisação.'
  }
]);

export function classificarFase(pctArrecadacao) {
  return FASES_FISCAIS.find(f => pctArrecadacao < f.limite);
}

/**
 * Posição na barra (0 a 100): cada fase ocupa um quarto, e o último vai de 3% a 6%
 */
export function posicaoNaEscala(pctArrecadacao) {
  const marcos = [0, 0.25, 1, 3, 6];
  const v = Math.max(0, Number(pctArrecadacao));
  for (let i = 1; i < marcos.length; i++) {
    if (v < marcos[i]) {
      return ((i - 1) + (v - marcos[i - 1]) / (marcos[i] - marcos[i - 1])) * 25;
    }
  }
  return 100;
}
