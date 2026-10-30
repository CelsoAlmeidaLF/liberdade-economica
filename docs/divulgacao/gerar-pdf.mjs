/**
 * Gera o PDF de divulgação do app Liberdade Econômica a partir dos dados de src/domain.
 * Uso: node docs/divulgacao/gerar-pdf.mjs
 * Duas passagens no Chrome headless: a primeira descobre a página de cada seção,
 * a segunda imprime o índice com os números certos.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { GREVE_CAMINHONEIROS_2018, IPCA_2018, REFERENCIAS_BASE, ORIGEM_CUSTO, ordenarGreves, custoPorDia } from '../../src/domain/CasosReais.js';
import { DIREITOS, AVISO_DIREITOS } from '../../src/domain/DireitosGreve.js';
import { TIPOS_GREVE, SETORES_PRODUCAO, ORGAOS_PUBLICOS } from '../../src/domain/TiposGreve.js';
import { SETORES } from '../../src/domain/SetorConsumo.js';
import { PIB_REFERENCIA, ARRECADACAO_REFERENCIA, OTICA_RENDA, FASES_FISCAIS } from '../../src/domain/ArrecadacaoReferencia.js';
import { SvgIcons } from '../../src/ui/SvgIcons.js';
import { IMPRENSA_GREVES, IMPRENSA_DIREITOS, IMPRENSA_GERAL, GLOSSARIO } from './conteudo.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const HTML = join(AQUI, 'liberdade-economica.html');
const PDF = join(AQUI, 'liberdade-economica.pdf');
const APP_URL = 'https://celsoalmeidalf.github.io/liberdade-economica-2026/';
const EDICAO = 'Outubro de 2026';
const LOGO = pathToFileURL(join(RAIZ, 'icons', 'icon-512.png')).href;

const esc = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const reais = v => {
  if (v >= 1e12) return `R$ ${num(v / 1e12, 2)} tri`;
  if (v >= 1e9) return `R$ ${num(v / 1e9, 2)} bi`;
  if (v >= 1e6) return `R$ ${num(v / 1e6, 0)} mi`;
  return `R$ ${num(v, 0)}`;
};
const icone = nome => (SvgIcons[nome] || '').replace('class="icon-svg"', 'class="ic"');
const fonteLink = f => `<a href="${esc(f.url)}">${esc(f.titulo)}</a>`;
const listaFontes = fontes => fontes.length ? `<ul class="fontes">${fontes.map(f => `<li>${fonteLink(f)}</li>`).join('')}</ul>` : '';
const CONQUISTA = { sim: 'Conquistou', parcial: 'Parcial', nao: 'Não conquistou' };
const SECOES = [
  ['apresentacao', '1. Apresentação'],
  ['metodo', '2. Como o app mede o custo de uma greve'],
  ['caso', '3. Caso central: caminhoneiros, 2018'],
  ['greves', '4. As greves'],
  ['direitos', '5. Os direitos e os limites'],
  ['glossario', '6. Glossário'],
  ['referencias', '7. Referências públicas']
];

// ── Capa ──
const capa = () => `
<section class="capa">
  <div class="capa-topo"><span class="mono">STK · GOVERNO BRASIL · 8.5</span></div>
  <div class="capa-meio">
    <img class="capa-logo" src="${LOGO}" alt="Ícone do app Liberdade Econômica">
    <p class="mono capa-kicker">Guia de divulgação</p>
    <h1>Liberdade<br>Econômica</h1>
    <p class="capa-sub">Quanto custa uma greve para o país, quem paga a conta e o que a lei brasileira permite, com a visão liberal e de direita.</p>
  </div>
  <div class="capa-numeros">
    <div><b class="mono">${ordenarGreves().length}</b><span>greves reais documentadas</span></div>
    <div><b class="mono">${DIREITOS.length}</b><span>temas de direitos e limites</span></div>
    <div><b class="mono">${num(GREVE_CAMINHONEIROS_2018.custoEconomiaPctPib, 1)}%</b><span>do PIB perdidos em 11 dias de 2018</span></div>
  </div>
  <div class="capa-rodape mono"><span>${EDICAO}</span><span>${esc(APP_URL)}</span></div>
</section>`;

// ── Índice ──
const indice = paginas => `
<section class="pagina indice">
  <h2 class="sem-numero">Índice</h2>
  <ol class="toc">
    ${SECOES.map(([id, t]) => `<li><a href="#${id}"><span>${esc(t)}</span><i></i><b class="mono">${paginas[id] ?? '00'}</b></a></li>`).join('')}
  </ol>
  <div class="nota">
    <strong>Como ler este guia.</strong> As seções 2 a 5 trazem os mesmos dados do app, com as fontes originais.
    Em cada tema de direitos, o bloco <em>Visão liberal e de direita</em> mostra a leitura liberal sempre apoiada em regra que já existe na lei brasileira.
    As referências da seção 7 priorizam jornais, revistas e institutos de linha liberal, conservadora e libertária.
  </div>
</section>`;

// ── 1. Apresentação ──
const apresentacao = () => `
<section class="pagina" id="apresentacao">
  <h2>${SECOES[0][1]}</h2>
  <p class="lead">Greve tem custo. Alguém deixa de produzir, alguém deixa de vender, alguém deixa de receber o serviço. O app <b>Liberdade Econômica</b> coloca números nesse custo e mostra quem paga a conta.</p>
  <p>O app simula cinco tipos de paralisação (consumo, transporte, geral, de uma categoria e do setor público), compara o resultado com greves reais documentadas e explica, tema por tema, o que a lei permite e o que ela proíbe.</p>
  <div class="grade-3">
    <div class="cartao">${icone('chartLine')}<h4>Simulador</h4><p>Custo em reais e em proporção do PIB, efeito cascata sobre outros setores, peso na arrecadação e divisão da conta.</p></div>
    <div class="cartao">${icone('target')}<h4>Greves reais</h4><p>Oito greves brasileiras de 1989 a 2024, com duração, custo quando existe, resultado e fontes.</p></div>
    <div class="cartao">${icone('scale')}<h4>Direitos e limites</h4><p>Lei de Greve, setor público, boicote e bloqueio de estradas, com a visão liberal e de direita.</p></div>
  </div>
  <h3>O ponto de vista</h3>
  <p>O guia parte de três ideias liberais, todas compatíveis com a legislação brasileira:</p>
  <ul class="pontos">
    <li><b>Liberdade de quem quer trabalhar.</b> A Lei de Greve já proíbe impedir o acesso ao trabalho ou ameaçar colegas (Lei 7.783/1989, art. 6º, § 3º).</li>
    <li><b>Responsabilidade pelo custo.</b> Quem para assume o risco: o contrato fica suspenso e os dias parados, em regra, não são pagos (art. 7º; STF, Tema 531).</li>
    <li><b>O mercado como resposta.</b> O boicote é escolha individual e voluntária; bloquear estrada transfere o custo a terceiros que não fazem parte da disputa.</li>
  </ul>
  <h3>Princípios do app</h3>
  <p>Funciona no navegador, sem cadastro e sem coleta de dados. Cada número tem fonte com link, e quando não há estimativa confiável o app diz isso em vez de inventar um valor.</p>
  <p class="mono pequeno">Acesse: <a href="${APP_URL}">${esc(APP_URL)}</a></p>
</section>`;

// ── 2. Método ──
const metodo = () => {
  const setores = Object.values(SETORES_PRODUCAO);
  const consumo = Object.values(SETORES);
  const orgaos = Object.values(ORGAOS_PUBLICOS);
  return `
<section class="pagina" id="metodo">
  <h2>${SECOES[1][1]}</h2>
  <h3>Os cinco tipos de greve</h3>
  <table class="tabela"><thead><tr><th>Tipo</th><th>O que acontece</th></tr></thead><tbody>
    ${Object.values(TIPOS_GREVE).map(t => `<tr><td><b>${esc(t.titulo)}</b></td><td>${esc(t.desc)}</td></tr>`).join('')}
  </tbody></table>
  <h3>A conta básica</h3>
  <div class="formula mono">PIB por dia (${reais(PIB_REFERENCIA.anual)} ÷ 365) × peso do setor × adesão × dias × cascata − produção recuperada depois</div>
  <p>A <b>cascata</b> mede quanto a parada de um setor arrasta os outros. A do transporte de carga foi calibrada pela greve de 2018: 0,2% do PIB em 11 dias com 80% de adesão dá um multiplicador de cerca de ${num(SETORES_PRODUCAO.carga.cascata, 2)}. As demais são estimativas ajustáveis no app.</p>
  <table class="tabela compacta"><thead><tr><th>Setor</th><th class="n">Peso no PIB</th><th class="n">Cascata</th><th class="n">Recupera</th><th class="n">Adesão padrão</th></tr></thead><tbody>
    ${setores.map(s => `<tr><td>${esc(s.nome)}</td><td class="n mono">${num(s.pesoPib, s.pesoPib < 1 ? 2 : 1)}%</td><td class="n mono">${num(s.cascata, 2)}</td><td class="n mono">${s.recuperacaoPct}%</td><td class="n mono">${s.adesaoPct}%</td></tr>`).join('')}
  </tbody></table>
  <ul class="notas-setor">${setores.map(s => `<li><b>${esc(s.nome)}:</b> ${esc(s.nota)}</li>`).join('')}</ul>

  <h3>Greve de consumo e imposto</h3>
  <p>Na greve de consumo, a perda vem do faturamento e do imposto embutido no preço. Parte do gasto é só adiada e volta depois.</p>
  <table class="tabela compacta"><thead><tr><th>Setor</th><th class="n">Imposto no preço</th><th class="n">Gasto só adiado</th></tr></thead><tbody>
    ${consumo.map(s => `<tr><td>${esc(s.nome)}</td><td class="n mono">${num(s.taxRatio, 1)}%</td><td class="n mono">${s.adiadoPct}%</td></tr>`).join('')}
  </tbody></table>

  <h3>Setor público</h3>
  <p>O governo mede o próprio serviço pelo custo: servidores parados × salário diário × dias. O app também mostra a fila de atendimentos que se acumula. Os valores abaixo são exemplos ajustáveis.</p>
  <table class="tabela compacta"><thead><tr><th>Órgão</th><th class="n">Servidores</th><th class="n">Salário mensal</th><th>Atendimento perdido</th></tr></thead><tbody>
    ${orgaos.map(o => `<tr><td>${esc(o.nome)}</td><td class="n mono">${num(o.servidores)}</td><td class="n mono">R$ ${num(o.remuneracaoMensal)}</td><td>${esc(o.unidade)}</td></tr>`).join('')}
  </tbody></table>

  <h3>Quem paga a conta</h3>
  <p>A produção perdida se divide como o PIB pela ótica da renda (IBGE, Contas Nacionais 2021):</p>
  <div class="barra-renda">
    <span style="flex:${OTICA_RENDA.empresas}" class="b-emp">Empresas ${num(OTICA_RENDA.empresas, 1)}%</span>
    <span style="flex:${OTICA_RENDA.trabalhadores}" class="b-trab">Trabalhadores ${num(OTICA_RENDA.trabalhadores, 1)}%</span>
    <span style="flex:${OTICA_RENDA.governo}" class="b-gov">Governo ${num(OTICA_RENDA.governo, 1)}%</span>
  </div>
  <p>Na greve de consumo, o governo perde o imposto e o consumidor guarda o dinheiro. No setor público, quem perde é a população, que fica sem o serviço.</p>

  <h3>Peso na arrecadação</h3>
  <p>Referência: arrecadação anual de ${reais(ARRECADACAO_REFERENCIA.anual)} (carga tributária de 32,3% do PIB em 2024). O app classifica a perda em quatro faixas de leitura:</p>
  <table class="tabela compacta"><tbody>
    ${FASES_FISCAIS.map((f, i) => `<tr><td class="mono">${i === 0 ? 'até' : ''} ${f.limite === Infinity ? `acima de ${num(FASES_FISCAIS[i - 1].limite, 0)}%` : `${num(f.limite, f.limite < 1 ? 2 : 0)}%`}</td><td><b>${esc(f.titulo)}</b><br>${esc(f.desc)}</td></tr>`).join('')}
  </tbody></table>
</section>`;
};

// ── 3. Caso central ──
const ipcaGrafico = () => {
  const { meses, valores, mesGreve, mesPico } = IPCA_2018;
  const w = 640, h = 236, base = 170, escala = 110, larg = w / meses.length;
  const barras = valores.map((v, i) => {
    const alt = Math.abs(v) * escala;
    const y = v >= 0 ? base - alt : base;
    const classe = i === mesPico ? 'pico' : i === mesGreve ? 'greve' : 'normal';
    return `<rect class="${classe}" x="${i * larg + 10}" y="${y}" width="${larg - 20}" height="${Math.max(alt, 1)}" rx="3"/>
      <text class="val" x="${i * larg + larg / 2}" y="${v >= 0 ? y - 6 : y + alt + 14}">${num(v, 2)}</text>
      <text class="mes" x="${i * larg + larg / 2}" y="${h - 4}">${meses[i]}</text>`;
  }).join('');
  return `<svg class="grafico" viewBox="0 0 ${w} ${h}" role="img" aria-label="IPCA mensal de 2018">
    <line x1="0" x2="${w}" y1="${base}" y2="${base}" class="eixo"/>${barras}</svg>`;
};

const caso = () => {
  const g = GREVE_CAMINHONEIROS_2018;
  return `
<section class="pagina" id="caso">
  <h2>${SECOES[2][1]}</h2>
  <p class="lead">${esc(g.resumo)}</p>
  <div class="kpis">
    <div><span>Duração</span><b class="mono">${g.dias} dias</b><small>${esc(g.periodo)}</small></div>
    <div><span>Custo para a economia</span><b class="mono">${reais(g.custoEconomia)}</b><small>${num(g.custoEconomiaPctPib, 1)}% do PIB · Ministério da Fazenda</small></div>
    ${g.destaques.map(d => `<div><span>${esc(d.label)}</span><b class="mono">${esc(d.valor)}</b><small>${esc(d.sub)}</small></div>`).join('')}
  </div>
  <p><b>Resultado:</b> ${esc(g.resultado)}</p>
  <div class="destaque-liberal"><h4>Leitura liberal</h4>
    <p>O acordo para encerrar a greve custou ${reais(g.custoAcordo)} ao Tesouro: ${reais(g.custoAcordoSubvencao)} de subsídio ao diesel e ${reais(g.custoAcordoTributos)} de tributos que deixaram de ser cobrados. Quem pagou foi o contribuinte, inclusive quem nunca dirigiu um caminhão. A tabela de frete mínimo criada no acordo é controle de preços, e um ano depois a renda dos caminhoneiros autônomos tinha caído, segundo a Gazeta do Povo.</p>
  </div>
  <h3>Efeito nos preços: IPCA mensal de 2018 (%)</h3>
  ${ipcaGrafico()}
  <p class="legenda"><span class="sw sw-greve"></span> maio, mês da greve (${num(IPCA_2018.valores[IPCA_2018.mesGreve], 2)}%) <span class="sw sw-pico"></span> junho, maior alta para o mês desde 1995 (${num(IPCA_2018.valores[IPCA_2018.mesPico], 2)}%)</p>
  <p>Cerca de ${num(IPCA_2018.atribuidoGreve, 2)} ponto percentual do IPCA de junho é atribuído à greve. A alimentação no domicílio subiu ${num(IPCA_2018.alimentosJunho, 2)}% no mês (Ipea): quem mais sentiu foi a família de baixa renda, que gasta maior parte do orçamento com comida.</p>
  <h4>Fontes do caso</h4>
  ${listaFontes([...g.fontes, ...IPCA_2018.fontes])}
  ${imprensa(IMPRENSA_GREVES[g.id])}
</section>`;
};

const imprensa = itens => itens?.length ? `<div class="imprensa"><h5>Na imprensa liberal e de direita</h5>${listaFontes(itens)}</div>` : '';

// ── 4. Greves ──
const greves = () => {
  const lista = ordenarGreves('data');
  return `
<section class="pagina" id="greves">
  <h2>${SECOES[3][1]}</h2>
  <p>Oito greves brasileiras com impacto documentado, da mais antiga à mais recente. Quando não há estimativa consolidada de custo, o guia diz isso.</p>
  <table class="tabela compacta"><thead><tr><th>Greve</th><th class="n">Dias</th><th class="n">Custo</th><th>Origem do número</th><th>Resultado</th></tr></thead><tbody>
    ${lista.map(g => `<tr><td>${esc(g.titulo)}</td><td class="n mono">${g.dias}</td><td class="n mono">${g.custoEconomia ? reais(g.custoEconomia) : '—'}</td><td>${esc(ORIGEM_CUSTO[g.origemCusto])}</td><td><span class="tag ${g.conquistou}">${CONQUISTA[g.conquistou]}</span></td></tr>`).join('')}
  </tbody></table>
  <h3>Linha do tempo por duração</h3>
  <div class="duracao">
    ${ordenarGreves('duracao').map(g => `<div class="linha"><span>${esc(g.titulo)}</span><i style="width:${(g.dias / 70) * 100}%"></i><b class="mono">${g.dias} d</b></div>`).join('')}
  </div>
  ${lista.map(g => {
    const porDia = custoPorDia(g);
    return `
  <article class="greve">
    <header><h3>${esc(g.titulo)}</h3><span class="tag ${g.conquistou}">${CONQUISTA[g.conquistou]}</span></header>
    <p class="meta mono">${esc(g.periodo)} · ${g.dias} ${g.dias === 1 ? 'dia' : 'dias'} · ${esc(TIPOS_GREVE[g.tipo]?.nome || g.tipo)}</p>
    <p>${esc(g.resumo)}</p>
    <dl>
      <dt>Participantes</dt><dd>${esc(g.participantes)}</dd>
      <dt>Custo</dt><dd>${g.custoEconomia ? `${reais(g.custoEconomia)} (${esc(ORIGEM_CUSTO[g.origemCusto])})${g.custoNota ? `. ${esc(g.custoNota)}` : ''}${porDia ? ` · cerca de ${reais(porDia)} por dia` : ''}` : 'Sem estimativa consolidada'}</dd>
      <dt>Resultado</dt><dd>${esc(g.resultado)}</dd>
    </dl>
    ${listaFontes(g.fontes)}
    ${imprensa(IMPRENSA_GREVES[g.id])}
  </article>`;
  }).join('')}
</section>`;
};

// ── 5. Direitos ──
const bloco = (classe, titulo, itens) => itens?.length ? `<div class="bloco ${classe}"><h5>${titulo}</h5><ul>${itens.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '';
const direitos = () => `
<section class="pagina" id="direitos">
  <h2>${SECOES[4][1]}</h2>
  <p class="aviso">${esc(AVISO_DIREITOS)}</p>
  ${DIREITOS.map(d => `
  <article class="direito">
    <header>${icone(d.icone)}<div><h3>${esc(d.titulo)}</h3><small class="mono">${esc(d.lei)}</small></div></header>
    <p class="lead">${esc(d.resumo)}</p>
    <div class="grade-blocos">
      ${bloco('pode', 'Pode', d.pode)}${bloco('exige', 'A lei exige', d.exige)}${bloco('nao-pode', 'Não pode', d.naoPode)}
    </div>
    ${bloco('visao', 'Visão liberal e de direita', d.visaoLiberal)}
    <p class="consequencia"><b>Consequência:</b> ${esc(d.consequencia)}</p>
    ${listaFontes(d.fontes)}
    ${imprensa(IMPRENSA_DIREITOS[d.id])}
  </article>`).join('')}
</section>`;

// ── 6. Glossário ──
const glossario = () => `
<section class="pagina" id="glossario">
  <h2>${SECOES[5][1]}</h2>
  <dl class="glossario">${GLOSSARIO.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
</section>`;

// ── 7. Referências ──
const referencias = () => {
  const vistos = new Set();
  const unicas = fs => fs.filter(f => !vistos.has(f.url) && vistos.add(f.url));
  const liberal = unicas([...IMPRENSA_GERAL, ...Object.values(IMPRENSA_GREVES).flat(), ...Object.values(IMPRENSA_DIREITOS).flat()]);
  const oficiais = unicas([...DIREITOS.flatMap(d => d.fontes), ...REFERENCIAS_BASE, ...IPCA_2018.fontes].filter(f => /gov\.br|leg\.br|planalto|ipea|tesesesumulas/.test(f.url)));
  const outras = unicas([...ordenarGreves('data').flatMap(g => g.fontes), ...IPCA_2018.fontes, ...REFERENCIAS_BASE, ...DIREITOS.flatMap(d => d.fontes)]);
  let n = 0;
  const grupo = (titulo, desc, itens) => `<h3>${titulo}</h3><p class="pequeno">${desc}</p><ol class="refs" start="${n + 1}">${itens.map(f => { n++; return `<li>${fonteLink(f)}<br><span class="url mono">${esc(f.url)}</span></li>`; }).join('')}</ol>`;
  return `
<section class="pagina" id="referencias">
  <h2>${SECOES[6][1]}</h2>
  <p>Todas as referências são públicas. Os links foram conferidos em ${EDICAO.toLowerCase()}.</p>
  ${grupo('7.1 Imprensa e institutos liberais, conservadores e libertários', 'Gazeta do Povo, Revista Oeste, Instituto Mises Brasil e Instituto Liberal.', liberal)}
  ${grupo('7.2 Legislação, tribunais e órgãos oficiais', 'Planalto, Câmara, Tesouro Nacional, Ipea, IBGE e teses do STF.', oficiais)}
  ${grupo('7.3 Demais fontes usadas pelo app', 'Imprensa geral e, quando não havia outra, fontes sindicais, identificadas no título.', outras)}
</section>`;
};

const css = readFileSync(join(AQUI, 'estilo.css'), 'utf8').replaceAll('__FONTES__', pathToFileURL(join(RAIZ, 'vendor', 'fonts')).href);
const montar = paginas => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Liberdade Econômica: guia de divulgação</title><style>${css}</style></head>
<body>${capa()}${indice(paginas)}${apresentacao()}${metodo()}${caso()}${greves()}${direitos()}${glossario()}${referencias()}</body></html>`;

const imprimir = () => {
  execFileSync('google-chrome', ['--headless', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files',
    `--print-to-pdf=${PDF}`, pathToFileURL(HTML).href], { stdio: 'ignore' });
};

// Passagem 1: descobre em que página cada título de seção caiu
writeFileSync(HTML, montar({}));
imprimir();
const total = Number(/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [PDF]).toString())[1]);
const paginas = {};
for (let p = 3; p <= total; p++) { // pula capa e índice, que também trazem os títulos
  const texto = execFileSync('pdftotext', ['-f', String(p), '-l', String(p), PDF, '-']).toString();
  for (const [id, titulo] of SECOES) if (!paginas[id] && texto.includes(titulo)) paginas[id] = p;
}
// Passagem 2: índice com os números certos (o índice tem tamanho fixo, as páginas não mudam)
writeFileSync(HTML, montar(paginas));
imprimir();
console.log(`PDF: ${PDF} (${total} páginas)`, paginas);
