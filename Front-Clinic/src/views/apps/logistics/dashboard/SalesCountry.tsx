'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'
import OptionsMenu from 'src/@core/components/option-menu'
import { useEffect, useState } from 'react'
import api from 'src/@core/components/api-client'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('src/@core/styles/libs/AppReactApexCharts'))



const CardWidgetsSalesCountry = () => {
  const theme = useTheme()

  const options: ApexOptions = {
  tooltip: {
  theme: 'light', 
  style: {
    fontSize: '13px',
    fontFamily: 'Inter' 
  },
   custom: function({ series, seriesIndex, dataPointIndex, w }) {
    const category = w.globals.labels[dataPointIndex]
    const value = series[seriesIndex][dataPointIndex]
    const color = w.config.colors[dataPointIndex] // cor da categoria

    return `
      <div style="
        padding: 8px 12px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
        color: #333;
        font-weight: 500;
      ">
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: ${color};
          "></div>
          <span>${category}</span>
        </div>
        <div style="margin-top: 4px;">Orçamentos: ${value}</div>
      </div>
    `
  }
},
  chart: {
    parentHeightOffset: 0,
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      borderRadius: 12,
      barHeight: '59%',
      horizontal: true,
      distributed: true,
      startingShape: 'rounded',
      dataLabels: {
        position: 'center' 
      }
    }
  },
  dataLabels: {
    enabled: true,
    style: {
      fontWeight: 600,
      fontSize: '13px',
      colors: ['#fff'] 
    }
  },
  grid: {
    strokeDashArray: 8,
    borderColor: '#e0e0e0',
    xaxis: {
      lines: { show: true }
    },
    yaxis: {
      lines: { show: false }
    },
    padding: {
      top: -30,
      left: 21,
      right: 25,
      bottom: -5
    }
  },
  
  colors: ['#ff9800', '#4caf50', '#1976d2', '#f44336'],
  legend: { show: false },
  states: {
    hover: {
      filter: { type: 'none' }
    },
    active: {
      filter: { type: 'none' }
    }
  },
  xaxis: {
    axisTicks: { show: false },
    axisBorder: { show: false },
    categories: ['Andamento', 'Fechado', 'Aberto', 'Perdido'], 
    labels: {
      style: {
        fontSize: '12px',
        colors: '#bdbdbd'
      }
    }
  },
  yaxis: {
   
    labels: {
      show: true,
      align: 'left',
      style: {
        fontWeight: 500,
        fontSize: '15px',
        colors: '#212121'
      },
      offsetX: -10 
    }
  }
}

const [series, setSeries] = useState([
  {
    name: 'Orçamentos',
    data: [0, 0, 0, 0] 
  }
])
const [period, setPeriod] = useState('month'); // default mês


useEffect(() => {
  const fetchStatusData = async () => {
    const res = await api.get('/crc/budgets/status-summary', { params: { period } })
    const { andamento, fechado, aberto, perdido } = res.data

    setSeries([
      {
        name: 'Orçamentos',
        data: [andamento, fechado, aberto, perdido]
      }
    ])
  }

  fetchStatusData()
}, [period]); 


  return (
    <Card>
      <CardHeader
        title='Analytics dos fechamentos'
        action={
          <OptionsMenu
             options={[
              {
                text: 'Hoje',
                menuItemProps: { onClick: () => setPeriod('day') }
              },
              {
                text: 'Última Semana',
                menuItemProps: { onClick: () => setPeriod('week') }
              },
              {
                text: 'Último Mês',
                menuItemProps: { onClick: () => setPeriod('month') }
              },
              {
                text: 'Todo Período',
                menuItemProps: { onClick: () => setPeriod('all') }
              }
            ]}
  
            // onSelect={(value: any) => setPeriod(value)}
          />
        } 
      />
      <CardContent sx={{ pt: 0 }}>
        <AppReactApexCharts type='bar' height={290} width='100%' series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default CardWidgetsSalesCountry
