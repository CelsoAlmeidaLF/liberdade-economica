import { CivicPressureModel } from '../domain/CivicPressureModel.js';
import { SETORES } from '../domain/SetorConsumo.js';
import { TIPOS_GREVE, ORGAOS_PUBLICOS, setoresDoTipo } from '../domain/TiposGreve.js';
import { ARRECADACAO_REFERENCIA, OTICA_RENDA, posicaoNaEscala } from '../domain/ArrecadacaoReferencia.js';
import { GREVE_CAMINHONEIROS_2018, IPCA_2018, ORIGEM_CUSTO, obterGreve, ordenarGreves, custoPorDia, compararComGreve, listarReferencias } from '../domain/CasosReais.js';
import { DIREITOS, AVISO_DIREITOS } from '../domain/DireitosGreve.js';
import { SvgIcons } from './SvgIcons.js';

const brl = CivicPressureModel.formatBRL;
const pct = (v, casas = 2) => `${Number(v).toFixed(casas).replace('.', ',')}%`;

// Cada controle deslizante altera um campo do estado
const SLIDERS = {
  cInputParticipants: 'participantes',
  cInputSpend: 'retencaoDiaria',
  cInputDays: 'dias',
  cInputTax: 'taxRatio',
  cInputAdiado: 'adiadoPct',
  cInputAdesao: 'adesaoPct',
  cInputAdesaoPub: 'adesaoPct',
  cInputRecuperacao: 'recuperacaoPct',
  cInputServidores: 'servidores',
  cInputRemuneracao: 'remuneracaoMensal',
  cInputAtendimentos: 'atendimentosDia'
};

const CONQUISTOU = { sim: 'Sim', parcial: 'Em parte', nao: 'Não' };

/**
 * Camada de UI: CivicView
 * Gerenciamento de elementos do DOM, bindings e renderização reativa do app Liberdade Econômica.
 */
export class CivicView {
  constructor({ service, chartAdapter }) {
    this.service = service;
    this.chartAdapter = chartAdapter;
    this.casoSelecionado = GREVE_CAMINHONEIROS_2018.id;
    this.ordemCasos = 'data';

    this._bindElements();
    this._attachEventListeners();
    this._renderPrecos();
    this._renderListaCasos();
    this._renderReferencias();
    this._renderDireitos();
    this._configurarAbas();
  }

  /**
   * Aba Direitos e limites: um cartão por tema, com pode / exige / não pode / consequência e fontes
   */
  _renderDireitos() {
    this._texto('lblAvisoDireitos', AVISO_DIREITOS);
    const indice = this.$('direitosIndice');
    if (indice) {
      indice.replaceChildren(...DIREITOS.map(d => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-preset';
        btn.textContent = d.titulo;
        btn.addEventListener('click', () => this.$(`direito-${d.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        return btn;
      }));
    }

    const lista = this.$('direitosLista');
    if (!lista) return;
    const bloco = (classe, titulo, itens) => {
      if (!itens.length) return null;
      const div = document.createElement('div');
      div.className = `direito-bloco ${classe}`;
      const h = document.createElement('h5');
      h.textContent = titulo;
      const ul = document.createElement('ul');
      itens.forEach(texto => {
        const li = document.createElement('li');
        li.textContent = texto;
        ul.appendChild(li);
      });
      div.append(h, ul);
      return div;
    };

    lista.replaceChildren(...DIREITOS.map(d => {
      const card = document.createElement('section');
      card.className = 'glass-panel direito-card';
      card.id = `direito-${d.id}`;

      const topo = document.createElement('div');
      topo.className = 'direito-topo';
      const icone = document.createElement('span');
      icone.className = 'direito-icone';
      icone.innerHTML = SvgIcons[d.icone] || '';
      const titulos = document.createElement('div');
      const h = document.createElement('h3');
      h.textContent = d.titulo;
      const lei = document.createElement('small');
      lei.textContent = d.lei;
      titulos.append(h, lei);
      topo.append(icone, titulos);

      const resumo = document.createElement('p');
      resumo.className = 'direito-resumo';
      resumo.textContent = d.resumo;

      const grade = document.createElement('div');
      grade.className = 'direito-grade';
      [bloco('pode', 'Pode', d.pode), bloco('exige', 'A lei exige', d.exige), bloco('nao-pode', 'Não pode', d.naoPode)]
        .filter(Boolean).forEach(b => grade.appendChild(b));

      const consequencia = document.createElement('p');
      consequencia.className = 'caso-resultado direito-consequencia';
      const rotulo = document.createElement('strong');
      rotulo.textContent = 'Consequência: ';
      consequencia.append(rotulo, d.consequencia);

      const fontes = document.createElement('ul');
      fontes.className = 'caso-fontes';
      this._fontes(fontes, d.fontes);

      card.append(topo, resumo, grade, consequencia, fontes);
      return card;
    }));
  }

  /**
   * Rodapé da aba de greves: lista numerada de todas as fontes, por grupo
   */
  _renderReferencias() {
    const alvo = this.$('listaReferencias');
    if (!alvo) return;
    let n = 0;
    alvo.replaceChildren(...listarReferencias().map(({ grupo, itens }) => {
      const bloco = document.createElement('div');
      bloco.className = 'referencias-grupo';
      const h = document.createElement('h4');
      h.textContent = grupo;
      const ol = document.createElement('ol');
      ol.start = n + 1;
      itens.forEach(f => {
        n++;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = f.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = f.titulo;
        li.appendChild(a);
        if (f.contexto) {
          const ctx = document.createElement('small');
          ctx.textContent = f.contexto;
          li.appendChild(ctx);
        }
        const dominio = document.createElement('small');
        dominio.className = 'referencia-dominio';
        dominio.textContent = new URL(f.url).hostname.replace(/^www\./, '');
        li.appendChild(dominio);
        ol.appendChild(li);
      });
      bloco.append(h, ol);
      return bloco;
    }));
  }

  /**
   * Abas Simulador / Greves reais. O endereço guarda a aba (#greves) para o link abrir nela.
   */
  _configurarAbas() {
    this.abas = [...document.querySelectorAll('[role="tab"][data-aba]')];
    if (this.abas.length === 0) return;

    this.abas.forEach((aba, i) => {
      aba.addEventListener('click', () => this.abrirAba(aba.dataset.aba, true));
      aba.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const proxima = this.abas[(i + (e.key === 'ArrowRight' ? 1 : this.abas.length - 1)) % this.abas.length];
        this.abrirAba(proxima.dataset.aba, true);
        proxima.focus();
      });
    });

    window.addEventListener('hashchange', () => this.abrirAba(this._abaDoEndereco(), false));
    this.abrirAba(this._abaDoEndereco(), false);
  }

  _abaDoEndereco() {
    const nome = location.hash.slice(1);
    return this.abas.some(a => a.dataset.aba === nome) ? nome : 'simulador';
  }

  abrirAba(nome, atualizarEndereco) {
    if (!this.abas) return;
    this.abas.forEach(aba => {
      const ativa = aba.dataset.aba === nome;
      aba.setAttribute('aria-selected', String(ativa));
      aba.tabIndex = ativa ? 0 : -1;
      const painel = document.getElementById(aba.getAttribute('aria-controls'));
      if (painel) painel.hidden = !ativa;
    });
    if (atualizarEndereco) {
      history.replaceState(null, '', nome === 'simulador' ? location.pathname + location.search : `#${nome}`);
      // Como num app: a aba nova abre do começo
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    // Gráficos criados em painel escondido ficam sem tamanho: recalcula ao mostrar
    requestAnimationFrame(() => this.chartAdapter.resizeAll());
  }

  _bindElements() {
    const $ = id => document.getElementById(id);
    this.$ = $;

    // Header & Badges
    this.btnSyncIbge = $('btnSyncIbge');
    this.iconSync = $('iconSync');
    this.ibgeStatusBadge = $('ibgeStatusBadge');
    this.lblLastSyncTime = $('lblLastSyncTime');
    this.lblPopBase = $('lblPopBase');

    // Controles deslizantes
    this.sliders = {};
    Object.keys(SLIDERS).forEach(id => { this.sliders[id] = $(id); });
    this.cInputCascata = $('cInputCascata');

    // Grupos por tipo de greve
    this.grupoConsumo = $('grupoConsumo');
    this.grupoProducao = $('grupoProducao');
    this.grupoPublico = $('grupoPublico');
    this.grupoSetorProducao = $('grupoSetorProducao');

    // Chips
    this.tipoChips = $('tipoChips');
    this.setorChips = $('setorChips');
    this.setorProducaoChips = $('setorProducaoChips');
    this.orgaoChips = $('orgaoChips');
    this.casosChips = $('casosChips');

    // Toast
    this.toastNotification = $('toastNotification');
    this.toastMessage = $('toastMessage');
  }

  _criarChips(container, itens, aoClicar) {
    if (!container) return;
    container.replaceChildren(...itens.map(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-preset';
      btn.dataset.id = item.id;
      btn.textContent = item.nome;
      btn.addEventListener('click', () => aoClicar(item.id));
      return btn;
    }));
  }

  _marcarChips(container, idAtivo) {
    if (!container) return;
    container.querySelectorAll('[data-id]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.id === idAtivo));
    });
  }

  _attachEventListeners() {
    if (this.btnSyncIbge) {
      this.btnSyncIbge.addEventListener('click', () => this.handleSyncIbge());
    }

    Object.entries(this.sliders).forEach(([id, el]) => {
      if (!el) return;
      el.addEventListener('input', () => this.service.updateParams({ [SLIDERS[id]]: parseFloat(el.value) }));
    });

    if (this.cInputCascata) {
      this.cInputCascata.addEventListener('change', () => this.service.updateParams({ usarCascata: this.cInputCascata.checked }));
    }

    this._criarChips(this.tipoChips, Object.values(TIPOS_GREVE), id => {
      const tipo = this.service.selecionarTipo(id);
      this.triggerToast(`${tipo.titulo} selecionada.`);
    });
    this._criarChips(this.setorChips, Object.values(SETORES), id => {
      const setor = this.service.selecionarSetor(id);
      this.triggerToast(`Setor: ${setor.nome} · ${setor.taxRatio.toFixed(1).replace('.', ',')}% de imposto, ${setor.adiadoPct}% só adiado.`);
    });
    this._criarChips(this.orgaoChips, Object.values(ORGAOS_PUBLICOS), id => {
      const orgao = this.service.selecionarOrgao(id);
      this.triggerToast(`Órgão: ${orgao.nome}.`);
    });

    document.querySelectorAll('[data-civic-preset]').forEach(btn => {
      btn.addEventListener('click', e => {
        const p = Number(e.currentTarget.getAttribute('data-preset-p'));
        const s = Number(e.currentTarget.getAttribute('data-preset-s'));
        const d = Number(e.currentTarget.getAttribute('data-preset-d'));
        this.service.updateParams({ participantes: p, retencaoDiaria: s, dias: d });
        this.triggerToast(`Cenário: ${p.toLocaleString('pt-BR')} cidadãos, R$ ${s}/dia, ${d} dias.`);
      });
    });

    document.querySelectorAll('[data-action="export-csv"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.service.exportCsv();
        this.triggerToast('Planilha CSV gerada e transferida com sucesso!');
      });
    });

    document.querySelectorAll('[data-action="share-whatsapp"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = this.service.generateExecutiveReport();
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      });
    });

    document.querySelectorAll('[data-ordem]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.ordemCasos = btn.dataset.ordem;
        document.querySelectorAll('[data-ordem]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        this._renderListaCasos();
      });
    });

    this.service.subscribe(() => {
      this.render();
    });
  }

  async handleSyncIbge() {
    if (this.btnSyncIbge) this.btnSyncIbge.disabled = true;
    if (this.iconSync) this.iconSync.classList.add('icon-spin');

    if (this.ibgeStatusBadge) {
      this.ibgeStatusBadge.className = 'badge-status syncing';
      this.ibgeStatusBadge.innerHTML = '<span class="badge-pulse"></span> Sincronizando IBGE...';
    }

    try {
      const res = await this.service.syncPopulacao();
      if (this.ibgeStatusBadge) {
        this.ibgeStatusBadge.className = `badge-status ${res ? 'active' : 'idle'}`;
        this.ibgeStatusBadge.innerHTML = `<span class="badge-pulse"></span> ${res ? 'IBGE ao vivo' : 'IBGE indisponível · referência'}`;
      }
      this.triggerToast(res ? 'População oficial atualizada via webservice IBGE!' : 'IBGE indisponível. Mantida a estimativa de referência (2026).');
    } catch {
      this.triggerToast('Conexão ao IBGE protegida via fallback local.');
    } finally {
      if (this.btnSyncIbge) this.btnSyncIbge.disabled = false;
      if (this.iconSync) this.iconSync.classList.remove('icon-spin');
    }
  }

  triggerToast(message) {
    if (!this.toastNotification || !this.toastMessage) return;
    this.toastMessage.textContent = message;
    this.toastNotification.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this.toastNotification.classList.remove('show');
    }, 3400);
  }

  _texto(id, valor) {
    const el = this.$(id);
    if (el) el.textContent = valor;
  }

  _mostrar(id, visivel) {
    const el = this.$(id);
    if (el) el.hidden = !visivel;
  }

  _kpi(n, label, valor, sub) {
    this._texto(`kpi${n}Label`, label);
    this._texto(`kpi${n}Valor`, valor);
    this._texto(`kpi${n}Sub`, sub);
  }

  _fontes(lista, fontes) {
    if (!lista) return;
    lista.replaceChildren(...fontes.map(f => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = f.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = SvgIcons.externalLink;
      a.append(f.titulo);
      li.appendChild(a);
      return li;
    }));
  }

  render() {
    const sim = this.service.calculateSimulation();
    const s = sim.state;

    // Controles refletem o estado (setores e órgãos mudam valores ao serem escolhidos)
    Object.entries(this.sliders).forEach(([id, el]) => {
      if (el && document.activeElement !== el) el.value = s[SLIDERS[id]];
    });
    if (this.cInputCascata) this.cInputCascata.checked = s.usarCascata;

    // Tipo de greve e grupos de controles
    this._marcarChips(this.tipoChips, sim.tipo.id);
    this._texto('cValTipo', sim.tipo.titulo);
    this._texto('lblTipoDesc', sim.tipo.desc);
    this._texto('cValDays', `${s.dias} dia${s.dias > 1 ? 's' : ''}`);
    if (this.grupoConsumo) this.grupoConsumo.hidden = sim.modo !== 'consumo';
    if (this.grupoProducao) this.grupoProducao.hidden = sim.modo !== 'producao';
    if (this.grupoPublico) this.grupoPublico.hidden = sim.modo !== 'publico';

    this._mostrar('painelArrecadacao', sim.modo !== 'publico');
    this._mostrar('painelChenoweth', sim.modo === 'consumo');
    this._mostrar('painelPublico', sim.modo === 'publico');
    this._mostrar('secDecomposicao', sim.modo === 'consumo');

    if (this.lblLastSyncTime) this.lblLastSyncTime.textContent = s.lastSync || 'Referência 2026';
    if (this.lblPopBase) this.lblPopBase.textContent = s.populacao.toLocaleString('pt-BR');

    if (sim.modo === 'consumo') this._renderConsumo(sim);
    else if (sim.modo === 'producao') this._renderProducao(sim);
    else this._renderPublico(sim);

    if (sim.modo !== 'publico') this._renderArrecadacao(sim.resumo);
    this._renderDivisao(sim.divisao);
    this._renderCasoSelecionado(sim);

    this.chartAdapter.updateEvolutionChart(sim.resumo.timeline);
  }

  _renderConsumo(sim) {
    const s = sim.state;
    const c = sim.civic;
    const sec = sim.sector;

    this._texto('cValParticipants', s.participantes.toLocaleString('pt-BR'));
    this._texto('cValSpend', `R$ ${s.retencaoDiaria.toFixed(2).replace('.', ',')}`);
    this._texto('cValTax', pct(s.taxRatio));
    this._texto('cValAdiado', `${s.adiadoPct}%`);
    this._texto('cValSetor', sim.setor.nome);
    this._texto('lblSetorNota', sim.setor.nota);
    this._marcarChips(this.setorChips, sim.setor.id);

    this._kpi(1, 'Imposto Perdido', brl(c.drenagemDefinitiva), `de vez · ${pct(c.pctArrecadacao)} da arrecadação`);
    this._kpi(2, 'Imposto Atrasado', brl(c.drenagemTributaria), `no período · ${brl(c.drenagemAdiada)} volta depois`);
    this._kpi(3, 'Gasto Evitado', brl(c.faturamentoRetido), `no período · ${brl(c.faturamentoPerdido)} perdido de vez`);
    this._kpi(4, 'Poupança', brl(c.poupancaRetida), 'fica com as famílias');

    // Referência dos 3,5%
    this._texto('cResChenowethPct', `${pct(c.pctPopulacao)} da População`);
    const barra = this.$('cBarChenoweth');
    if (barra) barra.style.width = `${c.progressoMetaChenoweth}%`;
    this._texto('cResChenowethStatus', c.statusChenoweth);
    this._texto('cResChenowethDesc', c.statusDesc);
    this._texto('lblChenowethGoal', `${c.chenowethGoal.toLocaleString('pt-BR')} pessoas`);

    // Decomposição federativa
    this._texto('valIcms', brl(sec.tributos.icms));
    this._texto('valPisCofins', brl(sec.tributos.pisCofins));
    this._texto('valIpi', brl(sec.tributos.ipi));
    this._texto('valIss', brl(sec.tributos.iss));
    this._texto('pctIcms', `${sec.percentuais.icms}%`);
    this._texto('pctPisCofins', `${sec.percentuais.pisCofins}%`);
    this._texto('pctIpi', `${sec.percentuais.ipi}%`);
    this._texto('pctIss', `${sec.percentuais.iss}%`);
    this._texto('valTotalDrenado', brl(sec.total));
    this.chartAdapter.updateBreakdownChart(sec);

    this._texto('lblChartTitulo', 'Impacto Acumulado do Boicote');
    this.chartAdapter.setEvolutionLabels('Gasto que deixou de circular', 'Imposto que não entrou');
  }

  _renderProducao(sim) {
    const s = sim.state;
    const p = sim.producao;
    const setor = sim.setorProducao;

    // Greve geral tem um setor só: esconde a escolha
    const setores = setoresDoTipo(sim.tipo.id);
    if (this.grupoSetorProducao) this.grupoSetorProducao.hidden = setores.length < 2;
    if (this.setorProducaoChips && this.setorProducaoChips.dataset.tipo !== sim.tipo.id) {
      this.setorProducaoChips.dataset.tipo = sim.tipo.id;
      this._criarChips(this.setorProducaoChips, setores, id => {
        const escolhido = this.service.selecionarSetorProducao(id);
        this.triggerToast(`${escolhido.nome}: ${String(escolhido.pesoPib).replace('.', ',')}% do PIB.`);
      });
    }
    this._marcarChips(this.setorProducaoChips, setor.id);
    this._texto('cValSetorProducao', setor.nome);
    this._texto('lblSetorProducaoNota', setor.nota);
    this._texto('cValAdesao', `${s.adesaoPct}%`);
    this._texto('cValRecuperacao', `${s.recuperacaoPct}%`);
    const semCascata = setor.cascata <= 1;
    if (this.cInputCascata) this.cInputCascata.disabled = semCascata;
    this._texto('lblCascata', semCascata
      ? 'Não se aplica: a greve geral já conta a economia inteira'
      : `Outros setores param junto (× ${setor.cascata.toFixed(2).replace('.', ',')})`);

    this._kpi(1, 'Perda na Economia', brl(p.perdaDefinitiva), `${pct(p.pctPib, 3)} do PIB anual`);
    this._kpi(2, 'Perda por Dia', brl(p.perdaDiaria), s.recuperacaoPct > 0 ? `antes de recuperar ${s.recuperacaoPct}% depois` : 'nada é recuperado depois');
    this._kpi(3, 'Efeito Cascata', brl(p.perdaCascata), `direto no setor: ${brl(p.perdaDireta)}`);
    this._kpi(4, 'Impostos Perdidos', brl(p.impostoPerdido), `${pct(sim.resumo.pctArrecadacao)} da arrecadação`);

    this._texto('lblChartTitulo', 'Perda Acumulada na Economia');
    this.chartAdapter.setEvolutionLabels('Produção perdida', 'Impostos perdidos');
  }

  _renderPublico(sim) {
    const s = sim.state;
    const pb = sim.publico;
    const orgao = sim.orgao;

    this._marcarChips(this.orgaoChips, orgao.id);
    this._texto('cValOrgao', orgao.nome);
    this._texto('lblOrgaoNota', orgao.nota);
    this._texto('cValServidores', s.servidores.toLocaleString('pt-BR'));
    this._texto('cValAdesaoPub', `${s.adesaoPct}%`);
    this._texto('cValRemuneracao', `R$ ${s.remuneracaoMensal.toLocaleString('pt-BR')}`);
    this._texto('cValAtendimentos', String(s.atendimentosDia));

    this._kpi(1, 'Serviço Não Prestado', brl(pb.servicoNaoPrestado), 'valor medido pelo salário');
    this._kpi(2, 'Por Dia', brl(pb.perdaDiaria), `${pb.servidoresParados.toLocaleString('pt-BR')} servidores parados`);
    this._kpi(3, orgao.unidade.charAt(0).toUpperCase() + orgao.unidade.slice(1), pb.atendimentosPerdidos.toLocaleString('pt-BR'), 'que deixaram de acontecer');
    this._kpi(4, 'Para Zerar a Fila', `${pb.diasParaZerarFila} dias`, `com ${pb.capacidadeExtraPct}% de atendimento extra`);

    this._texto('cResFila', `${pb.atendimentosPerdidos.toLocaleString('pt-BR')} ${orgao.unidade}`);
    this._texto('cResFilaDesc', `Depois de ${s.dias} dias parados, mesmo atendendo ${pb.capacidadeExtraPct}% acima do normal, o órgão leva cerca de ${pb.diasParaZerarFila} dias para voltar ao normal. Quem precisava do serviço espera esse tempo.`);

    this._texto('lblChartTitulo', 'Serviço Não Prestado Acumulado');
    this.chartAdapter.setEvolutionLabels('Serviço não prestado', null);
  }

  _renderArrecadacao(r) {
    const pctArrec = pct(r.pctArrecadacao);
    this._texto('cResArrecPct', `${pctArrec} da arrecadação`);
    const barra = this.$('cBarArrec');
    if (barra) barra.style.width = `${posicaoNaEscala(r.pctArrecadacao)}%`;
    this._texto('cResFaseTitulo', r.faseFiscal.titulo);
    this._texto('cResFaseDesc', r.faseFiscal.desc);
    this._texto('lblArrecRef', `Arrecadação no período: ${brl(r.arrecadacaoPeriodo)} (${ARRECADACAO_REFERENCIA.fonte}). Fases do simulador, não uma regra científica.`);
  }

  _renderDivisao(divisao) {
    const partes = [
      { id: 'empresas', nome: 'Empresas', cor: 'var(--warn)', desc: 'produção e faturamento perdidos' },
      { id: 'trabalhadores', nome: 'Trabalhadores', cor: 'var(--info)', desc: 'salários e dias descontados' },
      { id: 'governo', nome: 'Governo', cor: 'var(--down)', desc: 'impostos que não entram' },
      { id: 'consumidores', nome: 'Consumidores', cor: 'var(--accent)', desc: '' }
    ];
    const v = divisao.valores;
    const barra = this.$('divisaoBarra');
    if (barra) {
      barra.replaceChildren(...partes.filter(p => divisao.pct[p.id] > 0).map(p => {
        const seg = document.createElement('span');
        seg.style.width = `${divisao.pct[p.id]}%`;
        seg.style.background = p.cor;
        seg.title = `${p.nome}: ${pct(divisao.pct[p.id], 1)}`;
        return seg;
      }));
    }
    const lista = this.$('divisaoLista');
    if (lista) {
      lista.replaceChildren(...partes.map(p => {
        const linha = document.createElement('div');
        linha.className = 'divisao-item';
        const valor = v[p.id];
        let texto;
        let desc = p.desc;
        if (p.id === 'consumidores') {
          if (valor < 0) { texto = `+${brl(-valor)}`; desc = 'guardam o dinheiro que não gastaram'; }
          else if (valor > 0) { texto = brl(valor); desc = 'ficam sem o serviço'; }
          else { texto = 'Preços'; desc = 'podem subir com a falta de produtos (veja 2018)'; }
        } else {
          texto = valor > 0 ? brl(valor) : '—';
        }
        const cor = document.createElement('i');
        cor.style.background = p.cor;
        const nome = document.createElement('span');
        nome.className = 'divisao-nome';
        nome.textContent = p.nome;
        const sub = document.createElement('small');
        sub.textContent = desc + (divisao.pct[p.id] > 0 ? ` · ${pct(divisao.pct[p.id], 1)}` : '');
        nome.appendChild(sub);
        const num = document.createElement('strong');
        num.textContent = texto;
        linha.append(cor, nome, num);
        return linha;
      }));
    }
    this._texto('lblDivisaoNota', `${divisao.nota} Base: ${OTICA_RENDA.fonte} (trabalhadores ${pct(OTICA_RENDA.trabalhadores, 1)}, empresas ${pct(OTICA_RENDA.empresas, 1)}, governo ${pct(OTICA_RENDA.governo, 1)}).`);
  }

  _renderPrecos() {
    const ip = IPCA_2018;
    this._texto('lblPrecosResumo', 'Inflação mensal (IPCA) de 2018. A greve dos caminhoneiros foi no fim de maio; em junho, a inflação teve a maior alta para o mês desde 1995.');
    this._texto('lblPrecosLeitura', `Junho de 2018: IPCA de ${pct(ip.valores[ip.mesPico])}, contra ${pct(ip.valores[ip.mesGreve])} em maio. Cerca de ${String(ip.atribuidoGreve).replace('.', ',')} ponto percentual foi atribuído diretamente à greve, e a comida em casa subiu ${pct(ip.alimentosJunho)} no mês. Os preços voltaram a cair em julho e agosto, quando o abastecimento normalizou.`);
    this._fontes(this.$('listaPrecosFontes'), ip.fontes);
  }

  _renderListaCasos() {
    const lista = ordenarGreves(this.ordemCasos);
    this._criarChips(this.casosChips, lista.map(g => ({ id: g.id, nome: g.titulo })), id => {
      this.casoSelecionado = id;
      this._renderCasoSelecionado(this.service.calculateSimulation());
    });
    this._marcarChips(this.casosChips, this.casoSelecionado);

    // Tabela de comparação
    const corpo = this.$('tabelaGreves');
    if (corpo) {
      corpo.replaceChildren(...lista.map(g => {
        const tr = document.createElement('tr');
        tr.tabIndex = 0;
        tr.dataset.id = g.id;
        const cpd = custoPorDia(g);
        const celulas = [
          ['Greve', g.titulo, ''],
          ['Dias', String(g.dias), 'text-center'],
          ['Custo', g.custoEconomia ? brl(g.custoEconomia) : '—', 'text-right'],
          ['Custo / dia', cpd ? brl(cpd) : '—', 'text-right'],
          ['Origem do número', g.custoNota || ORIGEM_CUSTO[g.origemCusto], ''],
          ['Conquistou?', CONQUISTOU[g.conquistou] || '—', `conquista-${g.conquistou}`]
        ];
        celulas.forEach(([rotulo, texto, classe]) => {
          const td = document.createElement('td');
          td.dataset.label = rotulo;
          if (classe) td.className = classe;
          td.textContent = texto;
          tr.appendChild(td);
        });
        const escolher = () => {
          this.casoSelecionado = g.id;
          this._renderCasoSelecionado(this.service.calculateSimulation());
          this.$('casoDetalhe')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
        tr.addEventListener('click', escolher);
        tr.addEventListener('keydown', e => { if (e.key === 'Enter') escolher(); });
        return tr;
      }));
    }

    // Linha do tempo: barra proporcional à duração
    const linha = this.$('linhaTempo');
    if (linha) {
      const maxDias = Math.max(...lista.map(g => g.dias));
      linha.replaceChildren(...lista.map(g => {
        const li = document.createElement('li');
        li.className = `tempo-item tempo-${g.tipo}`;
        const ano = document.createElement('span');
        ano.className = 'tempo-ano';
        ano.textContent = g.inicio.slice(0, 4);
        const corpoItem = document.createElement('div');
        corpoItem.className = 'tempo-corpo';
        const titulo = document.createElement('strong');
        titulo.textContent = g.titulo;
        const barra = document.createElement('span');
        barra.className = 'tempo-barra';
        barra.style.width = `${Math.max(4, (g.dias / maxDias) * 100)}%`;
        const info = document.createElement('small');
        info.textContent = `${g.dias} dia${g.dias > 1 ? 's' : ''} · ${TIPOS_GREVE[g.tipo]?.titulo || ''}${g.custoEconomia ? ` · ${brl(g.custoEconomia)}` : ''}`;
        corpoItem.append(titulo, barra, info);
        li.append(ano, corpoItem);
        li.addEventListener('click', () => {
          this.casoSelecionado = g.id;
          this._renderCasoSelecionado(this.service.calculateSimulation());
          this.$('casoDetalhe')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        return li;
      }));
    }
  }

  _renderCasoSelecionado(sim) {
    const g = obterGreve(this.casoSelecionado);
    this._marcarChips(this.casosChips, g.id);
    this.$('tabelaGreves')?.querySelectorAll('tr').forEach(tr => tr.classList.toggle('selecionada', tr.dataset.id === g.id));

    this._texto('casoTitulo', g.titulo);
    this._texto('casoPeriodo', `${g.periodo} · ${g.dias} dia${g.dias > 1 ? 's' : ''}`);
    this._texto('casoResumo', `${g.resumo} Participantes: ${g.participantes}.`);
    this._texto('casoResultado', g.resultado);

    const cpd = custoPorDia(g);
    const kpis = [
      { label: 'Custo', cor: 'text-down', valor: g.custoEconomia ? brl(g.custoEconomia) : 'Sem estimativa', sub: g.custoEconomia ? (g.custoNota || ORIGEM_CUSTO[g.origemCusto]) : 'não há número consolidado' },
      { label: 'Custo por Dia', cor: 'text-warn', valor: cpd ? brl(cpd) : '—', sub: `${g.dias} dia${g.dias > 1 ? 's' : ''} de greve` },
      ...(g.destaques || []).map(d => ({ label: d.label, cor: 'text-info', valor: d.valor, sub: d.sub }))
    ];

    const perda = sim.resumo.perdaEconomia;
    let comparacao;
    if (g.custoEconomia) {
      const cmp = compararComGreve(perda, sim.state.dias, g);
      kpis.push({ label: 'Sua Simulação', cor: 'text-accent', valor: pct(cmp.pctDoCusto, 1), sub: `do custo · ${brl(perda)} simulado` });
      comparacao = cmp.diasParaIgualar
        ? `No ritmo simulado (${sim.tipo.titulo.toLowerCase()}), a perda por dia equivale a ${pct(cmp.ritmoRelativoPct, 1)} da perda diária desta greve. Seriam necessários ${cmp.diasParaIgualar.toLocaleString('pt-BR')} dias para igualá-la. Comparação aproximada.`
        : 'A simulação atual não gera perda definitiva para comparar.';
    } else {
      comparacao = 'Sem estimativa de custo consolidada para esta greve, não dá para comparar com a simulação.';
    }

    const grade = this.$('casoKpis');
    if (grade) {
      grade.replaceChildren(...kpis.map(k => {
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.padding = '1rem';
        const l = document.createElement('span');
        l.className = `kpi-label ${k.cor}`;
        l.textContent = k.label;
        const v = document.createElement('div');
        v.className = 'kpi-value';
        v.textContent = k.valor;
        const sb = document.createElement('span');
        sb.className = 'kpi-sub';
        sb.textContent = k.sub;
        card.append(l, v, sb);
        return card;
      }));
    }
    this._texto('casoComparacao', comparacao);
    this._fontes(this.$('casoFontes'), g.fontes);
  }
}
