import { useEffect, useState, MouseEvent, SyntheticEvent, ReactNode } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import YouTubeIcon from '@mui/icons-material/YouTube'
import Vimeo from '@u-wave/react-vimeo'
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef, MuiEvent } from '@mui/x-data-grid'
import { DatePicker } from '@mui/x-date-pickers'

import { ptBR } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'

import OptionsMenu from 'src/@core/components/option-menu'
import { PacientDebitDataType } from 'src/types/apps/userTypes'
import { ThemeColor } from 'src/@core/layouts/types'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import PaymentDialog from 'src/views/components/PaymentDialog'
import FinancialReportDialog from 'src/views/components/FinancialReportDialog'

// import ExpenseModal from './expenses'
// import RevenuesModal from './revenues'

// import categoriasData from './categoria.json'
import api from 'src/@core/components/api-client'
import dayjs, { utc } from 'dayjs'
import axios from 'axios'
import { uniqueId } from 'lodash'

import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { ExpenseData } from 'src/types/apps/financialTypes'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import AddFinancialDialog from 'src/views/components/AddFinancialDialog'
import { clearNumber } from 'src/@core/utils/format'
import AddTaxesDialog from 'src/views/components/AddTaxesDialog'
import moment from 'moment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

// import CashModal from './cash'
import ModalBudget from 'src/components/ModalBudget'
import { CellType, statusObj, TypeEnum } from 'src/pages/financial'
import ExpenseModal from 'src/pages/financial/expenses'

const categoriasData = [
  { id: '1', desc: 'Entrada' },
  { id: '2', desc: 'Saída' }
]

export const AccountsPayable = () => {
  const [dataDebits, setDataDebits] = useState<PacientDebitDataType[]>([])
  const [dataDebitsFiltered, setDataDebitsFiltered] = useState<any>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any | null>(null)
  const [caixasData, setCaixasData] = useState([])
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [selectedRowDebits, setSelectedRowDebits] = useState<any>(null)
  const [selectedFilterDate, setSelectedFilterDate] = useState<dayjs.Dayjs | null>(null)
  const [filterDueStart, setFilterDueStart] = useState<dayjs.Dayjs | null>(null)
  const [filterDueEnd, setFilterDueEnd] = useState<dayjs.Dayjs | null>(null)

  const [filterPayStart, setFilterPayStart] = useState<dayjs.Dayjs | null>(null)
  const [filterPayEnd, setFilterPayEnd] = useState<dayjs.Dayjs | null>(null)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const [deleteAction, setDeleteAction] = useState<() => Promise<void> | void>(() => () => {})
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)

  // Método para abrir o diálogo
  const handleOpenDialog = (row: PacientDebitDataType) => {
    setSelectedRow(row)
    setOpenDialog(true)
  }

  const handleRowClick = (params: any, event: MuiEvent<React.MouseEvent>) => {
    const target = event.target as HTMLElement
    const tag = target.tagName.toLowerCase()

    if (
      tag === 'button' ||
      tag === 'svg' ||
      tag === 'path' ||
      target.closest('[role="menu"]') ||
      target.closest('[aria-haspopup="menu"]')
    ) {
      return
    }

    const rowData = params.row

    if (rowData.type === 'E' && !rowData.entityId) {
      setExpenseModalOpen(true)
      setSelectedRowDebits(rowData)

      return
    }

    const entityId = params.row.entityId

    if (!entityId) {
      return
    }

    setSelectedRowDebits({ id: entityId })
    setOpenModal(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const receber = dataDebits
    .filter((d: any) => d.type === 'R' && !d.isPaid)
    .reduce((a: number, c: any) => parseFloat(c.value) + a, 0)

  const fetchData = async () => {
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    const isAdmin = userData?.isAdmin === true

    const { data } = await api.get('/transactions/payable')

    const filteredData = isAdmin ? data : data.filter((item: any) => item.type === 'R')

    setDataDebits(
      filteredData.map((item: any) => ({
        ...item,
        status: item.isPaid ? 'P' : 'O',
        date: dayjs(item.referenceDate || item.created_at).format('DD/MM/YYYY')
      }))
    )

    setDataDebitsFiltered(
      filteredData.map((item: any) => ({
        ...item,
        status: item.isPaid ? 'P' : 'O',
        date: dayjs(item.referenceDate || item.created_at).format('DD/MM/YYYY')
      }))
    )
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEmitRecibo = async (documentId: string, transactionId: string) => {
    if (documentId) {
      const { data } = await api.get(`/contracts-signature/docId/${documentId}`)

      if (data) {
        window.open(`/debt/print/${transactionId}`, '_blank')

        return
      }

      await api.post('/contracts-signature', {
        documentType: 'recibo',
        documentId: documentId
      })

      fetchData()
      window.open(`/debt/print/${transactionId}`, '_blank')
    } else {
      console.log('Nenhum documentId retornado da criação da recibo')
    }
  }

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
        itemDueDate.setUTCHours(0, 0, 0, 0) // ✅ zera no UTC

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

    if (selectedCard) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      filtered = filtered.filter((item: any) => {
        const dueDate = new Date(item.dueDate)
        dueDate.setHours(0, 0, 0, 0)

        if (selectedCard === 'vencidos') {
          return item.status === 'O' && dueDate < today
        }
        if (selectedCard === 'hoje') {
          return item.status === 'O' && dueDate.getTime() === today.getTime()
        }
        if (selectedCard === 'avencer') {
          return item.status === 'O' && dueDate > today
        }
        if (selectedCard === 'pagos') {
          return item.status === 'P'
        }

        return true
      })
    }

    setDataDebitsFiltered(filtered)
  }, [dataDebits, selectedFilterDate, filterDueStart, filterDueEnd, filterPayStart, filterPayEnd, selectedCard])

  async function handleDeleteRevenueOrExpenses(id: string) {
    const res = await api.delete(`/transactions/${id}`)
    if (res.status === 200) {
      fetchData()
    }
  }

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false)
    setSelectedRowDebits(null)
  }

  async function handleRealDeleteBudget(id: string) {
    const res = await api.delete(`/budgets/${id}`)
    if (res.status === 200) {
      fetchData()
    }
  }

  const saveTransaction = async (data: ExpenseData) => {
    console.log('Saving transaction data:', data)

    if (data.id) {
      await api.patch(`/transactions/${data.id}`, data)
    } else {
      await api.post('/transactions', data)
    }

    setExpenseModalOpen(false)

    fetchData()
  }

  const RED_LIGHT_DEGRADE = 'linear-gradient(to top, #f3c8d1ff 0%, #ffffff 100%)'
  const ORANGE_LIGHT_DEGRADE = 'linear-gradient(to top, #f3e9c6ff 0%, #ffffff 100%)'
  const GREEN_LIGHT_DEGRADE = 'linear-gradient(to top, #bcfcd6ff 0%, #ffffff 100%)'
  const BLUE_LIGHT_DEGRADE = 'linear-gradient(to top, #d4e8f7ff  0%, #ffffff 100%)'

  const HOVER_BASE_STYLE = {
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
    }
  }

  const columns: GridColDef[] = [
    {
      flex: 0.15,
      minWidth: 120,
      headerName: 'Data Vencimento',
      field: 'dueDate',
      renderCell: ({ row }: CellType) => {
        let formattedDate = ''

        if (row.dueDate) {
          const isoString = typeof row.dueDate === 'string' ? row.dueDate : row.dueDate.toISOString()

          const [year, month, day] = isoString.split('T')[0].split('-')
          formattedDate = `${day}/${month}/${year}`
        }

        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {formattedDate}
          </Typography>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 120,
      headerName: 'Data Pagamento',
      field: 'date payment',
      renderCell: ({ row }: CellType) => {
        const paymentDate = row?.paymentDate
          ? new Date(row?.paymentDate).toISOString().split('T')[0].split('-').reverse().join('/')
          : null

        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {paymentDate}
          </Typography>
        )
      }
    },

    {
      flex: 0.34,
      minWidth: 140,
      headerName: 'Nome',
      field: 'description',
      renderCell: ({ row }: CellType) => {
        return (
          <Tooltip title={row.description} arrow placement='top'>
            <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
              {row.description}
            </Typography>
          </Tooltip>
        )
      }
    },

    {
      flex: 0.15,
      minWidth: 100,
      headerName: 'valor',
      field: 'Valor',
      renderCell: ({ row }: any) => {
        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {Number(row.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Typography>
        )
      }
    },

    {
      flex: 0.15,
      minWidth: 100,
      headerName: 'Método',
      field: 'Método',
      renderCell: ({ row }: any) => {
        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {row.paymentMethod ? row.paymentMethod : ''}
          </Typography>
        )
      }
    },

    {
      width: 150,
      field: 'type',
      headerName: 'Tipo',
      renderCell: ({ row }: CellType) => (
        <>
          {row.type == TypeEnum.expense && (
            <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize', color: '#ff1744' }}>
              Despesa
            </Typography>
          )}
          {row.type == TypeEnum.revenue && (
            <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize', color: '#00e676' }}>
              Receita
            </Typography>
          )}
        </>
      )
    },

    {
      width: 150,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }: CellType) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayYMD = today.toISOString().slice(0, 10)

        const dueDateYMD = row.dueDate ? new Date(row.dueDate).toISOString().slice(0, 10) : null

        const isOverdue = dueDateYMD !== null && dueDateYMD < todayYMD && row.status !== 'P'

        const label = isOverdue ? 'Vencida' : statusObj[row.status]?.label
        const color = isOverdue ? 'error' : statusObj[row.status]?.color

        return (
          <CustomChip
            size='small'
            label={label}
            color={color}
            sx={{
              textTransform: 'capitalize',
              '& .MuiChip-label': { px: 2.5, lineHeight: 1.385 }
            }}
          />
        )
      }
    },

    {
      flex: 0.1,
      minWidth: 200,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', marginRight: 1 }}>
            {row.status !== 'P' ? (
              <Box sx={{ display: 'flex', marginRight: 1 }}>
                <Button
                  color='secondary'
                  variant='outlined'
                  onClick={event => {
                    event.stopPropagation()
                    handleOpenDialog(row)
                  }}
                >
                  {row.type === TypeEnum.revenue ? 'RECEBER' : 'PAGAR'}
                </Button>
              </Box>
            ) : (
              <Box>
                <Button
                  color='secondary'
                  variant='outlined'
                  onClick={() => handleOpenDialog(row)}
                  disabled
                  sx={{
                    opacity: 1,
                    color: theme => theme.palette.secondary.light + ' !important',
                    borderColor: theme => theme.palette.secondary.light + ' !important',
                    cursor: 'default '
                  }}
                >
                  {row?.paymentType}
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ marginLeft: 'auto' }}>
            <OptionsMenu
              iconProps={{ fontSize: 20 }}
              iconButtonProps={{
                size: 'small',
                onMouseDown: event => {
                  event.stopPropagation()
                  event.nativeEvent.stopImmediatePropagation()
                }
              }}
              menuProps={{
                sx: { '& .MuiMenuItem-root svg': { mr: 2 } }
              }}
              options={[
                ...(row.type === TypeEnum.revenue && row.entityId
                  ? [
                      {
                        text: row.status === 'P' ? 'Emitir recibo' : 'Receber',
                        onClick:
                          row.status === 'P'
                            ? () => handleEmitRecibo(row.entityId, row.id)
                            : () => handleOpenDialog(row)
                      },
                      {
                        text: 'Deletar Orçamento',
                        menuItemProps: {
                          onClick: (event: React.MouseEvent) => {
                            event.stopPropagation()
                            event.nativeEvent.stopImmediatePropagation()
                            setDeleteAction(() => () => handleRealDeleteBudget(row.entityId))
                            setOpenConfirmDelete(true)
                          }
                        }
                      }
                    ]
                  : [
                      {
                        text: row.type === TypeEnum.expense ? 'Apagar despesa' : 'Deletar receita',
                        menuItemProps: {
                          onClick: (event: React.MouseEvent) => {
                            event.stopPropagation()
                            event.nativeEvent.stopImmediatePropagation()
                            setDeleteAction(() => () => handleDeleteRevenueOrExpenses(row.id))
                            setOpenConfirmDelete(true)
                          }
                        }
                      }
                    ])
              ]}
            />
          </Box>
        </Box>
      )
    }
  ]

  return (
    <>
      <Box sx={{ p: 0, pb: 3 }}>
        <Grid container spacing={2} justifyContent='space-between' alignItems='flex-start' flexWrap='wrap' mt={0}>
          <Grid item xs={12} sm={6} md={2}>
            <Box
              onClick={() => setSelectedCard(selectedCard === 'pagos' ? null : 'pagos')}
              sx={{
                p: 2,
                textAlign: 'left',
                cursor: 'pointer',
                borderBottom: selectedCard === 'pagos' ? '2px solid #03cc6b' : '1px solid #e0e0e0',

                //   boxShadow: selectedCard === 'avencer' ? '0 0 10px rgba(229,57,53,0.4)' : 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { boxShadow: '0 0 8px rgba(0,0,0,0.1)' }
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'left',
                  gap: 1
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#03cc6b' }} /> Pagos
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', mt: 1, color: '#03cc6b' }}>
                {Number(
                  dataDebits.reduce((acc: number, curr: any) => {
                    if (curr.status === 'P') {
                      return acc + Number(curr.value)
                    }

                    return acc
                  }, 0)
                ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Box
              onClick={() => setSelectedCard(selectedCard === 'hoje' ? null : 'hoje')}
              sx={{
                p: 2,
                textAlign: 'left',
                cursor: 'pointer',
                borderBottom: selectedCard === 'hoje' ? '2px solid #f9a825' : '1px solid #e0e0e0',

                boxShadow: selectedCard === 'hoje' ? '0 0 10px rgba(229,57,53,0.4)' : 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { boxShadow: '0 0 8px rgba(0,0,0,0.1)' }
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'left',
                  gap: 1
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f9a825' }} />
                Vencem hoje
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', mt: 1, color: '#f9a825' }}>
                {Number(
                  dataDebits.reduce((acc: number, curr: any) => {
                    if (curr.status === 'O') {
                      const dueDate = new Date(curr.dueDate)
                      dueDate.setHours(0, 0, 0, 0)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)

                      if (dueDate.getTime() === today.getTime()) return acc + Number(curr.value)
                    }

                    return acc
                  }, 0)
                ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Box
              onClick={() => setSelectedCard(selectedCard === 'avencer' ? null : 'avencer')}
              sx={{
                p: 2,
                textAlign: 'left',
                cursor: 'pointer',
                borderBottom: selectedCard === 'avencer' ? '2px solid #f9a825' : '1px solid #e0e0e0',

                //   boxShadow: selectedCard === 'avencer' ? '0 0 10px rgba(229,57,53,0.4)' : 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { boxShadow: '0 0 8px rgba(0,0,0,0.1)' }
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'left',
                  gap: 1
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f9a825' }} />A vencer
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', mt: 1, color: '#f9a825' }}>
                {Number(
                  dataDebits.reduce((acc: number, curr: any) => {
                    if (curr.status === 'O') {
                      const dueDate = new Date(curr.dueDate)
                      dueDate.setHours(0, 0, 0, 0)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)

                      if (dueDate > today) return acc + Number(curr.value)
                    }

                    return acc
                  }, 0)
                ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Box
              onClick={() => setSelectedCard(selectedCard === 'vencidos' ? null : 'vencidos')}
              sx={{
                p: 2,
                textAlign: 'left',
                cursor: 'pointer',
                borderBottom: selectedCard === 'vencidos' ? '2px solid #e53935' : '1px solid #e0e0e0',

                //   boxShadow: selectedCard === 'vencidos' ? '0 0 10px rgba(229,57,53,0.4)' : 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { boxShadow: '0 0 8px rgba(0,0,0,0.1)' }
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'left',
                  gap: 1
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#e53935' }} />
                Vencidos
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', mt: 1, color: '#e53935' }}>
                {Number(
                  dataDebits.reduce((acc: number, curr: any) => {
                    if (curr.status === 'O') {
                      const dueDate = new Date(curr.dueDate)
                      dueDate.setHours(0, 0, 0, 0)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)

                      if (dueDate < today) return acc + Number(curr.value)
                    }

                    return acc
                  }, 0)
                ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            </Box>
          </Grid>

          {/* <Grid item xs={12} sm={6} md={2}>
          <Box
            sx={{
              // background: '#f9f9f9',
              // borderRadius: 2,
              p: 2,
              textAlign: 'center'

              // boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#fdd835' }} />
              Receitas a Receber
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', mt: 1 }}>
              {Number(receber).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Typography>
          </Box>
        </Grid> */}

          <Grid item xs={12} sm={6} md={2}>
            <Box
              sx={{
                // background: '#f9f9f9',
                // borderRadius: 2,
                p: 2,
                textAlign: 'left'

                // boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'left',
                  gap: 1
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#1565c0' }} />
                Total do período
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', mt: 1 }}>
                {Number(
                  dataDebits.reduce((acc: number, curr: any) => {
                    return acc + Number(curr.value)
                  }, 0)
                ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems='center' marginTop={2}>
          <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
            <Grid item xs={6} sm={4} md={1.5}>
              <DatePicker
                label='Vencimento de'
                format='DD/MM/YYYY'
                sx={{ width: '100%' }}
                value={filterDueStart}
                onChange={newValue => setFilterDueStart(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={1.5}>
              <DatePicker
                label='Até'
                format='DD/MM/YYYY'
                sx={{ width: '100%' }}
                value={filterDueEnd}
                onChange={newValue => setFilterDueEnd(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={1.5}>
              <DatePicker
                label='Pagamento de'
                format='DD/MM/YYYY'
                sx={{ width: '100%' }}
                value={filterPayStart}
                onChange={newValue => setFilterPayStart(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={1.5}>
              <DatePicker
                label='Até'
                format='DD/MM/YYYY'
                sx={{ width: '100%' }}
                value={filterPayEnd}
                onChange={newValue => setFilterPayEnd(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={1.5}>
              <DatePicker
                label='Data de Criação'
                format='DD/MM/YYYY'
                sx={{ width: '100%' }}
                value={selectedFilterDate}
                onChange={newValue => setSelectedFilterDate(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>
          </LocalizationProvider>

          <Grid item xs={12} sm={12} md={4.5} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant='outlined'
              fullWidth
              sx={{ maxWidth: 200 }}
              onClick={() => {
                setSelectedFilterDate(null)
                setFilterDueStart(null)
                setFilterDueEnd(null)
                setFilterPayStart(null)
                setFilterPayEnd(null)
                setSelectedCard(null)
              }}
            >
              Limpar filtros
            </Button>
          </Grid>
        </Grid>
      </Box>

      <DataGrid
        autoHeight
        columns={columns}
        rows={dataDebitsFiltered}
        disableRowSelectionOnClick
        pageSizeOptions={[7, 10, 25, 50]}
        paginationModel={paginationModel}
        onRowClick={(params, event) => handleRowClick(params, event)}
        onPaginationModelChange={setPaginationModel}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          '& .MuiDataGrid-columnHeaders': { borderRadius: 0 },
          '& .MuiDataGrid-row:hover': { cursor: 'pointer' }
        }}
      />

      <ModalBudget
        open={openModal}
        setOpen={setOpenModal}
        budget={selectedRowDebits}

        // clearBudget={() => setSelectedRowDebits(null)}
      />

      <PaymentDialog
        id={selectedRow?.id || ''}
        transaction={selectedRow?.entityId}
        open={openDialog}
        onClose={handleCloseDialog}
        typeDialogTitle={selectedRow?.type}
        nome={selectedRow?.patient?.name || ''}
        codigo={'1' || ''}
        data={dayjs()?.format?.('DD/MM/YYYY') || ''}
        valor={selectedRow?.value}
        fetchData={fetchData}
        servico={selectedRow?.description || ''}
      />

      <ExpenseModal
        open={expenseModalOpen}
        handleClose={handleCloseExpenseModal}
        caixas={caixasData}
        categorias={categoriasData}
        formData={(selectedRowDebits as ExpenseData) || {}}
        handleSave={data => {
          const expenseData: any = { ...data, type: 'E' }
          saveTransaction(expenseData)
        }}
        handleSelectChange={() => {
          console.log('handleSelectChange')
        }}
      />

      <Dialog open={openConfirmDelete} onClose={() => setOpenConfirmDelete(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDelete(false)}>Cancelar</Button>
          <Button
            color='error'
            onClick={() => {
              deleteAction()
              setOpenConfirmDelete(false)
            }}
          >
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
