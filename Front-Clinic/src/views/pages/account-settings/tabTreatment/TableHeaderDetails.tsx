// ** React Imports
import { FormEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import {
  DialogContentText,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  DialogActions,
  FormHelperText
} from '@mui/material'
import { Focused } from 'react-credit-cards'
import { SpecialtyType, TreatmentType } from 'src/types/apps/clinicsTypes'
import { RootState, AppDispatch } from 'src/store'
import { useSelector, useDispatch } from 'react-redux'
import { setCloseDialog, setFormValidationErrors } from 'src/store/apps/clinics'
import toast from 'react-hot-toast'

interface TableHeaderProps<T extends SpecialtyType> {
  value: string
  handleFilter: (val: string) => void
  addTreatments: (obj: TreatmentType) => void
  selectedSpecialty: T | null
  selectedTreatment: TreatmentType | null
  onEditTreatment: (treatment: TreatmentType) => void
  data: T[]
}

const TableHeaderDetails = <T extends SpecialtyType>(props: TableHeaderProps<T>) => {
  // ** Props

  const { value, handleFilter, addTreatments, selectedSpecialty, selectedTreatment, data } = props

  const [newTreatment, setNewTreatment] = useState<TreatmentType | null>(null)

  // ** State
  const [open, setOpen] = useState<boolean>(false)
  const [focus, setFocus] = useState<Focused>()
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const store = useSelector((state: RootState) => state.clinic)
  const dispatch = useDispatch<AppDispatch>()

  const handleDialogToggle = () => {
    setDialogMode('add')
    setNewTreatment(null)
    setOpen(!open)
    dispatch(setFormValidationErrors([]))
    setErrors({})
  }

  const handleAddTreatment = () => {
    if (selectedSpecialty && newTreatment) {
      props.addTreatments(newTreatment)
    }
  }

  useEffect(() => {
    if (store.closeDialog) {
      setOpen(false)
      setNewTreatment(null)
      dispatch(setCloseDialog(false))
      dispatch(setFormValidationErrors([]))
      setErrors({})
    }
  }, [store.closeDialog])

  useEffect(() => {
    const newErrors: Record<string, string> = {}

    if (store.formValidationErrors && store.formValidationErrors.length > 0) {
      store.formValidationErrors.forEach(msg => {
        if (msg.includes('nome do tratamento')) {
          newErrors.name = msg
        } else if (msg.includes('valor do tratamento')) {
          newErrors.value = msg
        } else if (msg.includes('nível complexidade') || msg.includes('complexidade não é valido')) {
          newErrors.complexity = msg
        } else if (msg.includes('especialidade')) {
          newErrors.specialtyId = msg
        }
      })
    }
    setErrors(newErrors)
  }, [store.formValidationErrors])

  useEffect(() => {
    if (open && selectedSpecialty) {
      setNewTreatment(prev => ({
        ...(prev ?? ({} as TreatmentType)),
        specialtyId: selectedSpecialty.id
      }))
    }
  }, [open, selectedSpecialty])

  useEffect(() => {
    if (selectedTreatment) {
      setNewTreatment(selectedTreatment)
      setDialogMode('edit')
      setOpen(true)
    }
  }, [selectedTreatment])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    setOpen(false)
    e.preventDefault()
  }

  const handleBlur = () => setFocus(undefined)

  function handleTreatmentFormData(key: keyof TreatmentType, value: any) {
    const _newTreatment = newTreatment ?? ({} as TreatmentType)

    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        
return newErrors
      })
    }

    if (key == 'cost' || key == 'value') {
      value = value.replace(/\D/g, '')
      value = (parseInt(value) / 100).toFixed(2)
      if (isNaN(value)) value = 0
    }
    setNewTreatment({ ..._newTreatment, [key]: value })
  }

  const formatCurrency = (input: string) => {
    const numericValue = input.replace(/\D/g, '')

    console.log('numericValue', numericValue)
    const value = (parseInt(numericValue) / 100).toFixed(2)
    console.log('value', value)

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value))
  }

  return (
    <>
      <Box
        sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <TextField
          size='small'
          value={value}
          sx={{ mr: 4, mb: 2.5 }}
          placeholder='Filtrar Tratamento'
          onChange={e => handleFilter(e.target.value)}
        />
        <Button
          sx={{ mb: 2.5 }}
          variant='contained'
          onClick={handleDialogToggle}
          disabled={!selectedSpecialty}
        >
          + Novo Tratamento
        </Button>
      </Box>

      {/* Dialog Add Tratamentos  */}

      <Dialog
        onClose={handleDialogToggle}
        open={open}
        aria-labelledby='user-view-billing-edit-card'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}
        aria-describedby='user-view-billing-edit-card-description'
      >
        <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1 }}>
          {dialogMode == 'add' ? 'Cadastro de' : 'Editar'} Tratamento
        </DialogTitle>

        <DialogContent sx={{ mt: 4 }}>
          <Typography variant='body2'>Vincule os tratamentos as especialidades</Typography>
        </DialogContent>

        <DialogContent>
          <form>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{ mt: 3 }}>
                    <FormControl fullWidth error={!!errors.specialtyId}>
                      <InputLabel id='treatment-view-Table-Header-Speciality-label'>Especialidade</InputLabel>
                      <Select
                        label='Especialidade'
                        id='treatment-view-Table-Header-Speciality'
                        labelId='treatment-view-Table-Header-Speciality-label'
                        value={newTreatment?.specialtyId ?? selectedSpecialty?.id ?? ''}
                        onChange={e => handleTreatmentFormData('specialtyId', e.target.value)}
                      >
                        {data.map(especialidade => (
                          <MenuItem key={especialidade.id} value={especialidade.id}>
                            {especialidade.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.specialtyId && <FormHelperText>{errors.specialtyId}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name='nomeTratamento'
                      autoComplete='off'
                      label='Nome'
                      onBlur={handleBlur}
                      placeholder='Digite o Nome do Tratamento'
                      onFocus={e => setFocus(e.target.name as Focused)}
                      value={newTreatment?.name ?? ''}
                      onChange={e => handleTreatmentFormData('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name='descTratamento'
                      autoComplete='off'
                      label='Descrição'
                      onBlur={handleBlur}
                      placeholder='Digite o Descrição do Tratamento'
                      onFocus={e => setFocus(e.target.name as Focused)}
                      value={newTreatment?.description ?? ''}
                      onChange={e => handleTreatmentFormData('description', e.target.value)}
                      error={!!errors.description}
                      helperText={errors.description}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name='name'
                      value={newTreatment?.contraindications ?? ''}
                      onChange={e => handleTreatmentFormData('contraindications', e.target.value)}
                      autoComplete='off'
                      onBlur={handleBlur}
                      label='Contraindicações'
                      placeholder=''
                      onFocus={e => setFocus(e.target.name as Focused)}
                      error={!!errors.contraindications}
                      helperText={errors.contraindications}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth error={!!errors.complexity}>
                      <InputLabel id='user-view-billing-edit-card-status-label'>Complexidade</InputLabel>
                      <Select
                        label='Complexidade'
                        id='user-view-billing-edit-card-status'
                        labelId='user-view-billing-edit-card-status- label'
                        value={newTreatment?.complexity ?? ''}
                        onChange={e => handleTreatmentFormData('complexity', e.target.value)}
                      >
                        <MenuItem value='low'>Baixo</MenuItem>
                        <MenuItem value='medium'>Médio</MenuItem>
                        <MenuItem value='hight'>Alto</MenuItem>
                      </Select>
                      {errors.complexity && <FormHelperText>{errors.complexity}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      name='custoEstimado'
                      label='Custo Estimado'
                      value={newTreatment?.cost ? formatCurrency(newTreatment.cost.toString()) : ''}
                      onChange={e => handleTreatmentFormData('cost', e.target.value)}
                      onBlur={handleBlur}
                      placeholder='Custo'
                      error={!!errors.cost}
                      helperText={errors.cost}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      name='valorTratamento'
                      label='Valor/Preço'
                      value={newTreatment?.value ? formatCurrency(newTreatment.value.toString()) : ''}
                      onChange={e => handleTreatmentFormData('value', e.target.value)}
                      autoComplete='off'
                      onBlur={handleBlur}
                      onFocus={e => setFocus(e.target.name as Focused)}
                      placeholder={'Valor'}
                      error={!!errors.value}
                      helperText={errors.value}
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ mr: 15 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newTreatment?.active ?? false}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            handleTreatmentFormData('active', event.target.checked)
                          }
                        />
                      }
                      label='Ativo?'
                      sx={{ '& .MuiTypography-root': { color: 'text.secondary' } }}
                    />
                  </Grid>
                  <Grid item sx={{ mt: 2 }}>
                    <Button variant='outlined' color='error' onClick={handleDialogToggle} sx={{ mr: 2 }}>
                      Cancelar
                    </Button>
                    <Button variant='contained' onClick={handleAddTreatment}>
                      Salvar
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TableHeaderDetails
