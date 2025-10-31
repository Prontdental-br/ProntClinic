import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chance, Status } from 'src/context/types'
import api from 'src/@core/components/api-client'
import returnsContext from './returnsContext'
import { isSameDay, isSameMonth, parseISO } from 'date-fns'
import MainShedule from './components/MainSchedule'
import { useRouter } from 'next/router'

export function Returns({
  periodo
}: {
  periodo: 'day' | 'week' | 'month' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
}) {
  const statuses: Array<Status> = [
    {
      name: 'opened',
      label: 'Retornos do dia',
      warning: 'Retornos do dia aparecerão aqui.'
    },
    {
      name: 'in_progress',
      label: 'Retornos do mês',
      warning: 'Retornos do mês aparecerão aqui.'
    },

    // {
    //   name: 'all',
    //   label: 'Retornos do ano',
    //   warning: 'Retornos do ano aparecerão aqui.'
    // },
    {
      name: 'won',
      label: 'Retornos agendados',
      warning: 'Retornos agendados aparecerão aqui.'
    },
    {
      name: 'lost',
      label: 'Retornos perdidos',
      warning: 'Retornos perdidos aparecerão aqui.'
    }
  ]

  const [chances, setChances] = useState<Array<Chance>>([])
  const [showCadSales, setShowCadSales] = useState(false)
  const [, updateState] = useState<object | null>()
  const forceUpdate = React.useCallback(() => updateState({}), [])
  const router = useRouter()

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

    let periodoParam: number | null = null

    if (router.query.periodo) {
      if (['day', 'month', 'year'].includes(String(router.query.periodo))) {
        switch (router.query.periodo) {
          case 'day':
            periodoParam = today.getMonth()
            break
          case 'month':
            periodoParam = today.getMonth()
            break
          case 'year':
            periodoParam = null
            break
        }
      } else {
        periodoParam = Number(router.query.periodo) - 1
      }
    } else {
      periodoParam = today.getMonth()
    }

    const statusCountMap: Record<'opened' | 'in_progress' | 'won' | 'lost' | 'all', number> = {
      opened: 0,
      in_progress: 0,
      all: 0,
      won: 0,
      lost: 0
    }

    try {
      const { data } = await api.get('/return-list', {
        params: { periodo: router.query.periodo }
      })

      data.forEach((item: any) => {
        const startDate = new Date(item.startDate)
        const returnDate = new Date(startDate)

        if (item.returnType === 'D') {
          returnDate.setDate(returnDate.getDate() + item.returnValue)
        } else if (item.returnType === 'M') {
          returnDate.setMonth(returnDate.getMonth() + item.returnValue)
        }

        let status: 'opened' | 'in_progress' | 'won' | 'lost' | 'all' = 'won'

        if (item.status === 'lost') {
          status = 'lost'
        } else if (item.status === 'confirmed') {
          status = 'won'
        } else {
          if (
            returnDate.getDate() === today.getDate() &&
            returnDate.getMonth() === today.getMonth() &&
            returnDate.getFullYear() === today.getFullYear()
          ) {
            status = 'opened' // Retorno do dia
          } else if (
            periodoParam !== null &&
            returnDate.getMonth() === periodoParam &&
            returnDate.getFullYear() === today.getFullYear()
          ) {
            status = 'in_progress' // Retorno do mês
          } else if (returnDate.getFullYear() === today.getFullYear()) {
            status = 'all' // Retorno do ano
          } else {
            status = 'won' // Agendados
          }
        }

        statusCountMap[status]++

        const chance = new Chance(
          item.patient?.name ?? 'Paciente não encontrado',
          item.treatment?.treatment?.name ?? 'Tratamento não encontrado',
          'opportunity',
          status
        )

        chance.id = item.id
        chance.amount = Number(item.treatment?.value ?? 0)
        chance.quantity = 1
        chance.author = ''
        chance.phone = item.patient?.cellPhone ?? ''
        chance.createdAt = new Date(item.created_at)
        chance.date = returnDate.toISOString()
        chance.history = []
        chance.payment = null

        chances.push(chance)
      })

      setChances(chances)
    } catch (error) {
      console.error('Erro ao buscar retornos:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [router.query.periodo])

  return (
    <returnsContext.Provider
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
    </returnsContext.Provider>
  )
}
