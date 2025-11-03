// DÉBITOS

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
import ExpenseModal from './expenses'
import RevenuesModal from './revenues'

import categoriasData from './categoria.json'
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
import CashModal from './cash'
import ModalBudget from 'src/components/ModalBudget'
import { AccountsPayable } from 'src/views/components/AccountsPayable'
import { AccountsReceivable } from 'src/views/components/AccountsReceivable'
import { format } from 'date-fns'
import { ptBR as ptBRLOCALE } from 'date-fns/locale'
import DespesasDonutChart from 'src/views/apps/logistics/dashboard/DespesasDonutChart'

interface Props {
  debitsData: PacientDebitDataType[]
}
export interface CellType {
  row: PacientDebitDataType
}

interface ReportCellType {
  row: reportType
}

interface StatusObj {
  [key: string]: {
    color: ThemeColor
    label: string
  }
}

export const statusObj: StatusObj = {
  A: { color: 'warning', label: 'Aberto' },
  O: { color: 'warning', label: 'Aberto' },
  R: { color: 'error', label: 'Rejeitado' },
  P: { color: 'success', label: 'Pago' }
}

export enum TypeEnum {
  revenue = 'R',
  expense = 'E'
}

export type transactionTypeFilterType =
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

export type periodtype = 'month' | 'week' | 'year'

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

type reportType = {
  id: string
  name: string
  description: string
  period: periodtype
  startDate: string
  endDate: string
  total: number
  financial: FinancialType | null
  transactionType: 'revenue' | 'expense'
  created_at: string
  updated_at: string
  accountId: string
}

const Financial = () => {
  const [caixasData, setCaixasData] = useState([])
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [openDialog, setOpenDialog] = useState(false)
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any | null>(null)
  const [dataDebits, setdataDebits] = useState<any>([])
  const [account, setAccount] = useState<any>()
  const [user, setUser] = useState<any>()
  const [total, setTotal] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [revenuesModalOpen, setRevenuesModalOpen] = useState(false)
  const [cashModalOpen, setCashModalOpen] = useState(false)

  const [tabValue, setTabValue] = useState<string>('1')

  const [periodFilter, setPeriodFilter] = useState<periodtype>()
  const [financialId, setFinancialId] = useState<string>()
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<transactionTypeFilterType>()

  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reports, setReports] = useState<reportType[]>([])

  const [listFilter, setListFilter] = useState<listFilterType>('none')
  const [dataDebitsFiltered, setDataDebitsFiltered] = useState<any>([])

  const [selectedFilterDate, setSelectedFilterDate] = useState<dayjs.Dayjs | null>(null)
  const [filterDueStart, setFilterDueStart] = useState<dayjs.Dayjs | null>(null)
  const [filterDueEnd, setFilterDueEnd] = useState<dayjs.Dayjs | null>(null)

  const [filterPayStart, setFilterPayStart] = useState<dayjs.Dayjs | null>(null)
  const [filterPayEnd, setFilterPayEnd] = useState<dayjs.Dayjs | null>(null)

  const [openMissingDocModal, setOpenMissingDocModal] = useState(false)

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}')

  const [openModalVideo, setOpenModalVideo] = useState(false)

  const toggleVideo = () => {
    setOpenModalVideo(true)
  }

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const [deleteAction, setDeleteAction] = useState<() => Promise<void> | void>(() => () => {})
  const [searchTerm, setSearchTerm] = useState('')

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

  useEffect(
    function () {
      console.log('transactions', dataDebits)
    },
    [dataDebits]
  )

  useEffect(() => {
    loadReports()
  }, [setReports])

  useEffect(() => {
    console.log('Reports', reports)
  }, [reports])

  const handleOpenExpenseModal = () => {
    setExpenseModalOpen(true)
    handleClose() // Isso fecha o menu
  }

  const handleOpenTaxModal = () => {
    setIsTaxModalOpen(true)
  }

  const handleCloseTaxModal = () => {
    setIsTaxModalOpen(false)
  }

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false)
    setSelectedRowDebits(null)
  }

  // Método para abrir o diálogo
  const handleOpenDialog = (row: PacientDebitDataType) => {
    setSelectedRow(row)
    setOpenDialog(true)
  }

  // Método para fechar o diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleOpenRevenuesModal = () => {
    setRevenuesModalOpen(true)
    handleClose() // Fecha o menu
  }

  const handleCloseRevenuesModal = () => {
    setRevenuesModalOpen(false)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCloseVideo = () => {
    setOpenModalVideo(false)
  }

  console.log(dataDebits)

  const fetchTotal = async () => {
    const { data } = await api.get('budgets/totalallopen')
    setTotal(data.total)
  }

  const closeFinancialDialog = () => {
    setIsFinancialDialogOpen(false)
  }

  const openDialogFinancialDialog = () => {
    setIsFinancialDialogOpen(true)
  }

  const fetchData = async () => {
    const resp = await api.get('/accounts/me')
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    console.log(userData)

    setAccount({ ...resp.data })
    setUser(userData)

    // const res = await api.get(`budgets`);
    // let data = res.data;
    // data = data.map((d:any)=>Object.assign({...d, budgetId: d.id, id: uniqueId()}))
    // setdataDebits(data);
    loadTransactions()
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

  const createSubaccount = async () => {
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')

    const res = await api.get('/clinics')
    const clinic = await res.data

    const requiredFields = {
      phone: account.cellPhone,
      address: clinic?.street,
      addressNumber: clinic?.addressNumber,
      province: clinic?.state,
      postalCode: clinic?.cep?.replaceAll('.', '').replaceAll('-', ''),
      cpfCnpj: clinic?.docNumber?.replaceAll('.', '').replaceAll('-', '')

      // birthDate: clinic.clinic?.birthday,
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingFields.length > 0) {
      setOpenMissingDocModal(true)

      return
    }

    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/subaccount`, {
      email: userData.email,
      accountId: userData.accountId,
      billingType: 'CREDIT_CARD'
    })
    console.log(data)
    const { invoiceUrl } = data
    window.open(invoiceUrl)
  }

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

  const saveTransaction = async (data: ExpenseData) => {
    console.log('Saving transaction data:', data)

    if (data.id) {
      await api.patch(`/transactions/${data.id}`, data)
    } else {
      await api.post('/transactions', data)
    }

    setExpenseModalOpen(false)
    loadTransactions()
  }

  useEffect(() => {
    fetchTotal()

    fetchData()
  }, [])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  async function handleRealDeleteBudget(id: string) {
    const res = await api.delete(`/budgets/${id}`)
    if (res.status === 200) {
      fetchData()
    }
  }

  async function handleDeleteRevenueOrExpenses(id: string) {
    const res = await api.delete(`/transactions/${id}`)
    if (res.status === 200) {
      fetchData()
    }
  }

  const expenseOptions = (row: PacientDebitDataType) => [
    {
      text: 'Apagar despesa'
    }
  ]

  const revenueOptions = (row: any) => [
    /*{
      text: 'Gerar Boleto',
      icon: <Icon icon='mdi:cash-sync' fontSize={20} />
    },
    {
      text: 'Conversar no WhatsApp',
      icon: <Icon icon='mdi:whatsapp' fontSize={20} />
    },
    {
      text: 'Duplicar orçamento',
      icon: <Icon icon='mdi:content-copy' fontSize={20} />
    },*/
    {
      text: row.status === 'P' ? 'Emitir recibo' : 'Receber',
      href: row.status === 'P' ? `/debt/print/${row?.entityId}` : undefined,
      onClick: row.status === 'P' ? undefined : () => handleOpenDialog(row)
    }

    // {
    //   text: 'Deletar orçamento',
    //   menuItemProps: {
    //     onClick: () => handleRealDeleteBudget(row.budgetId)
    //   }
    // },

    /*{
      text: 'Excluir orçamento',
      icon: <Icon icon='mdi:delete-outline' fontSize={20} />
    }*/
  ]

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

  const handleDownloadReport = async (id: string) => {
    const { data } = await api.get('/reports/download/' + id, {
      responseType: 'blob'
    })
    handleDownloadReportFile(data, `Relatório ${id}`)
  }

  const handleDeleteReport = async (id: string) => {
    const res = await api.delete(`/reports/${id}`)

    if (res.status === 200) {
      loadReports()
    }
  }

  const reportColumns: GridColDef[] = [
    {
      width: 400,
      headerName: 'Data',
      field: 'startDate',
      renderCell: ({ row }: ReportCellType) => (
        <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
          {new Date(row.startDate).toLocaleDateString()} a {new Date(row.endDate).toLocaleDateString()}{' '}
          {new Date(row.endDate).toLocaleTimeString()}
        </Typography>
      )
    },
    {
      flex: 1,
      minWidth: 350,
      headerName: 'Nome',
      field: 'name'
    },
    {
      width: 200,
      headerName: 'Tipo',
      field: 'transactionType',
      renderCell: ({ row }: ReportCellType) => (
        <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
          {row.transactionType === 'revenue' ? 'Receitas' : 'Despesas'}
        </Typography>
      )
    },
    {
      width: 220,
      headerName: 'Total',
      field: 'total',
      renderCell: ({ row }: ReportCellType) => (
        <>
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {Number(row.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Typography>
          <Box sx={{ marginLeft: 'auto', marginRight: '0' }}>
            {row.financial && (
              <IconButton
                size='small'
                href={`https://wa.me/55${clearNumber(row.financial.phone)}?text=${encodeURI(
                  `Baixe o relatório aqui: ${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/download/${row.id}`
                )}`}
                target='_blank'
              >
                <Icon icon='mdi:whatsapp' fontSize={20} />
              </IconButton>
            )}
            <OptionsMenu
              iconProps={{ fontSize: 20 }}
              iconButtonProps={{ size: 'small' }}
              menuProps={{ sx: { '& .MuiMenuItem-root svg': { mr: 2 } } }}
              options={[
                {
                  text: 'Baixar planilha',
                  onClick: () => handleDownloadReport(row.id)
                },
                {
                  text: 'Deletar planilha',
                  onClick: () => handleDeleteReport(row.id)
                }
              ]}
            />
          </Box>
        </>
      )
    }
  ]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayYMD = today.toISOString().slice(0, 10)

  const dailyCash = dataDebits
    .filter(
      (d: any) =>
        d.type === 'R' &&
        ((d.isPaid && d.paymentDate && dayjs(d.paymentDate).isSame(dayjs(), 'day')) ||
          (d.dueDate && new Date(d.dueDate).toISOString().slice(0, 10) === todayYMD))
    )
    .reduce((a: number, c: any) => parseFloat(c.value) + a, 0)

  const dailyOpenCash = dataDebits
    .filter(
      (d: any) =>
        d.type === 'R' && !d.isPaid && d.dueDate && new Date(d.dueDate).toISOString().slice(0, 10) === todayYMD
    )
    .reduce((a: number, c: any) => parseFloat(c.value) + a, 0)

  const dailyPaidCash = dataDebits
    .filter((d: any) => d.type === 'R' && d.isPaid && d.paymentDate && dayjs(d.paymentDate).isSame(dayjs(), 'day'))
    .reduce((a: number, c: any) => parseFloat(c.value) + a, 0)

  const receita = dataDebits
    .filter((d: any) => d.type === 'R' && d.isPaid)
    .reduce((a: number, c: any) => parseFloat(c.value) + a, 0)
  const receber = dataDebitsFiltered
    .filter((d: any) => d.type === 'R' && !d.isPaid)
    .reduce((a: number, c: any) => parseFloat(c.value) + a, 0)

  useEffect(() => {
    const filtered = dataDebits.filter((item: any) =>
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setDataDebitsFiltered(filtered)
  }, [searchTerm, dataDebits])

  const handleTabChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  const generateReport = async () => {
    const body: any = {
      name: 'Relatório',
      description: ''
    }

    if (['week', 'year', 'month', 'daily'].includes(listFilter)) {
      body.period = listFilter
    }

    if (
      [
        'expense',
        'expense-paid',
        'expense-open',
        'revenue',
        'revenue-month',
        'revenue-daily',
        'paid',
        'paid-daily',
        'paid-month',
        'open',
        'overdue'
      ].includes(listFilter)
    ) {
      body.transactionType = listFilter
    }

    if (filterDueStart) body.dueStart = filterDueStart.toDate()
    if (filterDueEnd) body.dueEnd = filterDueEnd.toDate()

    if (filterPayStart) body.payStart = filterPayStart.toDate()
    if (filterPayEnd) body.payEnd = filterPayEnd.toDate()

    if (selectedFilterDate) body.createdStart = selectedFilterDate.toDate()

    if (
      !body.transactionType &&
      !body.period &&
      !filterDueStart &&
      !filterDueEnd &&
      !filterPayStart &&
      !filterPayEnd &&
      !selectedFilterDate
    ) {
      body.transactionType = 'all'
    }

    if (!body.period) {
      body.period = 'year'
    }

    const { data } = await api.post('/reports', body, {
      responseType: 'blob'
    })

    handleDownloadReportFile(data, `Relatório ${name}`)
  }

  const generateClosingReport = async () => {
    const todayFormatted = dayjs().format('DD-MM-YYYY')

    const body = {
      name: `Fechamento de Caixa - ${todayFormatted}`,
      description: 'Relatório contendo valores do caixa diário, abertos e pagos no dia',
      period: 'daily',
      transactionType: 'revenue'
    }

    try {
      const { data } = await api.post('/reports', body, {
        responseType: 'blob'
      })

      handleDownloadReportFile(data, `Fechamento de Caixa - ${todayFormatted}`)
    } catch (error) {
      console.error('Erro ao gerar relatório de fechamento de caixa:', error)
    }
  }

  const handleNewReport = async () => {
    setShowReportDialog(true)
  }

  const handleCreateReport = async (data: {
    name: string
    description: string
    period?: string
    transactionType?: string
    dueStart?: Date
    dueEnd?: Date
    payStart?: Date
    payEnd?: Date
    createdStart?: Date
  }) => {
    const body: any = {
      name: data.name,
      description: data.description
    }

    if (data.period) body.period = data.period
    if (data.transactionType) body.transactionType = data.transactionType

    if (data.dueStart) body.dueStart = data.dueStart
    if (data.dueEnd) body.dueEnd = data.dueEnd

    if (data.payStart) body.payStart = data.payStart
    if (data.payEnd) body.payEnd = data.payEnd

    if (data.createdStart) body.createdStart = data.createdStart

    if (
      !body.transactionType &&
      !body.period &&
      !data.dueStart &&
      !data.dueEnd &&
      !data.payStart &&
      !data.payEnd &&
      !data.createdStart
    ) {
      body.transactionType = 'all'
    }

    if (body.transactionType === 'week') {
      body.period = 'week'
    }

    if (!body.period) {
      body.period = 'year'
    }

    const { data: file } = await api.post('/reports', body, { responseType: 'blob' })

    handleDownloadReportFile(file, `Relatório ${data.name}`)

    loadReports()
    setShowReportDialog(false)
  }

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

  const loadReports = async () => {
    const { data } = await api.get('/reports')
    setReports(data)
  }

  const expenseFilters = [
    { value: 'expense', label: 'Despesas' },
    { value: 'expense-paid', label: 'Despesas Pagas' },
    { value: 'expense-open', label: 'Despesas em Aberto' }
  ]

  const revenueFilters = [
    { value: 'revenue', label: 'Receitas' },
    { value: 'revenue-month', label: 'Receitas mensal' },
    { value: 'revenue-daily', label: 'Receitas Diária' },
    { value: 'paid', label: 'Pagos' },
    { value: 'paid-month', label: 'Pagos mensal' },
    { value: 'year', label: 'Desse Ano' },
    { value: 'month', label: 'Desse mês' },
    { value: 'week', label: 'Dessa semana' },
    { value: 'open', label: 'Em aberto' },
    { value: 'daily', label: 'Diário' },
    { value: 'overdue', label: 'Vencidas' },
    { value: 'paid-daily', label: 'Caixa Diário' }
  ]

  const isAdmin = user?.isAdmin || user?.professional.isAdmin === true

  useEffect(() => {
    const allFilters = isAdmin ? [...expenseFilters, ...revenueFilters] : [...revenueFilters]

    const validValues = allFilters.map(f => f.value)

    if (!validValues.includes(listFilter)) {
      setListFilter('none')
    }
  }, [isAdmin])

  const handleOpenCash = () => {
    setCashModalOpen(true)
  }

  const handleCloseCashModal = () => {
    setCashModalOpen(false)
  }

  const handleCloseCash = async () => {
    // setCashModalOpen(false)
    // await loadTransactions()
  }

  const [openModal, setOpenModal] = useState(false)
  const [selectedRowDebits, setSelectedRowDebits] = useState<any>(null)

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

  const handleCloseModal = () => setOpenModal(false)

  const RED_DEGRADE = 'linear-gradient(to top, #f3c8d1ff 0%, #ffffff 100%)'
  const ORANGE_DEGRADE = 'linear-gradient(to top, #f3e9c6ff 0%, #ffffff 100%)'
  const GREEN_DEGRADE = 'linear-gradient(to top, #bcfcd6ff 0%, #ffffff 100%)'
  const YELLOW_DEGRADE = 'linear-gradient(to top, #f5f0bfff 0%, #ffffff 100%)'

  const HOVER_BASE_STYLE = {
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
    }
  }

  return (
    <Grid container spacing={6}>
      <Dialog open={openMissingDocModal} onClose={() => setOpenMissingDocModal(false)}>
        <DialogTitle>Atenção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para criar a subconta Asaas, é necessário preencher corretamente os dados da aba "Clínica", especialmente o
            número do documento (CPF ou CNPJ).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='error' onClick={() => setOpenMissingDocModal(false)} autoFocus>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Grid item xs={12}>
        <Card sx={{ p: 1.5 }}>
          {/* <CardHeader /> */}
          <CardContent
            sx={{
              position: 'relative',
              p: 1.5,
              pt: 0,
              pb: 1.5,
              '&:last-child': { pb: 1.5 }
            }}
          >
            <ApexChartWrapper>
              <Box display='flex' alignItems='center' gap={4} flexWrap='wrap'>
                <Box flex={1} minWidth={150}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                    Caixa Diário <Icon icon='mdi:trending-up' color='green' fontSize={16} />
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem', mt: 1 }}>
                    {Number(dailyCash).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Typography>
                  <LinearProgress
                    value={100}
                    color='success'
                    variant='determinate'
                    sx={{ height: 10, borderRadius: '5px', mt: 1 }}
                  />
                </Box>

                <Box flex={1} minWidth={150}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                    Caixa em Aberto <Icon icon='mdi:clock-outline' color='orange' fontSize={16} />
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem', mt: 1 }}>
                    {Number(dailyOpenCash).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Typography>
                  <LinearProgress
                    value={100}
                    color='warning'
                    variant='determinate'
                    sx={{ height: 10, borderRadius: '5px', mt: 1 }}
                  />
                </Box>

                <Box flex={1} minWidth={150}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                    Caixa Pagos <Icon icon='mdi:cash-check' color='blue' fontSize={16} />
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem', mt: 1 }}>
                    {Number(dailyPaidCash).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Typography>
                  <LinearProgress
                    value={100}
                    color='info'
                    variant='determinate'
                    sx={{ height: 10, borderRadius: '5px', mt: 1 }}
                  />
                </Box>
                {userData?.planType !== 'E' && (
                  <Box display='flex' flexDirection='column' alignItems='flex-end' minWidth={150}>
                    <Button
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'transparent !important',
                        fontFamily: 'Inter',
                        p: 0,
                        '&:hover': {
                          background: 'transparent !important'
                        }
                      }}
                      onClick={toggleVideo}
                      variant='text'
                      color='error'
                    >
                      <YouTubeIcon sx={{ mr: 0.5 }} fontSize='small' />
                      <Typography variant='caption' sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        VÍDEOS
                      </Typography>
                    </Button>

                    {!account?.asaasAccount && user?.isAdmin ? (
                      <Button variant='contained' onClick={createSubaccount} sx={{ mt: 1, height: 35 }}>
                        CRIAR SUBCONTA ASAAS
                      </Button>
                    ) : (
                      <Button variant='outlined' color='success' sx={{ mt: 1, height: 35 }}>
                        Subconta Asaas Ativo
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </ApexChartWrapper>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TabContext value={tabValue}>
              <Grid container spacing={2} alignItems='center'>
                <Grid item xs={12} md={true}>
                  <TabList
                    onChange={handleTabChange}
                    variant='scrollable'
                    scrollButtons='auto'
                    sx={{ width: '100%', flexGrow: 1 }}
                  >
                    <Tab value='1' label='Extrato' />
                    <Tab value='2' label='Contas a pagar' />
                    <Tab value='3' label='Contas a receber' />
                    <Tab value='4' label='Relatórios' />
                  </TabList>
                </Grid>

                <Grid item xs={12} md={'auto'}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      width: { xs: '100%', md: 'auto' },
                      justifyContent: { xs: 'center', sm: 'flex-end' }
                    }}
                  >
                    {tabValue === '1' && (
                      <Button
                        variant='contained'
                        onClick={generateReport}
                        sx={{ backgroundColor: '#147D5F', '&:hover': { backgroundColor: '#0f634b' } }}
                      >
                        GERAR RELATÓRIO
                      </Button>
                    )}

                    {tabValue === '4' && (
                      <>
                        <Button variant='contained' onClick={handleNewReport}>
                          Gerar relatório
                        </Button>
                        <Button variant='contained' color='primary' onClick={openDialogFinancialDialog}>
                          + Adicionar Contabilidade
                        </Button>
                      </>
                    )}

                    {tabValue === '1' && (
                      <>
                        <Button
                          variant='contained'
                          color='success'
                          onClick={handleOpenCash}
                          sx={{ backgroundColor: '#71E33E', '&:hover': { backgroundColor: '#5dbb33' } }}
                        >
                          ABRIR CAIXA
                        </Button>

                        <Button
                          variant='contained'
                          color='error'
                          onClick={() => {
                            generateClosingReport()
                          }}
                          sx={{ backgroundColor: '#FF5C5C', '&:hover': { backgroundColor: '#e04f4f' } }}
                        >
                          FECHAR CAIXA
                        </Button>
                      </>
                    )}

                    {tabValue !== '4' && (
                      <Button
                        variant='contained'
                        sx={{ backgroundColor: '#147D5F', '&:hover': { backgroundColor: '#0f634b' } }}
                        aria-haspopup='true'
                        onClick={handleClick}
                        aria-expanded={open ? 'true' : undefined}
                        endIcon={<Icon icon='mdi:chevron-down' />}
                        aria-controls={open ? 'financial-CardHeader-actions-buttons' : undefined}
                      >
                        + ADICIONAR
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
              <Menu open={open} anchorEl={anchorEl} onClose={handleClose} id='financial-CardHeader-actions-buttons'>
                {(tabValue === '2' || tabValue === '1' || tabValue === '4') && (
                  <MenuItem onClick={handleOpenExpenseModal}>
                    <Box sx={{ display: 'flex', marginRight: 1 }}>
                      <Icon icon='mdi:trending-down' color='red' />
                    </Box>
                    DESPESAS
                  </MenuItem>
                )}

                {(tabValue === '3' || tabValue === '1' || tabValue === '4') && (
                  <MenuItem onClick={handleOpenRevenuesModal}>
                    <Box sx={{ display: 'flex', marginRight: 1 }}>
                      <Icon icon='mdi:trending-up' color='green' />
                    </Box>
                    RECEITAS
                  </MenuItem>
                )}
              </Menu>
              <TabPanel value='1'>
                <Card style={{ boxShadow: 'none', padding: 0 }}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <ApexChartWrapper>
                          <Grid
                            container
                            spacing={2}
                            justifyContent='flex-start'
                            alignItems='flex-start'
                            flexWrap='wrap'
                          >
                            <Grid item xs={12} sm={4} md={3} lg={1.71}>
                              <Box sx={{ p: 1, textAlign: 'left' }}>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <Box
                                    sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#03cc6b' }}
                                  />
                                  Recebidas
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#03cc6b' }}>
                                  {Number(
                                    dataDebitsFiltered.reduce((acc: number, curr: any) => {
                                      if (curr.type === 'R' && curr.status === 'P') return acc + Number(curr.value)

                                      return acc
                                    }, 0)
                                  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3} lg={1.71}>
                              <Box sx={{ p: 1, textAlign: 'left' }}>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <Box
                                    sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#03cc6b' }}
                                  />
                                  Pagas
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#03cc6b' }}>
                                  {Number(
                                    dataDebitsFiltered.reduce((acc: number, curr: any) => {
                                      if (curr.type === 'E' && curr.status === 'P') return acc + Number(curr.value)

                                      return acc
                                    }, 0)
                                  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3} lg={1.71}>
                              <Box sx={{ p: 1, textAlign: 'left' }}>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <Box
                                    sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f9a825' }}
                                  />
                                  A Receber
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#f9a825' }}>
                                  {Number(receber).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3} lg={1.71}>
                              <Box sx={{ p: 1, textAlign: 'left' }}>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <Box
                                    sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f9a825' }}
                                  />
                                  A Pagar
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#f9a825' }}>
                                  {Number(
                                    dataDebitsFiltered.reduce((acc: number, curr: any) => {
                                      if (curr.type === 'E' && curr.status === 'O' && curr.dueDate) {
                                        const due = new Date(curr.dueDate)
                                        due.setHours(0, 0, 0, 0)

                                        const today = new Date()
                                        today.setHours(0, 0, 0, 0)

                                        if (due >= today) {
                                          return acc + Number(curr.value)
                                        }
                                      }

                                      return acc
                                    }, 0)
                                  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3} lg={1.71}>
                              <Box sx={{ p: 1, textAlign: 'left' }}>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <Box
                                    sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#e53935' }}
                                  />
                                  Vencidas Receber
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#e53935' }}>
                                  {Number(
                                    dataDebitsFiltered.reduce((acc: number, curr: any) => {
                                      if (curr.type === 'R' && curr.status === 'O' && curr.dueDate) {
                                        const due = new Date(curr.dueDate)

                                        const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
                                        const today = new Date()
                                        const todayStart = new Date(
                                          today.getFullYear(),
                                          today.getMonth(),
                                          today.getDate()
                                        )

                                        if (dueDay < todayStart) {
                                          return acc + Number(curr.value)
                                        }
                                      }

                                      return acc
                                    }, 0)
                                  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3} lg={1.71}>
                              <Box sx={{ p: 1, textAlign: 'left' }}>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <Box
                                    sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#e53935' }}
                                  />
                                  Vencidas Pagar
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#e53935' }}>
                                  {Number(
                                    dataDebitsFiltered.reduce((acc: number, curr: any) => {
                                      if (curr.type === 'E' && curr.status === 'O' && curr.dueDate) {
                                        const due = new Date(curr.dueDate)
                                        due.setHours(0, 0, 0, 0)

                                        const today = new Date()
                                        today.setHours(0, 0, 0, 0)

                                        if (due < today) {
                                          return acc + Number(curr.value)
                                        }
                                      }

                                      return acc
                                    }, 0)
                                  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3} lg={1.71}>
                              <Box sx={{ p: 1, textAlign: 'left' }}>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <Box
                                    sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#1565c0' }}
                                  />
                                  Total Geral
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                                  {dataDebitsFiltered
                                    .reduce((acc: number, curr: any) => {
                                      if (curr.type === 'R' && curr.status === 'P') return acc + Number(curr.value)
                                      if (curr.type === 'E' && curr.status === 'P') return acc - Number(curr.value)

                                      return acc
                                    }, 0)
                                    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </ApexChartWrapper>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Box sx={{ p: 3, pb: 0 }}>
                    <Grid container spacing={2} alignItems='center'>
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

                      <Grid item xs={6} sm={4} md={1.5}>
                        <FormControl fullWidth size='small'>
                          <InputLabel>Filtro</InputLabel>
                          <Select
                            value={listFilter}
                            label='Filtro'
                            onChange={(e: SelectChangeEvent) => setListFilter(e.target.value as listFilterType)}
                          >
                            <MenuItem value='none'>Nenhum</MenuItem>
                            {isAdmin &&
                              expenseFilters.map(filter => (
                                <MenuItem key={filter.value} value={filter.value}>
                                  {filter.label}
                                </MenuItem>
                              ))}
                            {revenueFilters.map(filter => (
                              <MenuItem key={filter.value} value={filter.value}>
                                {filter.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6} md={1.5}>
                        <TextField
                          fullWidth
                          size='small'
                          placeholder='Pesquisar por nome'
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant='outlined'
                          fullWidth
                          onClick={() => {
                            setSelectedFilterDate(null)
                            setFilterDueStart(null)
                            setFilterDueEnd(null)
                            setFilterPayStart(null)
                            setFilterPayEnd(null)
                          }}
                        >
                          LIMPAR FILTROS
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <CardContent>
                    <DataGrid
                      autoHeight
                      columns={columns}
                      rows={dataDebitsFiltered}
                      disableRowSelectionOnClick
                      pageSizeOptions={[7, 10, 25, 50]}
                      paginationModel={paginationModel}
                      onRowClick={(params, event) => handleRowClick(params, event)}
                      onPaginationModelChange={setPaginationModel}
                      localeText={{
                        ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                        noRowsLabel: 'Nenhum registro encontrado',
                        columnMenuManageColumns: 'Gerenciar colunas'
                      }}
                      sx={{
                        '& .MuiDataGrid-columnHeaders': { borderRadius: 0 },
                        '& .MuiDataGrid-row:hover': { cursor: 'pointer' },
                        mb: 3
                      }}
                    />

                    <ModalBudget open={openModal} setOpen={setOpenModal} budget={selectedRowDebits} />
                  </CardContent>

                  <Grid item xs={12} md={4}>
  <DespesasDonutChart dataDebitsFiltered={dataDebitsFiltered} />
</Grid>
                </Card>
              </TabPanel>
              <TabPanel value='4'>
                {/* <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                  <FormControl sx={{mr: 2}}>
                    <InputLabel id="period-select-label">Período</InputLabel>
                    <Select
                      labelId="period-select-label"
                      value={periodFilter}
                      label="Período"
                      onChange={(e: SelectChangeEvent) => setPeriodFilter(e.target.value as periodtype)}
                      >
                      <MenuItem value="month">Desse mês</MenuItem>
                      <MenuItem value="week">Dessa semana</MenuItem>
                      <MenuItem value="year">Desse ano</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel id="period-select-label">Tipo</InputLabel>
                    <Select
                      labelId="period-select-label"
                      value={transactionTypeFilter}
                      label="Tipo"
                      onChange={(e: SelectChangeEvent) => setTransactionTypeFilter(e.target.value as transactionTypeFilterType)}
                      >
                      <MenuItem value="revenue">Receitas</MenuItem>
                      <MenuItem value="expense">Despesas</MenuItem>
                      <MenuItem value="paid">Pago</MenuItem>
                    </Select>
                  </FormControl>
                </Box> */}
                <DataGrid
                  autoHeight
                  columns={reportColumns}
                  rows={reports}
                  disableRowSelectionOnClick
                  pageSizeOptions={[7, 10, 25, 50]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                  localeText={{
                    ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                    noRowsLabel: 'Nenhum registro encontrado',
                    columnMenuManageColumns: 'Gerenciar colunas'
                  }}
                />
              </TabPanel>

              <TabPanel value='2'>
                <AccountsPayable />
              </TabPanel>
              <TabPanel value='3'>
                <AccountsReceivable />
              </TabPanel>
            </TabContext>
          </CardContent>
        </Card>
      </Grid>

      <AddFinancialDialog open={isFinancialDialogOpen} onClose={closeFinancialDialog} />

      <AddTaxesDialog open={isTaxModalOpen} onClose={handleCloseTaxModal} />

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

      <RevenuesModal
        open={revenuesModalOpen}
        handleClose={handleCloseRevenuesModal}
        handleSave={(data: ExpenseData) => {
          const revenueData: any = { ...data, type: 'R' }
          saveTransaction(revenueData)
          handleCloseRevenuesModal()
        }}
        formData={{} as ExpenseData}
        planos={[]}
        tratamentos={[]}
      />

      <CashModal
        open={cashModalOpen}
        handleClose={handleCloseCashModal}
        handleSave={(data: ExpenseData) => {
          const revenueData: any = { ...data, type: 'R' }
          saveTransaction(revenueData)
          handleCloseCashModal()
        }}
        formData={{} as ExpenseData}
        planos={[]}
        tratamentos={[]}
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

      <FinancialReportDialog
        open={showReportDialog}
        handleClose={() => setShowReportDialog(false)}
        period={periodFilter!}
        transactionType={transactionTypeFilter!}
        financialId={financialId}
        changePeriod={(period: periodtype | undefined) => setPeriodFilter(period)}
        changeFinancialId={(financialId: string) => setFinancialId(financialId)}
        changeTransactionType={(transactionType: transactionTypeFilterType | undefined) =>
          setTransactionTypeFilter(transactionType)
        }
        handleCreate={handleCreateReport}
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

      <Dialog open={openModalVideo} onClose={handleCloseVideo} maxWidth='md' fullWidth>
        <DialogTitle>Assistir Vídeo</DialogTitle>
        <DialogContent>
          <Vimeo video='1116921851' width='100%' height='480' responsive />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVideo} color='primary'>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

Financial.aclAbilities = { action: 'read', subject: 'financial' }
Financial.requiredRole = 'admin'
Financial.requiredPlan = 'E'

export default Financial
