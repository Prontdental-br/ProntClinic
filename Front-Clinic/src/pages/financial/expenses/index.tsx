import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material'

import { ExpenseData } from 'src/types/apps/financialTypes'
import { set } from 'nprogress'
import dayjs from 'dayjs'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AttachFileOutlined, Download, ZoomIn, ZoomInMapOutlined } from '@mui/icons-material'
import { Box } from '@mui/system'
import api from 'src/@core/components/api-client'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

interface Categoria {
  id: string
  desc: string
}

interface Caixa {
  id: string
  desc: string
}

interface ExpenseModalProps {
  open: boolean
  formData: ExpenseData
  categorias: Categoria[]
  caixas: Caixa[]

  //handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (event: React.ChangeEvent<{ name?: string; value: unknown }>) => void
  handleClose: () => void
  handleSave: (expenseData: ExpenseData) => void
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  open,
  formData,
  categorias,
  caixas,

  //handleInputChange,
  handleSelectChange,
  handleClose,
  handleSave
}) => {
  const [expenseData, setExpenseData] = useState<ExpenseData>(formData)
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>('')
  const [selectedPaymentDate, setSelectedPaymentDate] = React.useState<dayjs.Dayjs | null>(dayjs())
  const [paymentMethodError, setPaymentMethodError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [openImageModal, setOpenImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const theme = useTheme()

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}')
  const accountId = userData.accountId || ''

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    const alreadySaved = expenseData.attachments?.length || 0
    const maxAllowed = 5 - alreadySaved

    if (maxAllowed <= 0) {
      setSnackbar({ open: true, message: 'Limite máximo de 5 imagens atingido.' })

      return
    }

    if (files.length > maxAllowed) {
      setSnackbar({ open: true, message: `Você só pode adicionar mais ${maxAllowed} imagem(s).` })

      return
    }

    const totalFiles = [...selectedFiles, ...files].slice(0, maxAllowed)
    setSelectedFiles(totalFiles)
    setPreviewUrls(totalFiles.map(file => URL.createObjectURL(file)))
  }

  const [errors, setErrors] = useState({
    description: '',
    value: ''
  })

  useEffect(() => {
    if (formData) {
      setExpenseData({
        ...formData,
        dueDate: formData.dueDate ? dayjs(formData.dueDate).format('YYYY-MM-DD') : ''
      })

      setSelectedPaymentDate(formData.paymentDate ? dayjs.utc(formData.paymentDate) : dayjs())

      setPaymentMethod(formData.paymentType || '')
    }

    console.log(formData)
  }, [formData])

  function handleExpenseData(key: keyof ExpenseData, value: any) {
    setExpenseData(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validateFields = () => {
    const newErrors = {
      description: expenseData.description ? '' : 'Nome da despesa é obrigatório',
      value: expenseData.value ? '' : 'Valor da despesa é obrigatório'
    }

    setErrors(newErrors)

    return Object.values(newErrors).every(err => !err)
  }

  const isEditMode = Boolean(formData?.id)

  async function uploadImage(accountId: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(`/upload/${accountId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data.url
  }

  const handleCloseWithReset = () => {
    handleClose()
    setSelectedFiles([])
    setPreviewUrls([])
    setSelectedImage(null)
    setSnackbar({ open: false, message: '' })
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseWithReset}
      aria-labelledby='expense-modal-title'
      aria-describedby='expense-modal-description'
      sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 800 } }}
    >
      <DialogTitle id='expense-modal-title'>{isEditMode ? 'Editar Despesa' : 'Cadastrar Despesa'}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 5 }} variant='body1' id='expense-modal-description'>
          Preencha os detalhes da despesa.
        </DialogContentText>
        <form>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Nome da Despesa'
                required
                name='description'
                value={expenseData.description}
                onChange={event => handleExpenseData('description', event.target.value as never)}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label='Valor da Despesa'
                name='value'
                type='number'
                InputProps={{ inputProps: { min: 0 } }}
                value={expenseData.value}
                onChange={event => handleExpenseData('value', event.target.value as never)}
                error={!!errors.value}
                helperText={errors.value}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='date'
                label='Data de Vencimento'
                name='dueDate'
                value={expenseData.dueDate}
                onChange={event => handleExpenseData('dueDate', event.target.value as never)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Observação'
                multiline
                rows={4}
                name='observation'
                value={expenseData.observation}
                onChange={event => handleExpenseData('observation', event.target.value as never)}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={expenseData.isPaid}
                    onChange={event => handleExpenseData('isPaid', event.target.checked as never)}
                    name='isPaid'
                  />
                }
                label='Despesa Paga'
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
                        setSelectedPaymentDate(newValue)
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
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
                    <ToggleButton value='dinheiro'>Dinheiro</ToggleButton>
                    <ToggleButton value='credito'>Crédito</ToggleButton>
                    <ToggleButton value='debito'>Débito</ToggleButton>
                    <ToggleButton value='boleto'>Boleto</ToggleButton>
                    <ToggleButton value='pix'>Pix</ToggleButton>
                    <ToggleButton value='cheque'>Cheque</ToggleButton>
                  </ToggleButtonGroup>

                  {paymentMethodError && (
                    <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{paymentMethodError}</span>
                  )}
                </div>
              </>
            )}
          </Grid>

          <Grid item xs={12} sx={{ mt: 3 }}>
            <Button variant='outlined' component='label' startIcon={<AttachFileOutlined />}>
              Anexar Imagens (máx. 5)
              <input type='file' hidden accept='image/*' multiple onChange={handleFileChange} />
            </Button>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {previewUrls.map((url, index) => (
                <Grid item xs={4} key={index}>
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <IconButton
                      size='small'
                      sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#fff' }}
                      onClick={() => {
                        const newFiles = [...selectedFiles]
                        newFiles.splice(index, 1)
                        setSelectedFiles(newFiles)
                        setPreviewUrls(newFiles.map(file => URL.createObjectURL(file)))
                      }}
                    >
                      ✕
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {expenseData.attachments?.map((url, index) => (
                <Grid item xs={4} key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedImage(url)
                      setOpenImageModal(true)
                    }}
                  >
                    <img
                      src={url}
                      alt={`Imagem ${index}`}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant='outlined'
          color='error'
          onClick={() => {
            handleClose()
            setExpenseData({} as ExpenseData)
          }}
        >
          Cancelar
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={async () => {
            if (!paymentMethod && expenseData.isPaid) {
              setPaymentMethodError('Selecione uma forma de pagamento.')

              return
            } else {
              setPaymentMethodError('')
            }

            if (validateFields()) {
              const dueDateFinal = expenseData.dueDate
                ? dayjs(expenseData.dueDate).startOf('day').toISOString()
                : dayjs().startOf('day').toISOString()

              let uploadedUrls: string[] = expenseData.attachments || []

              if (selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(file => uploadImage(expenseData?.accountId || accountId, file))
                uploadedUrls = await Promise.all(uploadPromises)
              }

              handleSave({
                ...expenseData,
                dueDate: dueDateFinal,
                paymentType: expenseData.isPaid ? paymentMethod : null,
                paymentDate:
                  expenseData.isPaid && selectedPaymentDate
                    ? `${selectedPaymentDate.format('YYYY-MM-DD')}T00:00:00.000Z`
                    : undefined,
                attachments: [...(expenseData.attachments || []), ...uploadedUrls]
              })

              // Reset
              setExpenseData({} as ExpenseData)
              setSelectedFiles([])
              setPreviewUrls([])
            }
          }}
        >
          Salvar
        </Button>
      </DialogActions>

      <Dialog open={openImageModal} onClose={() => setOpenImageModal(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Visualização da Imagem
          <IconButton onClick={() => setOpenImageModal(false)}>✕</IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt='Imagem Ampliada'
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          {selectedImage && (
            <Button variant='outlined' color='primary' component='a' href={selectedImage} download>
              Baixar Imagem
            </Button>
          )}
          <Button variant='contained' color='error' onClick={() => setOpenImageModal(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSnackbar({ open: false, message: '' })}
      >
        <Alert
          severity='warning'
          sx={{
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            fontWeight: 500,
            '& .MuiAlert-icon': {
              color: theme.palette.warning.main
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default ExpenseModal
