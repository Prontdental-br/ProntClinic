// ** Types
import { Dispatch } from 'redux'

// ** Theme Type Import
import { ThemeColor } from 'src/@core/layouts/types'

export type CalendarFiltersType = {
  startDate: string
  endDate: string
  status: string[]
  professionals: string[]
}

export type CalendarUpdateStatusType = {
  id: string
  status: string
}

export type CalendarUpdateDateType = {
  id: string
  startDate: string
  endDate: string
}

export type EventDateType = Date | null | undefined

export type CalendarColors = {
  MS: ThemeColor
  SC: ThemeColor
  CP: ThemeColor
  CS: ThemeColor
  CF: ThemeColor
  AT: ThemeColor
  AP: ThemeColor
  IS: ThemeColor
  CT: ThemeColor
}

export type CalendarColorsLabelsType = {
  [key: string]: string
}

export type CalendarColorsLabels = {
  MS: string
  SC: string
  CP: string
  CS: string
  CF: string
  AT: string
  AP: string
}

export type TagType = {
  name: string
  color: string
}

export type EventType = {
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
    patientNextConsultationForecast?: string
    professionalId: string
    professionalName: string
    treatmentId?: string
    treatmentName?: string
    treatmentSession?: number
    treatmentSessionDone?: number
    treatmentStatus?: string
    waitingCreatedAt?: Date
    tag: {
      tagId: string
      name: string
      color: ThemeColor
    }
    status: string
    duration: number
    observation: string
    isConfirmed: boolean
  }
}

export type AddEventType = {
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
    status: string
    duration: number
    observation: string
    isConfirmed: boolean
    confirmMessage?: string
    activateReminder?: boolean
    activeConfirmMessage?: boolean
    activeNotificationSound?: boolean
    saveConfirmMessage?: boolean
    treatmentId?: string
    return?: string
    returnTime?: Date
    tag: {
      tagId: string
      name: string
      color: ThemeColor
    }
  }
}

export type EventStateType = {
  url: string
  title: string
  allDay: boolean
  guests: string[]
  description: string
  endDate: Date | string
  startDate: Date | string
  calendar: CalendarFiltersType | string
}

export type CalendarStoreType = {
  events: EventType[]
  selectedEvent: null | EventType
  selectedCalendars: CalendarFiltersType[] | string[]
}

export type CalendarType = {
  calendarApi: any
  dispatch: Dispatch<any>
  store: CalendarStoreType
  direction: 'ltr' | 'rtl'
  calendarsColor: any
  clinicData: any
  setCalendarApi: (val: any) => void
  handleLeftSidebarToggle: () => void
  updateEvent: (event: EventType) => void
  updateDateEvent: (event: CalendarUpdateDateType) => void
  handleCalendarDatesSet: (info: any) => void
  handleAddEventSidebarToggle: () => void
  handleModalItem: () => void
  handleSelectEvent: (event: EventType) => void
}

export type SidebarLeftType = {
  mdAbove: boolean
  dispatch: Dispatch<any>
  leftSidebarWidth: number
  calendarApi: any
  leftSidebarOpen: boolean
  store: CalendarStoreType
  calendarsColor: CalendarColors
  calendarsColorLabels: CalendarColorsLabelsType
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
  handleModalItem: () => void
  handleAllCalendars: (val: boolean) => void
  handleSelectEvent: (event: null | EventType) => void
  handleCalendarsUpdate: (val: CalendarFiltersType) => void
  handleCalendarsProfessionalUpdate: (val: (string | undefined)[]) => void
  handleOpenModalAddUser: () => void
}

export type AddEventSidebarType = {
  calendarApi: any
  accountMe: any
  drawerWidth: number
  dispatch: Dispatch<any>
  store: CalendarStoreType
  addEventSidebarOpen: boolean
  clinicData: any
  deleteEvent: (id: string) => void
  fetchAccountMe: () => void
  addEvent: (event: AddEventType) => void
  updateEvent: (event: EventType) => void
  handleAddEventSidebarToggle: () => void
  handleSelectEvent: (event: null | EventType) => void
}

export type ModalCalendarItemType = {
  calendarApi: any
  dispatch: Dispatch<any>
  store: CalendarStoreType
  onClose: () => void
  ModalCalendarItemOpen: boolean
  handleSelectEvent: (event: null | EventType) => void
  handleUpdateEventSidebarToggle: () => void
  updateStatusEvent: (event: any) => void
  calendarsColorLabels: CalendarColorsLabelsType
  deleteEvent: (id: string) => void
}

export type OptionType = {
  id: string
  name: string
}

export type ScheduleType = {
  type: string
  startDate: string
  endDate: string
  duration: number
  observation: string
  isConfirmed: boolean
  isAllDay: boolean
  activateReminder: boolean
  status: string
  returnIn: number
  patientId: string
  professionalId: string
  tags: string[]
  confirmMessage?: string
  activeConfirmMessage?: boolean
  activeNotificationSound?: boolean
  saveConfirmMessage?: boolean
  treatmentId?: string
  return?: string
  returnTime?: Date
}
