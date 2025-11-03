'use client'

import dynamic from 'next/dynamic'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import type { ApexOptions } from 'apexcharts'

const AppReactApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false }) 

type DebitData = {
  type: 'R' | 'E'
  status: 'O' | 'P' | 'A' | 'R'
  dueDate?: string
  value: string
}


interface DespesasDonutChartProps {
  dataDebitsFiltered: DebitData[]
}

const donutColors = {
  paid: '#7E22CE',
  open: '#A855F7', 
  overdue: '#C084FC' 
}

const DespesasDonutChart = ({ dataDebitsFiltered }: DespesasDonutChartProps) => {
  const theme = useTheme()

  const textSecondary = theme.palette.text.secondary 

  const { totalPaid, totalOpen, totalOverdue, totalExpenses } = (() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    let paid = 0
    let openNotOverdue = 0
    let overdue = 0

    dataDebitsFiltered
      .filter(debit => debit.type === 'E') 
      .forEach(debit => {
        const val = Number(debit.value) || 0

        if (debit.status === 'P') {
          paid += val
        } else if (debit.dueDate) {
          const due = new Date(debit.dueDate)
          const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())

          if (dueDay < todayStart) {
            overdue += val 
          } else {
            openNotOverdue += val 
          }
        } else if (debit.status === 'O' || debit.status === 'A') {
          openNotOverdue += val
        }
      })

    return {
      totalPaid: paid,
      totalOpen: openNotOverdue,
      totalOverdue: overdue,
      totalExpenses: paid + openNotOverdue + overdue
    }
  })()
  
  if (totalExpenses === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title="Despesa" />
        <CardContent>
          <Typography variant='body1'>
            Não há despesas registradas no período/filtro selecionado.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const percentPaid = (totalPaid / totalExpenses) * 100
  const percentOpen = (totalOpen / totalExpenses) * 100
  const percentOverdue = (totalOverdue / totalExpenses) * 100
  
  const seriesData = [percentPaid, percentOpen, percentOverdue]

  const totalValueLabel = Number(totalExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const options: ApexOptions = {
    chart: {
        type: 'donut' 
    },
    stroke: { width: 0 },
    labels: ['Pagos', 'Em Aberto', 'Vencidos'], 
    tooltip: {
      y: {
        formatter: (val: number) => {
          return `${Math.round(val)}%`
        }
      }
    },
    colors: [donutColors.paid, donutColors.open, donutColors.overdue],
    dataLabels: {
      enabled: true,
      formatter: (val: string) => `${Math.round(Number(val))}%`
    },
    legend: {
      fontSize: '13px',
      position: 'bottom',
      markers: {
        offsetX: theme.direction === 'rtl' ? 7 : -4
      },
      labels: { colors: textSecondary },
      itemMargin: { horizontal: 9 }
    },
    plotOptions: { 
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              fontSize: '1.2rem',
            },
            value: {
              fontSize: '1.2rem',
              color: textSecondary,

              formatter: () => totalValueLabel
            },
            total: {
              show: true,
              fontSize: '1.2rem',
              label: 'Despesas', 
              formatter: () => `${Math.round(percentPaid)}%`, 
              color: 'var(--mui-palette-text-primary)'
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 992,
        options: {
          chart: { height: 380 },
          legend: { position: 'bottom' }
        }
      },
      {
        breakpoint: 576,
        options: {
          chart: { height: 320 },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: { fontSize: '1rem' },
                  value: { fontSize: '1rem' },
                  total: { fontSize: '1rem' }
                }
              }
            }
          }
        }
      }
    ]
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title='Despesas' />
      <CardContent>
        <AppReactApexCharts 
          type='donut' 
          width='100%' 
          height={400} 
          options={options} 
          series={seriesData} 
        />
      </CardContent>
    </Card>
  )
}

export default DespesasDonutChart;