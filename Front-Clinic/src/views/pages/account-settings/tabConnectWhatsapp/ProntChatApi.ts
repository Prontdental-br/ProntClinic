import axios from 'axios'

const prontChatApi = axios.create({
  // baseURL: 'https://api.prontchat.com.br',
  baseURL: process.env.NEXT_PUBLIC_PRONT_CHAT_API_BASE_URL,
  timeout: 9000
})

prontChatApi.interceptors.request.use(
  async config => {
    const session = window?.localStorage.getItem('PRONT_CHAT_TOKEN')
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

prontChatApi.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config
    if (error?.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true

      const { data } = await prontChatApi.post('/auth/refresh_token')
      if (data) {
        localStorage.setItem('PRONT_CHAT_TOKEN', JSON.stringify(data.token))
        prontChatApi.defaults.headers.Authorization = `Bearer ${data.token}`
      }

      return prontChatApi(originalRequest)
    }
    if (error?.response?.status === 401) {
      window.localStorage.removeItem('PRONT_CHAT_TOKEN');
      window.localStorage.removeItem('PRONT_CHAT_USER');
      window.localStorage.removeItem('companyId');
    }

    return Promise.reject(error)
  }
)

export default prontChatApi
