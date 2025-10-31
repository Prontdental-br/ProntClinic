import { removerAcentos } from 'src/@core/utils/remover-acentos';
import Data from './data.json'

interface CidData {
  nome: string;
  codigo: string;
}

const dataArray: CidData[] = Data

function searchByName(name: string, resultsMaxLength = 5): CidData[] {
  if (name === '') {
    return [];
  }

  const data: CidData[] = [];
  for (let index = 0; index < dataArray.length; index += 1) {
    const currentItem = dataArray[index];
    if (data.length === resultsMaxLength) {
      break;
    }
    if (removerAcentos(currentItem.nome).toLowerCase().startsWith(removerAcentos(name).toLowerCase()) || currentItem.codigo.toLowerCase().startsWith(name.toLowerCase())) {
      data.push(currentItem);
    }
  }

  return data;
}

export { searchByName }
export type { CidData }
