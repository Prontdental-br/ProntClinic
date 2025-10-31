// ** Config
import authConfig from 'src/configs/auth'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 9000
})

// request interceptor
api.interceptors.request.use(
  async config => {
    const session = window?.localStorage.getItem(authConfig.storageTokenKeyName)
    if (session) {
      config.headers = {
        ...config.headers,
        authorization: `Bearer ${session}`
      }
    }

    return config
  },
  error => Promise.reject(error)
)

const apiV2 = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SOCKET_URL + '/api',
  timeout: 9000
})

// request interceptor
apiV2.interceptors.request.use(
  async config => {
    const session = window?.localStorage.getItem(authConfig.storageTokenKeyName)
    if (session) {
      config.headers = {
        ...config.headers,
        authorization: `Bearer ${session}`
      }
    }

    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => {
    window.localStorage.removeItem('showPaymentDialog')

    return response
  },
  error => {
    const status = error.response?.status
    const message = error.response?.data?.message

    if ((status === 401 || status === 403) && message === 'Expired Subscription') {
      if (!window.localStorage.getItem('showPaymentDialog')) {
        window.localStorage.setItem('showPaymentDialog', 'true')
        window.location.reload()
      }

      const paymentLink = error.response?.data?.paymentLink
      const amount = error.response?.data?.amount
      const fullPaymentLink = error.response?.data?.fullPaymentLink

      if (paymentLink) {
        window.localStorage.setItem('paymentLink', paymentLink)
      }

      if (amount) {
        window.localStorage.setItem('paymentAmount', String(amount))
      }

      if (fullPaymentLink) {
        window.localStorage.setItem('fullPaymentLink', fullPaymentLink)
      }

      return Promise.reject(error)
    }

    if (status === 401 && message !== 'Expired Subscription') {
      window.localStorage.removeItem('userData')
      window.localStorage.removeItem(authConfig.storageTokenKeyName)
      window.location.reload()
    } else if (status === 403 && message === 'Blocked Account') {
      // alert('Conta bloqueada. Entre em contato com o suporte');
    }

    return Promise.reject(error)
  }
)

export { apiV2 }
export default api
