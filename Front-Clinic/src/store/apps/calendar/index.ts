// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'

// ** Axios Imports
import moment from 'moment'
import api from 'src/@core/components/api-client'

// ** Types
import {
  CalendarFiltersType,
  AddEventType,
  EventType,
  CalendarUpdateStatusType,
  ScheduleType,
  CalendarUpdateDateType
} from 'src/types/apps/calendarTypes'
import axios from 'axios'

interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

// ** Fetch Events
export const fetchEvents = createAsyncThunk(
  'appCalendar/fetchEvents',
  async (calendars: CalendarFiltersType, { rejectWithValue }) => {
    try {
      if (!calendars.status.length) {
        return { data: [], params: calendars }
      }

      const status = calendars.status.length > 0 ? calendars.status.toString() : undefined
      const professionals = calendars.professionals.length > 0 ? calendars.professionals.toString() : ''

      const accessToken = window?.localStorage.getItem('accessToken')

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/schedules/search/date`, {
        params: {
          dateStart: moment(calendars.startDate).utc().toDate(),
          dateEnd: moment(calendars.endDate).utc().toDate(),
          status: status,
          professionalIds: professionals
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const data = response.data.map((item: any) => {
        return {
          id: item.id,
          url: '#',
          title: item.patient.name,
          allDay: item.allDay,
          end: moment(item.endDate).format('YYYY-MM-DDTHH:mm:ss.sss'),
          start: moment(item.startDate).format('YYYY-MM-DDTHH:mm:ss.sss'),
          extendedProps: {
            professionalId: item.professionalId,
            professionalName: item.professional.name,
            status: item.status,
            patientId: item.patientId,
            patientName: item.patient.name,
            patientNextConsultationForecast: item.patient.next_consultation_forecast || '',
            patientPhone: item.patient.cell_phone ? item.patient.cell_phone.replace(/\s/g, '') : '',
            duration: item.duration,
            waitingCreatedAt: item.waitingCreatedAt,
            treatmentId: item.treatmentId || null,
            treatmentName: item.treatmentName || null,
            treatmentSession: item.treatmentSession,
            treatmentSessionDone: item.treatmentSessionDone,
            treatmentStatus: item.treatmentStatus,
            returnIn: item.returnIn,
            observation: item.observation,
            isConfirmed: item.isConfirmed,
            tag: {
              tagId: item.tags[0]?.tagId || '',
              name: item.tags[0]?.tag.name || '',
              color: item.tags[0]?.tag.color || ''
            }
          }
        }
      })

      return { data, params: calendars }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        window.localStorage.removeItem('userData')
        window.localStorage.removeItem('accessToken')
        window.location.reload()
      }

      return rejectWithValue(error.response?.data || 'Erro desconhecido')
    }
  }
)

// ** Add Event
export const addEvent = createAsyncThunk(
  'appCalendar/addEvent',
  async (event: AddEventType, { getState, dispatch }: Redux) => {
    const schedule: ScheduleType = {
      type: 'consult',
      startDate: moment(event.start).format('YYYY-MM-DDTHH:mm:ss.sssZ'),
      endDate: moment(event.end).format('YYYY-MM-DDTHH:mm:ss.sssZ'),
      duration: event.extendedProps.duration,
      observation: event.extendedProps.observation,
      isConfirmed: event.extendedProps.isConfirmed,
      isAllDay: event.allDay,
      status: event.extendedProps.status,
      returnIn: event.extendedProps.returnIn,
      return: event.extendedProps.return,
      patientId: event.extendedProps.patientId,
      professionalId: event.extendedProps.professionalId,
      tags: [event.extendedProps.tag?.tagId],
      confirmMessage: event.extendedProps.confirmMessage,
      treatmentId: event.extendedProps.treatmentId || undefined,
      activeConfirmMessage: event.extendedProps.activeConfirmMessage,
      activateReminder: event.extendedProps.activateReminder ? event.extendedProps.activateReminder : false,
      activeNotificationSound: event.extendedProps.activeNotificationSound
        ? event.extendedProps.activeNotificationSound
        : false,
      saveConfirmMessage: event.extendedProps.saveConfirmMessage,
      returnTime: event.extendedProps.returnTime
    }
    const response = await api.post('/schedules', { ...schedule })
    await dispatch(fetchEvents(getState().calendar.params))

    return response.data.event
  }
)

// ** Update Event
export const updateEvent = createAsyncThunk(
  'appCalendar/updateEvent',
  async (event: EventType, { getState, dispatch }: Redux) => {
    const schedule = {
      type: 'consult',
      startDate: moment(event.start).format('YYYY-MM-DDTHH:mm:ss.sssZ'),
      endDate: moment(event.end).format('YYYY-MM-DDTHH:mm:ss.sssZ'),
      duration: event.extendedProps.duration,
      observation: event.extendedProps.observation,
      isConfirmed: event.extendedProps.isConfirmed,
      isAllDay: event.allDay,
      status: event.extendedProps.status,
      returnIn: event.extendedProps.returnIn,
      patientId: event.extendedProps.patientId,
      professionalId: event.extendedProps.professionalId,
      tags: [event.extendedProps.tag?.tagId]
    }

    const response = await api.patch('/schedules/' + event.publicId, { ...schedule })

    await dispatch(fetchEvents(getState().calendar.params))

    return response.data.event
  }
)

// ** Update Status Event
export const updateStatusEvent = createAsyncThunk(
  'appCalendar/updateStatusEvent',
  async (calendarUpdateStatus: CalendarUpdateStatusType, { getState, dispatch }: Redux) => {
    const response = await api.patch('/schedules/status/' + calendarUpdateStatus.id, {
      status: calendarUpdateStatus.status
    })
    await dispatch(fetchEvents(getState().calendar.params))

    return response.data.event
  }
)

// ** Update Date Event
export const updateDateEvent = createAsyncThunk(
  'appCalendar/updateDateEvent',
  async (calendarUpdateDate: CalendarUpdateDateType, { getState, dispatch }: Redux) => {
    const response = await api.patch('/schedules/date/' + calendarUpdateDate.id, {
      startDate: moment(calendarUpdateDate.startDate).format('YYYY-MM-DDTHH:mm:ss.sssZ'),
      endDate: moment(calendarUpdateDate.endDate).format('YYYY-MM-DDTHH:mm:ss.sssZ')
    })
    await dispatch(fetchEvents(getState().calendar.params))

    return response.data.event
  }
)

// ** Delete Event
export const deleteEvent = createAsyncThunk(
  'appCalendar/deleteEvent',
  async (id: number | string, { getState, dispatch }: Redux) => {
    const response = await api.delete('/schedules/' + id, {})
    await dispatch(fetchEvents(getState().calendar.params))

    return response.data
  }
)

export const appCalendarSlice = createSlice({
  name: 'appCalendar',
  initialState: {
    events: [],
    allEvents: [],
    selectedEvent: null,
    startDate: '',
    endDate: '',
    selectedCalendars: ['MS', 'SC', 'CP', 'CS', 'CF', 'AT', 'AP', 'IS', 'CT'],
    selectedProfessionals: [],
    selectedTags: [],
    params: {}
  },
  reducers: {
    handleSelectEvent: (state, action) => {
      state.selectedEvent = action.payload
    },
    handleCalendarsUpdate: (state, action) => {
      const filterIndex = state.selectedCalendars.findIndex(i => i === action.payload)
      if (state.selectedCalendars.includes(action.payload)) {
        state.selectedCalendars.splice(filterIndex, 1)
      } else {
        state.selectedCalendars.push(action.payload)
      }
      if (state.selectedCalendars.length === 0) {
        state.events.length = 0
      }
    },
    handleTagsUpdate: (state, action) => {
      const tagId = action.payload as never
      const index = state.selectedTags.findIndex(id => id === tagId)
      if (index !== -1) {
        state.selectedTags.splice(index, 1)
      } else {
        state.selectedTags.push(tagId)
      }
    },

    handleAllTags: (state, action) => {
      const allTagIds = action.payload.allTagIds as string[]
      const checked = action.payload.checked as boolean

      state.selectedTags = checked ? [...(allTagIds as never)] : []
    },

    updateFilteredEvents: (state, action) => {
      state.events = action.payload
    },

    handleCalendarsProfessionalUpdate: (state, action) => {
      state.selectedProfessionals = action.payload
    },
    handleCalendarDatesSet: (state, action) => {
      state.startDate = action.payload.startDate
      state.endDate = action.payload.endDate
    },
    handleAllCalendars: (state, action) => {
      const value = action.payload
      if (value === true) {
        state.selectedCalendars = ['MS', 'SC', 'CP', 'CS', 'CF', 'AT', 'AP', 'IS']
      } else {
        state.selectedCalendars = []
        state.events = []
      }
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.allEvents = action.payload.data
      state.events = action.payload.data
      state.params = action.payload.params
    })
  }
})
export const {
  handleSelectEvent,
  handleCalendarsUpdate,
  handleCalendarsProfessionalUpdate,
  handleAllCalendars,
  handleCalendarDatesSet,
  updateFilteredEvents,
  handleAllTags,
  handleTagsUpdate
} = appCalendarSlice.actions

export default appCalendarSlice.reducer
