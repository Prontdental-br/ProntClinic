import { useState, useEffect, useReducer, useContext } from 'react'
import toast from 'react-hot-toast'
import translateBackendError from 'src/common/translateBackendError'
import { SocketContext, SocketManager } from 'src/context/SocketContext'
import prontChatApi from 'src/views/pages/account-settings/tabConnectWhatsapp/ProntChatApi'

const reducer = (state: any, action: any) => {
  if (action.type === 'LOAD_WHATSAPPS') {
    const whatsApps = action.payload

    return [...whatsApps]
  }

  if (action.type === 'UPDATE_WHATSAPPS') {
    const whatsApp = action.payload
    const whatsAppIndex = state.findIndex((s: any) => s.id === whatsApp.id)

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex] = whatsApp

      return [...state]
    } else {
      return [whatsApp, ...state]
    }
  }

  if (action.type === 'UPDATE_SESSION') {
    const whatsApp = action.payload
    const whatsAppIndex = state.findIndex((s: any) => s.id === whatsApp.id)

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex].status = whatsApp.status
      state[whatsAppIndex].updatedAt = whatsApp.updatedAt
      state[whatsAppIndex].qrcode = whatsApp.qrcode
      state[whatsAppIndex].retries = whatsApp.retries

      return [...state]
    } else {
      return [...state]
    }
  }

  if (action.type === 'DELETE_WHATSAPPS') {
    const whatsAppId = action.payload

    const whatsAppIndex = state.findIndex((s: any) => s.id === whatsAppId)
    if (whatsAppIndex !== -1) {
      state.splice(whatsAppIndex, 1)
    }

    return [...state]
  }

  if (action.type === 'RESET') {
    return []
  }
}

const useWhatsApps = () => {
  const [whatsApps, dispatch] = useReducer(reducer, [])
  const [loading, setLoading] = useState(true)

  const socketManager = useContext(SocketContext)

  useEffect(() => {
    setLoading(true)
    const fetchSession = async () => {
      try {
        const { data } = await prontChatApi.get('/whatsapp/?session=0')
        dispatch({ type: 'LOAD_WHATSAPPS', payload: data })
        setLoading(false)
      } catch (err: any) {
        setLoading(false)
        const errorMsg = err.response?.data?.error;
        if (errorMsg) {
          // toast.error(translateBackendError(errorMsg));
        }
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    const companyId = localStorage.getItem('companyId')
    const socket = SocketManager.getSocket(companyId)

    socket.on(`company-${companyId}-whatsapp`, (data: { action: string, whatsapp: string }) => {
      if (data.action === 'update') {
        dispatch({ type: 'UPDATE_WHATSAPPS', payload: data.whatsapp })
      }
    })

    socket.on(`company-${companyId}-whatsapp`, (data: { action: string, whatsappId: string }) => {
      if (data.action === 'delete') {
        dispatch({ type: 'DELETE_WHATSAPPS', payload: data.whatsappId })
      }
    })

    socket.on(`company-${companyId}-whatsappSession`, (data: { action: string, session: string }) => {
      if (data.action === 'update') {
        dispatch({ type: 'UPDATE_SESSION', payload: data.session })
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [socketManager])

  return { whatsApps, loading }
}

export default useWhatsApps
