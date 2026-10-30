/**
 * Camada de Infraestrutura: CsvExporter
 * Exportador de dados tabulares da simulação cívica no padrão RFC 4180 com BOM UTF-8.
 */
export class CsvExporter {
  /**
   * @param {Array<[string, *, string, string]>} rows Indicador, valor, unidade e fundamentação
   */
  static export(rows, filename = 'liberdade_economica_simulacao.csv') {
    let csv = "Indicador,Valor,Unidade,Fundamentacao\r\n";

    rows.forEach(([k, v, u, f]) => {
      csv += `${k},${v},${u},"${String(f).replace(/"/g, `""`)}"\r\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
