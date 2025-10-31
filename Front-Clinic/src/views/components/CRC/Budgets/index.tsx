import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chance, Status } from 'src/context/types'
import api from 'src/@core/components/api-client'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import MainSales from 'src/pages/budget/sales/components/MainSales';
import salesContext from 'src/pages/budget/sales/salesContext';

export function Budgets() {
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
    { name: 'opened', label: 'Em aberto', warning: 'Seus orçamentos em aberto aparecerão aqui como oportunidades.' },
    {
      name: 'in_progress',
      label: 'Em andamento',
      warning: 'Mova as oportunidades para essa etapa após concluir a etapa anterior.'
    },
    {
      name: 'won',
      label: 'Fechado',
      warning:
        'Orçamentos aprovados na ficha do paciente serão movidos automaticamente para essa etapa ou mova manualmente.'
    },
    {
      name: 'lost',
      label: 'Perdida',
      warning: 'Mova as oportunidades para essa etapa quando o paciente não aprovar o orçamento.'
    }
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

  const fetchData = async ()=> {
    const chances = [];

    const resp = await api.get('sales') || [];

    for(let i=0;i<resp.data.length;i++){
      const secChance = new Chance(resp.data[i].title, resp.data[i].description, 'opportunity', resp.data[i].status)
      secChance.id = resp.data[i].id;
      secChance.amount = resp.data[i].total;
      secChance.author = resp.data[i].patient?.name;
      secChance.phone = resp.data[i].patient?.cellPhone;
      secChance.createdAt = new Date(resp.data[i].created_at);
    
      secChance.history = resp.data[i].history || [];
      console.log(secChance)
      chances.push(secChance);
    }

    const { data } = await api.get('budgets/sales');

    for(let i=0;i<data.length;i++){
      console.log(data[i])
      const initialChance = new Chance(data[i].description, data[i].description, 'sale', statusLabels[data[i].status])
      initialChance.id = data[i].id;
      initialChance.amount = data[i].subtotal - data[i].discount - data[i].downPayment;
      initialChance.author = data[i].patient?.name;
      initialChance.phone = data[i].patient?.cellPhone;
      initialChance.createdAt = new Date(data[i].created_at);
      initialChance.history = data[i].history  || [];
      initialChance.date = data[i]?.date;
      initialChance.payment = data[i].payment;
      initialChance.observationCRC = data[i].observationCRC;
      chances.push(initialChance);
    }

  
    console.log(resp.data)
    setChances(chances);
  } 

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

  return (
    <salesContext.Provider
      value={{
        showCadSales,
        setShowCadSales,
        saveChance,
        chances: filteredChances,
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
        fetchData
      }}
    >
      <MainSales fetchData={fetchData} />
    </salesContext.Provider>
  )
}
