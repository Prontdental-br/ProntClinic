import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  SelectChangeEvent,
  Card,
  FormControlLabel,
  Checkbox,
  DialogContentText,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { ExpenseData } from 'src/types/apps/financialTypes'
import dayjs from 'dayjs'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

interface TreatmentData {
  plano: string
  tratamento: string
  dentesRegiao: string
  valor: number
  dentista: string
}

interface RevenueData {
  nomePaciente: string
  dataRecebimento: string
  dataVencimento: string
  tratamentos: TreatmentData[]
  observacoes: string
}

interface RevenuesModalProps {
  open: boolean
  handleClose: () => void
  handleSave: (revenueData: ExpenseData) => void
  planos: Array<{ id: string; desc: string }> 
  tratamentos: Array<{ id: string; desc: string }> 
  formData: ExpenseData
}

const CashModal: React.FC<RevenuesModalProps> = ({ open, handleClose, handleSave, formData }) => {
  const [expenseData, setExpenseData] = useState<ExpenseData>(formData)
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>('');
  const [selectedPaymentDate, setSelectedPaymentDate] = React.useState<dayjs.Dayjs | null>(dayjs());
  const [paymentMethodError, setPaymentMethodError] = useState('');
  const [errors, setErrors] = useState({
      description: '',
      value: ''
    })
 
  function handleExpenseData(key: keyof ExpenseData, value: any) {
      setExpenseData(prev => ({ ...prev, [key]: value }))
      setErrors(prev => ({ ...prev, [key]: '' }))
    }

 const validateFields = () => {
    const newErrors = {
      description: expenseData.description ? '' : 'Nome da receita é obrigatório',
      value: expenseData.value ? '' : 'Valor da receita é obrigatório'
    }
  
    setErrors(newErrors)
  
    return Object.values(newErrors).every(err => !err)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='expense-modal-title'
      aria-describedby='expense-modal-description'
      sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 800 } }}
    >
      <DialogTitle id='expense-modal-title'>Caixa</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 5 }} variant='body1' id='expense-modal-description'>
          Preencha os detalhes sobre o caixa.
        </DialogContentText>
        <form>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Nome do Caixa'
                required
                name='description'
                value={expenseData.description}
                onChange={(event) => handleExpenseData('description', event.target.value as never)}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label='Saldo Inicial'
                name='value'
                type='number'
                InputProps={{ inputProps: { min: 0 } }}
                value={expenseData.value}
                onChange={(event) => handleExpenseData('value', event.target.value as never)}
                error={!!errors.value}
                helperText={errors.value}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='date'
                label='Data de Vencimento'
                name='dueDate'
                value={expenseData.dueDate}
                onChange={(event) => handleExpenseData('dueDate', event.target.value as never)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid> */}
            {/* <Grid item xs={12}>
              <TextField
                fullWidth
                label='Observação'
                multiline
                rows={4}
                name='observation'
                value={expenseData.observation}
                onChange={(event) => handleExpenseData('observation', event.target.value as never)}
              />
            </Grid> */}
            <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={expenseData.isPaid}
                  onChange={(event) => handleExpenseData('isPaid', event.target.checked)}
                  name='isPaid'
                />
              }
              label='Entrada Caixa'
            />
            </Grid>
            {expenseData.isPaid && ( 
              <>
                <Grid item xs={6} sx={{ paddingRight: 1, display: 'block' }}>
                  <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
                      <DatePicker
                          label='Data do Pagamento'
                          format='DD/MM/YYYY'
                          value={selectedPaymentDate}
                          onChange={(newValue: dayjs.Dayjs | null) => {
                            setSelectedPaymentDate(newValue);
                          }}
                          
                          />
                    </LocalizationProvider>
                </Grid>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <ToggleButtonGroup
                          value={paymentMethod}
                          exclusive
                          onChange={(event, newPaymentMethod) => {
                            setPaymentMethod(newPaymentMethod);
                            if (newPaymentMethod) {
                              setPaymentMethodError(''); 
                            }
                          }}
                          
                          >
                          <ToggleButton value='dinheiro'>Dinheiro</ToggleButton>
                          <ToggleButton value='credito'>Crédito</ToggleButton>
                          <ToggleButton value='debito'>Débito</ToggleButton>
                          <ToggleButton value='boleto'>Boleto</ToggleButton>
                          <ToggleButton value='pix'>Pix</ToggleButton>
                          <ToggleButton value='cheque'>Cheque</ToggleButton>
                          
                          {/* {asaasPay && (
                            <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
                            <DatePicker
                            label='Data Vencimento *'
                            format='DD/MM/YYYY'
                            sx={{ marginLeft: 3 }}
                            value={selectedDate}
                            onChange={(newValue: dayjs.Dayjs | null) => {
                              setSelectedDate(newValue);
                              }}
                              />
                              </LocalizationProvider>
                              )} */}
                        </ToggleButtonGroup>
      
      
                        {paymentMethodError && (
                          <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {paymentMethodError}
                          </span>
                        )}
                </div>
              </>
            )}
            {/* <Grid item xs={12}>
              <Button variant='contained' component='label'>
                Anexar Comprovante
                <input type='file' hidden />
              </Button>
            </Grid> */}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='error' onClick={() => {
            handleClose()
            setExpenseData({} as ExpenseData)
          }}>Cancelar</Button>
        <Button variant='contained' color='primary' onClick={() => {

          if (!paymentMethod && expenseData.isPaid) {
            setPaymentMethodError('Selecione uma forma de pagamento.');

            return;
            } else {
            setPaymentMethodError('');
            }

          if (validateFields()) {
            const dueDateFinal = expenseData.dueDate || dayjs().format('YYYY-MM-DD');
            handleSave({...expenseData, dueDate: dueDateFinal, paymentType: expenseData.isPaid ? paymentMethod : null, paymentDate: selectedPaymentDate?.format('YYYY-MM-DD')})
            setExpenseData({} as ExpenseData)
          }
        }}>Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CashModal
