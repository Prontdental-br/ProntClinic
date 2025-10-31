import React, { useEffect, useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem
} from '@mui/material'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { transactionTypeFilterType, periodtype } from 'src/pages/financial'
import api from 'src/@core/components/api-client'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

interface FinancialReportDialogProps {
  open: boolean
  handleClose: () => void
  period: periodtype
  transactionType: transactionTypeFilterType
  financialId: string | undefined
  changePeriod: (period: periodtype | undefined) => void
  changeFinancialId: (financialId: string) => void
  changeTransactionType: (transactionType: transactionTypeFilterType | undefined) => void
  handleCreate: (data: {
    name: string
    description: string
    period?: string
    transactionType?: string
    financialId?: number
    dueStart?: Date
    dueEnd?: Date
    payStart?: Date
    payEnd?: Date
    createdStart?: Date
  }) => void
}

const FinancialReportDialog = ({
  handleCreate,
  open,
  handleClose,
  period,
  transactionType,
  changePeriod,
  changeTransactionType,
  financialId,
  changeFinancialId
}: FinancialReportDialogProps) => {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [financials, setFinancials] = useState<any>([])
  const [filterDueStart, setFilterDueStart] = useState<dayjs.Dayjs | null>(null)
  const [filterDueEnd, setFilterDueEnd] = useState<dayjs.Dayjs | null>(null)
  const [selectedFilterDate, setSelectedFilterDate] = useState<dayjs.Dayjs | null>(null)

  const [filterPayStart, setFilterPayStart] = useState<dayjs.Dayjs | null>(null)
  const [filterPayEnd, setFilterPayEnd] = useState<dayjs.Dayjs | null>(null)

  const closeDialog = () => {
    setNome('')
    setDescricao('')
    changePeriod(undefined)
    changeTransactionType(undefined)
    changeFinancialId('')
    setSelectedFilterDate(null)
    setFilterDueStart(null)
    setFilterDueEnd(null)
    setFilterPayStart(null)
    setFilterPayEnd(null)

    handleClose()
  }

  const handleCreateAndResetStates = () => {
    handleCreate({
      name: nome,
      description: descricao,
      period,
      transactionType,
      dueStart: filterDueStart?.toDate(),
      dueEnd: filterDueEnd?.toDate(),
      payStart: filterPayStart?.toDate(),
      payEnd: filterPayEnd?.toDate(),
      createdStart: selectedFilterDate?.toDate()
    })

    setNome('')
    setDescricao('')
    changePeriod(undefined)
    changeTransactionType(undefined)
    changeFinancialId('')
    setSelectedFilterDate(null)
    setFilterDueStart(null)
    setFilterDueEnd(null)
    setFilterPayStart(null)
    setFilterPayEnd(null)
  }

  const fetchFinancials = async () => {
    try {
      const { data } = await api.get('/financial')

      setFinancials(data)
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  useEffect(() => {
    fetchFinancials()
  }, [])

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

  const allFilters = [...expenseFilters, ...revenueFilters]

  return (
    <Dialog open={open} fullWidth maxWidth='md' onClose={closeDialog}>
      <DialogTitle>Novo Relatório Financeiro</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 2 }}>
          <Grid container item xs={12} spacing={2}>
            <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
              <Grid item xs={12} sm={6} md={2.5}>
                <DatePicker
                  label='Vencimento de'
                  format='DD/MM/YYYY'
                  sx={{ width: '100%' }}
                  value={filterDueStart}
                  onChange={newValue => setFilterDueStart(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.2}>
                <DatePicker
                  label='Até'
                  format='DD/MM/YYYY'
                  sx={{ width: '100%' }}
                  value={filterDueEnd}
                  onChange={newValue => setFilterDueEnd(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.5}>
                <DatePicker
                  label='Pagamento de'
                  format='DD/MM/YYYY'
                  sx={{ width: '100%' }}
                  value={filterPayStart}
                  onChange={newValue => setFilterPayStart(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.2}>
                <DatePicker
                  label='Até'
                  format='DD/MM/YYYY'
                  sx={{ width: '100%' }}
                  value={filterPayEnd}
                  onChange={newValue => setFilterPayEnd(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.5}>
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
          </Grid>

          <Grid container item xs={12} spacing={2}>
            <Grid item xs={12} sm={6} md={4.9}>
              <FormControl fullWidth size='small'>
                <InputLabel id='type-select-label'>Tipo</InputLabel>
                <Select
                  labelId='type-select-label'
                  value={transactionType}
                  label='Tipo'
                  onChange={(e: SelectChangeEvent) =>
                    changeTransactionType(e.target.value as transactionTypeFilterType)
                  }
                >
                  {allFilters.map(filter => (
                    <MenuItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4.1}>
              <FormControl fullWidth size='small'>
                <InputLabel id='financial-select-label'>Contabilidade</InputLabel>
                <Select
                  labelId='financial-select-label'
                  label='Contabilidade'
                  value={financialId ?? ''}
                  onChange={(e: SelectChangeEvent) => changeFinancialId(e.target.value as string)}
                >
                  {financials.map((l: any, i: number) => (
                    <MenuItem key={i} value={l.id}>
                      {l.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Button
                variant='outlined'
                onClick={() => {
                  setSelectedFilterDate(null)
                  setFilterDueStart(null)
                  setFilterDueEnd(null)
                  setFilterPayStart(null)
                  setFilterPayEnd(null)
                }}
                sx={{ height: 40, whiteSpace: 'nowrap' }}
              >
                LIMPAR FILTROS
              </Button>
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ mb: 2 }}>
            <TextField fullWidth label='Nome' value={nome} onChange={(e: any) => setNome(e.target.value)} />
          </Grid>

          <Grid item xs={12} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label='Descrição'
              value={descricao}
              onChange={(e: any) => setDescricao(e.target.value.slice(0, 255))}
              multiline
              rows={2}
              maxRows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box sx={{ justifyContent: 'center', display: 'flex', gap: '8px' }}>
          <Button variant='outlined' color='error' onClick={closeDialog}>
            Cancelar
          </Button>
          <Button variant='contained' color='primary' disabled={nome === ''} onClick={handleCreateAndResetStates}>
            Salvar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default FinancialReportDialog
