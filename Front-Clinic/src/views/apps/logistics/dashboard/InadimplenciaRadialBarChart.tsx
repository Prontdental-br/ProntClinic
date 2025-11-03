'use client'

import dynamic from 'next/dynamic'

import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import type { ApexOptions } from 'apexcharts'
import { IconButton } from '@mui/material'

const AppReactApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

type DebitData = {
  type: 'R' | 'E'
  status: 'O' | 'P' | 'A' | 'R'
  dueDate?: string
  value: string
}

interface InadimplenciaChartProps {
  dataDebitsFiltered: DebitData[]
}

const chartColors = ['#7E22CE', '#A855F7', '#C084FC']

const InadimplenciaRadialBarChart = ({ dataDebitsFiltered }: InadimplenciaChartProps) => {
  const theme = useTheme()

  const { totalOverdue, totalNotOverdueOpen, totalToReceive } = (() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    let overdue = 0
    let notOverdueOpen = 0

    dataDebitsFiltered.forEach(debit => {
      if (debit.type === 'R' && debit.status === 'O' && debit.dueDate) {
        const due = new Date(debit.dueDate)
        const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
        const val = Number(debit.value) || 0
        if (dueDay < todayStart) overdue += val
        else notOverdueOpen += val
      }
    })

    return {
      totalOverdue: overdue,
      totalNotOverdueOpen: notOverdueOpen,
      totalToReceive: overdue + notOverdueOpen
    }
  })()

  const valueFormatter = (value: number) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (totalToReceive === 0) {
    return (
      <Card>
        <CardHeader
          title="Taxa de Inadimplência"
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 5 }}>
          <Typography variant='body1'>
            Não há valores em aberto a receber (Vencidos ou a Vencer).
          </Typography>
        </CardContent>
      </Card>
    )
  }


  const percentOverdue = (totalOverdue / totalToReceive) * 100
  const percentNotOverdue = (totalNotOverdueOpen / totalToReceive) * 100
  const rawPercentPago = 100 - (percentOverdue + percentNotOverdue)
  const percentPago = rawPercentPago > 0 ? rawPercentPago : 0

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '30%'
        },
        track: {
          background: '#f5ebff'
        },
        dataLabels: {
          show: true,

          name: {
            fontSize: '16px',
            color: '#6B21A8',
            offsetY: 10
          },

          value: {
            fontSize: '14px',
            color: '#4C1D95',
            formatter: (val: number | string) => {
              const n = Number(val)
              if (Number.isNaN(n)) return '0%'
              
return `${Math.round(n)}%` 
            }
          },

          total: {
            show: true,
            label: 'Total a Receber',
            color: '#6B21A8',
            formatter: () => valueFormatter(totalToReceive)
          }
        }
      }
    },
    stroke: {
      lineCap: 'round'
    },
    colors: chartColors,
    labels: ['Vencido', 'A Vencer', 'Pago'],
    legend: {
      show: false
    }
  }

  const series = [percentOverdue, percentNotOverdue, percentPago]

  return (
    <Card>
      <CardHeader
        title='Taxa de Inadimplência'
      />

      <CardContent>
        <AppReactApexCharts
          type='radialBar'
          height={330}
          options={options}
          series={series}
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant='body1' sx={{ fontWeight: 600, mb: 1 }}>
            Detalhes:
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: chartColors[0],
                mr: 1
              }}
            />
            <Typography variant='body2' sx={{ fontWeight: 600, color: chartColors[0] }}>
              Vencido (Inadimplência): {valueFormatter(totalOverdue)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: chartColors[1],
                mr: 1
              }}
            />
            <Typography variant='body2' sx={{ fontWeight: 600, color: chartColors[1] }}>
              A Vencer: {valueFormatter(totalNotOverdueOpen)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: chartColors[2],
                mr: 1
              }}
            />
            <Typography variant='body2' sx={{ fontWeight: 600, color: chartColors[2] }}>
              Pago: {valueFormatter(Math.max(0, totalToReceive - totalOverdue - totalNotOverdueOpen))}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default InadimplenciaRadialBarChart
