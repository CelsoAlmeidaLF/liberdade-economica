/**
 * Camada de Domínio: SectorDrainageModel
 * Decomposição federativa e setorial da drenagem tributária indireta.
 */
// Proporções médias do sistema tributário brasileiro sobre consumo (STN/Receita Federal)
const PARTILHA_MEDIA = Object.freeze({ icms: 58, pisCofins: 28, ipi: 8, iss: 6 });

export class SectorDrainageModel {
  /**
   * Decompõe a drenagem tributária entre entes federativos e principais tributos de consumo
   * @param {number} drenagemTotal Valor total de tributos drenados em BRL
   * @param {{icms:number, pisCofins:number, ipi:number, iss:number}} partilha Proporção de cada tributo % (padrão: média do consumo)
   */
  static decompose(drenagemTotal, partilha = PARTILHA_MEDIA) {
    const total = Math.max(0, Number(drenagemTotal));

    const icms = total * partilha.icms / 100;            // Estados
    const pisCofins = total * partilha.pisCofins / 100;  // União (Seguridade Social)
    const ipi = total * partilha.ipi / 100;              // União (Indústria)
    const iss = total * partilha.iss / 100;              // Municípios (Serviços)

    const uniaoTotal = pisCofins + ipi;
    const estadosTotal = icms;
    const municipiosTotal = iss;

    return {
      tributos: {
        icms: Number(icms.toFixed(2)),
        pisCofins: Number(pisCofins.toFixed(2)),
        ipi: Number(ipi.toFixed(2)),
        iss: Number(iss.toFixed(2))
      },
      federacao: {
        uniao: Number(uniaoTotal.toFixed(2)),
        estados: Number(estadosTotal.toFixed(2)),
        municipios: Number(municipiosTotal.toFixed(2))
      },
      percentuais: { ...partilha },
      total: Number(total.toFixed(2))
    };
  }
}
