import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chance, Status } from 'src/context/types'
import api from 'src/@core/components/api-client'
import birthdayContext from './birthdayContext'
import { isSameDay, isSameMonth, parseISO } from 'date-fns'
import MainShedule from './components/MainSchedule'

export function BirthdayPeople() {
  const statuses: Array<Status> = [
    {
      name: 'opened',
      label: 'Aniversariantes do dia',
      warning: 'Aniversariantes do dia aparecerão aqui ou mova manualmente.'
    },
    {
      name: 'in_progress',
      label: 'Aniversariantes do mês',
      warning: 'Aniversariantes do mês aparecerão aqui ou mova manualmente.'
    },
    {
      name: 'won',
      label: 'Aniversariantes do ano',
      warning: 'Aniversariantes do ano aparecerão aqui ou mova manualmente.'
    }
  ]

  const [chances, setChances] = useState<Array<Chance>>([])
  const [showCadSales, setShowCadSales] = useState(false)
  const [, updateState] = useState<object | null>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all')

  function saveChance(chance: Chance) {
    if (chances.findIndex(item => item.title === chance.title) === -1) {
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
    switch (chance.status) {
      case 'opened':
        return '#007BFF' + opacity
      case 'in_progress':
        return '#FFC107' + opacity
      case 'won':
        return '#28A745' + opacity
      case 'lost':
        return '#DC3545' + opacity
      default:
        return '#000000' + opacity
    }
  }

  function getStatusLabel(status: string) {
    return statuses.find(item => item.name === status)?.label
  }

  const cardCanvas = useRef<HTMLCanvasElement>(null)


const fetchData = async () => {
  const chances: Chance[] = []
  const today = new Date()

  // Inicializa contador por status
  const statusCountMap: Record<'opened' | 'in_progress' | 'won', number> = {
    opened: 0,
    in_progress: 0,
    won: 0,
  }

  try {
    const { data: patients } = await api.get('patients/birthdays');

    const chancesOpened = [];
    const chancesInProgress = [];
    const chancesWon = [];

    for (const patient of patients) {
      const birthDate = parseISO(patient.birthDate);
      const birthDay = birthDate.getDate();
      const birthMonth = birthDate.getMonth();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth();

      let status = 'won'

      if (birthDay === todayDay && birthMonth === todayMonth) {
        status = 'opened'
      } else if (birthMonth === todayMonth) {
        status = 'in_progress'
      }

      const chance = new Chance(
        patient.name,
        'Aniversariante',
        'birthday',
        status
      )

      chance.id = patient.id
      chance.amount = 0
      chance.quantity = 1
      chance.author = ''
      chance.phone = patient.cellPhone
      chance.createdAt = new Date(patient.created_at)
      chance.date = patient.birthDate
      chance.observationCRC = patient.observationCRC
      chance.history = []
      chance.payment = null

      if (status === 'opened') {
        chancesOpened.push(chance);
      } else if (status === 'in_progress') {
        chancesInProgress.push(chance);
      } else {
        chancesWon.push(chance);
      }
    }

    chancesOpened.sort((a, b) => {
      const dateA = a.date ? parseISO(a.date) : new Date(0);
      const dateB = b.date ? parseISO(b.date) : new Date(0);
      const monthA = dateA.getMonth();
      const dayA = dateA.getDate();
      const monthB = dateB.getMonth();
      const dayB = dateB.getDate();
      if (monthA !== monthB) return monthA - monthB;
      if (dayA !== dayB) return dayA - dayB;
      
return a.title.localeCompare(b.title);
    });

    chancesInProgress.sort((a, b) => {
      const dateA = a.date ? parseISO(a.date) : new Date(0);
      const dateB = b.date ? parseISO(b.date) : new Date(0);
      const monthA = dateA.getMonth();
      const dayA = dateA.getDate();
      const monthB = dateB.getMonth();
      const dayB = dateB.getDate();
      if (monthA !== monthB) return monthA - monthB;
      if (dayA !== dayB) return dayA - dayB;
      
return a.title.localeCompare(b.title);
    });

    chancesWon.sort((a, b) => {
      const nameComparison = a.title.localeCompare(b.title);
      if (nameComparison !== 0) return nameComparison;

      const dateA = a.date ? parseISO(a.date) : new Date(0);
      const dateB = b.date ? parseISO(b.date) : new Date(0);
      const monthA = dateA.getMonth();
      const dayA = dateA.getDate();
      const monthB = dateB.getMonth();
      const dayB = dateB.getDate();
      if (monthA !== monthB) return monthA - monthB;
      
return dayA - dayB;
    });

    const sortedChances = [...chancesOpened, ...chancesInProgress, ...chancesWon];

    setChances(sortedChances);
  } catch (error) {
    console.error('Erro ao buscar aniversariantes:', error)
  }
}


  useEffect(() => {
    fetchData()
  }, [])

  return (
    <birthdayContext.Provider
      value={{
        showCadSales,
        setShowCadSales,
        saveChance,
        chances,
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
      <MainShedule fetchData={fetchData} />
    </birthdayContext.Provider>
  )
}
