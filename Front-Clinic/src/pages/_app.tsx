// ** React Imports
import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from 'react'

// ** Next Imports
import Head from 'next/head'
import { Router, useRouter } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

// ** Store Imports
import { store } from 'src/store'
import { Provider } from 'react-redux'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'

// ** Config Imports
import 'src/configs/i18n'
import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'

// ** Fake-DB Import
import 'src/@fake-db'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import AclGuard from 'src/@core/components/auth/AclGuard'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import GuestGuard from 'src/@core/components/auth/GuestGuard'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Contexts
import { AuthProvider } from 'src/context/AuthContext'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

import { io } from 'socket.io-client'

// ** Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

import 'src/iconify-bundle/icons-bundle-react'

// ** Global css styles
import '../../styles/globals.css'
import '../../styles/toast.css'

import '../../styles/odontograma.css'
import '../../styles/rosto.css'
import '../../styles/footer.css'
import '../../styles/import-patients.css'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  Typography
} from '@mui/material'
import PricingPlans from 'src/views/pages/pricing/PricingPlans'
import { data } from 'src/@fake-db/pages/pricing'
import PlanDetails from 'src/@core/components/plan-details'
import PricingHeader from 'src/views/pages/pricing/PricingHeader'
import { WhatsAppsProvider } from 'src/context/WhatsAppsContext'
import { SocketContext, SocketManager } from 'src/context/SocketContext'
import { KanbanProvider } from 'src/context/KanbanContext'
import { OpportunityProvider } from 'src/context/OpportunityContext'
import { ProsthesisProvider } from 'src/context/ProsthesisContext'
import { AgentIAProvider } from 'src/context/AgentIAContext'
import { useForm } from 'react-hook-form'
import api from 'src/@core/components/api-client'

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

type GuardProps = {
  authGuard: boolean
  guestGuard: boolean
  children: ReactNode
}

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <>{children}</>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

let socket: any

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [plan, setPlan] = useState<'monthly' | 'annually'>('monthly')
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [fullPaymentLink, setFullPaymentLink] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [paymentAmount, setPaymentAmount] = useState<string | null>(null)

  const router = useRouter()

  const professional = userData?.professional || null

  const isAdmin = professional?.isAdmin === true || !professional

  // const [open, setOpen] = useState(false);
  // const { register, handleSubmit, formState: { errors } } = useForm();

  // const onSubmit = (data: any) => {
  //   console.log('Dados do cartão:', data);
  //   setOpen(false); // Fechar o diálogo após o envio
  // };

  // const handleOpen = () => {
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false
  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)

  const setConfig = Component.setConfig ?? undefined

  const authGuard = Component.authGuard ?? true

  const guestGuard = Component.guestGuard ?? false

  const aclAbilities = Component.acl ?? defaultACLObj

  useEffect(() => {
    ;(async () => {
      const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
      setUserData(userData)

      console.log(userData)
      console.log('socket conectando', process.env.NEXT_PUBLIC_SOCKET_URL)

      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
        query: { userId: userData.accountId },
        transports: ['websocket', 'polling', 'flashsocket'],
        timeout: 20000
      })

      socket.on('connect', () => {
        console.log('connected')

        setInterval(() => {
          console.log('conectado')
          socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
            query: { userId: userData.accountId },
            transports: ['websocket', 'polling', 'flashsocket'],
            timeout: 20000
          })
        }, 30000)
      })

      if (window.localStorage.getItem('showPaymentDialog')) {
        setShowPaymentDialog(true)
      }

      if (window.localStorage.getItem('paymentLink')) {
        setPaymentLink(window.localStorage.getItem('paymentLink'))
      }
      if (window.localStorage.getItem('fullPaymentLink')) {
        setFullPaymentLink(window.localStorage.getItem('fullPaymentLink'))
      }

      if (window.localStorage.getItem('paymentAmount')) {
        setPaymentAmount(window.localStorage.getItem('paymentAmount'))
      }
    })()
  }, [])

  const handleLoginRedirect = () => {
    window.localStorage.removeItem('showPaymentDialog')
    window.localStorage.removeItem('paymentLink')

    window.localStorage.removeItem('paymentAmount')

    window.localStorage.removeItem('fullPaymentLink')
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('userData')

    router.push('/login')
  }

  const formatPrice = (price: any) => {
    return Number(price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const planosVisiveis = useMemo(() => {
    const planosFiltrados = data.pricingPlans.filter(p => p.viewPrice === true)
    let planosSelecionados: typeof data.pricingPlans = []

    if (fullPaymentLink) {
      planosSelecionados = planosFiltrados.slice(1, 3)
    } else if (paymentLink || !paymentLink) {
      planosSelecionados = planosFiltrados.slice(1, 3)
    } else {
      planosSelecionados = planosFiltrados.slice(2, 3)
    }

    // if (paymentAmount && planosSelecionados.length > 0) {
    //   planosSelecionados = planosSelecionados.map(p => ({
    //     ...p,
    //     monthlyPrice: formatPrice(paymentAmount)
    //   }))
    // }

    return planosSelecionados
  }, [data.pricingPlans, paymentLink, fullPaymentLink, paymentAmount])

  // const planosVisiveis = useMemo(() => {
  //   const planosFiltrados = data.pricingPlans.filter(p => p.viewPrice === true)

  //   if (fullPaymentLink) {
  //     return planosFiltrados.slice(2, 3)
  //   }

  //   if (paymentLink || !paymentLink) {
  //     return planosFiltrados.slice(0, 1)
  //   }

  //   return planosFiltrados.slice(2, 3)
  // }, [data.pricingPlans, paymentLink, fullPaymentLink])

  const [openModalConfirmation, setOpenModalConfirmation] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'CREDIT_CARD' | 'PIX' | null>(null)

  const handleClickOpen = (paymentType: 'CREDIT_CARD' | 'PIX') => {
    setSelectedPayment(paymentType)
    setOpenModalConfirmation(true)
  }

  const handleClose = () => {
    setOpenModalConfirmation(false)
    setSelectedPayment(null)
  }

  const handleConfirm = () => {
    if (selectedPayment) {
      handleGeneratePayment(selectedPayment)
    }
    handleClose()
  }

  const handleGeneratePayment = async (method: 'CREDIT_CARD' | 'PIX') => {
    const res = await api.post('/asaas-subscription/generate-payment', {
      method
    })

    window.open(res.data, '_blank')
  }

  useEffect(() => {
    if (showPaymentDialog) {
      const interval = setInterval(async () => {
        try {
          const res = await api.get('/accounts/status')
          if (res.data.active && !res.data.expiredSubscription) {
            setShowPaymentDialog(false)
            window.localStorage.removeItem('showPaymentDialog')
            window.localStorage.removeItem('paymentLink')

            window.localStorage.removeItem('paymentAmount')
            window.localStorage.removeItem('fullPaymentLink')
          }
        } catch (err) {
          console.log('Conta ainda bloqueada...')
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [showPaymentDialog])

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{`${themeConfig.templateName} - Software`}</title>
          <meta name='description' content={`${themeConfig.templateName} – Gerenciamento de Clínicas`} />
          <meta name='keywords' content='Clinica, Estetica, Face, Facial, Gestão, Gerenciamento, App' />
          <meta name='viewport' content='initial-scale=1, width=device-width' />
          <meta name='google' content='notranslate' />
        </Head>
        <SocketContext.Provider value={SocketManager}>
          <WhatsAppsProvider>
            <AuthProvider>
              <AgentIAProvider>
                <KanbanProvider>
                  <OpportunityProvider>
                    <ProsthesisProvider>
                      <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
                        <SettingsConsumer>
                          {({ settings }) => {
                            return (
                              <ThemeComponent settings={settings}>
                                <Guard authGuard={authGuard} guestGuard={guestGuard}>
                                  <AclGuard
                                    aclAbilities={aclAbilities}
                                    guestGuard={guestGuard}
                                    authGuard={authGuard}
                                    requiredPlan={(Component as any).requiredPlan}
                                    requiredRole={(Component as any).requiredRole}
                                  >
                                    {getLayout(<Component {...pageProps} />)}
                                  </AclGuard>
                                </Guard>
                                <ReactHotToast>
                                  <Toaster
                                    position={settings.toastPosition}
                                    toastOptions={{ className: 'react-hot-toast' }}
                                  />
                                </ReactHotToast>
                                <Dialog
                                  open={showPaymentDialog}
                                  aria-labelledby='alert-dialog-title'
                                  aria-describedby='alert-dialog-description'
                                >
                                  <DialogContent>
                                    <PricingHeader
                                      plan={plan}
                                      handleChange={(e: ChangeEvent<{ checked: boolean }>) => {
                                        if (e.target.checked) {
                                          setPlan('annually')
                                        } else {
                                          setPlan('monthly')
                                        }
                                      }}
                                    />

                                    <Box mt={0} textAlign='center'>
                                      <Typography variant='body1' color='textSecondary' mb={2}>
                                        Se você já efetuou o pagamento, acesse a página de login.
                                      </Typography>
                                      <Button variant='contained' color='primary' onClick={handleLoginRedirect}>
                                        Ir para o Login
                                      </Button>
                                    </Box>

                                    {paymentLink && (
                                      <Box mt={4} mb={5} textAlign='center'>
                                        <Typography variant='body1' mb={2} color='textSecondary'>
                                          Para ativar sua conta e ter acesso completo ao sistema, realize o pagamento da
                                          mensalidade.
                                        </Typography>

                                        <Button
                                          variant='contained'
                                          color='primary'
                                          href={paymentLink}
                                          target='_blank'
                                          rel='noopener noreferrer'
                                        >
                                          {`Pagar Agora ${paymentAmount ? `(${formatPrice(paymentAmount)})` : ''}`}
                                        </Button>
                                      </Box>
                                    )}
                                    {/* {paymentLink && (
                                      <Box mt={4} mb={5} textAlign='center'>
                                        <Typography variant='body1' mb={2} color='textSecondary'>
                                          Para ativar sua conta e ter acesso completo ao sistema, realize o pagamento da
                                          mensalidade.
                                        </Typography>

                                        <Button
                                          variant='contained'
                                          color='primary'
                                          href={paymentLink}
                                          target='_blank'
                                          rel='noopener noreferrer'
                                        >
                                          Pagar Agora (R$ 1,00)
                                        </Button>
                                      </Box>
                                    )}

                                    {!paymentLink && !fullPaymentLink && (
                                      <Box
                                        mt={2}
                                        mb={5}
                                        textAlign='center'
                                        display='flex'
                                        justifyContent='center'
                                        gap={2}
                                        flexWrap='wrap'
                                      >
                                        <Button
                                          variant='contained'
                                          color='primary'
                                          onClick={() => handleClickOpen('PIX')}
                                        >
                                          Pagar com Pix (R$ 1,00)
                                        </Button>

                                        <Button
                                          variant='contained'
                                          color='secondary'
                                          onClick={() => handleClickOpen('CREDIT_CARD')}
                                        >
                                          Pagar com Cartão (R$ 1,00)
                                        </Button>
                                      </Box>
                                    )} */}

                                    {fullPaymentLink && isAdmin && (
                                      <Box mt={2} mb={5} textAlign='center'>
                                        <Button
                                          variant='contained'
                                          color='primary'
                                          onClick={() => window.open(fullPaymentLink, '_blank')}
                                        >
                                          Visualize sua cobrança vencida
                                        </Button>
                                      </Box>
                                    )}

                                    {/* <Dialog open={open} onClose={handleClose}>
  <DialogTitle textAlign={'center'}>Cadastro de Cartão de Crédito</DialogTitle>
  <DialogContent>
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box mb={2} mt={2}>
        <TextField
          label="Nome no cartão"
          variant="outlined"
          fullWidth
          placeholder="Ex: João Silva"
          {...register('holderName', { required: 'Nome é obrigatório' })}
          error={!!errors.holderName}
        />
      </Box>

      <Box mb={2}>
        <TextField
          label="Número do Cartão"
          variant="outlined"
          fullWidth
          placeholder="Ex: 1234 5678 9012 3456"
          {...register('number', { 
            required: 'Número do cartão é obrigatório', 
            pattern: {
              value: /^\d{16}$/,
              message: 'Número do cartão deve ter 16 dígitos'
            } 
          })}
          error={!!errors.number}
        />
      </Box>

      <Box mb={2} display="flex" justifyContent="space-between" gap={2}>
        <TextField
          label="Mês de Expiração"
          variant="outlined"
          fullWidth
          placeholder="Ex: 06"
          {...register('expiryMonth', { 
            required: 'Mês de expiração é obrigatório', 
            pattern: {
              value: /^(0[1-9]|1[0-2])$/,
              message: 'Mês de expiração inválido'
            } 
          })}
          error={!!errors.expiryMonth}
        />
        <TextField
          label="Ano de Expiração"
          variant="outlined"
          fullWidth
          placeholder="Ex: 2025"
          {...register('expiryYear', { 
            required: 'Ano de expiração é obrigatório', 
            pattern: {
              value: /^(202[3-9]|20[3-9][0-9])$/,
              message: 'Ano de expiração inválido'
            } 
          })}
          error={!!errors.expiryYear}
        />
      </Box>

      <Box mb={2}>
        <TextField
          label="Código de Segurança (CCV)"
          variant="outlined"
          fullWidth
          placeholder="Ex: 123"
          {...register('ccv', { 
            required: 'Código de segurança é obrigatório', 
            pattern: {
              value: /^[0-9]{3,4}$/,
              message: 'Código de segurança inválido'
            }
          })}
          error={!!errors.ccv}
        />
      </Box>

      <Box mb={2}>
        <TextField
          label="CPF"
          variant="outlined"
          fullWidth
          placeholder="Ex: 12345678901"
          {...register('cpfCnpj', { 
            required: 'CPF é obrigatório',
            pattern: {
              value: /^\d{11}$/,
              message: 'CPF inválido'
            } 
          })}
          error={!!errors.cpfCnpj}
        />
      </Box>

      <Box mb={2}>
        <TextField
          label="E-mail"
          variant="outlined"
          fullWidth
          placeholder="Ex: joao.silva@email.com"
          {...register('email', { 
            required: 'E-mail é obrigatório',
            pattern: {
              value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
              message: 'E-mail inválido'
            }
          })}
          error={!!errors.email}
        />
      </Box>

      <Box mb={2}>
        <TextField
          label="CEP"
          variant="outlined"
          fullWidth
          placeholder="Ex: 12345-678"
          {...register('postalCode', { 
            required: 'CEP é obrigatório',
            pattern: {
              value: /^[0-9]{5}-?[0-9]{3}$/,
              message: 'CEP inválido'
            }
          })}
          error={!!errors.postalCode}
        />
      </Box>

      <Box mb={2}>
        <TextField
          label="Número do Endereço"
          variant="outlined"
          fullWidth
          placeholder="Ex: 123"
          {...register('addressNumber', { required: 'Número do endereço é obrigatório' })}
          error={!!errors.addressNumber}
        />
      </Box>

      <Box mb={2}>
        <TextField
          label="Telefone"
          variant="outlined"
          fullWidth
          placeholder="Ex: (11) 98765-4321"
          {...register('phone', { 
            required: 'Telefone é obrigatório',
            pattern: {
              value: /^\(?\d{2}\)? \d{4,5}-\d{4}$/,
              message: 'Telefone inválido'
            }
          })}
          error={!!errors.phone}
        />
      </Box>

      <DialogActions>
        <Button onClick={handleClose} variant='outlined'  color="error">Cancelar</Button>
        <Button type="submit" variant='contained' color="primary">Salvar</Button>
      </DialogActions>
    </form>
  </DialogContent>
                              </Dialog> */}

                                    <div style={{ width: '100%' }}>
                                      {planosVisiveis.map(item => (
                                        <Grid item xs={12} md={4} key={item.title.toLowerCase()}>
                                          <PlanDetails plan={plan} data={item} />
                                        </Grid>
                                      ))}

                                      {/* <PricingPlans plan={plan} data={data.pricingPlans.filter((element) => element.viewPrice === true)} /> */}
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog open={openModalConfirmation} onClose={handleClose}>
                                  <DialogTitle>Confirmar pagamento</DialogTitle>
                                  <DialogContent>
                                    <DialogContentText>
                                      Tem certeza que deseja pagar com{' '}
                                      {selectedPayment === 'PIX' ? 'Pix' : 'Cartão de Crédito'} no valor de R$ 1,00?
                                    </DialogContentText>
                                  </DialogContent>
                                  <DialogActions>
                                    <Button onClick={handleClose}>Cancelar</Button>
                                    <Button onClick={handleConfirm} variant='contained' color='primary'>
                                      Confirmar
                                    </Button>
                                  </DialogActions>
                                </Dialog>
                              </ThemeComponent>
                            )
                          }}
                        </SettingsConsumer>
                      </SettingsProvider>
                    </ProsthesisProvider>
                  </OpportunityProvider>
                </KanbanProvider>
              </AgentIAProvider>
            </AuthProvider>
          </WhatsAppsProvider>
        </SocketContext.Provider>
      </CacheProvider>
    </Provider>
  )
}

export default App
