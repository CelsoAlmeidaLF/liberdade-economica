/**
 * Camada de Domínio: DivisaoCusto
 * Quem paga a conta de uma greve: empresas, trabalhadores, governo e consumidores.
 */
import { OTICA_RENDA } from './ArrecadacaoReferencia.js?v=20261104-1639';

export class DivisaoCusto {
  /**
   * Greve que para a produção: o valor perdido se divide como o PIB pela ótica da renda
   */
  static producao(perdaDefinitiva) {
    const perda = Math.max(0, Number(perdaDefinitiva));
    return montar({
      empresas: perda * OTICA_RENDA.empresas / 100,
      trabalhadores: perda * OTICA_RENDA.trabalhadores / 100,
      governo: perda * OTICA_RENDA.governo / 100,
      consumidores: 0
    }, 'Produção perdida dividida como o PIB pela ótica da renda. Preços mais altos para o consumidor não entram na conta; veja o efeito nos preços.');
  }

  /**
   * Greve de consumo: o governo perde o imposto; o resto do faturamento se divide entre
   * empresas e trabalhadores na proporção da ótica da renda; o consumidor guarda o dinheiro
   */
  static consumo(faturamentoPerdido, impostoDefinitivo) {
    const fat = Math.max(0, Number(faturamentoPerdido));
    const imposto = Math.min(fat, Math.max(0, Number(impostoDefinitivo)));
    const resto = fat - imposto;
    const base = OTICA_RENDA.empresas + OTICA_RENDA.trabalhadores;
    return montar({
      empresas: resto * OTICA_RENDA.empresas / base,
      trabalhadores: resto * OTICA_RENDA.trabalhadores / base,
      governo: imposto,
      // Negativo: o consumidor não perde, guarda o dinheiro que não gastou
      consumidores: -fat
    }, 'O faturamento perdido sai do bolso de empresas, trabalhadores (via salários) e governo (via imposto). O consumidor fica com o dinheiro.');
  }

  /**
   * Greve do setor público: a população perde o serviço; o salário pode ser descontado
   */
  static publico(servicoNaoPrestado) {
    const valor = Math.max(0, Number(servicoNaoPrestado));
    return montar({
      empresas: 0,
      trabalhadores: 0,
      governo: 0,
      consumidores: valor
    }, 'A população fica sem o serviço (valor medido pelo salário, como nas Contas Nacionais). Se os dias forem descontados, o servidor perde o mesmo valor; se forem pagos, o governo paga sem receber o serviço.');
  }
}

function montar(partes, nota) {
  const positivos = Object.values(partes).filter(v => v > 0).reduce((a, b) => a + b, 0);
  const pct = {};
  for (const [k, v] of Object.entries(partes)) {
    pct[k] = positivos > 0 && v > 0 ? Number(((v / positivos) * 100).toFixed(1)) : 0;
  }
  return { valores: partes, pct, nota };
}
