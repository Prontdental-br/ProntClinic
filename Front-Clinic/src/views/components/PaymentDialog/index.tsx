import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  DialogActions,
  Button,
  TextFieldProps,
  Checkbox,
  FormControlLabel,
  DialogContentText
} from '@mui/material'
import dayjs from 'dayjs'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import CurrencyFormat from 'react-currency-format'
import api, { apiV2 } from 'src/@core/components/api-client'
import { TypeEnum } from 'src/pages/financial'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Box } from '@mui/system'

dayjs.extend(utc)
dayjs.extend(timezone)

interface PaymentDialogProps {
  open: boolean
  onClose: () => void
  id: string
  nome: string
  codigo: string
  data: string
  valor: string
  servico: string
  typeDialogTitle?: string
  fetchData?: () => void
  transaction: string
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  id,
  nome,
  codigo,
  data,
  valor,
  servico,
  fetchData,
  transaction,
  typeDialogTitle
}) => {
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>('')
  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs | null>(dayjs())
  const [selectedPaymentDate, setSelectedPaymentDate] = React.useState<dayjs.Dayjs | null>(dayjs())
  const [downPayment, setDownPayment] = React.useState<string>()
  const [caixa, setCaixa] = React.useState('Clinica')
  const [caixas, setCaixas] = React.useState([])
  const [observacao, setObservacao] = React.useState('')
  const [parcelar, setParcelar] = React.useState(false)
  const [asaasPay, setAsaasPay] = React.useState(false)
  const [userData, setUserData] = React.useState<any>({})
  const [installmentCount, setInstallmentCount] = React.useState<number>()
  const [downPaymentError, setDownPaymentError] = useState('')
  const [paymentMethodError, setPaymentMethodError] = useState('')
  const [openInvalidDateModal, setOpenInvalidDateModal] = useState(false)
  const [openMinimalInstallmentValueAsaas, setOpenMinimalInstallmentValueAsaas] = useState(false)

  const [openMissingPatientDataModal, setOpenMissingPatientDataModal] = useState(false)

  const [openMinimalValueAsaas, setOpenMinimalValueAsaas] = useState(false)

  const handlePaymentMethod = (event: React.MouseEvent<HTMLElement>, newPaymentMethod: string | null) => {
    setPaymentMethod(newPaymentMethod)
  }

  const formatDueDate = () => {
    const dayJSDate = selectedDate?.toDate()

    const futureDate = new Date(dayJSDate ? dayJSDate : new Date())

    const year = futureDate.getFullYear()
    const month = String(futureDate.getMonth() + 1).padStart(2, '0') // Months are zero-based
    const day = String(futureDate.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const MINIMAL_VALUE_ASAAS = 5

  const handlePay = async () => {
    const today = dayjs().startOf('day')
    const dueDateSelected = dayjs(selectedDate).startOf('day')

    if (dueDateSelected.isBefore(today)) {
      setOpenInvalidDateModal(true)

      return
    }

    const paymentDateIso = dayjs(selectedPaymentDate)
      .startOf('day') // garante que é meia-noite no horário local
      .tz('America/Sao_Paulo') // ajusta para o fuso de SP
      .utc() // converte para UTC
      .toISOString() // formato ISO com Z

    console.log(paymentDateIso, 'selectedPaymentDate')

    if (!paymentMethod) {
      setPaymentMethodError('Selecione uma forma de pagamento.')

      return
    } else {
      setPaymentMethodError('')
    }

    if (asaasPay) {
      const totalValue = parseFloat(valor?.replace(',', '.') || '0')

      if (totalValue < MINIMAL_VALUE_ASAAS) {
        setOpenMinimalValueAsaas(true)

        return
      }

      if (parcelar && installmentCount && installmentCount > 1) {
        const parcelaValue = totalValue / installmentCount
        if (parcelaValue < MINIMAL_VALUE_ASAAS) {
          setOpenMinimalInstallmentValueAsaas(true) // Crie um modal similar ao existente

          return
        }
      }
    }

    if (transaction && asaasPay) {
      const { data } = await api.get(`budgets/${transaction}`)

      if (['boleto', 'pix'].includes(paymentMethod || '')) {
        if (!data.patient.cpf || !data.patient.email) {
          setOpenMissingPatientDataModal(true)

          return
        }
      }

      if (['credito', 'debito'].includes(paymentMethod || '')) {
        if (!data.patient.email) {
          setOpenMissingPatientDataModal(true)

          return
        }
      }
    }

    const entrada = parseFloat(downPayment?.replace(',', '.') || '0')
    const total = parseFloat(valor?.replace(',', '.') || '0')

    if (parcelar && entrada > total) {
      setDownPaymentError('A entrada não pode ser maior que o valor total.')

      return
    }
    if (['dinheiro', 'cheque'].includes(paymentMethod || '')) {
      await api.post(`budgets/addpayment/${id}`, {
        value: parseFloat(downPayment?.replaceAll(',', '.') || '0'),
        checkout: caixa,
        observation: observacao,
        paymentType: paymentMethod,
        paymentDate: paymentDateIso,
        transaction
      })
    } else {
      if (asaasPay) {
        const dueDate = formatDueDate()
        console.log(dueDate)
        const { data } = await apiV2.post(`charge`, {
          id: transaction,
          transactionId: id,
          value: parseFloat(valor?.replaceAll(',', '.') || '0'),
          observation: observacao,
          paymentType: paymentMethod,
          installmentCount,
          dueDate
        })
        window.open(data.invoiceUrl)

        onClose()
      } else {
        await api.post(`budgets/addpayment/${id}`, {
          value: parseFloat(downPayment?.replaceAll(',', '.') || '0'),
          checkout: caixa,
          observation: observacao,
          paymentType: paymentMethod,
          transaction,
          paymentDate: paymentDateIso
        })
      }
    }
    setDownPayment(undefined)
    setObservacao('')
    setAsaasPay(false)
    setSelectedDate(dayjs())
    setSelectedPaymentDate(dayjs())
    setPaymentMethod('')
    setInstallmentCount(undefined)
    setDownPaymentError('')
    setPaymentMethodError('')
    setParcelar(false)
    if (fetchData) fetchData()
    onClose()
  }

  const fetchDataCaixa = async () => {
    const resp = await api.get('/accounts/me')
    console.log(resp.data)

    setUserData({ ...resp.data })
    const { data } = await api.get('cash')

    setCaixas(data.map((d: any) => Object.assign(d.name)))
    setCaixa(data[0]?.name)
  }

  useEffect(() => {
    setUserData(userData)
    fetchDataCaixa()
  }, [])

  const onCloseWithReset = () => {
    setSelectedDate(dayjs())
    setSelectedPaymentDate(dayjs())
    setDownPayment(undefined)
    setPaymentMethod('')
    setPaymentMethodError('')
    setObservacao('')
    setAsaasPay(false)
    setInstallmentCount(undefined)
    setParcelar(false)
    onClose()
  }

  const selectedStyle = {
    '&.Mui-selected': {
      backgroundColor: '#6dbbb3ff', // Verde claro baseado no #087a64
      color: '#fff',
      '&:hover': {
        backgroundColor: '#26a69a' // Um tom mais escuro no hover
      }
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onCloseWithReset} fullWidth>
        <DialogTitle>
          {typeDialogTitle === TypeEnum.revenue ? `Receber receita de` : 'Pagar despesa de'} {servico}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant='h6' sx={{ mb: 5 }}>
                    Informações
                  </Typography>
                  <Grid container spacing={4}>
                    {/* <Grid item xs={12}>
                    <TextField fullWidth label='Nome' value={nome} InputProps={{ readOnly: true }} />
                  </Grid> */}
                    <Grid item xs={4}>
                      <TextField fullWidth label='Código do Serviço' value={codigo} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField fullWidth label='Serviço' InputProps={{ readOnly: true }} value={servico} />
                    </Grid>
                    <Grid item xs={6} sx={{ paddingRight: 1 }}>
                      <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label='Data do Pagamento'
                          format='DD/MM/YYYY'
                          value={selectedPaymentDate}
                          onChange={(newValue: dayjs.Dayjs | null) => {
                            setSelectedPaymentDate(newValue)
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={6} sx={{ paddingLeft: 1 }}>
                      <TextField
                        fullWidth
                        label='Valor'
                        value={parseFloat(valor).toFixed(2).replace('.', ',')}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Typography variant='h6' sx={{ mb: 5 }}>
                      Pagamento
                    </Typography>

                    {userData.asaasAccount && typeDialogTitle === 'R' && transaction && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            name='asaas_pay'
                            checked={asaasPay}
                            onChange={(e: any) => {
                              setAsaasPay(!asaasPay)
                            }}
                          ></Checkbox>
                        }
                        label='Pagar com Asaas'
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <ToggleButtonGroup
                      value={paymentMethod}
                      exclusive
                      onChange={(event, newPaymentMethod) => {
                        setPaymentMethod(newPaymentMethod)
                        if (newPaymentMethod) {
                          setPaymentMethodError('')
                        }
                      }}
                    >
                      {!asaasPay && (
                        <ToggleButton sx={selectedStyle} value='dinheiro'>
                          Dinheiro
                        </ToggleButton>
                      )}
                      <ToggleButton sx={selectedStyle} value='credito'>
                        Crédito
                      </ToggleButton>
                      <ToggleButton sx={selectedStyle} value='debito'>
                        Débito
                      </ToggleButton>
                      <ToggleButton sx={selectedStyle} value='boleto'>
                        Boleto
                      </ToggleButton>
                      <ToggleButton sx={selectedStyle} value='pix'>
                        Pix
                      </ToggleButton>
                      {!asaasPay && (
                        <ToggleButton sx={selectedStyle} value='cheque'>
                          Cheque
                        </ToggleButton>
                      )}
                      {asaasPay && (
                        <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label='Data Vencimento *'
                            format='DD/MM/YYYY'
                            sx={{ marginLeft: 3 }}
                            value={selectedDate}
                            minDate={dayjs()}
                            onChange={(newValue: dayjs.Dayjs | null) => {
                              setSelectedDate(newValue)
                            }}
                          />
                        </LocalizationProvider>
                      )}
                    </ToggleButtonGroup>

                    {paymentMethodError && (
                      <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{paymentMethodError}</span>
                    )}
                  </div>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <FormControl fullWidth sx={{ mt: 5 }}>
                        <InputLabel id='caixa-label'>Banco</InputLabel>
                        <Select labelId='caixa-label' value={caixa} onChange={e => setCaixa(e.target.value as string)}>
                          {caixas.map((c: any, idx: number) => (
                            <MenuItem value={c} key={idx}>
                              {c}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sx={{ mb: 2 }}></Grid>
                    <Grid item xs={12} sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label='Observação'
                        multiline
                        value={observacao}
                        onChange={(e: any) => setObservacao(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size='small'
                        name='Parcelar'
                        checked={parcelar}
                        onChange={() => setParcelar(!parcelar)}
                        sx={{ mb: -2, mt: -1.75, ml: -1.75 }}
                      />
                    }
                    label='Parcelar'
                  />

                  {parcelar && !asaasPay && (
                    <CurrencyFormat
                      customInput={TextField}
                      decimalSeparator=','
                      placeholder='Entrada'
                      label='Entrada'
                      name='entrada'
                      value={downPayment}
                      error={!!downPaymentError}
                      helperText={downPaymentError}
                      onChange={e => {
                        const value = e.target.value
                        const parsedValue = parseFloat(value.replace(',', '.') || '0')
                        const total = parseFloat(valor?.replace(',', '.') || '0')

                        setDownPayment(value)

                        if (parsedValue > total) {
                          setDownPaymentError('A entrada não pode ser maior que o valor total.')
                        } else {
                          setDownPaymentError('')
                        }
                      }}
                    />
                  )}

                  {parcelar && asaasPay && (
                    <TextField
                      type='number'
                      placeholder='Número de parcelas'
                      label='Número de parcelas'
                      name='installmentCount'
                      value={installmentCount}
                      onChange={e => setInstallmentCount(parseInt(e.target.value))}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseWithReset} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={handlePay} variant='contained' color='primary'>
            Pagar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMissingPatientDataModal} onClose={() => setOpenMissingPatientDataModal(false)}>
        <DialogTitle>Atenção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {['boleto', 'pix'].includes(paymentMethod || '')
              ? 'Para gerar cobranças com boleto ou pix no Asaas, é necessário que o paciente tenha CPF e e-mail preenchidos.'
              : 'Para gerar cobranças com cartão no Asaas, é necessário que o paciente tenha o e-mail preenchido.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='error' onClick={() => setOpenMissingPatientDataModal(false)} autoFocus>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMinimalValueAsaas} onClose={() => setOpenMinimalValueAsaas(false)}>
        <DialogTitle>Valor mínimo não permitido</DialogTitle>
        <DialogContent>
          <Typography>O Asaas não permite a criação de cobranças com valor inferior a R$5,00.</Typography>
          <Typography>Por favor, ajuste o valor para prosseguir com o pagamento.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMinimalValueAsaas(false)} variant='outlined' color='primary'>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openInvalidDateModal} onClose={() => setOpenInvalidDateModal(false)}>
        <DialogTitle>Atenção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A data de vencimento não pode ser anterior ao dia de hoje. Por favor, escolha uma data válida.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary' onClick={() => setOpenInvalidDateModal(false)}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMinimalInstallmentValueAsaas} onClose={() => setOpenMinimalInstallmentValueAsaas(false)}>
        <DialogTitle>Atenção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            O valor de cada parcela não pode ser menor que R$ {MINIMAL_VALUE_ASAAS.toFixed(2)}. Por favor, ajuste a
            quantidade de parcelas ou o valor total.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary' onClick={() => setOpenMinimalInstallmentValueAsaas(false)}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PaymentDialog
