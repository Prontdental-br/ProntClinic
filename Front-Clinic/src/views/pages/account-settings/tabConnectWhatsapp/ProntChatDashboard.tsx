import React, { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { read, utils } from 'xlsx'
import { excelDateToJSDate } from 'src/common/excel'
import api from 'src/@core/components/api-client'
import toast from 'react-hot-toast'
import {
  Container,
  CssBaseline,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Image from 'next/image'
import { CardContent } from '@mui/material'
import { blue, grey } from '@material-ui/core/colors'
import moment from 'moment'
import prontChatApi from './ProntChatApi'
import { isArray, isEmpty } from 'lodash'
import ButtonWithSpinner from 'src/views/components/ButtonWithSpinner'
import { ChartsDate } from './charts/ChartDate'
import { ChatsUser } from './charts/ChartUser'
import useContacts from 'src/hooks/useContacts'
import TableAttendantsStatus from 'src/views/components/TableAttendantsStatus/TableAttendantsStatus'

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2)
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    height: 240,
    overflowY: 'auto'
  },
  cardAvatar: {
    fontSize: '55px',
    color: grey[500],
    backgroundColor: '#ffffff',
    width: theme.spacing(7),
    height: theme.spacing(7)
  },
  cardTitle: {
    fontSize: '18px',
    color: blue[700]
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: '14px'
  },
  alignRight: {
    textAlign: 'right'
  },
  fullWidth: {
    width: '100%'
  },
  selectContainer: {
    width: '100%',
    textAlign: 'left'
  },
  iframeDashboard: {
    width: '100%',
    height: 'calc(100vh - 64px)',
    border: 'none'
  },

  // container: {
  //   paddingTop: theme.spacing(4),
  //   paddingBottom: theme.spacing(4),
  // },
  // fixedHeightPaper: {
  //   padding: theme.spacing(2),
  //   display: "flex",
  //   overflow: "auto",
  //   flexDirection: "column",
  //   height: 240,
  // },
  customFixedHeightPaper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: 120
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%'
  },
  card0: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#9400D3',
    color: '#eee'
  },
  card00: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#8B1C62',
    color: '#eee'
  },
  card1: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#11bf42',
    color: '#eee'
  },
  card2: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#748e9d',
    color: '#eee'
  },
  card3: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#e53935',
    color: '#eee'
  },
  card4: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#cc991b',
    color: '#eee'
  },
  card5: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#47a7f6',
    color: '#eee'
  },
  card6: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#b87d77',
    color: '#eee'
  },
  card7: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#7bc780',
    color: '#eee'
  },
  card8: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#b05c38',
    color: '#eee'
  },
  card9: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#bd3c58',
    color: '#eee'
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column'
  }
}))

interface FindParams {
  date_from?: string,
  period?: number,
  date_to?: string,
}

export interface Attendant {
  id: number,
  name: string,
  online: boolean,
  rating: number,
  tickets: number,
  avgSupportTime: number,
}

interface Counters {
  leads: number,
  avgWaitTime: number,
  avgSupportTime: any,
  supportPending: number,
  totalCompanies: number,
  supportFinished: number,
  supportHappening: number,
  totalWhatsappSessions: number,
}

const ProntChatDashboard = ({ user }: any) => {
  const classes = useStyles()
  const [counters, setCounters] = useState<Counters>({
    leads: 0,
    avgWaitTime: 0,
    avgSupportTime: null,
    supportPending: 0,
    totalCompanies: 0,
    supportFinished: 0,
    supportHappening: 0,
    totalWhatsappSessions: 0
  })
  const [attendants, setAttendants] = useState<Attendant[]>([])
  const [period, setPeriod] = useState(0)
  const [filterType, setFilterType] = useState(1)
  const [dateFrom, setDateFrom] = useState(moment('1', 'D').format('YYYY-MM-DD'))
  const [dateTo, setDateTo] = useState(moment().format('YYYY-MM-DD'))
  const [loading, setLoading] = useState(false)

  const newDate = new Date()
  const date = newDate.getDate()
  const month = newDate.getMonth() + 1
  const year = newDate.getFullYear()
  const now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`

  const [showFilter, setShowFilter] = useState(false)
  const [queueTicket, setQueueTicket] = useState(false)

  let userQueueIds = []

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q: any) => q.id)
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData()
    }
    setTimeout(() => {
      firstLoad()
    }, 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleChangePeriod(value: unknown) {
    setPeriod(Number(value))
  }

  async function handleChangeFilterType(value: unknown) {
    setFilterType(Number(value))
    if (value === 1) {
      setPeriod(0)
    } else {
      setDateFrom('')
      setDateTo('')
    }
  }

  const find = async (params: FindParams) => {
    const { data } = await prontChatApi.get(`/dashboard`, { params })

    return data
  }

  async function fetchData() {
    setLoading(true)

    let params = {}

    if (period > 0) {
      params = {
        days: period
      }
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format('YYYY-MM-DD')
      }
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format('YYYY-MM-DD')
      }
    }

    if (Object.keys(params).length === 0) {
      toast.error('Parametrize o filtro')
      setLoading(false)

      return
    }

    const data = await find(params)

    setCounters(data.counters)
    if (isArray(data.attendants)) {
      setAttendants(data.attendants)
    } else {
      setAttendants([])
    }

    setLoading(false)
  }

  function formatTime(minutes: number) {
    return moment().startOf('day').add(minutes, 'minutes').format('HH[h] mm[m]')
  }

  const GetUsers = () => {
    let userOnline = 0
    attendants.forEach(user => {
      if (user.online === true) {
        userOnline = userOnline + 1
      }
    })
    const count = userOnline === 0 ? 0 : userOnline

    return count
  }

  const GetContacts = (all: boolean) => {
    let props = {}
    if (all) {
      props = {}
    }
    const { count } = useContacts(props)

    return count
  }

  function renderFilters() {
    if (filterType === 1) {
      return (
        <>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label='Data Inicial'
              type='date'
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label='Data Final'
              type='date'
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
        </>
      )
    } else {
      return (
        <Grid item xs={12} sm={6} md={4}>
          <FormControl className={classes.selectContainer}>
            <InputLabel id='period-selector-label'>Período</InputLabel>
            <Select
              labelId='period-selector-label'
              id='period-selector'
              value={period}
              onChange={e => handleChangePeriod(e.target.value)}
            >
              <MenuItem value={0}>Nenhum selecionado</MenuItem>
              <MenuItem value={3}>Últimos 3 dias</MenuItem>
              <MenuItem value={7}>Últimos 7 dias</MenuItem>
              <MenuItem value={15}>Últimos 15 dias</MenuItem>
              <MenuItem value={30}>Últimos 30 dias</MenuItem>
              <MenuItem value={60}>Últimos 60 dias</MenuItem>
              <MenuItem value={90}>Últimos 90 dias</MenuItem>
            </Select>
            <FormHelperText>Selecione o período desejado</FormHelperText>
          </FormControl>
        </Grid>
      )
    }
  }

  return (
    <div>
      <Container maxWidth='lg' className={classes.container}>
        <Grid container spacing={3} justifyContent='flex-end'>
          {/* FILTROS */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id='period-selector-label'>Tipo de Filtro</InputLabel>
              <Select
                labelId='period-selector-label'
                value={filterType}
                onChange={e => handleChangeFilterType(e.target.value)}
              >
                <MenuItem value={1}>Filtro por Data</MenuItem>
                <MenuItem value={2}>Filtro por Período</MenuItem>
              </Select>
              <FormHelperText>Selecione o período desejado</FormHelperText>
            </FormControl>
          </Grid>

          {renderFilters()}

          {/* BOTAO FILTRAR */}
          <Grid item xs={12} className={classes.alignRight}>
            <ButtonWithSpinner loading={loading} onClick={() => fetchData()} variant='contained' color='primary'>
              Filtrar
            </ButtonWithSpinner>
          </Grid>

          {/* CONEXÕES */}
          {user.super && (
            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classes.card0} style={{ overflow: 'hidden' }} elevation={4}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography component='h3' variant='h6' paragraph>
                      Conexões Ativas
                    </Typography>
                    <Grid item>
                      <Typography component='h1' variant='h4'>
                        {counters.totalWhatsappSessions}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={2}>
                    <Icon icon='ic:outline-mobile-friendly' fontSize={100} color='#fff' />
                    {/* <MobileFriendlyIcon
                      style={{
                        fontSize: 100,
                        color: '#fff'
                      }}
                    /> */}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* EMPRESAS */}
          {user.super && (
            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classes.card00} style={{ overflow: 'hidden' }} elevation={4}>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Typography component='h3' variant='h6' paragraph>
                      Empresas
                    </Typography>
                    <Grid item>
                      <Typography component='h1' variant='h4'>
                        {counters.totalCompanies}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={2}>
                    <Icon icon='material-symbols:store' fontSize={100} color='#FF34B3' />
                    {/* <StoreIcon
                      style={{
                        fontSize: 100,
                        color: '#FF34B3'
                      }}
                    /> */}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* EM ATENDIMENTO */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card1} style={{ overflow: 'hidden' }} elevation={4}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component='h3' variant='h6' paragraph>
                    Em Conversa
                  </Typography>
                  <Grid item>
                    <Typography component='h1' variant='h4'>
                      {counters.supportHappening}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={2}>
                  <Icon icon='mdi:phone' fontSize={100} color="#0b708c" />
                  {/* <CallIcon
                    style={{
                      fontSize: 100,
                      color: '#0b708c'
                    }}
                  /> */}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* AGUARDANDO */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card2} style={{ overflow: 'hidden' }} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component='h3' variant='h6' paragraph>
                    Aguardando
                  </Typography>
                  <Grid item>
                    <Typography component='h1' variant='h4'>
                      {counters.supportPending}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Icon icon='ic:baseline-hourglass-empty' fontSize={100} color='#47606e' />
                  {/* <HourglassEmptyIcon
                    style={{
                      fontSize: 100,
                      color: '#47606e'
                    }}
                  /> */}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* ATENDENTES ATIVOS */}
          {/*<Grid item xs={12} sm={6} md={4}>
            <Paper
              className={classes.card6}
              style={{ overflow: "hidden" }}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography
                    component="h3"
                    variant="h6"
                    paragraph
                  >
                    Conversas Ativas
                  </Typography>
                  <Grid item>
                    <Typography
                      component="h1"
                      variant="h4"
                    >
                      {GetUsers()}
                      <span
                        style={{ color: "#805753" }}
                      >
                        /{attendants.length}
                      </span>
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <RecordVoiceOverIcon
                    style={{
                      fontSize: 100,
                      color: "#805753",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
</Grid>*/}

          {/* FINALIZADOS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card3} style={{ overflow: 'hidden' }} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component='h3' variant='h6' paragraph>
                    Finalizados
                  </Typography>
                  <Grid item>
                    <Typography component='h1' variant='h4'>
                      {counters.supportFinished}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                
                  <Icon icon='material-symbols:check-circle' fontSize={100} color='#5852ab' />
                  {/* <CheckCircleIcon
                    style={{
                      fontSize: 100,
                      color: '#5852ab'
                    }}
                  /> */}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* NOVOS CONTATOS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card4} style={{ overflow: 'hidden' }} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component='h3' variant='h6' paragraph>
                    Novos Contatos
                  </Typography>
                  <Grid item>
                    <Typography component='h1' variant='h4'>
                      {GetContacts(true)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Icon icon='material-symbols:group-add' fontSize={100} color='#8c6b19' />
                  {/* <GroupAddIcon
                    style={{
                      fontSize: 100,
                      color: '#8c6b19'
                    }}
                  /> */}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* T.M. DE ATENDIMENTO */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card8} style={{ overflow: 'hidden' }} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component='h3' variant='h6' paragraph>
                    T.M. de Conversa
                  </Typography>
                  <Grid item>
                    <Typography component='h1' variant='h4'>
                      {formatTime(counters.avgSupportTime)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Icon icon='material-symbols:alarm-outline' fontSize={100} color='#7a3f26' />
                  {/* <AccessAlarmIcon
                    style={{
                      fontSize: 100,
                      color: '#7a3f26'
                    }}
                  /> */}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* T.M. DE ESPERA */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card9} style={{ overflow: 'hidden' }} elevation={6}>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component='h3' variant='h6' paragraph>
                    T.M. de Espera
                  </Typography>
                  <Grid item>
                    <Typography component='h1' variant='h4'>
                      {formatTime(counters.avgWaitTime)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Icon icon='material-symbols:timer' fontSize={100} color='#8a2c40' />
                  {/* <TimerIcon
                    style={{
                      fontSize: 100,
                      color: '#8a2c40'
                    }}
                  /> */}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* USUARIOS ONLINE */}
          <Grid item xs={12}>
            {attendants.length ? <TableAttendantsStatus attendants={attendants} loading={loading} /> : null}
          </Grid>

          {/* TOTAL DE ATENDIMENTOS POR USUARIO */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChatsUser />
            </Paper>
          </Grid>

          {/* TOTAL DE ATENDIMENTOS */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChartsDate companyId={ user.companyId } />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

export default ProntChatDashboard
