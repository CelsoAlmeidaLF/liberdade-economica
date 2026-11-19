import { coresDoTema } from '../../vendor/stk-gov/stk-gov-config.js?v=20261119-1256';

/**
 * Camada de Infraestrutura: ChartAdapter
 * Adaptador visual de gráficos para a Liberdade Econômica.
 */
export class ChartAdapter {
  constructor() {
    this.evolutionChart = null;
    this.breakdownChart = null;
  }

  /**
   * Gráfico de Linha: Evolução temporal acumulada (Dias)
   */
  initEvolutionChart(canvasEl) {
    if (!canvasEl || typeof Chart === 'undefined') return;
    const t = coresDoTema();
    if (this.evolutionChart) this.evolutionChart.destroy();

    const ctx = canvasEl.getContext('2d');
    this.evolutionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Dia 1', 'Dia 7', 'Dia 14'],
        datasets: [
          {
            label: 'Gasto que deixou de circular',
            data: [100, 700, 1750],
            borderColor: t.amarelo, // gold
            backgroundColor: t.alfa(t.amarelo, 0.08),
            fill: true,
            tension: 0.35,
            pointBackgroundColor: t.amarelo,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Imposto que não entrou',
            data: [34, 238, 595],
            borderColor: t.vermelho, // down
            backgroundColor: t.alfa(t.vermelho, 0.12),
            fill: true,
            tension: 0.35,
            pointBackgroundColor: t.vermelho,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: t.texto,
              font: { family: 'Inter', size: 10 },
              filter: (item, data) => !data.datasets[item.datasetIndex].hidden
            }
          },
          tooltip: {
            backgroundColor: '#2B2B2B',
            borderColor: '#3D3D3D',
            borderWidth: 1,
            titleFont: { family: 'Inter' },
            bodyFont: { family: 'Inter' },
            callbacks: {
              label: c => {
                const val = c.raw;
                if (val >= 1e9) return ` ${c.dataset.label}: R$ ${(val / 1e9).toFixed(2).replace('.', ',')} Bi`;
                return ` ${c.dataset.label}: R$ ${(val / 1e6).toFixed(1).replace('.', ',')} Mi`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: t.eixo, font: { family: 'Inter', size: 10 } },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: t.eixo,
              font: { family: 'Inter', size: 9 },
              callback: v => {
                if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1)}B`;
                return `R$ ${(v / 1e6).toFixed(0)}M`;
              }
            },
            grid: { color: t.grade }
          }
        }
      }
    });
  }

  updateEvolutionChart(timeline) {
    if (!this.evolutionChart || !timeline || timeline.length === 0) return;
    this.evolutionChart.data.labels = timeline.map(t => t.label);
    this.evolutionChart.data.datasets[0].data = timeline.map(t => t.volumeRetido);
    this.evolutionChart.data.datasets[1].data = timeline.map(t => t.drenagemTributaria);
    this.evolutionChart.update();
  }

  /**
   * Gráfico de Rosca: Decomposição da drenagem tributária indireta
   */
  initBreakdownChart(canvasEl) {
    if (!canvasEl || typeof Chart === 'undefined') return;
    const t = coresDoTema();
    if (this.breakdownChart) this.breakdownChart.destroy();

    const ctx = canvasEl.getContext('2d');
    this.breakdownChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'ICMS (Estados - 58%)',
          'PIS/COFINS (União - 28%)',
          'IPI (União - 8%)',
          'ISS (Municípios - 6%)'
        ],
        datasets: [{
          data: [58, 28, 8, 6],
          backgroundColor: [
            t.verde, // accent (Estados)
            t.azul, // info (União PIS/COFINS)
            t.amarelo, // gold (União IPI)
            t.roxo  // purple (Municípios ISS)
          ],
          borderColor: t.superficie,
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: window.matchMedia('(max-width: 639px)').matches ? 'bottom' : 'right',
            labels: {
              color: t.texto,
              font: { family: 'Inter', size: 10 },
              boxWidth: 12,
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: '#2B2B2B',
            borderColor: '#3D3D3D',
            borderWidth: 1,
            titleFont: { family: 'Inter' },
            bodyFont: { family: 'Inter' },
            callbacks: {
              label: c => {
                const val = c.raw;
                if (val >= 1e9) return ` ${c.label}: R$ ${(val / 1e9).toFixed(2).replace('.', ',')} Bi`;
                return ` ${c.label}: R$ ${(val / 1e6).toFixed(1).replace('.', ',')} Mi`;
              }
            }
          }
        },
        cutout: '62%'
      }
    });
  }

  updateBreakdownChart(sectorData) {
    if (!this.breakdownChart || !sectorData) return;
    const p = sectorData.percentuais;
    this.breakdownChart.data.labels = [
      `ICMS (Estados - ${p.icms}%)`,
      `PIS/COFINS (União - ${p.pisCofins}%)`,
      `IPI (União - ${p.ipi}%)`,
      `ISS (Municípios - ${p.iss}%)`
    ];
    this.breakdownChart.data.datasets[0].data = [
      sectorData.tributos.icms,
      sectorData.tributos.pisCofins,
      sectorData.tributos.ipi,
      sectorData.tributos.iss
    ];
    this.breakdownChart.update();
  }

  /**
   * Troca os nomes das duas linhas do gráfico de evolução conforme o tipo de greve
   */
  setEvolutionLabels(serie1, serie2) {
    if (!this.evolutionChart) return;
    this.evolutionChart.data.datasets[0].label = serie1;
    // Sem segunda série (setor público não gera imposto perdido): esconde a linha e a legenda
    this.evolutionChart.data.datasets[1].hidden = !serie2;
    this.evolutionChart.data.datasets[1].label = serie2 || '';
  }

  /**
   * Gráfico de barras: IPCA mensal, com o mês da greve e o pico destacados
   */
  initPrecosChart(canvasEl, { meses, valores, mesGreve, mesPico }) {
    if (!canvasEl || typeof Chart === 'undefined') return;
    const t = coresDoTema();
    if (this.precosChart) this.precosChart.destroy();

    const cores = valores.map((_, i) => {
      if (i === mesPico) return t.vermelho;
      if (i === mesGreve) return t.amarelo;
      return t.alfa(t.azul, 0.55);
    });

    this.precosChart = new Chart(canvasEl.getContext('2d'), {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'IPCA mensal (%)',
          data: valores,
          backgroundColor: cores,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#2B2B2B',
            borderColor: '#3D3D3D',
            borderWidth: 1,
            callbacks: {
              label: c => {
                const extra = c.dataIndex === mesGreve ? ' · greve (21 a 31/05)' : c.dataIndex === mesPico ? ' · maior junho desde 1995' : '';
                return ` ${String(c.raw.toFixed(2)).replace('.', ',')}%${extra}`;
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: t.eixo, font: { family: 'Inter', size: 10 } }, grid: { display: false } },
          y: {
            ticks: { color: t.eixo, font: { family: 'Inter', size: 10 }, callback: v => `${String(v).replace('.', ',')}%` },
            grid: { color: t.gradeSuave }
          }
        }
      }
    });
  }

  resizeAll() {
    // Redesenha sem animação: evita barras fora do lugar ao mostrar um painel que estava escondido
    [this.evolutionChart, this.breakdownChart, this.precosChart].forEach(chart => {
      if (!chart) return;
      chart.resize();
      chart.update('none');
    });
  }
}
