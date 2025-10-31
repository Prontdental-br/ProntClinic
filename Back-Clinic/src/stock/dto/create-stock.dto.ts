export class CreateStockDto {
  id: number;
  categoria: string;
  unidadeDeMedida: string;
  quantidade: number;
  nomeProduto: string;
  preco: number;
  fornecedor: string;
  validade: Date;
  fabricante: string;
  dataFabricacao: Date;
  precoVenda: number;
  LocalEstoque: string;
  lote: string;
  armazenamento: string;
  status: number;
  obs: string;
}
