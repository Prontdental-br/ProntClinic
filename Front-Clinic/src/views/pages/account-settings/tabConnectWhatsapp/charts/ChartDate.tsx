import React, { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import brLocale from 'date-fns/locale/pt-BR'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { Button, Stack, TextField } from '@mui/material'
import Typography from '@material-ui/core/Typography'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import prontChatApi from '../ProntChatApi'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface DataChats {
  total: number
  data?: number
  horario?: string
}

interface TicketsData {
  data: DataChats[]
  count: number
}

export const ChartsDate = ({ companyId }: { companyId: number }) => {
  const [initialDate, setInitialDate] = useState(new Date())
  const [finalDate, setFinalDate] = useState(new Date())
  const [ticketsData, setTicketsData] = useState<TicketsData>({ data: [], count: 0 })

  useEffect(() => {
    handleGetTicketsInformation()
  }, [])

  const handleGetTicketsInformation = async () => {
    try {
      const { data } = await prontChatApi.get(
        `/dashboard/ticketsDay?initialDate=${format(initialDate, 'yyyy-MM-dd')}&finalDate=${format(
          finalDate,
          'yyyy-MM-dd'
        )}&companyId=${companyId}`
      )
      setTicketsData(data)
    } catch (error) {
      toast.error('Erro ao buscar informações dos tickets')
    }
  }

  return (
    <>
      <Typography component='h2' variant='h6' color='primary' gutterBottom>
        Total ({ticketsData?.count})
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
            slots={{ textField: params => <TextField fullWidth {...params} sx={{ width: '20ch' }} /> }}
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
          labels:
            ticketsData && ticketsData?.data.length > 0
              ? ticketsData?.data.map((item: any) =>
                  item.hasOwnProperty('horario') ? `Das ${item.horario}:00 as ${item.horario}:59` : item.data
                )
              : undefined,
          datasets: [
            {
              // label: 'Dataset 1',
              data:
                ticketsData?.data.length > 0
                  ? ticketsData?.data.map((item, index) => {
                      return item.total
                    })
                  : undefined,
              backgroundColor: '#2DDD7F'
            }
          ]
        }}
        style={{ maxWidth: '100%', maxHeight: '280px' }}
      />
    </>
  )
}
