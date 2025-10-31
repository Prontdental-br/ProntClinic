// ** React Imports
import React, { useState, ElementType, ChangeEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Select from '@mui/material/Select'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Button, { ButtonProps } from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { FormLabel, Radio, RadioGroup } from '@mui/material'

interface Data {
  email: string

  address: string
  country: string
  lastName: string
  currency: string
  language: string
  timezone: string
  firstName: string
  organization: string

  zipCode: number | string

  // Novos campos da clínica
  clinicName: string // Nome da Clínica
  cnpj: string // CNPJ da Clínica
  communicationName: string // Nome utilizado na comunicação
  responsible: string // Responsável pela Clínica
  openingTime: string // Horário de abertura da Clínica
  closingTime: string // Horário de Fechamento da Clínica
  timeZone: string // Fuso Horário
  receiptInNameOf: string // Emitir Recibo em nome da (valor padrão)
  clinicEmail: string // Email da Clínica
  clinicPhone: string // Telefone da Clínica
  clinicCellPhone: string // Celular da Clínica
  cep: string // CEP
  street: string // Rua
  calendarSchedule: string
  number: string // Número
  complement: string // Complemento
  neighborhood: string // Bairro
  city: string // Cidade
  state: string // Estado
}

const initialData: Data = {
  state: '',
  number: '',
  address: '',
  zipCode: '',
  lastName: 'Doe',
  currency: 'usd',
  firstName: 'John',
  language: 'arabic',
  timezone: 'gmt-12',
  country: 'australia',
  email: 'john.doe@example.com',
  organization: 'Pixinvent',
  clinicName: '', // Nome da Clínica
  cnpj: '', // CNPJ da Clínica
  communicationName: '', // Nome utilizado na comunicação
  responsible: '', // Responsável pela Clínica
  openingTime: '', // Horário de abertura da Clínica
  closingTime: '', // Horário de Fechamento da Clínica
  timeZone: 'gmt-12', // Fuso Horário padrão
  receiptInNameOf: 'Clinica', // Emitir Recibo em nome da (valor padrão)
  clinicEmail: '', // Email da Clínica
  clinicPhone: '', // Telefone da Clínica
  clinicCellPhone: '', // Celular da Clínica
  cep: '', // CEP
  street: '', // Rua
  calendarSchedule: '', // Hórario Calendario

  complement: '', // Complemento
  neighborhood: '', // Bairro
  city: '' // Cidade
}

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(5),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const TabAccount = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [userInput, setUserInput] = useState<string>('yes')
  const [formData, setFormData] = useState<Data>(initialData)
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const [secondDialogOpen, setSecondDialogOpen] = useState<boolean>(false)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { checkbox: false } })

  const handleClose = () => setOpen(false)

  const handleSecondDialogClose = () => setSecondDialogOpen(false)

  const onSubmit = () => setOpen(true)

  const handleConfirmation = (value: string) => {
    handleClose()
    setUserInput(value)
    setSecondDialogOpen(true)
  }

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])

      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const handleInputImageReset = () => {
    setInputValue('')
    setImgSrc('/images/avatars/1.png')
  }

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Detalhes da Clínica' />
          <form>
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ImgStyled src={imgSrc} alt='Profile Pic' />
                <div>
                  <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                    Atualizar Logo
                    <input
                      hidden
                      type='file'
                      value={inputValue}
                      accept='image/png, image/jpeg'
                      onChange={handleInputImageChange}
                      id='account-settings-upload-image'
                    />
                  </ButtonStyled>
                  <Typography sx={{ mt: 5, color: 'text.disabled' }}>
                    PNG ou JPEG permitidos. Tamanho máximo de 800K.
                  </Typography>
                </div>
              </Box>
            </CardContent>
            <Divider />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <CardHeader title='Fiscal' />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Emitir Recibo em nome da</InputLabel>
                    <Select
                      label='Emitir Recibo em nome da'
                      value={formData.receiptInNameOf}
                      onChange={e => handleFormChange('receiptInNameOf', e.target.value)}
                    >
                      <MenuItem value='Clinica'>Clínica</MenuItem>
                      <MenuItem value='Medico'>Médico</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <CardHeader title='Informações da Clínica' />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Nome da Clínica'
                    placeholder='Nome da Clínica'
                    value={formData.clinicName}
                    onChange={e => handleFormChange('clinicName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='CNPJ da Clínica'
                    placeholder='CNPJ da Clínica'
                    value={formData.cnpj}
                    onChange={e => handleFormChange('cnpj', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Nome utilizado na comunicação'
                    placeholder='Nome utilizado na comunicação'
                    value={formData.communicationName}
                    onChange={e => handleFormChange('communicationName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Responsável pela Clínica'
                    placeholder='Responsável pela Clínica'
                    value={formData.responsible}
                    onChange={e => handleFormChange('responsible', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Tempo de visualização na agenda (minutos)</FormLabel>
                    <RadioGroup
                      row
                      name="calendarSchedule"
                      value={formData.calendarSchedule || '15'} 
                      onChange={(e) => handleFormChange('calendarSchedule', e.target.value)}
                    >
                      <FormControlLabel value="5" control={<Radio />} label="5" />
                      <FormControlLabel value="10" control={<Radio />} label="10" />
                      <FormControlLabel value="15" control={<Radio />} label="15" />
                      <FormControlLabel value="20" control={<Radio />} label="20" />
                      <FormControlLabel value="30" control={<Radio />} label="30" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Horário de abertura da Clínica'
                    placeholder='Horário de abertura da Clínica'
                    value={formData.openingTime}
                    onChange={e => handleFormChange('openingTime', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Horário de Fechamento da Clínica'
                    placeholder='Horário de Fechamento da Clínica'
                    value={formData.closingTime}
                    onChange={e => handleFormChange('closingTime', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Fuso Horário</InputLabel>
                    <Select
                      label='Fuso Horário'
                      value={formData.timeZone}
                      onChange={e => handleFormChange('timeZone', e.target.value)}
                    >
                      <MenuItem value='gmt-12'>(GMT-12:00) International Date Line West</MenuItem>
                      <MenuItem value='gmt-11'>(GMT-11:00) Midway Island, Samoa</MenuItem>
                      <MenuItem value='gmt-10'>(GMT-10:00) Hawaii</MenuItem>
                      <MenuItem value='gmt-09'>(GMT-09:00) Alaska</MenuItem>
                      <MenuItem value='gmt-08'>(GMT-08:00) Pacific Time (US & Canada)</MenuItem>
                      <MenuItem value='gmt-08-baja'>(GMT-08:00) Tijuana, Baja California</MenuItem>
                      <MenuItem value='gmt-07'>(GMT-07:00) Chihuahua, La Paz, Mazatlan</MenuItem>
                      <MenuItem value='gmt-07-mt'>(GMT-07:00) Mountain Time (US & Canada)</MenuItem>
                      <MenuItem value='gmt-06'>(GMT-06:00) Central America</MenuItem>
                      <MenuItem value='gmt-06-ct'>(GMT-06:00) Central Time (US & Canada)</MenuItem>
                      <MenuItem value='gmt-06-mc'>(GMT-06:00) Guadalajara, Mexico City, Monterrey</MenuItem>
                      <MenuItem value='gmt-06-sk'>(GMT-06:00) Saskatchewan</MenuItem>
                      <MenuItem value='gmt-05'>(GMT-05:00) Bogota, Lima, Quito, Rio Branco</MenuItem>
                      <MenuItem value='gmt-05-et'>(GMT-05:00) Eastern Time (US & Canada)</MenuItem>
                      <MenuItem value='gmt-05-ind'>(GMT-05:00) Indiana (East)</MenuItem>
                      <MenuItem value='gmt-04'>(GMT-04:00) Atlantic Time (Canada)</MenuItem>
                      <MenuItem value='gmt-04-clp'>(GMT-04:00) Caracas, La Paz</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <CardHeader title='Localização' />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='CEP'
                    placeholder='CEP'
                    value={formData.cep}
                    onChange={e => handleFormChange('cep', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Rua'
                    placeholder='Rua'
                    value={formData.street}
                    onChange={e => handleFormChange('street', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Número'
                    placeholder='Número'
                    value={formData.number}
                    onChange={e => handleFormChange('number', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Complemento'
                    placeholder='Complemento'
                    value={formData.complement}
                    onChange={e => handleFormChange('complement', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Bairro'
                    placeholder='Bairro'
                    value={formData.neighborhood}
                    onChange={e => handleFormChange('neighborhood', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Cidade'
                    placeholder='Cidade'
                    value={formData.city}
                    onChange={e => handleFormChange('city', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Estado'
                    placeholder='Estado'
                    value={formData.state}
                    onChange={e => handleFormChange('state', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
      <Grid item xs={12} display='flex' justifyContent='space-between'>
        <ButtonStyled type='submit' variant='contained' onClick={handleSubmit(onSubmit)}>
          Salvar Alterações
        </ButtonStyled>
        <ResetButtonStyled type='button' variant='contained' color='error' onClick={handleInputImageReset}>
          Reset
        </ResetButtonStyled>
      </Grid>

      <Dialog open={open} keepMounted onClose={handleClose}>
        <DialogContent>Tem certeza de que deseja salvar as alterações?</DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='error'>
            Cancelar
          </Button>
          <Button onClick={() => handleConfirmation('yes')} color='primary'>
            Sim
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={secondDialogOpen} keepMounted onClose={handleSecondDialogClose}>
        <DialogContent>{`As alterações foram salvas com sucesso? (${userInput})`}</DialogContent>
        <DialogActions>
          <Button onClick={handleSecondDialogClose} color='error'>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default TabAccount
