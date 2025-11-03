'use client'
import React, { useContext, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
} from '@mui/material'
import dayjs, { utc } from 'dayjs'
import { useRouter } from 'next/router'
import { useSettings } from 'src/@core/hooks/useSettings'
import { AuthContext } from 'src/context/AuthContext'
import { ModalConfirmRegistration } from 'src/views/components/ModalConfirmRegistration'
import { Cake, CalendarMonth } from '@mui/icons-material'
import LogisticsShipmentStatistics from 'src/views/apps/logistics/dashboard/LogisticsShipmentStatistics'
import StatusCards from 'src/views/apps/logistics/dashboard/StatusCards'
import api from 'src/@core/components/api-client'
import LogisticsDeliveryExceptions from 'src/views/apps/logistics/dashboard/LogisticsDeliveryExceptions'
import AnalyticsReceiptReport from 'src/views/dashboards/AnalyticsReceiptReport'
import AnalyticsCongratulations from 'src/views/dashboards/AnalyticsCongratulations'
import { DailyReport } from '../home'
import moment from 'moment'
import AnalyticsTotalPatients from 'src/views/dashboards/AnalyticsTotalPatients'
import ExternalLinks from 'src/views/apps/logistics/dashboard/ExternalLinks'
import InadimplenciaRadialBarChart from './../../views/apps/logistics/dashboard/InadimplenciaRadialBarChart';
import DespesasDonutChart from 'src/views/apps/logistics/dashboard/DespesasDonutChart'

type listFilterType =
  | 'none'
  | 'expense'
  | 'revenue'
  | 'paid'
  | 'year'
  | 'week'
  | 'month'
  | 'open'
  | 'daily'
  | 'revenue-month'
  | 'paid-month'
  | 'revenue-daily'
  | 'paid-daily'
  | 'overdue'
  | 'expense-paid'
  | 'expense-open'

type FinancialType = {
  id: string
  phone: string
  name: string
}

const Start = () => {
  const [openModalConfirmRegistration, setOpenModalConfirmRegistration] = useState<boolean>(false)

  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const router = useRouter()
  const { settings, saveSettings } = useSettings()
  const { user } = useContext(AuthContext)

  const [reportData, setReportData] = useState<null | DailyReport>(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ]
  const [reportsTypes, setReportsTypes] = useState(['Resumo Diário', 'Resumo Mês', 'Resumo Total', ...monthNames])
  const [selectedReportType, setSelectedReportType] = useState(reportsTypes[0])
  const handleReportTypeChange = (value: string) => {
    setSelectedReportType(value)
  }
  const [dataDebits, setdataDebits] = useState<any>([])

  const [listFilter, setListFilter] = useState<listFilterType>('none')

  const [dataDebitsFiltered, setDataDebitsFiltered] = useState<any>([])
  const [selectedFilterDate, setSelectedFilterDate] = useState<dayjs.Dayjs | null>(null)
  const [filterDueStart, setFilterDueStart] = useState<dayjs.Dayjs | null>(null)
  const [filterDueEnd, setFilterDueEnd] = useState<dayjs.Dayjs | null>(null)

  const [filterPayStart, setFilterPayStart] = useState<dayjs.Dayjs | null>(null)
  const [filterPayEnd, setFilterPayEnd] = useState<dayjs.Dayjs | null>(null)
  useEffect(() => {
    let filtered = [...dataDebits]

    if (selectedFilterDate) {
      const selectedDate = selectedFilterDate.toDate()
      const selectedYear = selectedDate.getFullYear()
      const selectedMonth = selectedDate.getMonth()
      const selectedDay = selectedDate.getDate()

      filtered = filtered.filter((item: any) => {
        const [day, month, year] = item.date.split('/').map(Number)
        const itemDate = new Date(year, month - 1, day)

        return (
          itemDate.getFullYear() === selectedYear &&
          itemDate.getMonth() === selectedMonth &&
          itemDate.getDate() === selectedDay
        )
      })
    }

    if (filterDueStart || filterDueEnd) {
      filtered = filtered.filter((item: any) => {
        if (!item.dueDate) return false

        const itemDueDate = new Date(item.dueDate)
        itemDueDate.setUTCHours(0, 0, 0, 0)

        const start = filterDueStart ? filterDueStart.toDate() : null
        const end = filterDueEnd ? filterDueEnd.toDate() : null

        if (start) {
          start.setUTCHours(0, 0, 0, 0)
          if (itemDueDate < start) return false
        }

        if (end) {
          end.setUTCHours(0, 0, 0, 0)
          if (itemDueDate > end) return false
        }

        return true
      })
    }

    if (filterPayStart || filterPayEnd) {
      filtered = filtered.filter((item: any) => {
        if (!item.paymentDate) return false

        const itemPayDate = new Date(item.paymentDate)
        const localDate = new Date(itemPayDate.getUTCFullYear(), itemPayDate.getUTCMonth(), itemPayDate.getUTCDate()) // remove o offset

        const start = filterPayStart ? new Date(filterPayStart.toDate().setHours(0, 0, 0, 0)) : null
        const end = filterPayEnd ? new Date(filterPayEnd.toDate().setHours(23, 59, 59, 999)) : null

        if (start && localDate < start) return false
        if (end && localDate > end) return false

        return true
      })
    }

    switch (listFilter) {
      case 'year': {
        const currentYear = new Date().getFullYear()
        filtered = filtered.filter((item: any) => {
          const [, , year] = item.date.split('/').map(Number)

          return year === currentYear
        })
        break
      }
      case 'month': {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        filtered = filtered.filter((item: any) => {
          const [day, month, year] = item.date.split('/').map(Number)
          const itemDate = new Date(year, month - 1, day)

          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
        })
        break
      }
      case 'week': {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        filtered = filtered.filter((item: any) => {
          const [day, month, year] = item.date.split('/').map(Number)
          const itemDate = new Date(year, month - 1, day)

          return itemDate >= startOfWeek && itemDate <= endOfWeek
        })
        break
      }
      case 'expense-paid':
        filtered = filtered.filter((item: any) => item.type === 'E' && item.isPaid)
        break

      case 'expense-open':
        filtered = filtered.filter((item: any) => item.type === 'E' && !item.isPaid)
        break
      case 'expense':
        filtered = filtered.filter((item: any) => item.type === 'E')
        break
      case 'revenue':
        filtered = filtered.filter((item: any) => item.type === 'R')
        break
      case 'paid':
        filtered = filtered.filter((item: any) => item.isPaid)
        break
      case 'open':
        filtered = filtered.filter((item: any) => !item.isPaid)
        break
      case 'daily': {
        filtered = filtered.filter((item: any) => {
          const isCreatedToday = item.date && dayjs(item.date, 'DD/MM/YYYY').isSame(dayjs(), 'day')

          const isPaidToday = item.isPaid && item.paymentDate && dayjs(item.paymentDate).isSame(dayjs(), 'day')

          return isCreatedToday || isPaidToday
        })
        break
      }
      case 'paid-daily': {
        const todayYMD = new Date().toISOString().slice(0, 10)

        filtered = filtered.filter((item: any) => {
          if (item.type !== 'R') return false

          const isSamePaymentDay = item.isPaid && item.paymentDate && dayjs(item.paymentDate).isSame(dayjs(), 'day')

          const isSameDueDay = item.dueDate && new Date(item.dueDate).toISOString().slice(0, 10) === todayYMD

          return isSamePaymentDay || isSameDueDay
        })

        break
      }
      case 'revenue-daily': {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        filtered = filtered.filter((item: any) => {
          const [day, month, year] = item.date.split('/').map(Number)
          const itemDate = new Date(year, month - 1, day)

          return item.type === 'R' && itemDate.getTime() === today.getTime()
        })
        break
      }
      case 'paid-month': {
        filtered = filtered.filter((item: any) => {
          return item.isPaid && item.paymentDate && dayjs(item.paymentDate).isSame(dayjs(), 'month')
        })
        break
      }
      case 'revenue-month': {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        filtered = filtered.filter((item: any) => {
          const [day, month, year] = item.date.split('/').map(Number)
          const itemDate = new Date(year, month - 1, day)

          return item.type === 'R' && itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
        })
        break
      }
      case 'overdue': {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        filtered = filtered.filter((item: any) => {
          if (!item.dueDate || item.status !== 'O') return false

          const dueDate = new Date(item.dueDate)
          dueDate.setHours(0, 0, 0, 0)

          return dueDate < today
        })

        break
      }
      case 'none':
      default:
        break
    }

    setDataDebitsFiltered(filtered)
  }, [listFilter, dataDebits, selectedFilterDate, filterDueStart, filterDueEnd, filterPayStart, filterPayEnd])

  const receber = dataDebitsFiltered
    .filter((d: any) => d.type === 'R' && !d.isPaid)
    .reduce((a: number, c: any) => parseFloat(c.value) + a, 0)

  const currentHour = new Date().getHours()

  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) {
      return 'Bom dia'
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Boa tarde'
    } else {
      return 'Boa noite'
    }
  }

  const handleCloseModalConfirmRegistration = () => {
    setOpenModalConfirmRegistration(false)
  }

  useEffect(() => {
    if (typeof user?.clinicId == 'undefined') {
      window.location.href = '/dados-cadastrais'
    } else {
      console.log('tem clinica')
    }

    if (!user?.professional && user?.clinicId) {
      setOpenModalConfirmRegistration(true)
    }
  }, [user])

  useEffect(() => {
    saveSettings({ ...settings, navCollapsed: true })
  }, [])

  let columns = 1
  if (isSm) columns = 2
  if (isMdUp) columns = 4

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professional = userData?.professional || null

  const isAdmin = professional?.isAdmin === true || !professional

  const [data, setData] = useState({
    agendados: 0,
    atendidos: 0,
    confirmados: 0,
    retornos: 0,
    desmarcados: 0,
    aniversariantes: 0
  })

  const [periodo, setPeriodo] = useState<
    'day' | 'week' | 'month' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
  >('day')

  const textPeriod: Record<string, string> = {
    day: 'para hoje',
    week: 'para a semana',
    month: 'para o mês',
    1: 'para Janeiro',
    2: 'para Fevereiro',
    3: 'para Março',
    4: 'para Abril',
    5: 'para Maio',
    6: 'para Junho',
    7: 'para Julho',
    8: 'para Agosto',
    9: 'para Setembro',
    10: 'para Outubro',
    11: 'para Novembro',
    12: 'para Dezembro'
  }

  const fetchData = async () => {
    try {
      const response = await api.get(`crc/start?range=${periodo}`)
      setData({
        agendados: response.data.scheduled,
        atendidos: response.data.attended,
        confirmados: response.data.confirmed,
        retornos: response.data.returns,
        desmarcados: response.data.canceled,
        aniversariantes: response.data.birthdays
      })
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [periodo])

  const handleDownloadReportFile = async (blobData: any, title: string) => {
    const url = window.URL.createObjectURL(new Blob([blobData]))

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${title}.xlsx`)
    document.body.appendChild(link)
    link.click()
    if (link.parentNode) {
      link.parentNode.removeChild(link)
    }
  }

  const handleDownloadReport = async () => {
    let params = {}
    let name = 'resumo-diario'
    if (selectedReportType === 'Resumo Mês') {
      const startDate = moment().startOf('month').startOf('day').toISOString()
      const endDate = moment().endOf('month').endOf('day').toISOString()
      name = 'resumo-mensal'
      params = { startDate, endDate }
    }
    if (selectedReportType === 'Resumo Total') {
      const startDate = moment('2010-03-13').startOf('day').toISOString()
      const endDate = moment().endOf('day').toISOString()
      name = 'resumo-total'
      params = { startDate, endDate }
    }

    if (monthNames.includes(selectedReportType)) {
      const monthIndex = monthNames.indexOf(selectedReportType) // 0 = Janeiro
      const startDate = moment().month(monthIndex).startOf('month').startOf('day').toISOString()
      const endDate = moment().month(monthIndex).endOf('month').endOf('day').toISOString()
      name = `resumo-${selectedReportType.toLowerCase()}`
      params = { startDate, endDate }
    }

    const { data } = await api.get('/reports/generate/download', {
      responseType: 'blob',
      params
    })
    handleDownloadReportFile(data, name)
  }

  const isAdminOrProfessional =
    (userData?.professional && userData?.professional?.isAdmin) ||
    (userData?.professional === null && userData.role === 'admin')
  const isReceptionist = userData?.professional?.specialty === 'recepcionista'

  const generateDailyReport = async () => {
    setGeneratingReport(true)
    let params = {}
    if (selectedReportType === 'Resumo Mês') {
      const startDate = moment().startOf('month').startOf('day').toISOString()
      const endDate = moment().endOf('month').endOf('day').toISOString()
      params = { startDate, endDate }
    }
    if (selectedReportType === 'Resumo Total') {
      const startDate = moment('2010-03-13').startOf('day').toISOString()
      const endDate = moment().endOf('day').toISOString()
      params = { startDate, endDate }
    }

    if (monthNames.includes(selectedReportType)) {
      const monthIndex = monthNames.indexOf(selectedReportType)
      const startDate = moment().month(monthIndex).startOf('month').startOf('day').toISOString()
      const endDate = moment().month(monthIndex).endOf('month').endOf('day').toISOString()
      params = { startDate, endDate }
    }

    const { data } = await api.get(`reports/generate`, { params })
    setReportData(data)
    setTimeout(() => {
      setGeneratingReport(false)
    }, 4000)
  }

  const [openModal, setOpenModal] = useState(false)

  const handleClose = () => {
    setOpenModal(false)
  }

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 1
    }
  }

  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('month')

  const loadTransactions = async () => {
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    const isAdmin = userData?.isAdmin === true

    const { data } = await api.get('/transactions')

    const filteredData = isAdmin ? data : data.filter((item: any) => item.type === 'R')

    setdataDebits(
      filteredData.map((item: any) => ({
        ...item,
        status: item.isPaid ? 'P' : 'O',
        date: dayjs(item.referenceDate || item.created_at).format('DD/MM/YYYY')
      }))
    )
  }

  useEffect(() => {
    loadTransactions()
  }, [period])
  const professionalName = userData.professional?.name ? userData.professional?.name : null

  return (
    <>
      <Box p={2}>
        <Box>
          <Typography sx={{ fontSize: 26 }}>
            <strong style={{ color: '#8B18BB' }}> Olá, {professionalName}!</strong> {getGreeting()}
          </Typography>
          <Typography sx={{ fontSize: 17 }} color='text.secondary'>
            <span style={{ opacity: 0.5 }}>|</span>
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5} md={2.4}>
            <Card
              onClick={() => router.push('/calendar')}
              sx={{
                borderTop: '15px solid #911BC4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911BC4'>
                  Agendados
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911BC4'>
                  {data.agendados}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>
                <CalendarMonth
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911BC4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <Card
              onClick={() => router.push('/calendar')}
              sx={{
                borderTop: '15px solid #911BC4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911BC4'>
                  Atendidos
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911BC4'>
                  {data.atendidos}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>
                <CalendarMonth
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911BC4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <Card
              onClick={() => router.push('/calendar')}
              sx={{
                borderTop: '15px solid #911BC4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911BC4'>
                  Confirmados
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911BC4'>
                  {data.confirmados}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>
                <CalendarMonth
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911BC4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <Card
              onClick={() => router.push('/calendar')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderTop: '15px solid #911bc4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911bc4'>
                  Desmarcados
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911bc4'>
                  {data.desmarcados}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>

                {/* Ícone com classe para aplicar shake */}
                <CalendarMonth
                  fontSize='large'
                  className='icon-shake'
                  sx={{
                    color: '#911bc4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    transition: 'transform 0.2s ease-in-out'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <Card
              onClick={() => router.push(`/crc?section=retornos&periodo=${periodo}`)}
              sx={{
                borderTop: '15px solid #911BC4',
                borderRadius: 1,
                cursor: 'pointer',
                height: '100%',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911BC4'>
                  Retornos
                </Typography>

                <Typography variant='h3' fontWeight='bold' color='#911BC4'>
                  {data.retornos}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>

                <FormControl
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    minWidth: 100
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <InputLabel>Período</InputLabel>
                  <Select value={periodo} label='Período' onChange={e => setPeriodo(e.target.value as any)}>
                    <MenuItem value='day'>Hoje</MenuItem>
                    <MenuItem value='week'>Semana</MenuItem>
                    <MenuItem value='month'>Mês</MenuItem>
                    <MenuItem value='1'>Janeiro</MenuItem>
                    <MenuItem value='2'>Fevereiro</MenuItem>
                    <MenuItem value='3'>Março</MenuItem>
                    <MenuItem value='4'>Abril</MenuItem>
                    <MenuItem value='5'>Maio</MenuItem>
                    <MenuItem value='6'>Junho</MenuItem>
                    <MenuItem value='7'>Julho</MenuItem>
                    <MenuItem value='8'>Agosto</MenuItem>
                    <MenuItem value='9'>Setembro</MenuItem>
                    <MenuItem value='10'>Outubro</MenuItem>
                    <MenuItem value='11'>Novembro</MenuItem>
                    <MenuItem value='12'>Dezembro</MenuItem>
                    <MenuItem value='12'>Dezembro</MenuItem>
                    <MenuItem value='12'>Dezembro</MenuItem>
                  </Select>
                </FormControl>

                <CalendarMonth
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911BC4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {userData?.planType !== 'E' && isAdmin && (
            <>
              <Grid item xs={12} md={9.6}>
                <LogisticsShipmentStatistics />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={4} md={2.4}> 
            <Card
              onClick={() => router.push('/crc?section=aniversariantes')} 
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderTop: '15px solid #911bc4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911bc4'>
                  Aniversariantes
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911bc4'>
                  {data.aniversariantes}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>
                <Cake
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911bc4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {userData?.planType !== 'E' && isAdmin && (
            <>
              <Grid item xs={12} md={9.6}>
                <AnalyticsReceiptReport />
              </Grid>
            </>
          )}

          <Grid item xs={12} md={2.4}>
            <LogisticsDeliveryExceptions />
          </Grid>
        </Grid>
      </Box>

      {userData?.planType !== 'E' && isAdmin && <StatusCards />}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <AnalyticsCongratulations
            generateReport={generateDailyReport}
            reportsTypes={reportsTypes}
            changeSelectedReportType={handleReportTypeChange}
            selectedReportType={selectedReportType}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <AnalyticsTotalPatients
            selectedReportType={selectedReportType}
            generatingReport={generatingReport}
            reportData={reportData}
            generateReport={handleDownloadReport}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {userData?.planType !== 'E' && isAdmin && (
          <>
            <Grid container spacing={4} sx={{ mt: 0 }}>
              <Grid item xs={12} md={4}>
                <ExternalLinks />
              </Grid>

              <Grid item xs={12} md={4}>
                <InadimplenciaRadialBarChart dataDebitsFiltered={dataDebitsFiltered} />
              </Grid>

              <Grid item xs={12} md={4}>
                <DespesasDonutChart dataDebitsFiltered={dataDebitsFiltered} />
              </Grid>
            </Grid>
          </>
        )}




        {/* <Grid container spacing={2} sx={{mt:2}}>
        <Grid item xs={12} sm={12} md={9.6}>
                          <AnalyticsBudgetReport />
                          </Grid> */}
      </Grid>

      <ModalConfirmRegistration open={openModalConfirmRegistration} onClose={handleCloseModalConfirmRegistration} />
    </>
  )
}

Start.aclAbilities = { action: 'read', subject: 'start' }

// Start.requiredRole = 'admin'

// Start.requiredPlan = 'E'
export default Start

