# Liberdade Econômica

**App publicado:** https://celsoalmeidalf.github.io/liberdade-economica-2026/

**Ícone oficial:** `icons/` (favicon, logo do cabeçalho, tela inicial do celular via `manifest.webmanifest` e prévia de compartilhamento `og-image.jpg`). A imagem original fica em `icons/` e os tamanhos são gerados dela.

**Impacto econômico das greves no Brasil.** Simula greves de consumo, de transporte, gerais, de uma categoria e do setor público; mostra o efeito cascata sobre outros setores, quem paga a conta, o efeito nos preços e compara com greves reais documentadas.

## Abas
- **Simulador:** tipos de greve, resultados, peso na arrecadação e quem paga a conta.
- **Greves reais** (`#greves`): efeito nos preços, biblioteca de greves, comparação, linha do tempo e referências.
- **Direitos e limites** (`#direitos`, `DireitosGreve.js`): Lei de Greve, greve no setor público, boicote e bloqueio de estradas (CTB art. 253-A), cada tema com pode / exige / não pode / visão liberal e de direita / consequência e fontes.

No computador as abas ficam no topo; no celular, na barra de baixo junto com IBGE, CSV, Link e Enviar.

**Compartilhar** copia um link com o cenário e a aba atuais (`CenarioUrl.js`), por exemplo `index.html#tipo=transporte&setor=carga&adesao=80&dias=11`. Quem abre vê os mesmos valores. Os links antigos, como `#greves`, continuam valendo.

## Tipos de greve (`TiposGreve.js`, `GreveProducaoModel.js`)

| Tipo | Como o impacto é calculado |
|---|---|
| Consumo | Pessoas × gasto evitado × dias; imposto embutido no preço e parte só adiada (seções abaixo) |
| Transporte, geral e categoria | PIB por dia (R$ 11,7 tri / 365) × peso do setor × adesão × dias × cascata, menos a produção recuperada depois |
| Setor público | Servidores parados × salário diário × dias (o governo mede o próprio produto pelo custo) e fila de atendimentos acumulada |

Cascata do transporte de carga **calibrada pela greve de 2018**: 0,2% do PIB em 11 dias com 80% de adesão dá multiplicador de ~4,15. As demais cascatas, pesos e valores do setor público são estimativas ajustáveis.

## Quem paga a conta (`DivisaoCusto.js`)
Produção perdida dividida como o PIB pela ótica da renda (IBGE, 2021): trabalhadores 39,2%, empresas 45,3%, governo 15,5%. Na greve de consumo, o governo perde o imposto e o consumidor guarda o dinheiro. No setor público, a população perde o serviço.

## Efeito nos preços
IPCA mensal de 2018: maio 0,40%, junho 1,26% (maior junho desde 1995), com ~0,48 p.p. atribuídos à greve dos caminhoneiros.

## Greves reais (`CasosReais.js`)
Greve geral (1989), petroleiros (1995), bancários (2016), greve geral (2017), caminhoneiros (2018), petroleiros (2020), Correios (2020) e educação federal (2024), com duração, custo quando existe, origem do número, resultado e fontes. Comparação lado a lado e linha do tempo por data ou duração. Quando não há estimativa consolidada de custo, o app informa.


Funciona no navegador, sem servidor próprio e sem telemetria; instala como app (PWA) e abre sem internet. Os ícones são SVG. O simulador nasceu dos modelos de Gene Sharp (*The Politics of Nonviolent Action*) e da pesquisa de Erica Chenoweth e Maria J. Stephan (*Why Civil Resistance Works*).

---

## Integrações Governamentais

- **Instituto Brasileiro de Geografia e Estatística (IBGE):**
  - Estimativa oficial de população via SIDRA (tabela 6579, variável 9324). O endpoint antigo `/api/v1/projecoes/populacao` responde 404.
  - Valor de referência quando o IBGE não responde: estimativa de 2026 ($214.211.951\text{ habitantes}$).
- **Secretaria do Tesouro Nacional (STN) & Receita Federal:**
  - Parcela de tributos no valor gasto pelas famílias: estimativa padrão de ~$21,8\%$ (ajustável no slider).
    - Cálculo: tributos sobre bens e serviços ($13,91\%$ do PIB em 2024, prévia do Tesouro Nacional) ÷ consumo das famílias (~$63,8\%$ do PIB, IBGE).
    - É um teto: parte desses tributos incide sobre investimento e compras do governo, não só sobre o consumo das famílias.
    - Antes o app usava $34,2\%$, que é a carga tributária total sobre o PIB (inclui renda, folha e patrimônio) e superestimava a perda.
  - Decomposição dos tributos sobre consumo:
    - Estados (ICMS): $58\%$ dos tributos indiretos
    - União (PIS/COFINS & IPI): $36\%$ dos tributos indiretos
    - Municípios (ISS): $6\%$ dos tributos indiretos

---

## Fundamentação Teórica e Modelos Matemáticos

### 1. Dinâmica da Retenção de Consumo e Drenagem Fiscal
$$V_{\text{retido}} = P \cdot G \cdot D \qquad D_{\text{tributos}} = V_{\text{retido}} \cdot \text{TaxRate}$$
$$D_{\text{definitiva}} = D_{\text{tributos}} \cdot (1 - A)$$
Onde:
- $P$: Cidadãos em adesão
- $G$: Gasto evitado por cidadão por dia (BRL)
- $D$: Duração do boicote (dias)
- $\text{TaxRate}$: Parcela de tributos embutida no preço (depende do setor; média ~21,8%)
- $A$: Parte do gasto que é só adiada e volta a ser feita depois. O imposto dessa parte só atrasa; a poupança das famílias é só o que não volta a ser gasto.

### 2. Setores do boicote (`SetorConsumo.js`)
Cada setor traz tributo no preço, gasto adiado típico e partilha entre ICMS, PIS/COFINS, IPI e ISS. São estimativas ajustáveis nos controles:

| Setor | Tributo no preço | Só adiado |
|---|---|---|
| Consumo em geral | 21,8% | 40% |
| Combustíveis | 37% | 60% |
| Energia elétrica | 28% | 10% |
| Bebidas alcoólicas | 45% | 20% |
| Eletrônicos e eletrodomésticos | 40% | 80% |
| Alimentos | 17% | 90% |
| Lazer, bares e restaurantes | 30% | 20% |

### 3. Peso na arrecadação e fases (`ArrecadacaoReferencia.js`)
A perda definitiva é comparada com a arrecadação de União, estados e municípios no mesmo período: R$ 3,78 tri/ano (carga tributária bruta 2024 de 32,3% do PIB, Tesouro Nacional, × PIB 2024 de R$ 11,7 tri, IBGE).

| Fase | Perda definitiva / arrecadação do período |
|---|---|
| 1. Sinal simbólico | abaixo de 0,25% |
| 2. Pressão perceptível | 0,25% a 1% |
| 3. Pressão forte | 1% a 3% |
| 4. Choque fiscal | 3% ou mais |

As faixas são do simulador, não uma regra científica. Exemplo: 3,5% da população deixando de gastar R$ 75/dia por 30 dias, com 40% adiado, fica na Fase 2 (~0,7% da arrecadação).

### 4. Caso real: greve dos caminhoneiros de 2018 (`CasosReais.js`)
Régua para a simulação. De 21 a 31 de maio de 2018 (11 dias):
- Custo para a economia: R$ 15 bi, 0,2% do PIB (Ministério da Fazenda, jun/2018)
- Produção industrial: -10,9% de abril para maio (IBGE)
- Acordo para encerrar a greve: R$ 13,5 bi (R$ 9,5 bi de subvenção + R$ 4 bi de PIS/COFINS e CIDE no diesel, MP 838/2018)

O app compara a perda definitiva do boicote com o custo da greve e calcula quantos dias, no ritmo simulado, seriam necessários para igualá-la. A comparação é aproximada: a greve parou a produção; o boicote reduz o consumo.

### 5. Referência dos 3,5% de Erica Chenoweth (Harvard Kennedy School)
Na pesquisa de Chenoweth e Stephan, campanhas de massa contra governos que mobilizaram 3,5% da população costumaram ter sucesso. A própria autora aponta exceções, e o estudo não trata de boicotes de consumo. No app, a barra mede só a **adesão** ($0{,}035 \cdot \text{População} \approx 7.497.000$ pessoas); o impacto fiscal fica no painel de peso na arrecadação.

---

## Arquitetura Hexagonal (Ports & Adapters)

```
8. STK-GOVERNO-BRAZIL/8.5. LIBERDADE-ECONOMICA/
├── index.html                   # Entrypoint Web semântico e acessível
├── css/
│   ├── fonts.css                # Fontes locais
│   ├── liberdade.css            # Estilos próprios do app (setores, fases, cartões)
│   └── style.css                # Tokens e estilos base (Fluent-Spectrum, cores do Brasil)
├── src/
│   ├── Program.js               # Composition Root & Injeção de Dependências
│   ├── domain/                  # Lógica pura de negócio e modelos matemáticos
│   │   ├── CivicState.js        # Entidade de estado cívico imutável
│   │   ├── CivicPressureModel.js # Retenção, gasto adiado, peso na arrecadação e adesão
│   │   ├── SectorDrainageModel.js # Decomposição federativa (ICMS/PIS/COFINS/IPI/ISS)
│   │   ├── SetorConsumo.js      # Catálogo de setores do boicote
│   │   ├── CasosReais.js        # Greves reais com fontes, IPCA 2018
│   │   ├── TiposGreve.js        # Tipos de greve, setores de produção e órgãos públicos
│   │   ├── GreveProducaoModel.js # Perda de produção, cascata e setor público
│   │   ├── DivisaoCusto.js      # Quem paga a conta
│   │   └── ArrecadacaoReferencia.js # Arrecadação de referência e fases fiscais
│   ├── application/             # Casos de uso e orquestração
│   │   └── CivicPressureService.js # Gestão de simulação e notas técnicas
│   ├── infrastructure/          # Adapters externos
│   │   ├── IbgeGateway.js       # Conector REST ao IBGE com fallback seguro
│   │   ├── PwaRegistrar.js      # Registro do service worker
│   │   ├── CsvExporter.js       # Exportador CSV RFC 4180 UTF-8 BOM
│   │   └── ChartAdapter.js      # Gráficos Chart.js 4.4.1 (Evolução + Rosca setorial)
│   └── ui/                      # Camada de apresentação e interface
│       ├── SvgIcons.js          # Ícones vetorizados Lucide / FinancIcons
│       ├── AtalhoConteudo.js    # "Pular para o conteúdo"
│       ├── CenarioUrl.js        # Cenário do simulador no endereço da página
│       └── CivicView.js         # Controle reativo do DOM e eventos
├── vendor/
│   ├── chart.js/chart.umd.js    # Chart.js 4.4.1 vendored localmente
│   └── fonts/                   # Arquivos .woff2
├── scripts/versionar.mjs        # Carimba a versão nos arquivos e no sw.js
├── sw.js                        # Service worker (lista e versão geradas)
└── tests/
    ├── test_civic_models.js     # Testes de domínio e infraestrutura
    └── test_ui_smoke.mjs        # Teste da tela num Chrome headless
```

---

## Execução e Testes

```bash
python3 -m http.server 8282   # abrir em http://localhost:8282
npm test                      # regras e infraestrutura
npm run test:ui               # tela, num Chrome headless (sem Chrome, é pulado)
npm run versionar             # depois de mudar qualquer arquivo da página
```

Depois de mudar CSS ou JS, rode `npm run versionar`: sem isso o navegador pode misturar arquivos novos com antigos do cache.
