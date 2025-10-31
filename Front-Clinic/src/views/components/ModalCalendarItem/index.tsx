/* eslint-disable @typescript-eslint/no-unused-vars */
// ** React Imports
import { useState, useEffect, useCallback } from 'react'
import { Card, CardActions, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, InputLabel, LinearProgress, MenuItem, Modal, Select, TextField, Tooltip } from '@mui/material'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { Link } from '@mui/material'

// ** Third Party Imports
import { useForm } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import PhoneIcon from '@mui/icons-material/Phone';
import { ModalCalendarItemType } from 'src/types/apps/calendarTypes'
import moment from 'moment'
import { ThemeColor } from 'src/@core/layouts/types'
import CheckCalendar from './CheckCalendar'
import toast from 'react-hot-toast'
import { Info, LockOutlined } from '@mui/icons-material'
import { useRouter } from 'next/router'

interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

interface DefaultStateType {
  publicId: string
  url: string
  title: string
  allDay: boolean
  end: Date
  start: Date
  extendedProps: {
    returnIn: number
    patientId: string
    patientName: string
    patientPhone: string
    professionalId: string
    professionalName: string
    treatmentId?: string
    patientNextConsultationForecast: string
    status: string
    duration: number
    observation: string
    confirmed: boolean
    tag: {
      tagId: string
      name: string
      color: ThemeColor
    }
  }
}

const capitalize = (string: string) => string && string[0].toUpperCase() + string.slice(1)

const defaultState: DefaultStateType = {
  publicId: '',
  title: '',
  allDay: false,
  url: '#',
  end: new Date(),
  start: new Date(),
  extendedProps: {
    duration: 30,
    observation: '',
    confirmed: false,
    status: '',
    returnIn: 0,
    patientId: '',
    patientName: '',
    patientPhone: '',
    professionalId: '',
    professionalName: '',
    treatmentId: '',
    patientNextConsultationForecast: '',
    tag: {
      tagId: '',
      name: '',
      color: 'primary'
    }
  }
}

const ModalCalendarItem = (props: ModalCalendarItemType) => {
  // ** Props
  const {
    store,
    dispatch,
    calendarApi,
    handleSelectEvent,
    onClose,
    ModalCalendarItemOpen,
    handleUpdateEventSidebarToggle,
    updateStatusEvent,
    calendarsColorLabels,
    deleteEvent
  } = props

  // ** States
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const [modalOpenHourFree, setModalOpenHourFree] = useState(false)
  const [status, setStatus] = useState<string>('')

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);  

  const defaultValues = {
    patientId: '',
    phone: '',
    professionalId: ''
  }

  const {
    setValue,
    clearErrors,
    formState: { errors }
  } = useForm({ defaultValues: {} })

  const handleModalItemClose = async () => {
    setValues(defaultState)
    clearErrors()
    dispatch(handleSelectEvent(null))
    onClose()
  }

  const handleClickArrivedPatient = () => {
    setStatus('AP')
    dispatch(
      updateStatusEvent({
        id: store.selectedEvent?.publicId,
        status: 'AP'
      })
    )
  }

  const router = useRouter()
  
const MAX_OBSERVATION_LENGTH = 100; 
const MAX_PATIENT_NEXT_CONSULTATION_FORECAST_LENGTH = 90;

const patientNextConsultationForecast = store.selectedEvent?.extendedProps.patientNextConsultationForecast;


// const treatmentWithoutSessionButDone = store.selectedEvent?.extendedProps.treatmentStatus;

// const done = store.selectedEvent?.extendedProps.treatmentSessionDone ?? 0;
// const total = store.selectedEvent?.extendedProps.treatmentSession ?? 0;

// const percent = total > 0 ? Math.round((done / total) * 100) : 0;


const treatmentWithoutSessionButDone =
  store.selectedEvent?.extendedProps.treatmentStatus === 'done';

const done = store.selectedEvent?.extendedProps.treatmentSessionDone ?? 0;
const total = store.selectedEvent?.extendedProps.treatmentSession ?? 0;

let percent = 0;

if (total > 0) {
  percent = Math.round((done / total) * 100);
} else {
  
  if (treatmentWithoutSessionButDone) {
    percent = 100;
  }
}

const shortNextConsultationForecast = 
patientNextConsultationForecast && patientNextConsultationForecast.length > MAX_PATIENT_NEXT_CONSULTATION_FORECAST_LENGTH
    ? patientNextConsultationForecast.substring(0, MAX_PATIENT_NEXT_CONSULTATION_FORECAST_LENGTH) + '...'
    : patientNextConsultationForecast;


const observation = store.selectedEvent?.extendedProps.observation;
const shortObservation =
  observation && observation.length > MAX_OBSERVATION_LENGTH
    ? observation.substring(0, MAX_OBSERVATION_LENGTH) + '...'
    : observation;

  const handleChangeStatus = (event: any) => {
    setStatus(event.target.value)
    dispatch(
      updateStatusEvent({
        id: store.selectedEvent?.publicId,
        status: event.target.value
      })
    )
  }

  const handleDelete = (publicId: string) => {
    dispatch(deleteEvent(publicId))
    toast.success('Agendamento deletado!')
    onClose()
  }

  const resetToStoredValues = useCallback(() => {
    if (store.selectedEvent !== null) {
      const event = store.selectedEvent
    
      setStatus(event.extendedProps.status || '')
      setValues({
        publicId: event.publicId,
        title: event.title,
        allDay: event.allDay || false,
        url: '#',
        start: event.start !== null ? event.start : new Date(),
        end: event.end !== null ? event.end : event.start,
        extendedProps: {
          duration: event.extendedProps.duration || 30,
          observation: event.extendedProps.observation || '',
          confirmed: event.extendedProps.isConfirmed || false,
          status: event.extendedProps.status,
          returnIn: event.extendedProps.returnIn || 0,
          patientId: event.extendedProps.patientId || '',
          patientName: event.extendedProps.patientName || '',
          patientNextConsultationForecast: event.extendedProps.patientNextConsultationForecast || '',
          patientPhone: event.extendedProps.patientPhone || '',
          professionalId: event.extendedProps.professionalId || '',
          professionalName: event.extendedProps.professionalName || '',
          treatmentId: event.extendedProps.treatmentId || '',
          tag: event.extendedProps.tag || ''
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, store.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValues(defaultState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue])

  useEffect(() => {
    if (store.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [resetToStoredValues, resetToEmptyValues, store.selectedEvent])

  return (
    <Modal open={ModalCalendarItemOpen} onClose={handleModalItemClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24
        }}
      >
        <Box
          sx={{
            display: 'flex',
            backgroundColor: 'background.default',
            pl: 4,
            pt: 4,
            pb: 2
          }}
        >
          <Typography variant='h6' component='div' sx={{ marginBottom: 2 }}>
            Detalhes do Agendamento
          </Typography>
        </Box>
        <Box
          sx={{
            p: 4
          }}
        >
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ my: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                    {/*  */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* <CustomAvatar skin='light' variant='rounded' sx={{ mr: 3 }} contentEditable='false'> */}
                        <Icon icon='mdi:check' color='green' width={20} />
                        {/* </CustomAvatar> */}
                        <div>
                          <Typography sx={{ lineHeight: 1.3, pt: 3 }}>
                            {calendarsColorLabels[store.selectedEvent?.extendedProps.status as string]}
                          </Typography>
                        </div>
                      </div>
                    </Box>

                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
                      component={Link}
                      href={`http://wa.me/` + '55' + store.selectedEvent?.extendedProps.patientPhone}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <Icon icon='mdi:whatsapp' color='green' width={20} />
                        <Typography sx={{ lineHeight: 1.3, pt: 3 }}>WhatsApp</Typography>
                      </div>
                    </Box>

                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
                      component={Link}
                      href={`http://wa.me/` + '55' + store.selectedEvent?.extendedProps.patientPhone + '?text=' + encodeURI(`Olá, ${store.selectedEvent?.title}
                      Está confirmada sua consulta com o ${store.selectedEvent?.extendedProps.professionalName}
                      Horário : ${moment(store.selectedEvent?.start).format('HH:mm DD/MM/yyyy')}
                      Até breve!!`)}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <CheckCalendar />
                        <Typography sx={{ lineHeight: 1.3, pt: 3 }}>Confirmação</Typography>
                      </div>
                    </Box>
                  </Box>

                </CardContent>

                <CardContent>
                  <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: '.2rem' }}>{store.selectedEvent?.title}
                    <Link href={`/patient/view/about/${values.extendedProps.patientId}`} style={{ display: 'flex' }}>
                      <Icon icon='mdi:arrow-right' color='blue' width={20} />
                    </Link>

                     <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', ml: 4 }}>
                        
                         <Tooltip title="Prontuário" placement="top">
                          <Link href={`/patient/view/about/${values.extendedProps.patientId}`} style={{ display: 'flex' }}>
                            <Icon icon="mdi:account-outline" color='gray'  width={23} />
                          </Link>
                         </Tooltip>

                         <Tooltip title="Orçamentos" placement="top">
                            <Link href={`/patient/view/budget/${values.extendedProps.patientId}`} style={{ display: 'flex' }}>
                              <Icon icon="mdi:clipboard-text-outline" color='gray'  width={23} />
                            </Link>
                          </Tooltip>

                         <Tooltip title="Débitos" placement="top">
                            <Link href={`/patient/view/debts/${values.extendedProps.patientId}`} style={{ display: 'flex' }}>
                              <Icon icon="mdi:currency-usd" color='gray' width={23} />
                            </Link>
                         </Tooltip>
                     </Box>
                    
                  </Typography>
                    <span style={{ fontSize: '14.5px', padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                    <PhoneIcon sx={{ fontSize: '18px' }}/> {store.selectedEvent?.extendedProps.patientPhone}
                    </span>
                  <Divider sx={{ mt: theme => `${theme.spacing(2)} !important` }} />
                  <Box sx={{ pt: 2, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', mb: 2.7 }}>

                      <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Rótulo:
                      </Typography>
                      <Typography variant='body2'>
                        {store.selectedEvent?.extendedProps.tag?.tagId ? (
                          <Chip
                            key={store.selectedEvent?.extendedProps.tag?.tagId}
                            size='small'
                            label={store.selectedEvent?.extendedProps.tag?.name}
                            color={store.selectedEvent?.extendedProps.tag?.color}
                          />
                        ) : (
                          <Chip size='small' label='Nenhum' color='primary' />
                        )}
                      </Typography>
                        </Box>

                      <button style={{ 
                        backgroundColor: '#ff7f00', 
                        border: 'none', 
                        color: 'white', 
                        padding: '10px 20px', 
                        borderRadius: '5px', 
                        fontFamily: 'Inter', 
                        cursor: 'pointer',  
                       textTransform: 'uppercase',
                       fontWeight: '500'
                        }}
                        onClick={handleClickArrivedPatient}
                        >
                        paciente chegou
                      </button>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                      <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Profissional:
                      </Typography>
                      <Typography variant='body2'>{store.selectedEvent?.extendedProps.professionalName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                      <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Data Inicial:
                      </Typography>
                      <Typography variant='body2'>
                        {moment(store.selectedEvent?.start).format('DD/MM/yyyy HH:mm')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                      <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Data Final:
                      </Typography>
                      <Typography variant='body2'>
                        {moment(store.selectedEvent?.end).format('DD/MM/yyyy HH:mm')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%' }}>
                      <Select
                        displayEmpty
                        fullWidth
                        sx={{ height: '48px' }}
                        onChange={handleChangeStatus}
                        value={status}
                      >
                        <MenuItem value=''>[SELECIONE STATUS]</MenuItem>
                        <MenuItem value='SC'>agendada</MenuItem>
                        <MenuItem value='CP'>cancelada pelo paciente</MenuItem>
                        <MenuItem value='CS'>cancelada pelo profissional</MenuItem>
                        <MenuItem value='CF'>confirmada</MenuItem>
                        <MenuItem value='MS'>falta</MenuItem>
                        <MenuItem value='AT'>atendida</MenuItem>
                        <MenuItem value='IS'>em atendimento</MenuItem>
                        <MenuItem value='CT'>compromisso</MenuItem>
                        <MenuItem value='AP'>paciente chegou</MenuItem>
                      </Select>
                    </Box>
                      
                    {store.selectedEvent?.extendedProps.observation && (
                      <TextField
                        sx={{ mt: 4 }}
                        label="Observações"
                        value={shortObservation || 'Sem observações'}
                        multiline
                        minRows={2}
                        maxRows={4}
                        fullWidth
                        variant="outlined"
                        InputProps={{ readOnly: true }}
                      />
                    )}

                  
                    
                  {store.selectedEvent?.extendedProps.treatmentId && (
                    <Card variant="outlined" sx={{ mt: 2, borderRadius: 1, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mr: 2, color: 'text.primary' }} gutterBottom>
                          Tratamento
                        </Typography>
                        
                        <Typography variant="subtitle2" color="text.secondary">
                          {store.selectedEvent?.extendedProps.treatmentName}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" mt={2} mb={1}>
                          <Typography variant="body2">
                            {store.selectedEvent?.extendedProps.treatmentSession && (
                              <>
                                Sessões: {store.selectedEvent?.extendedProps.treatmentSessionDone} / {store.selectedEvent?.extendedProps.treatmentSession}
                              </>
                            )}
                            
                          </Typography>
                      
                            <Typography variant="body2">
                                {percent}%
                            </Typography>
                          
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#f0f0f0",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor:
                              percent === 100
                                ? "#4caf50" 
                                : "#1976d2", 
                          },
                        }}
                        />
                      </CardContent>
                    </Card>
                  )}
                    
                    {store.selectedEvent?.extendedProps.patientNextConsultationForecast && (
                     <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <InputLabel sx={{ fontSize: '13px' }}>A executar</InputLabel>
                          <IconButton
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => router.push(`/patient/view/treatment/${values.extendedProps.patientId}`)}
                          >
                            <LockOutlined fontSize='small' />
                          </IconButton>
                        </Box>

                        <TextField
                          value={shortNextConsultationForecast || ''}
                          multiline
                          minRows={2}
                          maxRows={4}
                          fullWidth
                          variant="outlined"
                          InputProps={{ readOnly: true }}
                        />
                      </Box>
                    )}
                  
                                    
                  </Box>
                </CardContent>

                <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button variant='contained' sx={{ mr: 2 }} onClick={handleUpdateEventSidebarToggle}>
                    Editar
                  </Button>
                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => {
                      setEventToDelete(store.selectedEvent?.publicId || '');
                      setOpenConfirmDialog(true);
                    }}
                  >
                    Apagar
                  </Button>
                  <Button variant='outlined' onClick={() => onClose()}>
                    Fechar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
   <Dialog
  open={openConfirmDialog}
  onClose={() => setOpenConfirmDialog(false)}
>
  <DialogTitle>Confirmar Exclusão</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Tem certeza que deseja apagar este agendamento? Esta ação não pode ser desfeita.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
      Cancelar
    </Button>
    <Button
      onClick={() => {
        if (eventToDelete) {
          handleDelete(eventToDelete);
        }
        setOpenConfirmDialog(false);
      }}
      color="error"
      variant="contained"
    >
      Apagar
    </Button>
  </DialogActions>
</Dialog>
      </Box>

    </Modal>
  )
}

export default ModalCalendarItem
