import {BudgetItemType, BudgetType} from 'src/types/apps/budgetTypes';

type graphType = 'permanentes' | 'deciduos' | 'estetica';
export const permanentesTooths = [
  '18',
  '17',
  '16',
  '15',
  '14',
  '13',
  '12',
  '11',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '48',
  '47',
  '46',
  '45',
  '44',
  '43',
  '42',
  '41',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38'
];
export const deciduosTooths = [
  '55',
  '54',
  '53',
  '52',
  '51',
  '61',
  '62',
  '63',
  '64',
  '65',
  '85',
  '84',
  '83',
  '82',
  '81',
  '71',
  '72',
  '73',
  '74',
  '75'  
];
export const regioes = ['Maxila', 'Mandíbula', 'Face', 'Arcada superior', 'Arcada inferior', 'Arcadas'];
export const regioesEstetica = [
  "Rugas da fronte da testa",
  "Rugas da Glabela",
  "Elevacao das sobrancelhas",
  "Pes de galinha",
  "Rugas do nariz",
  "Correcao olheira",
  "Macas do rosto",
  "Sulcos nadogenianos bigode chines",
  "Rugas periorais codigo de barras",
  "Contorno e volume labial",
  "Linhas de marionete",
  "Covinha no queixo",
  "Lifting nefertiti",
  "Papada"
];

export const getGraphType = (budget: BudgetType): graphType | null => {
  if(budget === undefined || budget.budgetTreatments === undefined) return null;

  if(
    (Array.isArray(budget.shapesTabAi) && budget.shapesTabAi.length > 0) 
    || (Array.isArray(budget.shapesTabRegiao) && budget.shapesTabRegiao.length > 0)
    || budget.imageCaptured
  ) return 'estetica' as graphType;
  
  let _type = null;
  const items = budget.budgetTreatments;
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if(permanentesTooths.includes(item.description)){
      _type = 'permanentes' as graphType;  
      break;    
    }
    if(deciduosTooths.includes(item.description)){
      _type = 'deciduos' as graphType;      
      break;
    }
    if(regioesEstetica.includes(item.description)){      
      _type = 'estetica' as graphType;      
      break;
    }    
  }
  
  return _type;
}