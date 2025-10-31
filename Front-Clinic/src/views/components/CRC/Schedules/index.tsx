import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chance, Status } from 'src/context/types'
import scheduleContext from './scheduleContext';
import api from 'src/@core/components/api-client'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import MainShedule from './components/MainSchedule';
import { CalendarColorsLabelsType } from 'src/types/apps/calendarTypes';

export function Schedules() {
  const statusLabels: Record<string, 'opened' | 'in_progress' | 'won' | 'lost'> = {
  SC: 'opened',           // Agendada → Confirmação pendentes
  AT: 'in_progress',      // Atendida → Atendidos
  AP: 'won',              // Paciente chegou → Confirmados
  CF: 'won',              // Confirmada → Confirmados
  CP: 'lost',             // Cancelado pelo paciente → Faltou / Cancelou
  CS: 'lost',             // Cancelado pelo profissional → Faltou / Cancelou
  MS: 'lost'              // Falta → Faltou / Cancelou
}

  const calendarsColor = {
    MS: 'error',
    SC: 'primary',
    CP: 'warning',
    CS: 'secondary',
    CF: 'success',
    AT: 'info',
    AP: 'orange'
  }
  
  const calendarsColorLabels: CalendarColorsLabelsType = {
    MS: 'Falta',
    SC: 'Agendada',
    CP: 'Canc. Paciente',
    CS: 'Canc. Profissional',
    CF: 'Confirmada',
    AT: 'Atendida',
    AP: 'Paciente chegou'
  }

function getDateFilterBounds(filter: 'week' | 'month' | 'all' | 'daily') {
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
    { 
        name: 'opened', 
        label: 'Confirmação pendentes',
        warning: 'Seus agendamentos em confirmação aparecerão aqui.' 
    },
    {
      name: 'in_progress',
      label: 'Atendidos',
      warning: 'Seus agendamentos atendidos aparecerão aqui..'
    },
    {
      name: 'won',
      label: 'Confirmados',
      warning:
        'Agendamentos confirmados aparecerão aqui ou mova manualmente.'
    },
    {
      name: 'lost',
      label: 'Faltou / Cancelou',
      warning: 'Mova os agendamentos para essa etapa quando o paciente não comparecer ou cancelar.'
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

  const fetchData = async () => {
  const chances: Chance[] = []

  try {
    const { data: schedules } = await api.get('schedules/search/crc/date')

     const statusCountMap: Record<string, number> = {}
            schedules.forEach((schedule: any) => {
            const status = schedule.status || 'SC'
            statusCountMap[status] = (statusCountMap[status] || 0) + 1
    })

    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i]
        const status = schedule.status || 'SC'

      const chance = new Chance(
        schedule.patient?.name || 'Sem nome',
        schedule.observation || 'Sem observações',
        'schedule',
        statusLabels[schedule.status] || 'opened'
      )

      chance.id = schedule.id
      chance.amount = 0
      chance.quantity = 1
      chance.author = schedule.professional?.name
      chance.phone = schedule.patient?.cell_phone
      chance.createdAt = new Date(schedule.created_at)
      chance.date = schedule.startDate
      chance.observationCRC = schedule.observationCRC
      chance.history = [] 
      chance.payment = null 

      chances.push(chance)
    }

    setChances(chances)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
  }
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
    <scheduleContext.Provider
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
        fetchData,
        setFilter
      }}
    >
      <MainShedule fetchData={fetchData} />
    </scheduleContext.Provider>
  )
}
