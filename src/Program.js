import { IbgeGateway } from './infrastructure/IbgeGateway.js';
import { ChartAdapter } from './infrastructure/ChartAdapter.js';
import { CivicPressureService } from './application/CivicPressureService.js';
import { CivicView } from './ui/CivicView.js';
import { renderIcons } from './ui/SvgIcons.js';
import { IPCA_2018 } from './domain/CasosReais.js';

/**
 * Composition Root do app Liberdade Econômica
 * Padrão Canônico Systekna: Program.js com Injeção de Dependências
 */
export class Program {
  static async run() {
    console.log('[Liberdade Econômica] Inicializando Composition Root...');

    // 1. Renderizar Ícones SVG Canônicos
    renderIcons(document);

    // 2. Instanciar Infraestrutura
    const chartAdapter = new ChartAdapter();
    const ibgeGateway = new IbgeGateway({
      timeoutMs: 6000,
      onLog: (log) => console.log(`[Liberdade Econômica] ${log.message}`)
    });

    // 3. Instanciar Aplicação
    const service = new CivicPressureService({
      ibgeGateway
    });

    // 4. Instanciar UI / View
    const viewInstance = new CivicView({
      service,
      chartAdapter
    });

    // 5. Inicializar Gráficos Chart.js
    const canvasEvolution = document.getElementById('chartEvolution');
    const canvasBreakdown = document.getElementById('chartBreakdown');

    if (canvasEvolution) chartAdapter.initEvolutionChart(canvasEvolution);
    if (canvasBreakdown) chartAdapter.initBreakdownChart(canvasBreakdown);
    const canvasPrecos = document.getElementById('chartPrecos');
    if (canvasPrecos) chartAdapter.initPrecosChart(canvasPrecos, IPCA_2018);

    // 6. Renderização Inicial
    viewInstance.render();

    console.log('[Liberdade Econômica] Sistema pronto.');
  }
}

// Inicialização automática
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Program.run());
} else {
  Program.run();
}
