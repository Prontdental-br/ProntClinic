/* eslint-disable @typescript-eslint/no-unused-vars */
// ** React Imports
import { useState, useEffect, forwardRef, useCallback, Fragment } from 'react'

// ** MUI Imports
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import 'cleave.js/dist/addons/cleave-phone.br'

import moment from 'moment-timezone'

// ** Third Party Imports
import DatePicker, { registerLocale } from 'react-datepicker'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/router'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Types
import { EventDateType, AddEventSidebarType, AddEventType } from 'src/types/apps/calendarTypes'
import { AutocompleteWithAddButton } from 'src/views/components/AutocompleteWithAddButton'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  Grid,
  InputLabel
} from '@mui/material'

import { SelectNewLabel } from 'src/views/components/SelectNewLabel'
import FindDateHourFree from 'src/views/components/FindDateHourFree'
import { ThemeColor } from 'src/@core/layouts/types'

import { addPatient } from 'src/store/apps/patient'
import { fetchData as fetchDataTag, handleAllTags } from 'src/store/apps/tag'
import { fetchData as fetchDataPatient } from 'src/store/apps/patient'

// import { fetchData as fetchDataProfessional } from 'src/store/apps/professional'
import { fetchOne as fetchOneAccount } from 'src/store/apps/account'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import React, { useRef } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ProfessionalDataType } from 'src/types/apps/userTypes'
import ModalAddPacient from 'src/views/components/ModalAddPacient'
import api from 'src/@core/components/api-client'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

import utc from 'dayjs/plugin/utc'
import toast from 'react-hot-toast'
import { ptBR } from 'date-fns/locale'

dayjs.extend(utc)

interface OptionType {
  id: number
  name: string
  color: string
}
interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

interface DefaultStateType {
  publicId: string
  patientId: string
  professionalId: string
  treatmentId: string
  treatmentName: string
  treatmentSession: number
  treatmentSessionDone: number
  start: Date
  end: Date
  status: string
  allDay: boolean
  confirmed: boolean
  observation: string
  returnIn: number
  duration: number
  activeConfirmMessage?: boolean
  activeNotificationSound?: boolean
  activateReminder?: boolean
  saveConfirmMessage?: boolean
  returnTime?: Date
  tag: {
    tagId: string
    name: string
    color: ThemeColor
  }
}

const defaultState: DefaultStateType = {
  publicId: '',
  patientId: '',
  professionalId: '',
  treatmentId: '',
  treatmentName: '',
  treatmentSession: 0,
  treatmentSessionDone: 0,
  start: new Date(),
  end: new Date(),
  status: 'SC',
  allDay: false,
  confirmed: false,
  observation: '',
  returnIn: 0,
  duration: 0,
  activeConfirmMessage: false,
  activeNotificationSound: false,
  activateReminder: false,
  returnTime: new Date(),
  tag: {
    tagId: '',
    name: '',
    color: 'primary'
  }
}

const defaultValues = {
  patientId: '',
  professionalId: '',
  start: new Date(),
  end: new Date(),
  status: 'SC',
  allDay: false,
  observation: '',
  returnIn: '',
  duration: 0,
  return: '',
  tagId: '',
  treatmentId: '',
  confirmMessage: `👋 Olá %PACIENTE%,

Você tem uma consulta presencial com %MEDICO% agendada para %DIA% às 🕔 %HORA%.

🏥 Endereço: %ENDERECO%

✅ Por favor, confirme sua presença clicando no link abaixo:
%LINK%

🔄 Se precisar remarcar, avise com antecedência (pelo menos 24 horas antes) ⚠️

📞 Para falar com o consultório, entre em contato pelo número abaixo:

📱 %FONE%

✨ Aguardamos sua confirmação!`
}

const schema = yup.object().shape({
  patientId: yup.string().required('Campo obrigatório'),
  professionalId: yup.string().required('Campo obrigatório'),
  status: yup.string().required('Campo obrigatório'),
  return: yup.string().notRequired()
})

registerLocale('pt-BR', ptBR)

const AddEventSidebar = (props: AddEventSidebarType) => {
  // ** Props
  const {
    store,
    dispatch,
    addEvent,
    updateEvent,
    drawerWidth,
    calendarApi,
    deleteEvent,
    handleSelectEvent,
    addEventSidebarOpen,
    accountMe,
    fetchAccountMe,
    handleAddEventSidebarToggle,
    clinicData
  } = props

  const router = useRouter()
  const autocompleteWithAddButtonPatientRef = useRef<any>(null)
  const autocompleteWithAddButtonProfessionalRef = useRef<any>(null)
  const selectNewLabelRef = useRef<any>(null)

  const storeAccount = useSelector((state: RootState) => state.account)

  const storePatient = useSelector((state: RootState) => state.patient)

  //const dataTags = useSelector((state: RootState) => state.tag.data)
  const [dataTags, setDataTags] = useState([])
  const storeProfessional = useSelector((state: RootState) => state.professional)
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const [modalOpenHourFree, setModalOpenHourFree] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>({})
  const [patientTreatments, setPatientTreatments] = useState<any>([])
  const [selectedProfessional, setSelectedProfessional] = useState<any>({})
  const [selectedTag, setSelectedTag] = useState('')
  const [openModalAddPatient, setOpenModalAddPatient] = useState(false)
  const [user, setUser] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [openWhatsAppDialog, setOpenWhatsAppDialog] = useState(false)

  const [scheduleMessage, setScheduleMessage] = useState(`👋 Olá %PACIENTE%,

 Você tem uma consulta presencial com. %MEDICO% agendada para %DIA% às 🕔 %HORA%.

🏥 Endereço: %ENDERECO%

✅ Por favor, confirme sua presença clicando no link abaixo:
%LINK%

🔄 Se precisar remarcar, avise com antecedência (pelo menos 24 horas antes) ⚠️

📞 Para falar com o consultório, entre em contato pelo número abaixo:

📱 %FONE%

✨ Aguardamos sua confirmação!
  `)

  const resetScheduleMessage = () => {
    setScheduleMessage(`👋 Olá %PACIENTE%,

 Você tem uma consulta presencial com. %MEDICO% agendada para %DIA% às 🕔 %HORA%.

🏥 Endereço: %ENDERECO%

✅ Por favor, confirme sua presença clicando no link abaixo:
%LINK%

🔄 Se precisar remarcar, avise com antecedência (pelo menos 24 horas antes) ⚠️

📞 Para falar com o consultório, entre em contato pelo número abaixo:

📱 %FONE%

✨ Aguardamos sua confirmação!
  `)
  }

  // const fetchDataUser = async () => {
  //   const resp = await api.get('/accounts/me');
  //   console.log(resp.data.user)
  //   setScheduleMessage(resp.data.user?.scheduleMessageText || scheduleMessage);
  // }

  // const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  // console.log(userData)
  // setUser({ ...userData })
  // console.log(userData);
  // if (userData.professional) {
  //   setSelectedProfessional({ id: userData.professional.id, name: userData.professional.name })
  //   setValue('professionalId', userData.professional.id)
  // }

  const fetchData = async () => {
    const resp = await api.get('/accounts/me')
    console.log(resp.data.user)

    if (store.selectedEvent?.publicId !== '' && store.selectedEvent?.start && store.selectedEvent?.end)
      setValues({
        ...values,
        activeConfirmMessage:
          resp.data.user?.activeScheduleMessage === true || resp.data.user?.activeScheduleMessage === 'true',
        activeNotificationSound: resp.data.user?.activeNotificationSound || false,
        activateReminder: resp.data.user?.activateReminder || false,
        start: store.selectedEvent.start,
        end: store.selectedEvent.end
      })
    else
      setValues({
        ...values,
        activeConfirmMessage:
          resp.data.user?.activeScheduleMessage === true || resp.data.user?.activeScheduleMessage === 'true',
        activeNotificationSound: resp.data.user?.activeNotificationSound || false,
        activateReminder: resp.data.user?.activateReminder || false
      })

    setScheduleMessage(resp.data.user?.scheduleMessageText || scheduleMessage)

    // const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    // console.log(userData)
    // setUser({ ...userData })
    // console.log(userData);
    // if (userData.professional) {
    //   setSelectedProfessional({ id: userData.professional.id, name: userData.professional.name })
    //   setValue('professionalId', userData.professional.id)
    // }

    const { data } = await api.get('/tags')
    console.log(data)
    setSelectedTag(data[0]?.id)
    setDataTags(data)
    dispatch(handleAllTags(data))
  }

  // useEffect(() => {
  //   fetchData();
  // }, [])

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        if (selectedPatient?.id) {
          const { data } = await api.get(`/budget-items?patientId=${selectedPatient.id}`)

          const pendingTreatments = data.filter((item: any) => item.status === 'PENDING')

          setPatientTreatments(pendingTreatments)
        }
      } catch (error) {
        console.error('Erro ao buscar tratamentos do paciente:', error)
      }
    }

    fetchDataAsync()
  }, [selectedPatient])

  // useEffect(() => {
  //     fetchDataAsync();
  // }, [selectedPatient])

  useEffect(() => {
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    dispatch(fetchOneAccount(userData.accountId))

    // dispatch(fetchDataTag())
  }, [dispatch])

  const fetchOptionsPatient = async (searchText: string) => {
    try {
      // dispatch(fetchDataPatient(searchText))

      const data = storePatient.data.map((item: OptionType) => {
        return {
          id: item.id,
          name: item.name
        }
      })

      return data
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const fetchOptionsProfessional = async (searchText: string) => {
    try {
      // dispatch(fetchDataProfessional())

      const data = storeProfessional.data
        .filter((item: ProfessionalDataType) => item.specialty !== 'recepcionista')
        .map((item: ProfessionalDataType) => {
          return {
            id: item.id,
            name: item.name
          }
        })

      return data
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const handleVerifyWhatsApp = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/whatsapp')
      const connection = data?.data?.[0]

      if (!connection || !connection.isConnected) {
        setOpenWhatsAppDialog(true)
        setLoading(false)

        return false
      }

      return true

      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({ defaultValues, resolver: yupResolver(schema) })

  const handleAddPatient = () => {
    console.log('Cadastrar novo paciente')
  }

  const treatmentId = watch('treatmentId')

  const handleOpenCloseModal = () => {
    // setIdPatient(id)
    setOpenModalAddPatient(!openModalAddPatient)
  }

  const handleSavePaciente = (data: any) => {
    dispatch(addPatient(data))
  }

  const handleAddProfessional = () => {
    router.push('/pages/account-settings/security/')
    console.log('Cadastrar novo profissional')
  }

  const handleSidebarClose = async () => {
    setValues(defaultState)
    clearErrors()
    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
  }

  const handleModalOpen = () => {
    setModalOpenHourFree(true)
  }

  const handleModalClose = () => {
    setModalOpenHourFree(false)
  }

  const dateOptions = ['2023-08-01', '2023-08-02', '2023-08-03', '2023-08-04', '2023-08-05']

  const onSubmit = async (data: any) => {
    const modifiedEvent: AddEventType = {
      publicId: store.selectedEvent?.publicId || '',
      title: values.patientId,
      start: values.start,
      end: values.end,
      url: '#',
      allDay: values.allDay,
      extendedProps: {
        returnIn: data.returnIn ? Math.floor(data.returnIn) : 0,
        patientId: data.patientId,
        patientName: '',
        patientPhone: '',
        professionalId:
          user && user['professional'] && user['professional']['id'] ? user['professional']['id'] : data.professionalId,
        professionalName: '',
        status: data.status,
        duration: storeAccount.account.consultationTime || 30,
        observation: data.observation,
        isConfirmed: data.status == 'CF',
        confirmMessage: scheduleMessage,
        activateReminder: values.activateReminder,
        treatmentId: data.treatmentId,
        activeConfirmMessage: values.activeConfirmMessage,
        activeNotificationSound: values.activeNotificationSound,
        saveConfirmMessage: values.saveConfirmMessage,
        returnTime: values.returnTime,
        return: data.return,
        tag: {
          tagId: data.tagId ? data.tagId : selectedTag
        } as any
      }
    }

    if (store.selectedEvent === null || store.selectedEvent.publicId === '') {
      if (values.activeConfirmMessage) {
        const isConnected = await handleVerifyWhatsApp()

        if (!isConnected) {
          return
        }
      }

      dispatch(addEvent(modifiedEvent))
      toast.success('Agendado com sucesso!')
    } else {
      dispatch(updateEvent({ ...modifiedEvent }))
      toast.success('Agendamento editado!')
    }

    fetchData()
    calendarApi.refetchEvents()
    handleSidebarClose()
  }

  const handleDeleteEvent = () => {
    if (store.selectedEvent) {
      dispatch(deleteEvent(store.selectedEvent.publicId))
    }

    // calendarApi.getEventById(store.selectedEvent.id).remove()
    handleSidebarClose()
  }

  const handleStart = (date: Date) => {
    if (date > values.end) {
      setValues({ ...values, start: new Date(date), end: new Date(date) })
    }
  }

  const resetToStoredValues = useCallback(() => {
    if (store.selectedEvent !== null) {
      const event = store.selectedEvent

      setValue('patientId', event.extendedProps?.patientId)
      setValue('professionalId', event.extendedProps?.professionalId)
      setValue('status', event.extendedProps?.status)
      setValue('observation', event.extendedProps?.observation)
      setValue('returnIn', event.extendedProps?.returnIn.toString())
      setValue('tagId', event.extendedProps?.tag.tagId)
      setValue('treatmentId', event.extendedProps?.treatmentId || '')

      setSelectedPatient({ id: event.extendedProps?.patientId, name: event.extendedProps?.patientName })
      setSelectedProfessional({ id: event.extendedProps?.professionalId, name: event.extendedProps?.professionalName })
      setSelectedTag(event.extendedProps?.tag.tagId)

      setValues({
        publicId: event.publicId,
        start: event.start !== null ? event.start : new Date(),
        end: event.end !== null ? event.end : event.start,
        duration: event.extendedProps?.duration,
        observation: event.extendedProps?.observation || '',
        confirmed: event.extendedProps?.isConfirmed,
        allDay: event.allDay,
        status: event.extendedProps?.status || '',
        returnIn: event.extendedProps?.returnIn,
        patientId: event.extendedProps?.patientId || '',
        professionalId: event.extendedProps?.professionalId || '',
        treatmentId: event.extendedProps?.treatmentId || '',
        treatmentName: event.extendedProps?.treatmentName || '',
        treatmentSession: event.extendedProps?.treatmentSession || 0,
        treatmentSessionDone: event.extendedProps?.treatmentSessionDone || 0,
        tag: event.extendedProps?.tag || ''
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, store.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('patientId', defaultState.patientId)
    setValue('treatmentId', defaultState.treatmentId)
    setValue('professionalId', defaultState.professionalId)
    setValue('observation', defaultState.observation)
    setValue('allDay', defaultState.allDay)
    setValue('returnIn', defaultState.returnIn.toString())
    setValue('status', defaultState.status)
    setValue('start', defaultState.start)
    setValue('end', defaultState.end)
    setValues(defaultState)

    if (autocompleteWithAddButtonPatientRef.current) {
      autocompleteWithAddButtonPatientRef.current.clearAutocomplete(true)
    }

    if (autocompleteWithAddButtonProfessionalRef.current) {
      autocompleteWithAddButtonProfessionalRef.current.clearAutocomplete(true)
    }

    if (selectNewLabelRef.current) {
      selectNewLabelRef.current.clear(true)
      setSelectedTag('')
    }
  }, [setValue])

  useEffect(() => {
    if (store.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }

    fetchData()
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, store.selectedEvent])

  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
    return (
      <TextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        sx={{ width: '100%' }}
        error={props.error}
      />
    )
  })

  const RenderSidebarFooter = () => {
    if (store.selectedEvent === null || store.selectedEvent.publicId === '') {
      return (
        <Fragment>
          <Button size='large' type='submit' variant='contained' sx={{ mr: 4 }}>
            MARCAR
          </Button>
          <Button size='large' variant='outlined' color='secondary' onClick={handleSidebarClose}>
            FECHAR
          </Button>
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          <Button size='large' type='submit' variant='contained' sx={{ mr: 4 }}>
            ATUALIZAR
          </Button>
          <Button size='large' variant='outlined' color='secondary' onClick={handleSidebarClose}>
            FECHAR
          </Button>
        </Fragment>
      )
    }
  }

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth + 100] } }}
    >
      <Box
        className='sidebar-header'
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: 'background.default',
          p: theme => theme.spacing(3, 3.255, 3, 5.255)
        }}
      >
        <Typography variant='h6'>{store.selectedEvent !== null ? 'Atualizar Agenda' : 'Adicionar Agenda'}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {store.selectedEvent !== null ? (
            <IconButton
              size='small'
              onClick={handleDeleteEvent}
              sx={{ color: 'text.primary', mr: store.selectedEvent !== null ? 1 : 0 }}
            >
              <Icon icon='mdi:delete-outline' fontSize={20} />
            </IconButton>
          ) : null}
          <IconButton size='small' onClick={handleSidebarClose} sx={{ color: 'text.primary' }}>
            <Icon icon='mdi:close' fontSize={20} />
          </IconButton>
        </Box>
      </Box>

      <Box className='sidebar-body' sx={{ p: theme => theme.spacing(5, 6) }}>
        <DatePickerWrapper>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <FormControl fullWidth sx={{ mb: 6 }} error={!!errors?.patientId}>
              <AutocompleteWithAddButton
                fieldForm='patientId'
                control={control}
                selectedItem={selectedPatient}
                fetchDataOptions={fetchOptionsPatient}
                onAddEvent={handleOpenCloseModal}
                title='Paciente'
                ref={autocompleteWithAddButtonPatientRef}
                onChange={setSelectedPatient}
              />
              {errors?.patientId && (
                <Typography color='error' variant='caption'>
                  {errors?.patientId?.message}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 6 }}>
              <AutocompleteWithAddButton
                fieldForm='professionalId'
                control={control}
                selectedItem={
                  user['professional']
                    ? { id: user['professional']['id'], name: user['professional']['name'] }
                    : selectedProfessional
                }
                fetchDataOptions={fetchOptionsProfessional}
                onAddEvent={handleAddProfessional}
                title='Profissional'
                ref={autocompleteWithAddButtonProfessionalRef}
              />
              {errors?.professionalId && (
                <Typography color='error' variant='caption'>
                  {errors?.professionalId?.message}
                </Typography>
              )}
            </FormControl>

            <Box sx={{ mb: 6 }}>
              <DatePicker
                selectsStart
                id='event-start-date'
                endDate={values.end as EventDateType}
                selected={values.start as EventDateType}
                startDate={values.start as EventDateType}
                showTimeSelect={!values.allDay}
                timeIntervals={clinicData?.calendarSchedule || 5}
                timeFormat='HH:mm'
                locale='pt-BR'
                dateFormat={!values.allDay ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
                customInput={<PickersComponent label='Data Inicial' registername='start' />}
                onChange={(date: Date) => setValues({ ...values, start: new Date(date) })}
                onSelect={handleStart}
              />
            </Box>
            <Box sx={{ mb: 6 }}>
              <DatePicker
                selectsEnd
                id='event-end-date'
                endDate={values.end as EventDateType}
                selected={values.end as EventDateType}
                minDate={values.start as EventDateType}
                startDate={values.start as EventDateType}
                showTimeSelect={!values.allDay}
                timeIntervals={clinicData?.calendarSchedule || 5}
                timeFormat='HH:mm'
                locale='pt-BR'
                dateFormat={!values.allDay ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
                customInput={<PickersComponent label='Data Final' registername='end' />}
                onChange={(date: Date) => setValues({ ...values, end: new Date(date) })}
              />
            </Box>

            <Box sx={{ mb: 6 }}>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    displayEmpty
                    fullWidth
                    sx={{ height: '48px' }}
                    onChange={async event => {
                      const value = event.target.value
                      field.onChange(value)

                      if (value === 'CT') {
                        try {
                          const patients = await fetchOptionsPatient('')
                          const compromissoPatient = patients?.find((p: any) => p.name === 'Compromisso')

                          if (compromissoPatient) {
                            setValue('patientId', String(compromissoPatient.id))
                            setSelectedPatient(compromissoPatient)
                          }
                        } catch (error) {
                          console.error('Erro ao buscar paciente compromisso:', error)
                        }
                      }
                    }}
                  >
                    {!field.value && (
                      <MenuItem value=''>
                        <>Selecione o Status</>
                      </MenuItem>
                    )}
                    <MenuItem value='SC'>agendada</MenuItem>
                    <MenuItem value='CP'>cancelada pelo paciente</MenuItem>
                    <MenuItem value='CS'>cancelada pelo profissional</MenuItem>
                    <MenuItem value='CF'>confirmada</MenuItem>
                    <MenuItem value='MS'>falta</MenuItem>
                    <MenuItem value='AT'>atendida</MenuItem>
                    <MenuItem value='AP'>paciente chegou</MenuItem>
                    <MenuItem value='IS'>Em atendimento</MenuItem>
                    <MenuItem value='CT'>compromisso</MenuItem>
                  </Select>
                )}
              />
              {errors?.status && (
                <Typography color='error' variant='caption'>
                  {errors?.status?.message}
                </Typography>
              )}
            </Box>

            {/* <FormControl sx={{ mb: 1 }}>
              <Grid item xs={6}>
                <FormControlLabel
                  label='TODO O DIA?'
                  control={
                    <Switch
                      checked={values.allDay}
                      onChange={e => setValues({ ...values, allDay: e.target.checked })}
                    />
                  }
                />
              </Grid>
            </FormControl> */}

            {/* <FormControl fullWidth sx={{ mb: 6 }}>
              <Button
                style={{
                  color: 'Highlight',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
                href=''
                onClick={() => handleModalOpen()}
              >
                Encontrar horário livre
              </Button>
            </FormControl> */}

            <Controller
              name='observation'
              control={control}
              defaultValue=''
              render={({ field }) => (
                <TextField
                  {...field}
                  key={field.name}
                  rows={2}
                  multiline
                  fullWidth
                  sx={{ mb: 6 }}
                  label='Observações'
                  id='event-observation'
                />
              )}
            />

            {storeAccount.account?.planType !== 'E' && (
              <Controller
                name='treatmentId'
                control={control}
                defaultValue=''
                render={({ field }) => (
                  <FormControl fullWidth sx={{ mb: 6 }}>
                    <InputLabel id='select-treatment-label'>Tratamento</InputLabel>
                    <Select
                      {...field}
                      labelId='select-treatment-label'
                      id='select-treatment'
                      label='Tratamento'
                      value={field.value || ''}
                      onChange={event => {
                        field.onChange(event.target.value)
                      }}
                    >
                      {patientTreatments.map((treatmentItem: any) => (
                        <MenuItem key={treatmentItem.id} value={treatmentItem.id}>
                          {treatmentItem.treatment?.name} – R$ {Number(treatmentItem.value).toFixed(2)}
                          {treatmentItem.session > 0 && (
                            <>
                              {' '}
                              ({treatmentItem.sessionDone} / {treatmentItem.session})
                            </>
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            )}

            {treatmentId && (
              <Controller
                name='return'
                control={control}
                defaultValue=''
                rules={{ required: 'Selecione o aviso de retorno' }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth sx={{ mb: 6 }} error={!!error}>
                    <InputLabel id='aviso-retornos-label'>Aviso Retornos</InputLabel>
                    <Select
                      {...field}
                      labelId='aviso-retornos-label'
                      id='aviso-retornos'
                      label='Aviso Retornos'
                      value={field.value || ''}
                      onChange={event => field.onChange(event.target.value)}
                    >
                      <MenuItem value='5-D'>5 dias</MenuItem>
                      <MenuItem value='15-D'>15 dias</MenuItem>

                      {[...Array(12)].map((_, index) => (
                        <MenuItem key={index + 1} value={`${index + 1}-M`}>
                          {index + 1} {index + 1 === 1 ? 'mês' : 'meses'}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            )}

            <FormControl sx={{ mb: 1 }}>
              <Grid item xs={6}>
                <FormControlLabel
                  label='Ativar mensagem de confirmação'
                  control={
                    <Switch
                      checked={values.activeConfirmMessage}
                      onChange={e => {
                        // fetchDataUser();
                        setValues({ ...values, activeConfirmMessage: e.target.checked })
                      }}
                    />
                  }
                />
              </Grid>
            </FormControl>

            {storeAccount.account?.planType !== 'E' && (
              <FormControl sx={{ mb: 1 }}>
                <Grid item xs={6}>
                  <FormControlLabel
                    label='Lembrete 24h'
                    control={
                      <Switch
                        checked={values.activateReminder}
                        onChange={e => {
                          // fetchDataUser();
                          setValues({ ...values, activateReminder: e.target.checked })
                        }}
                      />
                    }
                  />
                </Grid>
              </FormControl>
            )}

            <FormControl sx={{ mb: 1 }}>
              <Grid item xs={6}>
                <FormControlLabel
                  label='Ativar Som'
                  control={
                    <Switch
                      checked={values.activeNotificationSound}
                      onChange={e => {
                        // fetchDataUser();
                        setValues({ ...values, activeNotificationSound: e.target.checked })
                      }}
                    />
                  }
                />
              </Grid>
            </FormControl>

            {values.activeConfirmMessage && (
              <FormControl sx={{ mb: 1 }}>
                <>
                  <Grid item xs={6}>
                    <FormControlLabel
                      label='Salvar mensagem'
                      control={
                        <Switch
                          checked={values.saveConfirmMessage}
                          onChange={e => setValues({ ...values, saveConfirmMessage: e.target.checked })}
                        />
                      }
                    />
                  </Grid>
                  <Button onClick={resetScheduleMessage}>Inserir mensagem padrão</Button>
                </>
              </FormControl>
            )}

            {values.activeConfirmMessage && (
              <Controller
                name='confirmMessage'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    key={field.name}
                    rows={4}
                    multiline
                    fullWidth
                    sx={{ mb: 6 }}
                    value={scheduleMessage}
                    onChange={e => setScheduleMessage(e.target.value)}
                    label='Mensagem de confirmação'
                    id='confirm-message'
                  />
                )}
              />
            )}

            <FormControl fullWidth sx={{ display: 'flex', mb: 6, flexDirection: 'row', gap: 2 }}>
              <SelectNewLabel
                data={dataTags}
                fetch={fetchData}
                name='Rótulo'
                control={control}
                ref={selectNewLabelRef}
                reset={reset}
                selectedTag={selectedTag}
              />
              {/* 
              <div style={{ flex: 1 }}>
                <Controller
                  name='returnIn'
                  control={control}
                  defaultValue='0'
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors?.returnIn}>
                      <Select {...field} displayEmpty>
                        <MenuItem value='0'>SEM RETORNO</MenuItem>
                        <MenuItem value='5'>15 DIAS</MenuItem>
                        <MenuItem value='6'>30 DIAS</MenuItem>
                        <MenuItem value='1'>1 MÊS </MenuItem>
                        <MenuItem value='7'>2 MESES </MenuItem>
                        <MenuItem value='8'>3 MESES </MenuItem>
                        <MenuItem value='9'>4 MESES </MenuItem>
                        <MenuItem value='10'>5 MESES </MenuItem>
                        <MenuItem value='2'>6 MESES</MenuItem>
                        <MenuItem value='11'>7 MESES </MenuItem>
                        <MenuItem value='12'>8 MESES </MenuItem>
                        <MenuItem value='13'>9 MESES </MenuItem>
                        <MenuItem value='14'>10 MESES </MenuItem>
                        <MenuItem value='15'>11 MESES </MenuItem>
                        <MenuItem value='3'>12 MESES</MenuItem>
                        <MenuItem value='4'>OUTROS</MenuItem>
                      </Select>
                      {errors?.returnIn && (
                        <Typography color='error' variant='caption'>
                          {errors?.returnIn?.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </div>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  value={dayjs(values.returnTime)}
                  format={'HH:mm'}
                  ampm={false}
                  label='Hora inicial'
                  onChange={(date: any) => setValues({ ...values, returnTime: date.toDate() })}
                />
              </LocalizationProvider>

              

              {/* <Controller
                name='tagId'
                control={control}
                defaultValue=''
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors?.tagId}>
                    <Select {...field}>
                      <MenuItem value=''>
                        <div style={{ display: 'flex', alignItems: 'center' }}>NENHUM</div>
                      </MenuItem>
                      {dataTags.map((option: any, index) => (
                        <MenuItem key={index} value={option.id}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              label={option.name[0]?.toUpperCase()}
                              color={option.color as any}
                              size='medium'
                              sx={{ marginRight: '8px', height: '32px' }}
                            />
                            {option.name.toUpperCase()}
                          </div>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors?.tagId && (
                      <Typography color='error' variant='caption'>
                        {errors?.tagId?.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
                */}
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RenderSidebarFooter />
            </Box>
          </form>
        </DatePickerWrapper>
      </Box>

      <FindDateHourFree open={modalOpenHourFree} onClose={handleModalClose} data={dateOptions} />
      <ModalAddPacient
        id={null}
        open={openModalAddPatient}
        onClose={handleOpenCloseModal}
        onSave={handleSavePaciente}
      />

      <Dialog open={openWhatsAppDialog} onClose={() => setOpenWhatsAppDialog(false)}>
        <DialogTitle>Conexão Necessária</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para enviar mensagens de confirmação no WhatsApp, é necessário conectar sua conta.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWhatsAppDialog(false)} color='primary'>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              setOpenWhatsAppDialog(false)
              router.push('/pages/account-settings/connect-whatsapp')
            }}
          >
            Conectar Agora
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  )
}

export default AddEventSidebar
