/**
 * STK-GOVERNO-BRAZIL — painel de configurações comum (tema, dados neste aparelho, sobre o app).
 * Fonte canônica: 8. STK-GOVERNO-BRAZIL/_design-system/stk-gov-config.js
 * Cada projeto recebe uma cópia em vendor/stk-gov/ (node _design-system/sync.mjs): não edite a cópia.
 *
 * Abre pelo botão de engrenagem que o próprio painel põe no topo (.topbar-actions-wrap).
 * Cada app acrescenta seções próprias com `secoes`. Nada sai do aparelho.
 */

const SVG = inner => `<span class="stk-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg></span>`;
const ICONE_ENGRENAGEM = SVG('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>');
const ICONE_FECHAR = SVG('<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>');
const ICONE_LIXEIRA = SVG('<path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M10 11v6"></path><path d="M14 11v6"></path>');
const ICONE_ATUALIZAR = SVG('<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path>');

const ROTULOS_COMUNS = Object.freeze({ tema: 'Tema escolhido', 'sidebar.recolhida': 'Menu lateral recolhido' });
const ESPERA_CONFIRMACAO_MS = 6000;

const MENSAGENS_ATUALIZACAO = Object.freeze({
  atualizado: 'Versão nova instalada. Recarregando…',
  'em-dia': 'O app já está na versão mais recente.',
  'sem-rede': 'Sem conexão: não foi possível procurar atualização.',
  indisponivel: 'A atualização automática não está ativa neste navegador.'
});

/** Armazenamento do navegador, ou null se estiver bloqueado */
function armazenamentoPadrao() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

/**
 * O que este app guardou no aparelho. Os apps publicados dividem a mesma origem
 * (celsoalmeidalf.github.io), por isso só contam as chaves com o prefixo do app.
 * @param {Storage|null} storage
 * @param {string} app
 * @param {Object<string, string>} [rotulos] Chave sem o prefixo → nome para a pessoa
 * @returns {{chave: string, rotulo: string, bytes: number}[]}
 */
export function dadosDoApp(storage, app, rotulos = {}) {
  if (!storage) return [];
  const prefixo = `${app}.`;
  const nomes = { ...ROTULOS_COMUNS, ...rotulos };
  const itens = [];
  for (let i = 0; i < storage.length; i++) {
    const chave = storage.key(i);
    if (!chave || !chave.startsWith(prefixo)) continue;
    const curta = chave.slice(prefixo.length);
    // localStorage guarda texto em UTF-16: 2 bytes por caractere
    itens.push({ chave, rotulo: nomes[curta] || curta, bytes: (chave.length + (storage.getItem(chave) || '').length) * 2 });
  }
  return itens.sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
}

/**
 * Apaga só o que é deste app
 * @returns {number} Quantos itens saíram
 */
export function apagarDadosDoApp(storage, app) {
  const itens = dadosDoApp(storage, app);
  itens.forEach(item => storage.removeItem(item.chave));
  return itens.length;
}

/** @param {number} bytes */
export function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`;
}

/** Versão carimbada por scripts/versionar.mjs no endereço deste módulo; null se não houver */
export function versaoDoEndereco(endereco) {
  const bruta = new URL(endereco).searchParams.get('v');
  const partes = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})$/.exec(bruta || '');
  if (!partes) return bruta;
  const [, ano, mes, dia, hora, minuto] = partes;
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

/** @param {string} hex #RRGGBB @param {number} alfa */
function comAlfa(hex, alfa) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
}

/** Cores dos gráficos no tema atual: o canvas não lê variáveis CSS sozinho */
export function coresDoTema(doc = document) {
  const estilo = getComputedStyle(doc.documentElement);
  const token = nome => estilo.getPropertyValue(`--chart-${nome}`).trim();
  return {
    texto: token('text'), eixo: token('axis'), grade: token('grid'), gradeSuave: token('grid-soft'), superficie: token('surface'), sobreBarra: token('on-bar'),
    verde: token('green'), verdeHover: token('green-hover'), amarelo: token('yellow'), vermelho: token('red'),
    rosa: token('rose'), azul: token('blue'), roxo: token('purple'), cinza: token('gray'),
    alfa: comAlfa
  };
}

/**
 * Grupo de opções exclusivas (botões de rádio com cara de controle segmentado)
 * @param {Object} opcoes
 * @param {string} opcoes.nome Atributo name
 * @param {string} opcoes.legenda
 * @param {{valor: string, rotulo: string}[]} opcoes.itens
 * @param {string} opcoes.selecionado
 * @param {(valor: string) => void} opcoes.aoMudar
 * @param {Document} [opcoes.doc]
 */
export function grupoDeOpcoes({ nome, legenda, itens, selecionado, aoMudar, doc = document }) {
  const grupo = doc.createElement('fieldset');
  grupo.className = 'stk-config-grupo';
  const titulo = doc.createElement('legend');
  titulo.textContent = legenda;
  const opcoes = doc.createElement('div');
  opcoes.className = 'stk-config-opcoes';
  for (const { valor, rotulo } of itens) {
    const opcao = doc.createElement('label');
    opcao.className = 'stk-config-opcao';
    const entrada = doc.createElement('input');
    entrada.type = 'radio';
    entrada.name = nome;
    entrada.value = valor;
    entrada.checked = valor === selecionado;
    entrada.addEventListener('change', () => aoMudar(valor));
    const texto = doc.createElement('span');
    texto.textContent = rotulo;
    opcao.append(entrada, texto);
    opcoes.append(opcao);
  }
  grupo.append(titulo, opcoes);
  return grupo;
}

export class StkGovConfig {
  /**
   * @param {Object} opcoes
   * @param {string} opcoes.app Mesmo nome dado ao StkGovShell: prefixo das chaves salvas
   * @param {string} opcoes.nome Nome do app para a pessoa
   * @param {import('./stk-gov-pwa.js').StkGovPwa} [opcoes.pwa] Liga o botão "Procurar atualização"
   * @param {Object<string, string>} [opcoes.rotulosDados] Chave sem o prefixo → nome para a pessoa
   * @param {() => string} [opcoes.dataDosDados] Texto da referência dos dados, na seção Sobre
   * @param {{titulo: string, montar: (corpo: HTMLElement) => void}[]} [opcoes.secoes] Seções do app, depois de Aparência
   * @param {Storage|null} [opcoes.storage]
   * @param {Document} [opcoes.doc]
   */
  constructor({ app, nome, pwa = null, rotulosDados = {}, dataDosDados = null, secoes = [], storage = armazenamentoPadrao(), doc = document }) {
    this.app = app;
    this.nome = nome;
    this.pwa = pwa;
    this.rotulosDados = rotulosDados;
    this.dataDosDados = dataDosDados;
    this.secoes = secoes;
    this.storage = storage;
    this.doc = doc;
    this.dialogo = null;
    this.esperaConfirmacao = null;
    this.valorDados = null;
  }

  iniciar() {
    const doc = this.doc;
    this.dialogo = doc.createElement('dialog');
    this.dialogo.className = 'stk-config';
    this.dialogo.id = 'stkConfig';
    this.dialogo.setAttribute('aria-labelledby', 'stkConfigTitulo');

    const topo = doc.createElement('div');
    topo.className = 'stk-config-topo';
    topo.innerHTML = `<h2 id="stkConfigTitulo">Configurações</h2><button type="button" class="stk-config-fechar" aria-label="Fechar configurações">${ICONE_FECHAR}</button>`;
    topo.querySelector('button').addEventListener('click', () => this.fechar());
    this.dialogo.append(topo);

    this._secao('Aparência', corpo => corpo.append(grupoDeOpcoes({
      nome: 'stkTema',
      legenda: 'Tema',
      itens: [{ valor: 'escuro', rotulo: 'Escuro' }, { valor: 'claro', rotulo: 'Claro' }, { valor: 'sistema', rotulo: 'Do sistema' }],
      selecionado: globalThis.StkGovTema?.preferencia() || 'escuro',
      aoMudar: valor => globalThis.StkGovTema?.definir(valor),
      doc
    })));
    this.secoes.forEach(({ titulo, montar }) => this._secao(titulo, montar));
    this._secao('Dados neste aparelho', corpo => this._montarDados(corpo));
    this._secao('Sobre', corpo => this._montarSobre(corpo));

    // Clique no fundo escurecido: o alvo é o próprio <dialog>, fora do conteúdo das seções
    this.dialogo.addEventListener('click', e => { if (e.target === this.dialogo) this.fechar(); });
    this.dialogo.addEventListener('close', () => this._cancelarConfirmacao());
    doc.body.append(this.dialogo);

    const botao = doc.createElement('button');
    botao.type = 'button';
    botao.id = 'btnConfig';
    botao.className = 'action-btn action-btn-secondary';
    botao.title = 'Configurações';
    botao.setAttribute('aria-label', 'Configurações');
    botao.setAttribute('aria-haspopup', 'dialog');
    botao.innerHTML = ICONE_ENGRENAGEM;
    botao.addEventListener('click', () => this.abrir());
    doc.querySelector('.topbar-actions-wrap')?.append(botao);
  }

  abrir() {
    this._listarDados();
    if (this.valorDados) this.valorDados.textContent = this.dataDosDados();
    this.dialogo.showModal();
  }

  fechar() {
    this.dialogo.close();
  }

  _secao(titulo, montar) {
    const secao = this.doc.createElement('section');
    secao.className = 'stk-config-secao';
    const cabecalho = this.doc.createElement('h3');
    cabecalho.textContent = titulo;
    secao.append(cabecalho);
    montar(secao);
    this.dialogo.append(secao);
  }

  _montarDados(corpo) {
    const doc = this.doc;
    const texto = doc.createElement('p');
    texto.className = 'stk-config-texto';
    texto.textContent = 'Fica só neste navegador. Nada é enviado para fora do aparelho.';
    this.listaDados = doc.createElement('ul');
    this.listaDados.className = 'stk-config-lista';
    this.btnApagar = doc.createElement('button');
    this.btnApagar.type = 'button';
    this.btnApagar.className = 'stk-config-botao perigo';
    this.btnApagar.addEventListener('click', () => this._aoClicarApagar());
    corpo.append(texto, this.listaDados, this.btnApagar);
    this._rotuloApagar('Apagar dados deste app');
  }

  _rotuloApagar(texto) {
    this.btnApagar.innerHTML = ICONE_LIXEIRA;
    this.btnApagar.append(texto);
  }

  _listarDados() {
    const itens = dadosDoApp(this.storage, this.app, this.rotulosDados);
    this.listaDados.replaceChildren(...itens.map(({ rotulo, bytes }) => {
      const linha = this.doc.createElement('li');
      const nome = this.doc.createElement('span');
      nome.textContent = rotulo;
      const tamanho = this.doc.createElement('span');
      tamanho.textContent = formatarTamanho(bytes);
      linha.append(nome, tamanho);
      return linha;
    }));
    if (!itens.length) {
      const vazio = this.doc.createElement('li');
      vazio.textContent = 'Nenhum dado guardado.';
      this.listaDados.append(vazio);
    }
    this.btnApagar.disabled = !itens.length;
  }

  /** Primeiro clique pede confirmação; o segundo apaga e recarrega, para o app voltar ao padrão */
  _aoClicarApagar() {
    if (this.esperaConfirmacao === null) {
      this.btnApagar.classList.add('confirmando');
      this._rotuloApagar('Confirmar: apagar tudo');
      this.esperaConfirmacao = setTimeout(() => this._cancelarConfirmacao(), ESPERA_CONFIRMACAO_MS);
      return;
    }
    this._cancelarConfirmacao();
    apagarDadosDoApp(this.storage, this.app);
    this.doc.defaultView.location.reload();
  }

  _cancelarConfirmacao() {
    if (this.esperaConfirmacao === null) return;
    clearTimeout(this.esperaConfirmacao);
    this.esperaConfirmacao = null;
    this.btnApagar.classList.remove('confirmando');
    this._rotuloApagar('Apagar dados deste app');
  }

  _montarSobre(corpo) {
    const doc = this.doc;
    const lista = doc.createElement('ul');
    lista.className = 'stk-config-lista';
    const linhas = [['App', this.nome], ['Versão', versaoDoEndereco(import.meta.url) || 'não informada']];
    if (this.dataDosDados) linhas.push(['Dados', '']);
    for (const [rotulo, valor] of linhas) {
      const linha = doc.createElement('li');
      const nome = doc.createElement('span');
      nome.textContent = rotulo;
      const conteudo = doc.createElement('span');
      conteudo.textContent = valor;
      linha.append(nome, conteudo);
      lista.append(linha);
      if (rotulo === 'Dados') this.valorDados = conteudo; // preenchido a cada abertura: a consulta pode ter acabado de terminar
    }
    corpo.append(lista);
    if (!this.pwa) return;

    const botao = doc.createElement('button');
    botao.type = 'button';
    botao.className = 'stk-config-botao';
    botao.innerHTML = ICONE_ATUALIZAR;
    botao.append('Procurar atualização');
    const status = doc.createElement('p');
    status.className = 'stk-config-status';
    status.setAttribute('role', 'status');
    botao.addEventListener('click', async () => {
      botao.disabled = true;
      status.textContent = 'Procurando…';
      const resultado = await this.pwa.procurarAtualizacao();
      status.textContent = MENSAGENS_ATUALIZACAO[resultado];
      botao.disabled = false;
      if (resultado === 'atualizado') doc.defaultView.location.reload();
    });
    corpo.append(botao, status);
  }
}
