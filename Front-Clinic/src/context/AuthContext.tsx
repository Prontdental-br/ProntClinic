// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import api from '../@core/components/api-client'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType, SignupType } from './types'
import professional from 'src/store/apps/professional'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  signup: () => Promise.resolve(),
  signupReserva: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  const { saveSettings, settings } = useSettings()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      if (window.localStorage.getItem('userData')) {
        const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
        setUser({ ...userData })
      }

      // const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
      // if (storedToken) {
      //   setLoading(true)
      //   await api
      //     .get(authConfig.meEndpoint, {
      //       headers: {
      //         Authorization: storedToken
      //       }
      //     })
      //     .then(async response => {
      //       setLoading(false)
      //       setUser({ ...response.data.userData })
      //     })
      //     .catch(() => {
      //       localStorage.removeItem('userData')
      //       localStorage.removeItem('refreshToken')
      //       localStorage.removeItem('accessToken')
      //       setUser(null)
      //       setLoading(false)
      //       console.log('onTokenExpiration: ', authConfig.onTokenExpiration)
      //       if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
      //         router.replace('/login')
      //       }
      //     })
      // } else {
      //   setLoading(false)
      // }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setLoading(false)
  }, [])

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    // const { data } = await api.get(`/professionals/email/${params.email}`);
    // console.log(data)
    api
      .post('/auth/signin', {
        username: params.email,
        password: params.password
      })
      .then(async response => {
        if (params.rememberMe) {
          window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
        }

        const returnUrl = router.query.returnUrl
        const userData = { ...response.data.userData }

        const professional = userData.professional

        userData.isAdmin = professional?.isAdmin === true || (!professional && userData.isHolder === true)

        userData.role = userData.isAdmin ? 'admin' : 'no-admin'

        setUser(userData)
        if (params.rememberMe) {
          window.localStorage.setItem('userData', JSON.stringify(userData))
        }

        try {
          const chargeResponse = await api.get('/asaas-subscription/pending-payment')

          const pending = chargeResponse.data
          const url = chargeResponse.data?.paymentUrl

          if (pending && url) {
            window.localStorage.setItem('paymentLink', url)
          }
        } catch (err) {
          console.error('Erro ao verificar cobrança:', err)
        }

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem('paymentLink')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    saveSettings({ ...settings, navCollapsed: true })
    router.push('/login')
  }

  const handleSignup = (params: SignupType, errorCallback?: ErrCallbackType) => {
    api
      .post('/auth/signup', {
        name: params.name,
        email: params.email,
        cellPhone: params.cellPhone,
        type: params.type,
        password: params.password
      })
      .then(async response => {
        window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
        setUser({ ...response.data.userData })

        await new Promise(resolve => setTimeout(resolve, 800))

        const returnUrl = router.query.returnUrl
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL as string)
      })
      .catch(err => {
        const apiError = err.response?.data?.message || 'Erro ao cadastrar'

        if (errorCallback) {
          errorCallback({ message: apiError })
        }
      })
  }

  const handleSignupReserva = (params: SignupType, successCallback?: () => void, errorCallback?: ErrCallbackType) => {
    api
      .post('/auth/signup', {
        name: params.name,
        email: params.email,
        cellPhone: params.cellPhone,
        type: params.type,
        password: params.password

        // couponId: params.couponId
      })
      .then(async response => {
        if (successCallback) successCallback()
      })
      .catch(err => {
        const apiError = err.response?.data?.message || 'Erro ao cadastrar'
        if (errorCallback) errorCallback({ message: apiError })
      })
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    signup: handleSignup,
    signupReserva: handleSignupReserva
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
