'use client'

// Next Imports
import dynamic from 'next/dynamic'

//  MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'
import OptionsMenu from 'src/@core/components/option-menu'
import api from 'src/@core/components/api-client'
import { useEffect, useState } from 'react'

// Components Imports


// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('src/@core/styles/libs/AppReactApexCharts'))

const series = [
  {
    name: 'Receita',
    data: [70, 90, 80, 95, 75, 90]
  },
  {
    name: 'A receber',
    data: [110, 72, 62, 65, 100, 75]
  }
]

const Performance = () => {
  // Hooks
  const theme = useTheme()

 const options: ApexOptions = {
  chart: {
    parentHeightOffset: 0,
    toolbar: { show: false }
  },
  legend: {
    itemMargin: { horizontal: 10 },
    fontSize: '15px',
    labels: { colors: '#9e9e9e' },
    offsetY: 5,
    markers: {
      offsetX: theme.direction === 'rtl' ? 8 : -4,
      width: 10,
      height: 10
    }
  },
  plotOptions: {
    radar: {
      size: 110,
      polygons: {
        strokeColors: '#e0e0e0',
        connectorColors: '#e0e0e0'
      }
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      gradientToColors: ['#ff9800', '#1976d2'],
      shadeIntensity: 1,
      type: 'vertical',
      opacityFrom: 1,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  },
  colors: ['#ff9800', '#1976d2'],
  labels: ['Jul','Ago', 'Set', 'Out', 'Nov', 'Dez'],
  markers: { size: 0 },
  xaxis: {
    labels: {
      show: true,
      style: {
        fontSize: '13px',
        colors: Array(6).fill('#bdbdbd')
      }
    }
  },
  yaxis: { show: false },
  grid: {
    show: false,
    padding: { top: 10, bottom: -10 }
  }
}

const [series, setSeries] = useState([
  { name: 'Receita', data: [] },
  { name: 'A receber', data: [] }
]);

useEffect(() => {
  const fetchData = async () => {
    const res = await api.get('/crc/transactions/performance-summary');
    const { received, pending } = res.data;

    setSeries([
      { name: 'Receita', data: received },
      { name: 'A receber', data: pending }
    ]);
  };

  fetchData();
}, []);

  return (
    <Card>
      <CardHeader title='Performance' />
      <CardContent>
        <AppReactApexCharts type='radar' height={290} width='100%' series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default Performance
