'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'
import OptionsMenu from 'src/@core/components/option-menu'
import api from 'src/@core/components/api-client'
import { useEffect, useState } from 'react'

// Chart Import
const AppReactApexCharts = dynamic(() => import('src/@core/styles/libs/AppReactApexCharts'))

const series = [
  {
    type: 'column',
    name: 'Earning',
    data: [100, 56, 75, 50, 87, 60, 52]
  },
  {
    type: 'column',
    name: 'Expense',
    data: [-53, -29, -67, -84, -60, -40, -77]
  },
  {
    type: 'line',
    name: 'Expense',
    data: [73, 20, 50, -20, 58, 15, 25]
  }
]

const WeeklySales = () => {
  const options: ApexOptions = {
    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false },
      foreColor: '#9e9e9e'
    },
    markers: {
      size: 4,
      strokeWidth: 3,
      fillOpacity: 1,
      strokeOpacity: 1,
      colors: ['#ffffff'],
      strokeColors: '#ff9800'
    },
    stroke: {
      curve: 'smooth',
      width: [0, 0, 3],
      colors: ['#ff9800']
    },
    colors: ['#1976d2', '#90caf9'],
    dataLabels: { enabled: false },
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    },
    legend: { show: false },
    grid: {
      yaxis: { lines: { show: false } },
      padding: { top: -26, left: -14, right: -16, bottom: -8 }
    },
    plotOptions: {
      bar: {
    borderRadius: 12,
    columnWidth: '50%',
    startingShape: 'rounded'
  }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      labels: {
        style: {
          colors: '#9e9e9e',
          fontSize: '13px'
        }
      }
    },
    yaxis: {
      max: 100,
      min: -100,
      show: false
    }
  }

   const [series, setSeries] = useState([
    { type: 'column', name: 'Earning', data: [] },
    { type: 'column', name: 'Expense', data: [] },
    { type: 'line', name: 'Balance', data: [] }
  ]);

  const [totals, setTotals] = useState({ revenue: 0, expense: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get('/crc/monthly-summary');
      const { revenue, expense, balance } = res.data;

      setSeries([
        { type: 'column', name: 'Earning', data: revenue },
        { type: 'column', name: 'Expense', data: expense },
        { type: 'line', name: 'Balance', data: balance }
      ]);

      // Calcular os totais
      console.log(revenue);
      console.log(expense);
      
      const totalRevenue = revenue.reduce((acc: number, curr: number) => acc + curr, 0);
      const totalExpense = expense.reduce((acc: number, curr: number) => acc + Math.abs(curr), 0);

      setTotals({ revenue: totalRevenue, expense: totalExpense });
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader
        title='Total de orçamentos'
        subheader='Total de entrada'
        action={<OptionsMenu options={['Refresh', 'Update', 'Share']} />}
      />
      <CardContent>
        <Stack direction='row' spacing={4} mb={5}>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Avatar sx={{ bgcolor: '#1976d2' }} variant='rounded'>
              <TrendingUpIcon fontSize='small' />
            </Avatar>
            <Box>
              <Typography variant='body2'>Receita</Typography>
                <Typography color='text.primary' fontWeight='500'>
                {totals.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            </Box>
          </Stack>

          <Stack direction='row' spacing={2} alignItems='center'>
            <Avatar sx={{ bgcolor: '#ff9800' }} variant='rounded'>
              <AttachMoneyIcon fontSize='small' />
            </Avatar>
            <Box>
              <Typography variant='body2'>Despesa</Typography>
                <Typography color='text.primary' fontWeight='500'>
                  {totals.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Typography>
            </Box>
          </Stack>
        </Stack>

        <AppReactApexCharts
          type='line'
          height={213}
          width='100%'
          series={series}
          options={options}
        />
      </CardContent>
    </Card>
  )
}

export default WeeklySales;
