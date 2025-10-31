import React, { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import brLocale from 'date-fns/locale/pt-BR'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { Button, Stack, TextField } from '@mui/material'
import Typography from '@material-ui/core/Typography'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { makeStyles } from '@material-ui/core/styles'
import prontChatApi from '../ProntChatApi'

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2)
  }
}))

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)

interface DataChats {
  quantidade: number
  nome: string
}

interface TicketsData {
  data: DataChats[]
}

export const ChatsUser = () => {
  // const classes = useStyles();
  const [initialDate, setInitialDate] = useState(new Date())
  const [finalDate, setFinalDate] = useState(new Date())
  const [ticketsData, setTicketsData] = useState<TicketsData>({ data: [] })

  const companyId = localStorage.getItem('companyId')

  useEffect(() => {
    handleGetTicketsInformation()
  }, [])

  const handleGetTicketsInformation = async () => {
    try {
      const { data } = await prontChatApi.get(
        `/dashboard/ticketsUsers?initialDate=${format(initialDate, 'yyyy-MM-dd')}&finalDate=${format(
          finalDate,
          'yyyy-MM-dd'
        )}&companyId=${companyId}`
      )
      setTicketsData(data)
    } catch (error) {
      toast.error('Erro ao obter informações da conversa')
    }
  }

  return (
    <>
      <Typography component='h2' variant='h6' color='primary' gutterBottom>
        Total de Conversas por Usuários
      </Typography>

      <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ my: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
          <DatePicker
            value={initialDate}
            onChange={newValue => {
              if (newValue) {
                setInitialDate(newValue)
              }
            }}
            label='Inicio'
            slots={{ textField: params => <TextField fullWidth  {...params} /> }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
          <DatePicker
            value={finalDate}
            onChange={newValue => {
              if (newValue) {
                setFinalDate(newValue)
              }
            }}
            label='Fim'
            slots={{ textField: params => <TextField fullWidth {...params} sx={{ width: '20ch' }} /> }}
          />
        </LocalizationProvider>

        <Button className='buttonHover' onClick={handleGetTicketsInformation} variant='contained'>
          Filtrar
        </Button>
      </Stack>
      <Bar
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              display: false
            },
            title: {
              display: true,
              text: 'Gráfico de Conversas',
              position: 'left'
            },
            datalabels: {
              display: true,
              anchor: 'start',
              offset: -30,
              align: 'start',
              color: '#fff',
              textStrokeColor: '#000',
              textStrokeWidth: 2,
              font: {
                size: 20,
                weight: 'bold'
              }
            }
          }
        }}
        data={{
          labels: ticketsData && ticketsData?.data.length > 0 ? ticketsData?.data.map(item => item.nome) : undefined,
          datasets: [
            {
              data:
                ticketsData?.data.length > 0 &&
                ticketsData?.data.map((item, index) => {
                  return item.quantidade
                }),
              backgroundColor: '#2DDD7F'
            }
          ]
        }}
        style={{ maxWidth: '100%', maxHeight: '280px' }}
      />
    </>
  )
}
