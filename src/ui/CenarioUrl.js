/**
 * Camada de UI: CenarioUrl
 * Guarda o cenário do simulador no endereço da página (depois do #), para quem receber o link
 * abrir com os mesmos valores. Ex.: index.html#tipo=transporte&setor=carga&adesao=80&dias=11
 * Os links antigos, só com a aba (#greves, #direitos), continuam valendo.
 * Valores fora dos limites são ignorados.
 */

/** Campo do cenário → [chave no link, mínimo, máximo] */
const NUMEROS = Object.freeze({
  dias: ['dias', 1, 365],
  participantes: ['participantes', 1000, 100000000],
  retencaoDiaria: ['gasto', 1, 1000],
  taxRatio: ['tributo', 5, 60],
  adiadoPct: ['adiado', 0, 100],
  adesaoPct: ['adesao', 1, 100],
  recuperacaoPct: ['recuperacao', 0, 100],
  servidores: ['servidores', 10, 5000000],
  remuneracaoMensal: ['remuneracao', 1000, 100000],
  atendimentosDia: ['atendimentos', 1, 50]
});
const ABAS = ['simulador', 'greves', 'direitos'];
const TIPOS = ['consumo', 'transporte', 'geral', 'categoria', 'publico'];
const TEXTOS = ['setor', 'orgao'];
const TAMANHO_MAXIMO_TEXTO = 40;

/** Só aceita número decimal simples: Number() deixaria passar '', '1e3' e '0x10' */
function lerNumero(bruto, min, max) {
  const texto = String(bruto).trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(texto)) return undefined;
  const v = Number(texto);
  return v >= min && v <= max ? v : undefined;
}

/** Deixa só o formato dos ids; 'constructor' sairia como setor válido em SETORES[id] */
function sanitizar(bruto) {
  const texto = String(bruto).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, TAMANHO_MAXIMO_TEXTO);
  return texto && !(texto in Object.prototype) ? texto : undefined;
}

export class CenarioUrl {
  /**
   * Lê o cenário de um endereço
   * @param {string} href
   * @returns {Object|null} Só os campos válidos; null se não houver nenhum
   */
  static ler(href) {
    const hash = String(href || '').split('#')[1];
    if (!hash) return null;
    if (ABAS.includes(hash)) return { aba: hash };

    const params = new URLSearchParams(hash);
    const cenario = {};
    if (ABAS.includes(params.get('aba'))) cenario.aba = params.get('aba');
    if (TIPOS.includes(params.get('tipo'))) cenario.tipo = params.get('tipo');
    for (const campo of TEXTOS) {
      const texto = params.has(campo) ? sanitizar(params.get(campo)) : undefined;
      if (texto !== undefined) cenario[campo] = texto;
    }
    for (const [campo, [chave, min, max]] of Object.entries(NUMEROS)) {
      const v = params.has(chave) ? lerNumero(params.get(chave), min, max) : undefined;
      if (v !== undefined) cenario[campo] = v;
    }
    if (['0', '1'].includes(params.get('cascata'))) cenario.cascata = params.get('cascata') === '1';
    return Object.keys(cenario).length ? cenario : null;
  }

  /**
   * Monta o endereço com o cenário, trocando o # que já houver
   * @param {string} href Endereço atual
   * @param {Object} cenario Mesmos campos devolvidos por ler(); os inválidos ficam de fora
   * @returns {string}
   */
  static montar(href, cenario) {
    const dados = cenario || {};
    const params = new URLSearchParams();
    if (ABAS.includes(dados.aba)) params.set('aba', dados.aba);
    if (TIPOS.includes(dados.tipo)) params.set('tipo', dados.tipo);
    for (const campo of TEXTOS) {
      const texto = dados[campo] == null ? undefined : sanitizar(dados[campo]);
      if (texto !== undefined) params.set(campo, texto);
    }
    for (const [campo, [chave, min, max]] of Object.entries(NUMEROS)) {
      const v = dados[campo] == null ? undefined : lerNumero(dados[campo], min, max);
      if (v !== undefined) params.set(chave, String(Number(v.toFixed(2))));
    }
    if (typeof dados.cascata === 'boolean') params.set('cascata', dados.cascata ? '1' : '0');

    const base = String(href || '').split('#')[0];
    const hash = params.toString();
    return hash ? `${base}#${hash}` : base;
  }
}
