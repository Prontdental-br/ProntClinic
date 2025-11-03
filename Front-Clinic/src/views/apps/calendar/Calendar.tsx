/* eslint-disable react/no-deprecated */
// ** React Import
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import YouTubeIcon from '@mui/icons-material/YouTube'
import Vimeo from '@u-wave/react-vimeo'

import ReactDOM from 'react-dom'

// ** Types
import { CalendarType, EventType } from 'src/types/apps/calendarTypes'

// ** Third Party Style Import
import 'bootstrap-icons/font/bootstrap-icons.css'
import moment from 'moment-timezone'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Popover, Typography } from '@mui/material'
import { Box } from '@mui/system'

const tagColors: Record<string, string> = {
  error: '#dc3545',
  primary: '#007bff',
  warning: '#ffc107',
  secondary: '#6c757d',
  success: '#198754',
  info: '#17a2b8',

  turquoise: '#B2DFDB',
  lightYellow: '#FFF9C4',
  skyBlue: '#BBDEFB',
  lavender: '#E1BEE7',
  taupe: '#BCAAA4',
  periwinkle: '#C5CAE9',
  salmon: '#FFAB91',
  rose: '#FFCDD2',
  lime: '#AED581',
  orangeMedium: '#FFB74D',
  dustyRose: '#CA8686',
  cyan: '#00FFFF',
  steelBlue: '#A1A1B9',
  tealDark: '#008B8B',
  grayDark: '#A9A9A9',
  neonGreen: '#03F103',
  khakiDark: '#BDB76B',
  purpleDeep: '#8B008B',
  coral: '#E9967A',
  fuchsia: '#FF00FF'
}

const blankEvent: EventType = {
  publicId: '',
  url: '',
  title: '',
  allDay: false,
  end: new Date(),
  start: new Date(),
  extendedProps: {
    returnIn: 0,
    patientId: '',
    patientName: '',
    patientPhone: '',
    professionalId: '',
    professionalName: '',
    patientNextConsultationForecast: '',
    treatmentId: '',
    treatmentName: '',
    treatmentSession: 0,
    treatmentSessionDone: 0,
    tag: {
      tagId: '',
      name: '',
      color: 'info'
    },
    status: 'SC',
    duration: 0,
    observation: '',
    isConfirmed: false
  }
}

const statusLabels: { [key: string]: string } = {
  SC: 'Agendada',
  CP: 'Canc. Paciente',
  CF: 'Confirmada',
  AT: 'Atendida',
  MS: 'Falta',
  CS: 'Canc. Profissional',
  AP: 'Paciente Chegou',
  IS: 'Em atendimento',
  CT: 'Compromisso'
}

const PopoverModal = ({
  hoveredEvent,
  mousePosition,
  setHoveredEvent,
  setMousePosition,
  hoverTimeoutRef
}: {
  hoveredEvent: any
  mousePosition: { top: number; left: number } | null
  setHoveredEvent: (value: any) => void
  setMousePosition: (value: any) => void
  hoverTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
}) => {
  return (
    <Popover
      open={!!hoveredEvent && !!mousePosition}
      anchorReference='anchorPosition'
      anchorPosition={mousePosition ? { top: mousePosition.top + 10, left: mousePosition.left + 10 } : undefined}
      onClose={() => {
        setHoveredEvent(null)
        setMousePosition(null)
      }}
      onMouseEnter={() => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current)
          hoverTimeoutRef.current = null
        }
      }}
      onMouseLeave={e => {
        const toElement = e.relatedTarget as HTMLElement
        if (toElement && e.currentTarget.contains(toElement)) return

        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredEvent(null)
          setMousePosition(null)
        }, 200)
      }}
      disableRestoreFocus
      disableAutoFocus
      disableEnforceFocus
      sx={{ pointerEvents: 'none' }}
      PaperProps={{
        sx: {
          p: 2,
          pointerEvents: 'auto',
          minWidth: 250,
          maxWidth: 300,
          boxShadow: 3,
          borderRadius: 2
        }
      }}
    >
      {hoveredEvent && (
        <Box>
          <Typography variant='subtitle2' fontWeight={600}>
            {hoveredEvent.title}
          </Typography>
          <Typography variant='body2' sx={{ mt: 1 }}>
            <strong>Horário:</strong> {moment(hoveredEvent.start).format('HH:mm')} -{' '}
            {moment(hoveredEvent.end).format('HH:mm')}
          </Typography>
          <Typography variant='body2'>
            <strong>Paciente:</strong> {hoveredEvent.extendedProps?.patientName}
          </Typography>
          <Typography variant='body2'>
            <strong>Rótulo:</strong> {hoveredEvent.extendedProps?.tag?.name || '—'}
          </Typography>
          <Typography variant='body2'>
            <strong>Profissional:</strong> {hoveredEvent.extendedProps?.professionalName}
          </Typography>
          <Typography variant='body2'>
            <strong>Status:</strong> {statusLabels[hoveredEvent.extendedProps?.status] || '—'}
          </Typography>
          <Typography variant='body2'>
            <strong>A executar:</strong> {hoveredEvent.extendedProps?.patientNextConsultationForecast || '—'}
          </Typography>
          <Typography variant='body2'>
            <strong>Observação:</strong> {hoveredEvent.extendedProps?.observation || '—'}
          </Typography>
        </Box>
      )}
    </Popover>
  )
}

const Calendar = (props: CalendarType) => {
  // ** Props
  const {
    store,
    dispatch,
    direction,
    updateEvent,
    updateDateEvent,
    handleCalendarDatesSet,
    calendarApi,
    calendarsColor,
    setCalendarApi,
    handleSelectEvent,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle,
    handleModalItem,
    clinicData
  } = props

  const storeAccount = useSelector((state: RootState) => state.account)
  const storeProfessional = useSelector((state: RootState) => state.professional)
  const storeSelectProfessional = useSelector((state: RootState) => state.calendar.selectedProfessionals)

  const selectedProfessionals: string[] = storeSelectProfessional
  const allProfessionals = storeProfessional?.data || []

  const filteredProfessionals =
    selectedProfessionals.length > 0
      ? allProfessionals.filter((p: any) => selectedProfessionals.includes(p.id))
      : allProfessionals

  const resources = filteredProfessionals
    .filter((p: any) => p.specialty?.toLowerCase() !== 'recepcionista')
    .map((p: any) => ({
      id: p.id,
      title: p.name
    }))

  const events = store.events.length
    ? store.events
        .filter(
          event =>
            selectedProfessionals.length === 0 || selectedProfessionals.includes(event.extendedProps?.professionalId)
        )
        .map(event => ({
          ...event,
          resourceId: event.extendedProps?.professionalId
        }))
    : []

  // ** Refs
  const calendarRef = useRef<FullCalendar | null>(null)

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
  }, [calendarApi, setCalendarApi])

  const [hoveredEvent, setHoveredEvent] = useState<any | null>(null)
  const [mousePosition, setMousePosition] = useState<{ top: number; left: number } | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isClickingRef = useRef(false)
  const isPopoverOpen = hoveredEvent !== null && mousePosition !== null

  const [currentTime, setCurrentTime] = useState(moment().format('HH:mm:ss'))

  useEffect(() => {
    const toolbarEl = document.querySelector('.fc-header-toolbar')

    if (toolbarEl && !toolbarEl.querySelector('#calendar-clock')) {
      const clockEl = document.createElement('div')
      clockEl.id = 'calendar-clock'
      clockEl.innerText = currentTime

      clockEl.style.fontSize = '1.5rem'
      clockEl.style.fontWeight = 'bold'
      clockEl.style.fontFamily = 'Inter, sans-serif'
      clockEl.style.color = '#8B18BB'
      clockEl.style.marginLeft = '1rem'
      clockEl.style.marginRight = '1rem'
      clockEl.style.alignSelf = 'center'

      const centerWrapper = document.createElement('div')
      centerWrapper.style.display = 'flex'
      centerWrapper.style.alignItems = 'center'
      centerWrapper.style.justifyContent = 'center'
      centerWrapper.style.flex = '1'
      centerWrapper.style.textAlign = 'center'
      centerWrapper.appendChild(clockEl)

      const titleWrapper = toolbarEl.querySelector('.fc-toolbar-chunk:nth-child(2)')
      if (titleWrapper) {
        titleWrapper.appendChild(centerWrapper)
      }

      const interval = setInterval(() => {
        const el = document.getElementById('calendar-clock')
        if (el) {
          el.innerText = moment().format('HH:mm:ss')
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [currentTime])

  const [openModal, setOpenModal] = useState(false)

  const toggleVideo = () => {
    setOpenModal(true)
  }

  useEffect(() => {
    const el = document.querySelector('.fc-youtubeButton-button')
    if (el) {
      const parent = el.parentElement
      if (parent) {
        const wrapper = document.createElement('span')

        // aplica a mesma classe que o FullCalendar usa nos botões
        wrapper.className = 'fc-button'
        wrapper.style.marginRight = '4px' // mesmo espaçamento lateral dos outros

        /* ReactDOM.render(
          <Button
            sx={{
              mb: 0,
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              background: 'transparent !important',
              fontFamily: 'Inter'
            }}
            onClick={toggleVideo}
          >
            <YouTubeIcon color='error' sx={{ mr: 1 }} />
            VÍDEOS
          </Button>,
          wrapper
        ) */

        parent.replaceChild(wrapper, el)
      }
    }
  }, [])

  const handleClose = () => {
    setOpenModal(false)
  }

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 1
    }
  }

  if (store) {
    // ** calendarOptions(Props)
    const calendarOptions = {
      locale: ptBrLocale,
      resources,
      events,
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin, resourceTimeGridPlugin],

      initialView: 'timeGridWeek',
      headerToolbar: {
        start: 'sidebarToggle, prev, next, title',
        end: 'youtubeButton dayGridMonth,timeGridWeek,resourceTimeGridDay,listMonth'
      },
      views: {
        timeGridWeek: {
          slotDuration: `00:${clinicData?.calendarSchedule || '20'}:00`,
          slotLabelInterval: `00:${clinicData?.calendarSchedule || '20'}:00`,
          slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          } as const,
          eventOverlap: false,
          slotEventOverlap: false,
          eventDisplay: 'block',
          dayMaxEvents: 2
        },
        timeGridDay: {
          slotDuration: `00:${clinicData?.calendarSchedule || '20'}:00`,
          slotLabelInterval: `00:${clinicData?.calendarSchedule || '20'}:00`,
          slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          } as const,
          eventOverlap: false,
          slotEventOverlap: false,
          eventDisplay: 'block',
          dayMaxEvents: 2
        },
        resourceTimeGridDay: {
          slotDuration: `00:${clinicData?.calendarSchedule || '20'}:00`,
          slotLabelInterval: `00:${clinicData?.calendarSchedule || '20'}:00`,
          slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          } as const
        }
      },

      slotMinTime: clinicData?.openHour || '06:00:00',
      slotMaxTime: clinicData?.closeHour || `18:${clinicData?.calendarSchedule || 20}:00`,

      /*
      Enable dragging and resizing event
      ? Docs: https://fullcalendar.io/docs/editable
    */
      editable: true,

      /*
      Enable resizing event from start
      ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
    */
      eventResizableFromStart: true,

      nowIndicator: true,

      /*
        Automatically scroll the scroll-containers during event drag-and-drop and date selecting
        ? Docs: https://fullcalendar.io/docs/dragScroll
      */
      dragScroll: true,

      /*
        Max number of events within a given day
        ? Docs: https://fullcalendar.io/docs/dayMaxEvents
      */
      dayMaxEvents: 2,

      /*
        Determines if day names and week names are clickable
        ? Docs: https://fullcalendar.io/docs/navLinks
      */
      navLinks: true,

      displayEventTime: false,

      eventClassNames({ event: calendarEvent, el: any }: any) {
        // @ts-ignore

        console.log(calendarEvent)
        const colorName = calendarsColor[calendarEvent._def.extendedProps.status]

        return [`bg-${colorName}`]
      },

      eventClick({ event: clickedEvent }: any) {
        const startDate = new Date(moment(clickedEvent._instance.range.start).utc().format('YYYY-MM-DDTHH:mm:ss.sss'))
        const endDate = new Date(moment(clickedEvent._instance.range.end).utc().format('YYYY-MM-DDTHH:mm:ss.sss'))

        isClickingRef.current = true
        setHoveredEvent(null)
        setMousePosition(null)

        setTimeout(() => {
          isClickingRef.current = false
        }, 500)

        const event: EventType = {
          publicId: clickedEvent._def.publicId,
          url: clickedEvent._def.url,
          title: clickedEvent._def.title,
          allDay: clickedEvent._def.allDay,
          start: startDate,
          end: endDate,
          extendedProps: {
            returnIn: clickedEvent._def.extendedProps.returnIn,
            patientId: clickedEvent._def.extendedProps.patientId,
            patientName: clickedEvent._def.extendedProps.patientName,
            patientPhone: clickedEvent._def.extendedProps.patientPhone,
            professionalId: clickedEvent._def.extendedProps.professionalId,
            patientNextConsultationForecast: clickedEvent._def.extendedProps.patientNextConsultationForecast,
            professionalName: clickedEvent._def.extendedProps.professionalName,
            treatmentName: clickedEvent._def.extendedProps.treatmentName,
            treatmentSession: clickedEvent._def.extendedProps.treatmentSession,
            treatmentSessionDone: clickedEvent._def.extendedProps.treatmentSessionDone,
            treatmentStatus: clickedEvent._def.extendedProps.treatmentStatus,
            treatmentId: clickedEvent._def.extendedProps.treatmentId,
            tag: clickedEvent._def.extendedProps.tag,
            status: clickedEvent._def.extendedProps.status,
            duration: clickedEvent._def.extendedProps.duration,
            observation: clickedEvent._def.extendedProps.observation,
            isConfirmed: clickedEvent._def.extendedProps.isConfirmed
          }
        }

        dispatch(handleSelectEvent(event))
        handleModalItem()

        //handleAddEventSidebarToggle()

        // * Only grab required field otherwise it goes in infinity loop
        // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
        // event.value = grabEventDataFromEventApi(clickedEvent)

        // isAddNewEventSidebarActive.value = true
      },

      customButtons: {
        sidebarToggle: {
          icon: 'bi bi-list',
          click() {
            handleLeftSidebarToggle()
          }
        },
        youtubeButton: {
          text: '',
          click() {
            toggleVideo() // sua função
          }
        }
      },

      dateClick(info: any) {
        const ev = { ...blankEvent }

        isClickingRef.current = true
        setHoveredEvent(null)
        setMousePosition(null)

        // use 400ms ou 500ms para garantir que o hover não ocorra logo depois
        setTimeout(() => {
          isClickingRef.current = false
        }, 500)

        const startDate = moment(info.dateStr).utc().toDate()
        const endDate = moment(info.dateStr)
          .add(clinicData.calendarSchedule || 30, 'minute')
          .toDate()

        ev.start = startDate
        ev.end = endDate
        ev.allDay = false

        // @ts-ignore
        dispatch(handleSelectEvent(ev))
        handleAddEventSidebarToggle()
      },

      /*
        Handle event drop (Also include dragged event)
        ? Docs: https://fullcalendar.io/docs/eventDrop
        ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
      */
      eventDrop({ event: droppedEvent }: any) {
        const startDate = moment(droppedEvent._instance.range.start).utc().format('YYYY-MM-DDTHH:mm:ss.sss')
        const endDate = moment(droppedEvent._instance.range.end).utc().format('YYYY-MM-DDTHH:mm:ss.sss')
        const id = droppedEvent._def.publicId
        dispatch(updateDateEvent({ id, startDate, endDate }))
      },

      eventDidMount({ event, el }: any) {
        const tagColor = tagColors[event._def.extendedProps.tag.color] || '#00FCFE'

        el.style.marginRight = '2px'

        // el.style.position = 'relative'

        const sideBar = document.createElement('div')
        sideBar.style.position = 'absolute'
        sideBar.style.left = '0'
        sideBar.style.top = '0'
        sideBar.style.right = '0' 
        sideBar.style.height = '8px'
        sideBar.style.width = 'auto'
        sideBar.style.borderRadius = '0px'
        sideBar.style.backgroundColor = '#00FCFE'

        // el.style.position = 'relative'
        el.appendChild(sideBar)

        const logoIcon = document.createElement('img')
        logoIcon.src = '/images/logos/ICO 150 BRANCO.png'
        logoIcon.style.height = '16px'
        logoIcon.style.width = '16px'
        logoIcon.style.marginRight = '4px'
        logoIcon.style.verticalAlign = 'middle'

        const extraInfo = document.createElement('div')

       // extraInfo.innerText = `• ${event._def.extendedProps.tag.name}`
        extraInfo.style.fontSize = '.9em'
        extraInfo.style.fontWeight = 'bold'
        extraInfo.style.marginTop = '.3em'
        extraInfo.style.fontFamily = 'Inter'
        extraInfo.style.color = tagColor

        

        const tagText = document.createTextNode(event._def.extendedProps.tag.name)

        extraInfo.appendChild(logoIcon)

        extraInfo.appendChild(tagText)

        el.querySelector('.fc-event-title')?.appendChild(extraInfo)

        el.classList.add('fc-event-hoverable')

        el.style.cursor = 'pointer'

        const onMouseEnter = (e: MouseEvent) => {
          if (isClickingRef.current) return

          hoverTimeoutRef.current = setTimeout(() => {
            if (!isClickingRef.current && el.matches(':hover')) {
              setHoveredEvent(event)
              setMousePosition({ top: e.clientY, left: e.clientX })
            }
          }, 1000)
        }

        // const onMouseLeave = (e: MouseEvent) => {
        //   const toElement = e.relatedTarget as HTMLElement;
        //   console.log('chamouonMouseLeave')
        //   if (toElement && el.contains(toElement)) return;

        //   hoverTimeoutRef.current = setTimeout(() => {
        //     setHoveredEvent(null);
        //     setMousePosition(null);
        //   }, 200);
        // };

        el.addEventListener('mouseenter', onMouseEnter)

        // el.addEventListener('mouseleave', onMouseLeave);

        return () => {
          el.removeEventListener('mouseenter', onMouseEnter)

          //   el.removeEventListener('mouseleave', onMouseLeave);
        }
      },

      /*
        Handle event resize
        ? Docs: https://fullcalendar.io/docs/eventResize
      */
      eventResize({ event: resizedEvent }: any) {
        const startDate = moment(resizedEvent._instance.range.start).utc().format('YYYY-MM-DDTHH:mm:ss.sss')
        const endDate = moment(resizedEvent._instance.range.end).utc().format('YYYY-MM-DDTHH:mm:ss.sss')
        const id = resizedEvent._def.publicId
        dispatch(updateDateEvent({ id, startDate, endDate }))
      },

      datesSet(info: any) {
        const startDate = moment(info.view.activeStart).utc().format('YYYY-MM-DD[T00:00:00.000]Z')
        const endDate = moment(info.view.activeEnd).utc().format('YYYY-MM-DD[T00:00:00.000]Z')
        const dates = {
          startDate,
          endDate
        }

        dispatch(handleCalendarDatesSet(dates))
      },

      ref: calendarRef,

      // Get direction from app state (store)
      direction
    }

    // @ts-ignore
    return (
      <>
        <FullCalendar {...calendarOptions} />
        {isPopoverOpen && (
          <PopoverModal
            hoveredEvent={hoveredEvent}
            mousePosition={mousePosition}
            setHoveredEvent={setHoveredEvent}
            hoverTimeoutRef={hoverTimeoutRef}
            setMousePosition={setMousePosition}
          />
        )}

        <Dialog open={openModal} onClose={handleClose} maxWidth='md' fullWidth>
          <DialogTitle>Assistir Vídeo</DialogTitle>
          <DialogContent>
            <Vimeo
              video='1109989914' // pode ser só o ID também
              width='100%'
              height='480'
              responsive
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color='primary'>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  } else {
    return null
  }
}

export default Calendar
