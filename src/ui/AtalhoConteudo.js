/**
 * Camada de UI: "Pular para o conteúdo", primeiro item do Tab.
 * Foca o <main> sem mexer no # do endereço, que guarda a aba aberta.
 */
export function criarAtalhoConteudo(doc = document) {
  const principal = doc.querySelector('main');
  if (!principal) return;
  principal.tabIndex = -1;
  const atalho = doc.createElement('a');
  atalho.className = 'skip-link';
  atalho.href = '#';
  atalho.textContent = 'Pular para o conteúdo';
  atalho.addEventListener('click', e => { e.preventDefault(); principal.focus(); });
  doc.body.prepend(atalho);
}
