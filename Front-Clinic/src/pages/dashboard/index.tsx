'use client'
import React, { useContext, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { useRouter } from 'next/router'
import { useSettings } from 'src/@core/hooks/useSettings'
import { AuthContext } from 'src/context/AuthContext'
import { ModalConfirmRegistration } from 'src/views/components/ModalConfirmRegistration'
import { Cake, CalendarMonth, CalendarToday } from '@mui/icons-material'
import Image from 'next/image'
import LogisticsShipmentStatistics from 'src/views/apps/logistics/dashboard/LogisticsShipmentStatistics'
import WeeklySales from 'src/views/apps/logistics/dashboard/WeeklySales'
import Performance from 'src/views/apps/logistics/dashboard/Performance'
import CardWidgetsSalesCountry from 'src/views/apps/logistics/dashboard/SalesCountry'
import ExternalLinks from 'src/views/apps/logistics/dashboard/ExternalLinks'
import StatusCards from 'src/views/apps/logistics/dashboard/StatusCards'
import AnalyticsBudgetReport from 'src/views/dashboards/AnalyticsBudgetReport'
import Typewriter from 'src/components/Typewriter'
import api from 'src/@core/components/api-client'
import LogisticsDeliveryExceptions from 'src/views/apps/logistics/dashboard/LogisticsDeliveryExceptions'
import YouTubeIcon from '@mui/icons-material/YouTube'
import YouTube from 'react-youtube'
import AnalyticsReceiptReport from 'src/views/dashboards/AnalyticsReceiptReport'
import AnalyticsBugetOpen from 'src/views/dashboards/AnalyticsBugetOpen'


const items = [
  { label: 'Paciente', path: '/patient/list' },
  { label: 'Agenda', path: '/calendar' },
  { label: 'Orçamentos', path: '/budgets' },
  { label: 'Clínica', path: '/pages/account-settings/account/' },
  { label: 'Contratos', path: '/contracts' },
  { label: 'Financeiro', path: '/financial' },
  { label: 'Tarefas', path: '/kanban' },
  { label: 'Chat CRM', path: '/chat/conversation' }
]

const phrases = [
  'Você não veio até aqui pra ser mediano.',
  'Todo dia é uma nova chance de fazer melhor.',
  'Disciplina hoje. Liberdade amanhã.',
  'O seu futuro está sendo construído agora.',
  'Você nasceu para impactar vidas.',
  'Não se esqueça: excelência é um hábito.',
  'Grandes profissionais se constroem nos bastidores.',
  'Você é o diferencial da sua clínica.',
  'Persistência é o que separa os bons dos excelentes.',
  'A jornada é difícil, mas o destino vale a pena.',
  'Seja o profissional que você gostaria de encontrar.',
  'Crescer exige coragem. E você tem de sobra.',
  'Todo atendimento é uma oportunidade de transformação.',
  'Você é mais capaz do que imagina.',
  'A sua constância é mais importante que a sua motivação.',
  'Lembre-se do porquê você começou.',
  'Seu trabalho transforma sorrisos, rostos e histórias.',
  'Sonhos grandes pedem ações ousadas.',
  'É na rotina que o sucesso se esconde.',
  'Profissional de verdade cuida dos detalhes.',
  'Você não precisa ser perfeito. Precisa ser consistente.',
  'Quando você evolui, sua clínica cresce junto.',
  'Coragem é continuar mesmo quando ninguém está vendo.',
  'Você está exatamente onde deveria estar.',
  'Continue firme. Você está mais perto do que pensa.',
  'Se desafie todos os dias. É assim que se cresce.',
  'Seu propósito vale cada esforço.',
  'Orgulhe-se da sua trajetória. Você está construindo algo grande.',
  'Você não está sozinho. A jornada é coletiva.',
  'Mais do que um profissional, você é um exemplo.',
  'A sua energia transforma o ambiente ao seu redor.',
  'Gestão clara, crescimento natural.'
]

const Start = () => {
  const [openModalConfirmRegistration, setOpenModalConfirmRegistration] = useState<boolean>(false)

  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const router = useRouter()
  const { settings, saveSettings } = useSettings()
  const { user } = useContext(AuthContext)

  const mode = settings.mode

  const handleCloseModalConfirmRegistration = () => {
    setOpenModalConfirmRegistration(false)
  }

  const handleRouter = (path: string) => {
    router.push(path)
    saveSettings({ ...settings, navCollapsed: false })
  }

  useEffect(() => {
    if (typeof user?.clinicId == 'undefined') {
      window.location.href = '/dados-cadastrais'
    } else {
      console.log('tem clinica')
    }

    if (!user?.professional && user?.clinicId) {
      setOpenModalConfirmRegistration(true)
    }
  }, [user])

  useEffect(() => {
    saveSettings({ ...settings, navCollapsed: true })
  }, [])

  let columns = 1
  if (isSm) columns = 2
  if (isMdUp) columns = 4

  const dataFake = {
    agendados: 5,
    atendidos: 9,
    desmarcados: 7,
    aniversariantes: 0,
    gerencia: {
      agendamentos: 20,
      financeiro: 40,
      crc: 25,
      chatCrm: 37
    }
  }

  const [selectedPhrase, setSelectedPhrase] = useState('')

  const [key, setKey] = useState(0)

  useEffect(() => {
    const setRandomPhrase = () => {
      const random = Math.floor(Math.random() * phrases.length)
      setSelectedPhrase(phrases[random])
      setKey(prev => prev + 1)
    }

    setRandomPhrase() // inicial
    const interval = setInterval(setRandomPhrase, 20000)

    return () => clearInterval(interval)
  }, [])

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professionalName = userData.professional?.name ? userData.professional?.name : null
  const professional = userData?.professional || null

  const isAdmin = professional?.isAdmin === true || !professional
  const isRecepcionista = professional?.specialty === 'recepcionista' && !!professional
  const isProfissional = professional?.specialty !== 'recepcionista' && !!professional

  const [data, setData] = useState({
    agendados: 0,
    atendidos: 0,
    retornos: 0,
    desmarcados: 0,
    aniversariantes: 0
  })

  const [periodo, setPeriodo] = useState<
    'day' | 'week' | 'month' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
  >('day')

  const textPeriod: Record<string, string> = {
    day: 'para hoje',
    week: 'para a semana',
    month: 'para o mês',
    1: 'para Janeiro',
    2: 'para Fevereiro',
    3: 'para Março',
    4: 'para Abril',
    5: 'para Maio',
    6: 'para Junho',
    7: 'para Julho',
    8: 'para Agosto',
    9: 'para Setembro',
    10: 'para Outubro',
    11: 'para Novembro',
    12: 'para Dezembro'
  }

  const fetchData = async () => {
    try {
      const response = await api.get(`crc/start?range=${periodo}`)
      setData({
        agendados: response.data.scheduled,
        atendidos: response.data.attended,
        confirmados: response.data.confirmed,
        retornos: response.data.returns,
        desmarcados: response.data.canceled,
        aniversariantes: response.data.birthdays
      })
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [periodo])

  const currentHour = new Date().getHours()

  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) {
      return 'Bom dia'
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Boa tarde'
    } else {
      return 'Boa noite'
    }
  }

  const [openModal, setOpenModal] = useState(false)

  const toggleVideo = () => {
    setOpenModal(true)
  }

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

  return (
    <>
      <Box p={2}>
        <Grid container spacing={2}>

          <Grid item xs={12} sm={5} md={2.4}>
            <Card
              onClick={() => router.push('/calendar')}
              sx={{
                borderTop: '15px solid #911BC4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911BC4'>
                  Agendados
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911BC4'>
                  {data.agendados}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>
                <CalendarMonth
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911BC4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <Card
              onClick={() => router.push('/calendar')}
              sx={{
                borderTop: '15px solid #911BC4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911BC4'>
                  Atendidos
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911BC4'>
                  {data.atendidos}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>
                <CalendarMonth
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911BC4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <Card
              onClick={() => router.push('/calendar')}
              sx={{
                borderTop: '15px solid #911BC4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911BC4'>
                  Confirmados
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911BC4'>
                  {data.confirmados}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>
                <CalendarMonth
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911BC4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <Card
              onClick={() => router.push('/calendar')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderTop: '15px solid #911bc4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911bc4'>
                  Desmarcados
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911bc4'>
                  {data.desmarcados}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>

                {/* Ícone com classe para aplicar shake */}
                <CalendarMonth
                  fontSize='large'
                  className='icon-shake'
                  sx={{
                    color: '#911bc4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    transition: 'transform 0.2s ease-in-out'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <Card
              onClick={() => router.push(`/crc?section=retornos&periodo=${periodo}`)}
              sx={{
                borderTop: '15px solid #911BC4',
                borderRadius: 1,
                cursor: 'pointer',
                height: '100%',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911BC4'>
                  Retornos
                </Typography>

                <Typography variant='h3' fontWeight='bold' color='#911BC4'>
                  {data.retornos}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>

                <FormControl
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    minWidth: 100
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <InputLabel>Período</InputLabel>
                  <Select value={periodo} label='Período' onChange={e => setPeriodo(e.target.value as any)}>
                    <MenuItem value='day'>Hoje</MenuItem>
                    <MenuItem value='week'>Semana</MenuItem>
                    <MenuItem value='month'>Mês</MenuItem>
                    <MenuItem value='1'>Janeiro</MenuItem>
                    <MenuItem value='2'>Fevereiro</MenuItem>
                    <MenuItem value='3'>Março</MenuItem>
                    <MenuItem value='4'>Abril</MenuItem>
                    <MenuItem value='5'>Maio</MenuItem>
                    <MenuItem value='6'>Junho</MenuItem>
                    <MenuItem value='7'>Julho</MenuItem>
                    <MenuItem value='8'>Agosto</MenuItem>
                    <MenuItem value='9'>Setembro</MenuItem>
                    <MenuItem value='10'>Outubro</MenuItem>
                    <MenuItem value='11'>Novembro</MenuItem>
                    <MenuItem value='12'>Dezembro</MenuItem>
                    <MenuItem value='12'>Dezembro</MenuItem>
                    <MenuItem value='12'>Dezembro</MenuItem>
                  </Select>
                </FormControl>

                <CalendarMonth
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911BC4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          
        </Grid>

        <Grid container spacing={2} sx = {{ mt: 2 }}>
          {userData?.planType !== 'E' && isAdmin && (
            <>
            <Grid item xs={12} md={9.6}>
                <LogisticsShipmentStatistics />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={4} md={2.4}>
            <Card
              onClick={() => router.push('/crc?section=aniversariantes')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderTop: '15px solid #911bc4',
                borderRadius: 1,
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)'
                },
                '&:hover .icon-shake': {
                  animation: 'shake 0.4s ease-in-out forwards',
                  transformOrigin: 'center'
                },
                '@keyframes shake': {
                  '0%': { transform: 'scale(1.2) rotate(5deg)' },
                  '25%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '50%': { transform: 'scale(1.2) rotate(5deg)' },
                  '75%': { transform: 'scale(1.2) rotate(-5deg)' },
                  '100%': { transform: 'scale(1.2) rotate(3deg)' }
                }
              }}
            >
              <CardContent sx={{ position: 'relative', minHeight: 100 }}>
                <Typography fontWeight='bold' sx={{ fontSize: 20 }} color='#911bc4'>
                  Aniversariantes
                </Typography>
                <Typography variant='h3' fontWeight='bold' color='#911bc4'>
                  {data.aniversariantes}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {textPeriod[periodo]}
                </Typography>
                <Cake
                  className='icon-shake'
                  fontSize='large'
                  sx={{
                    color: '#911bc4',
                    position: 'absolute',
                    bottom: 8,
                    right: 8
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {userData?.planType !== 'E' && isAdmin && (
            <>
              <Grid item xs={12} md={9.6}>
                <AnalyticsReceiptReport />
              </Grid>
            </>
          )}

          <Grid item xs={12} md={2.4}>
            <LogisticsDeliveryExceptions />
          </Grid>
        </Grid>
      </Box>

      {/* {userData?.planType !== 'E' && isAdmin && (
        <>
          <Grid container spacing={4} sx={{ mt: 0 }}>
            <Grid item xs={12} md={4}>
              <Performance />
            </Grid>
            <Grid item xs={12} md={4}>
              <ExternalLinks />
            </Grid>
            <Grid item xs={12} md={4}>
              <CardWidgetsSalesCountry />
            </Grid>
          </Grid>
        </>
      )} */}
      {userData?.planType !== 'E' && isAdmin && <StatusCards />}

      <Grid container spacing={2} sx={{mt:2}}>
        <Grid item xs={12} sm={12} md={9.6}>
                          <AnalyticsBudgetReport />
                        </Grid>
      </Grid>

      <ModalConfirmRegistration open={openModalConfirmRegistration} onClose={handleCloseModalConfirmRegistration} />

      <Dialog open={openModal} onClose={handleClose} maxWidth='md' fullWidth>
        <DialogTitle>Assistir Vídeo</DialogTitle>
        <DialogContent>
          <YouTube opts={opts} videoId={'mWKUDE2Wjno'} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

Start.aclAbilities = { action: 'read', subject: 'start' }

// Start.requiredRole = 'admin'

// Start.requiredPlan = 'E'
export default Start
