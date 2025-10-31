'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { lighten, useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'
import { useEffect, useMemo, useState } from 'react'
import api from 'src/@core/components/api-client'
import { FormControl, IconButton, InputLabel, MenuItem, Select } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Box } from '@mui/system'

// Components Imports


// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('src/@core/styles/libs/AppReactApexCharts'))

const deliveryExceptionsChartSeries = [13, 25, 22, 40]

const LogisticsDeliveryExceptions = () => {
  const theme = useTheme()

  const [totals, setTotals] = useState({ revenue: 0, expense: 0 })
  const [showValues, setShowValues] = useState(false)

  const chartSeries = [totals.revenue, totals.expense]
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('all')

useEffect(() => {
  const fetchData = async () => {
    const res = await api.get(`/crc/monthly-summary?range=${filtroPeriodo}`)
    const { revenue, expense } = res.data

    const totalRevenue = revenue.reduce((acc: number, curr: number) => acc + curr, 0)
    const totalExpense = expense.reduce((acc: number, curr: number) => acc + Math.abs(curr), 0)

    setTotals({ revenue: totalRevenue, expense: totalExpense })
  }

  fetchData()
}, [filtroPeriodo])

 const options: ApexOptions = useMemo(() => ({
  labels: ['Receita', 'Despesa'],
  stroke: { width: 0 },
  colors: [ '#c55cf1ff', '#911bc4'],
  tooltip: {
  y: {
    formatter: (val: number) =>
      showValues
        ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '••••'
  }
},
  dataLabels: {
    enabled: false
  },
  legend: {
    show: true,
    position: 'bottom',
    offsetY: 10,
    fontSize: '13px',
    fontWeight: 400,
    labels: {
      colors: theme.palette.text.primary,
      useSeriesColors: false
    },
    markers: {
      width: 8,
      height: 8,
      offsetY: 1,
      offsetX: theme.direction === 'rtl' ? 8 : -4
    },
    itemMargin: { horizontal: 15, vertical: 5 }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          value: {
            fontSize: '24px',
            color: theme.palette.text.primary,
            fontWeight: 500,
            offsetY: -20,
            formatter: val =>
              showValues
                ? `R$ ${parseFloat(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : '••••'
          },
          name: {
            offsetY: 20
          },
          total: {
            show: true,
            label: 'Total',
            fontSize: '15px',
            color: theme.palette.text.secondary,
            formatter: () =>
              showValues
                ? `R$ ${(totals.revenue - totals.expense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : '••••'
          }
        }
      }
    }
  },
  grid: {
    padding: {
      top: 15
    }
  }
}), [theme, showValues, totals])


  return (
    <Card>
      <CardHeader
        title='Total Financeiro'
        subheader='Total de receitas e despesas'
         action={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton onClick={() => setShowValues(prev => !prev)}>
        {showValues ? <Visibility /> : <VisibilityOff />}
      </IconButton>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Período</InputLabel>
        <Select
          value={filtroPeriodo}
          label="Período"
          onChange={(e) => setFiltroPeriodo(e.target.value)}
        >
          <MenuItem value="day">Hoje</MenuItem>
          <MenuItem value="week">Semana</MenuItem>
          <MenuItem value="month">Mês atual</MenuItem>
          <MenuItem value="all">Ano inteiro</MenuItem>
          <MenuItem value="1">Janeiro</MenuItem>
          <MenuItem value="2">Fevereiro</MenuItem>
          <MenuItem value="3">Março</MenuItem>
          <MenuItem value="4">Abril</MenuItem>
          <MenuItem value="5">Maio</MenuItem>
          <MenuItem value="6">Junho</MenuItem>
          <MenuItem value="7">Julho</MenuItem>
          <MenuItem value="8">Agosto</MenuItem>
          <MenuItem value="9">Setembro</MenuItem>
          <MenuItem value="10">Outubro</MenuItem>
          <MenuItem value="11">Novembro</MenuItem>
          <MenuItem value="12">Dezembro</MenuItem>
        </Select>
      </FormControl>
    </Box>
  }
      />
      <CardContent>
        <AppReactApexCharts
            key={`donut-${showValues}-${filtroPeriodo}-${totals.revenue}-${totals.expense}`}
          type='donut'
          height={357}
          width='100%'
          series={chartSeries} 
          options={options}
        />
      </CardContent>
    </Card>
  )
}

export default LogisticsDeliveryExceptions
