import { IbgeGateway } from './infrastructure/IbgeGateway.js?v=20261104-1710';
import { StkGovShell, renderStkIcons } from '../vendor/stk-gov/stk-gov-shell.js?v=20261104-1710';
import { StkGovPwa } from '../vendor/stk-gov/stk-gov-pwa.js?v=20261104-1710';
import { ChartAdapter } from './infrastructure/ChartAdapter.js?v=20261104-1710';
import { CivicPressureService } from './application/CivicPressureService.js?v=20261104-1710';
import { CivicView } from './ui/CivicView.js?v=20261104-1710';
import { renderIcons } from './ui/SvgIcons.js?v=20261104-1710';
import { IPCA_2018 } from './domain/CasosReais.js?v=20261104-1710';

/**
 * Composition Root do app Liberdade Econômica
 * Padrão Canônico Systekna: Program.js com Injeção de Dependências
 */
export class Program {
  static async run() {
    console.log('[Liberdade Econômica] Inicializando Composition Root...');

    // 1. Renderizar Ícones SVG Canônicos
    renderIcons(document);
    renderStkIcons();

    // As abas ficam com a CivicView, que guarda aba e cenário no endereço; o shell cuida de menu, gaveta e menus
    const shell = new StkGovShell({ app: 'liberdade-economica', gerenciarAbas: false });
    shell.iniciar();
    document.querySelectorAll('.sidebar-nav-item[data-aba]').forEach(item => {
      item.addEventListener('click', () => shell.fecharGaveta());
    });

    const pwa = new StkGovPwa('sw.js');
    pwa.init();
    pwa.ligarBotao(document.getElementById('btnInstallApp'));

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
