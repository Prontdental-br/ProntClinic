// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import chat from 'src/store/apps/chat'
import user from 'src/store/apps/user'
import email from 'src/store/apps/email'
import invoice from 'src/store/apps/invoice'
import calendar from 'src/store/apps/calendar'
import permissions from 'src/store/apps/permissions'
import patient from 'src/store/apps/patient'
import professional from 'src/store/apps/professional'
import account from 'src/store/apps/account'
import tag from 'src/store/apps/tag'
import odontogram from 'src/store/apps/odontogram'
import evolution from 'src/store/apps/evolution'
import clinic from 'src/store/apps/clinics'
import chatReducer from 'src/store/apps/chat-v2'

export const store = configureStore({
  reducer: {
    patient,
    user,
    chat,
    email,
    invoice,
    calendar,
    permissions,
    professional,
    account,
    tag,
    odontogram,
    evolution,
    clinic,
    chatReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
