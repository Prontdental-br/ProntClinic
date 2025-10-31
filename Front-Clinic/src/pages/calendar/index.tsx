// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Types
import { RootState, AppDispatch } from 'src/store'
import {
  CalendarColors,
  CalendarColorsLabels,
  CalendarColorsLabelsType,
  CalendarFiltersType
} from 'src/types/apps/calendarTypes'

// ** FullCalendar & App Components Imports
import Calendar from 'src/views/apps/calendar/Calendar'
import SidebarLeft from 'src/views/apps/calendar/SidebarLeft'
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'
import AddEventSidebar from 'src/views/apps/calendar/AddEventSidebar'
import 'react-toastify/dist/ReactToastify.css'

// ** Actions
import {
  addEvent,
  fetchEvents,
  deleteEvent,
  updateEvent,
  updateStatusEvent,
  updateDateEvent,
  handleCalendarDatesSet,
  handleSelectEvent,
  handleAllCalendars,
  handleCalendarsUpdate,
  handleCalendarsProfessionalUpdate
} from 'src/store/apps/calendar'
import ModalCalendarItem from 'src/views/components/ModalCalendarItem'
import SidebarAddUser from 'src/views/apps/user/list/AddUserDrawer'
import { ToastContainer, toast } from 'react-toastify'
import api from 'src/@core/components/api-client'

import { EventSourcePolyfill } from 'event-source-polyfill'
import authConfig from 'src/configs/auth'
import { notifyArrival } from 'src/views/components/NotifyArrival'
import { useRouter } from 'next/router'

// ** CalendarColors
const calendarsColor: CalendarColors = {
  MS: 'error',
  SC: 'primary',
  CP: 'warning',
  CS: 'secondary',
  CF: 'success',
  AT: 'info',
  AP: 'orange',
  IS: 'bic',
  CT: 'purple'
}

const calendarsColorLabels: CalendarColorsLabelsType = {
  MS: 'Falta',
  SC: 'Agendada',
  CP: 'Canc. Paciente',
  CS: 'Canc. Profissional',
  CF: 'Confirmada',
  AT: 'Atendida',
  AP: 'Paciente chegou',
  IS: 'Em atendimento',
  CT: 'Compromisso'
}

const returnDays: any = {
  '5': 15,
  '6': 30,
  '1': 30,
  '7': 60,
  '8': 90,
  '9': 120,
  '10': 150,
  '2': 180,
  '11': 210,
  '12': 240,
  '13': 270,
  '14': 300,
  '15': 330,
  '3': 360
}

// function checkAppointments(appointments = []) {
//   const now: any = new Date();
//   const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

//   appointments.forEach((appointment: any) => {
//       console.log(appointment);
//       const start: any = new Date(appointment.startDate);

//       if ((start - now) <= oneDayInMilliseconds && appointment.status === 'SC') {
//         console.log('Entrou no IF');
//           toast(`Atenção! A consulta de ${appointment.patient?.name} está a 24 horas de ser iniciada. Data e hora: ${appointment.startDate}`);
//       }
//   });
// }

// function checkAppointmentsReturn(appointments: any = []) {
//   const now: any = new Date();
//   const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

//   appointments.forEach((appointment: any) => {
//       const start: any = new Date(appointment.startDate);

//       if(appointment.returnIn === 5)
//         console.log(appointment);
//       const returnInDays = returnDays[appointment.returnIn];

//       if (returnInDays !== undefined) {
//           const returnDate: any = new Date(start.getTime() + returnInDays * 24 * 60 * 60 * 1000);

//           if ((returnDate - now) <= oneDayInMilliseconds && (returnDate - now) > 0) {
//               toast(`Atenção! O retorno de ${appointment.patient.name} está a 24 horas de ser iniciado. Data e hora: ${returnDate.toISOString()}`);
//           }
//       }
//   });
// }

const AppCalendar = () => {
  // ** States
  const [calendarApi, setCalendarApi] = useState<null | any>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)
  const [modalCalendarItemOpen, setModalCalendarItemOpen] = useState<boolean>(false)
  const [modalAddUserOpen, setModalAddUserOpen] = useState<boolean>(false)
  const [accountMe, setAccountMe] = useState<any>({})
  const [clinicData, setClinicData] = useState<any>({})

  // ** Hooks
  const { settings } = useSettings()
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const store = useSelector((state: RootState) => state.calendar)

  // ** Vars
  const leftSidebarWidth = 269
  const addEventSidebarWidth = 400
  const { skin, direction } = settings
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const URL_API = process.env.NEXT_PUBLIC_API_BASE_URL
  const TOKEN = window?.localStorage.getItem(authConfig.storageTokenKeyName)
  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')

  const professionalId = userData?.professional?.id

  const playNotificationSound = () => {
    const sound = new Audio('/notification.mp3')
    sound.currentTime = 0
    sound.play().catch(error => console.error('Erro ao reproduzir o som:', error))
  }

  const fetchData = async () => {
    const resp = await api.get('/accounts/me')
    setAccountMe(resp.data.user)

    return resp.data.user
  }

  const fetchDataClinc = async () => {
    const response = await api.get('/clinics')

    setClinicData(response.data)
  }

  useEffect(() => {
    fetchData()
    fetchDataClinc()
  }, [])

  useEffect(() => {
    if (!accountMe) return

    let eventSource: EventSourcePolyfill

    const connect = () => {
      eventSource = new EventSourcePolyfill(`${URL_API}/schedules/sse/${professionalId}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      })

      eventSource.onmessage = event => {
        const notification = JSON.parse(event.data)

        if (accountMe?.activeNotificationSound) {
          playNotificationSound()
        }

        toast(
          notifyArrival({
            patientName: notification.patientName,
            tag: notification.tag,
            time: notification.time,
            professionalName: notification.professionalName,
            nextConsultationForecast: notification.nextConsultationForecast || ''
          }),
          {
            autoClose: false,
            className: 'custom-toast',
            onClick: () => {
              toast.dismiss()
              markAsRead(notification.patientId)
            },
            closeButton: true
          }
        )
      }

      eventSource.onerror = () => {
        console.warn('Conexão SSE perdida, tentando reconectar...')
        eventSource.close()
        setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      eventSource.close()
    }
  }, [accountMe])

  const markAsRead = (patientId: string) => {
    router.push(`/patient/view/about/${patientId}`)
  }

  // useEffect(() => {
  //   (async ()=>{
  //     // const { data } = await api.get('/schedules');

  //     // checkAppointments(data);

  //     // checkAppointmentsReturn(data);
  //   })();
  // },[]);

  useEffect(() => {
    dispatch(
      fetchEvents({
        startDate: store.startDate,
        endDate: store.endDate,
        status: store.selectedCalendars,
        professionals: store.selectedProfessionals
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, store.startDate, store.endDate, store.selectedCalendars, store.selectedProfessionals])

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  const handleModalCalendarItemOpen = () => setModalCalendarItemOpen(!modalCalendarItemOpen)

  const handleModalAddUserOpen = () => setModalAddUserOpen(!modalAddUserOpen)

  const handleUpdateEventOpen = () => {
    handleModalCalendarItemOpen()
    handleAddEventSidebarToggle()
  }

  return (
    <CalendarWrapper
      className='app-calendar'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && {
          border: theme => `1px solid ${theme.palette.divider}`
        })
      }}
    >
      <ToastContainer />

      {/* CONTEÚDO PRINCIPAL DO CALENDÁRIO */}
      <Box
        sx={{
          px: 5,
          pt: 3.75,
          flexGrow: 1,
          borderRadius: 1,
          boxShadow: 'none',
          backgroundColor: 'background.paper',
          ...(mdAbove ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : {}) // ajustado para o lado direito
        }}
      >
        <Calendar
          store={store}
          dispatch={dispatch}
          direction={direction}
          updateEvent={updateEvent}
          updateDateEvent={updateDateEvent}
          handleCalendarDatesSet={handleCalendarDatesSet}
          calendarApi={calendarApi}
          calendarsColor={calendarsColor}
          setCalendarApi={setCalendarApi}
          handleSelectEvent={handleSelectEvent}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          clinicData={clinicData}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          handleModalItem={handleModalCalendarItemOpen}
        />
      </Box>

      {/* SIDEBAR AGORA DO LADO DIREITO */}
      <SidebarLeft
        store={store}
        mdAbove={mdAbove}
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarsColor={calendarsColor}
        calendarsColorLabels={calendarsColorLabels}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarWidth={leftSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        handleAllCalendars={handleAllCalendars}
        handleModalItem={handleModalCalendarItemOpen}
        handleCalendarsUpdate={handleCalendarsUpdate}
        handleCalendarsProfessionalUpdate={handleCalendarsProfessionalUpdate}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        handleOpenModalAddUser={handleModalAddUserOpen}
      />

      {/* MODAIS E SIDEBARS EXTRAS */}
      <ModalCalendarItem
        ModalCalendarItemOpen={modalCalendarItemOpen}
        onClose={handleModalCalendarItemOpen}
        store={store}
        calendarApi={calendarApi}
        dispatch={dispatch}
        handleSelectEvent={handleSelectEvent}
        handleUpdateEventSidebarToggle={handleUpdateEventOpen}
        updateStatusEvent={updateStatusEvent}
        calendarsColorLabels={calendarsColorLabels}
        deleteEvent={deleteEvent}
      />

      <SidebarAddUser open={modalAddUserOpen} toggle={handleModalAddUserOpen} />

      <AddEventSidebar
        store={store}
        accountMe={accountMe}
        fetchAccountMe={fetchData}
        dispatch={dispatch}
        addEvent={addEvent}
        updateEvent={updateEvent}
        deleteEvent={deleteEvent}
        calendarApi={calendarApi}
        drawerWidth={addEventSidebarWidth}
        clinicData={clinicData}
        handleSelectEvent={handleSelectEvent}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />
    </CalendarWrapper>
  )
}

export default AppCalendar
