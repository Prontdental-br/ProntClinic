import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chance, Status } from 'src/context/types'
import api from 'src/@core/components/api-client'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { CalendarColorsLabelsType } from 'src/types/apps/calendarTypes'

import deselectionsContext from './deselectionsContext'
import MainDeselections from './components/MainDeselections'


export function Deselections() {
  // Labels de status para mapeamento interno do Kanban, mas aqui só usaremos para cada chance
  const getStatusLabel: Record<string, 'opened' | 'in_progress' | 'won' | 'lost'> = {
    SC: 'won',  // Agendada
    AT: 'in_progress', // Atendida
    AP: 'won', // Paciente chegou
    CF: 'won', // Confirmada
    CP: 'lost', // Cancelado paciente
    CS: 'lost', // Cancelado profissional
    MS: 'lost' // Falta
  }

  // Estados para armazenar as 3 colunas com chances (agendamentos)
  const [chancesGrouped, setChancesGrouped] = useState<{
    Desmarcado: Chance[]
    'Contato Realizado': Chance[]
    Agendada: Chance[]
  }>({
    Desmarcado: [],
    'Contato Realizado': [],
    Agendada: []
  })

  const [chances, setChances] = useState<Array<Chance>>([]);
  const [showCadSales, setShowCadSales] = useState(false);
  const [, updateState] = useState<object | null>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all')

  function getDateFilterBounds(filter: 'week' | 'month' | 'all') {
    const now = new Date()
    switch (filter) {
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        }
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      case 'all':
      default:
        return null
    }
  }

  // Faz fetch dos dados do backend já agrupados em colunas do Kanban
  const fetchData = async () => {
    try {
      const { data: groupedData } = await api.get('/crc/canceled') 

    const mapToChance = (schedules: any[], column: 'Desmarcado' | 'Contato Realizado' | 'Agendada'): Chance[] =>
    schedules.map((schedule) => {
      // Força o status 'in_progress' para os da coluna 'Contato Realizado'
      const status =
        column === 'Contato Realizado'
          ? 'in_progress'
          : getStatusLabel[schedule.status || 'SC'] || 'opened'

      const chance = new Chance(
        schedule.patientName || 'Sem nome',
        schedule.observation || 'Sem observações',
        'schedule',
        status
      )
      chance.id = schedule.id
      chance.quantity = 1
      chance.author = schedule.professionalName || 'Sem profissional'
      chance.phone = schedule.phone || ''
      chance.date = schedule.startDate || ''
      chance.defaultStatus = schedule.status
      chance.observationCRC = schedule.observationCRC
      chance.tag = schedule.tag

      Object.setPrototypeOf(chance, Chance.prototype)

      return chance
    })

    setChancesGrouped({
      Desmarcado: mapToChance(groupedData.Desmarcado || [], 'Desmarcado'),
      'Contato Realizado': mapToChance(groupedData['Contato Realizado'] || [], 'Contato Realizado'),
      Agendada: mapToChance(groupedData.Agendada || [], 'Agendada')
    })
    } catch (error) {
      console.error('Erro ao buscar agendamentos no Kanban:', error)
      setChancesGrouped({ Desmarcado: [], 'Contato Realizado': [], Agendada: [] })
    }
  }

  const filteredChancesGrouped = useMemo(() => {
    if (filter === 'all') return chancesGrouped

    const bounds = getDateFilterBounds(filter)
    if (!bounds) return chancesGrouped

    function filterList(list: Chance[]) {
      if (!bounds) return [];
      
return list.filter((chance) => {
        if (!chance.date) return false
        const chanceDate = parseISO(chance.date)
        
        return isWithinInterval(chanceDate, { start: bounds.start, end: bounds.end })
      })
    }

    return {
      Desmarcado: filterList(chancesGrouped.Desmarcado),
      'Contato Realizado': filterList(chancesGrouped['Contato Realizado']),
      Agendada: filterList(chancesGrouped.Agendada)
    }
  }, [chancesGrouped, filter])

  function findChanceById(id: string): Chance | undefined {
  return [
    ...chancesGrouped.Desmarcado,
    ...chancesGrouped['Contato Realizado'],
    ...chancesGrouped.Agendada
  ].find(chance => chance.id === id)
}

  useEffect(() => {
    fetchData()
  }, [])

  const statuses: Status[] = [
    { name: 'Desmarcado', label: 'Desmarcado' },
    { name: 'Contato Realizado', label: 'Contato Realizado' },
    { name: 'Agendada', label: 'Agendada' }
  ]

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

  const [showEditChanceModal, setShowEditChanceModal] = useState(false)
  const [chanceToEdit, setChanceToEdit] = useState<Chance | null>(null)

  function handleEditChance(chance: Chance) {
    setChanceToEdit(chance)
    setShowEditChanceModal(true)
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


  function saveChance(chance: Chance) {
    if (chances.findIndex(item => item.title == chance.title) == -1) {
      setChances([...chances, chance])
    }
  }

const cardCanvas = useRef<HTMLCanvasElement>(null)

  return (
    <deselectionsContext.Provider
      value={{
        chancesGrouped: filteredChancesGrouped,
        setChancesGrouped,
        fetchData,
        filter,
        setFilter,
        setChances,
        statuses,
        getChanceStatusColor,
        showEditChanceModal,
        setShowEditChanceModal,
        handleEditChance,
        chanceToEdit,
        setChanceToEdit,
        forceUpdate,
        getStatusLabel,
        cardCanvas,
        saveChance,
        findChanceById

        // Outras funções e estados que usar
      }}
    >
      <MainDeselections fetchData={fetchData} />
    </deselectionsContext.Provider>
  )
}
