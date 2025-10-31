function formatCPF(string: string) {
  return string
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatRG(string: string) {
  return string
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
}

function formatCellphone(string: string) {
  return string.replace(/\D/g, '').replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
}

export { formatCPF, formatRG, formatCellphone };
