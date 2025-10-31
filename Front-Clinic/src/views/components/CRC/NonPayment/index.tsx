import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chance, Status } from 'src/context/types'
import api from 'src/@core/components/api-client'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from 'date-fns';
import nonPaymentContext from './nonPaymentContext';
import MainNonPayment from './components/MainNonPayment';

export function NonPayment() {
  const statusLabels: any = {
    'O': 'opened',
    'A': 'in_progress',
    'P': 'won',
    'R': 'lost'
  }

function getDateFilterBounds(filter: 'week' | 'month' | 'all') {
  const now = new Date();
  switch (filter) {
    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), 
        end: endOfWeek(now, { weekStartsOn: 1 })
      };
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    case 'all':
    default:
      return null; 
  }
}

  const statuses: Array<Status> = [
    { name: 'opened', label: 'Parcela Vencida', warning: 'Seus orçamentos em aberto aparecerão aqui como oportunidades.' },
    {
      name: 'in_progress',
      label: 'Contato Realizado',
      warning: 'Mova as oportunidades para essa etapa após concluir a etapa anterior.'
    },
    {
      name: 'won',
      label: 'Renegociação',
      warning:
        'Orçamentos aprovados na ficha do paciente serão movidos automaticamente para essa etapa ou mova manualmente.'
    },

    // {
    //   name: 'lost',
    //   label: 'Perdida',
    //   warning: 'Mova as oportunidades para essa etapa quando o paciente não aprovar o orçamento.'
    // }
  ]

  const initialChance = new Chance('Oportunidade 1', 'Descrição da oportunidade 1', 'sale', 'won')
  initialChance.amount = 1000
  initialChance.author = 'Nome do autor'

  const initialChance2 = new Chance('Oportunidade 2', 'Descrição da oportunidade 2', 'sale', 'opened')
  initialChance2.amount = 1500
  initialChance2.author = 'Nome do autor2'

  const [chances, setChances] = useState<Array<Chance>>([])

  const [showCadSales, setShowCadSales] = useState(false)

  const [, updateState] = React.useState<object | null>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all')

  function saveChance(chance: Chance) {
    if (chances.findIndex(item => item.title == chance.title) == -1) {
      setChances([...chances, chance])
    }
  }

  const [showEditChanceModal, setShowEditChanceModal] = useState(false)
  const [chanceToEdit, setChanceToEdit] = useState<Chance | null>(null)

  function handleEditChance(chance: Chance) {
    setChanceToEdit(chance)
    setShowEditChanceModal(true)
  }

  function getChanceStatusColor(chance: Chance, opacity = 'FF') {
    if (chance == null) return '#000000' + opacity
    switch (chance.status) {
      case 'opened':
        return '#007BFF' + opacity
      case 'in_progress':
        return '#FFC107' + opacity
      case 'won':
        return '#28A745' + opacity
      case 'lost':
        return '#DC3545' + opacity
    }
  }

  function getStatusLabel(status: string) {
    return statuses.find(item => item.name == status)?.label
  }

  const cardCanvas = useRef<HTMLCanvasElement>(null)

 const fetchData = async () => {
  const chances: Chance[] = [];

  const kanbanResp = await api.get('/transactions/kanban');

  const mapGroupToStatus = {
    'Parcela Vencida': 'opened',
    'Contato Realizado': 'in_progress',
    'Renegociação': 'won'
  };

  for (const [group, cards] of Object.entries(kanbanResp.data)) {
    for (const tx of cards as any) {
      const chance = new Chance(
        tx.description || 'Sem descrição',
        `Vencida em: ${format(new Date(tx.dueDate), 'dd/MM/yyyy')}`,
        'transaction',
        mapGroupToStatus[group as keyof typeof mapGroupToStatus]
      );
      chance.id = tx.id;
      chance.amount = Number(tx.value) || 0;
      chance.author = tx.patientName;
      chance.phone = tx.patientPhone;
      chance.createdAt = new Date(tx.dueDate);
      chance.quantity = 1
      chances.push(chance);
    }
  }

  setChances(chances);
};

console.log(chances);

  const filteredChances = useMemo(() => {
    if (filter === 'all') return chances;
  
    const bounds = getDateFilterBounds(filter);
    if (!bounds) return chances;
    
    return chances.filter(chance => {
      
    const chanceDate = chance.date ? parseISO(chance.date) : null;

     return chanceDate && isWithinInterval(chanceDate, { start: bounds.start, end: bounds.end });
  });
  }, [chances, filter]);
  

  useEffect(()=>{
    fetchData();
  },[])

 function findChanceById(id: string): Chance | undefined {
  return chances.find((chance) => chance.id === id)
}

  return (
    <nonPaymentContext.Provider
      value={{
        showCadSales,
        setShowCadSales,
        saveChance,
        chances: filteredChances,
        setChances,
        statuses,
        showEditChanceModal,
        setShowEditChanceModal,
        handleEditChance,
        chanceToEdit,
        setChanceToEdit,
        getChanceStatusColor,
        forceUpdate,
        getStatusLabel,
        cardCanvas,
        filter,
        setFilter,
        fetchData,
        findChanceById
      }}
    >
      <MainNonPayment fetchData={fetchData} />
    </nonPaymentContext.Provider>
  )
}
