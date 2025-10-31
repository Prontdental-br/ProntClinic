'use client'

import dynamic from 'next/dynamic'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import classnames from 'classnames'
import OptionsMenu from 'src/@core/components/option-menu'
import type { ApexOptions } from 'apexcharts'
import { useEffect, useState } from 'react'
import api from 'src/@core/components/api-client'
import { IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

const AppReactApexCharts = dynamic(() => import('src/@core/styles/libs/AppReactApexCharts'))

const series = [
  {
    name: 'Aprovados',
    data: [110, 235, 125, 230, 215, 115, 200]
  },
  {
    name: 'Reprovados',
    data: [155, 135, 320, 100, 150, 335, 160]
  }
]

const data = [
  { sales: 'R$845k', title: 'Aprovados', trendNumber: '82%', trend: 'down' },
  { sales: 'R$12.5k', title: 'Reprovados', trendNumber: '52%', trend: 'up' }
]

const ExternalLinks = () => {

const [showValues, setShowValues] = useState(false)


  const options: ApexOptions = {
    tooltip: {
  shared: true,
  intersect: false,
  custom: function({ series, seriesIndex, dataPointIndex, w }) {
    const categories = w.globals.labels
    const colorAprovados = w.config.colors[0]
    const colorReprovados = w.config.colors[1]
    const valAprovados = w.globals.series[0][dataPointIndex]
    const valReprovados = w.globals.series[1][dataPointIndex]

    return `
      <div style="
        padding: 10px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        color: #333;
        font-size: 13px;
        font-weight: 500;
      ">
        <div style="margin-bottom: 6px;">Dia: <strong>${categories[dataPointIndex]}</strong></div>

        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${colorAprovados};"></div>
          <span>Aprovados: ${valAprovados}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${colorReprovados};"></div>
          <span>Reprovados: ${valReprovados}</span>
        </div>
      </div>
    `
  }
},

    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 12,
        columnWidth: '35%',
        startingShape: 'rounded',
        endingShape: 'rounded'
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
    },
    yaxis: { show: false },
    colors: ['#7265e6', '#4b4b4b'], 
    grid: {
      strokeDashArray: 10,
      borderColor: '#e0e0e0',
      padding: { top: -25, left: -4, right: -5, bottom: -10 }
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 0,
      colors: ['transparent']
    },
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    },
    responsive: [
      {
        breakpoint: 1536,
        options: { plotOptions: { bar: { columnWidth: '49%' } } }
      },
      {
        breakpoint: 1355,
        options: { plotOptions: { bar: { columnWidth: '55%' } } }
      },
      {
        breakpoint: 600,
        options: { plotOptions: { bar: { columnWidth: '35%' } } }
      },
      {
        breakpoint: 430,
        options: { plotOptions: { bar: { columnWidth: '50%' } } }
      }
    ]
  }

const [series, setSeries] = useState([
  { name: 'Aprovados', data: [] },
  { name: 'Reprovados', data: [] }
])


const [data, setData] = useState([
  { sales: '', title: 'Aprovados', trendNumber: '', trend: 'down' },
  { sales: '', title: 'Reprovados', trendNumber: '', trend: 'up' }
])

useEffect(() => {
  const fetchData = async () => {
    const res = await api.get('/crc/budgets/weekly-summary')
    const { approved, rejected, totalApproved, totalRejected } = res.data

    const total = (totalApproved || 0) + (totalRejected || 0) || 1

    const approvedPercent = ((totalApproved / total) * 100).toFixed(0) + '%'
    const rejectedPercent = ((totalRejected / total) * 100).toFixed(0) + '%'

    setSeries([
      { name: 'Aprovados', data: approved },
      { name: 'Reprovados', data: rejected }
    ])

    setData([
      {
        title: 'Aprovados',
        sales: `R$ ${totalApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        trendNumber: approvedPercent,
        trend: 'up'
      },
      {
        title: 'Reprovados',
        sales: `R$ ${totalRejected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        trendNumber: rejectedPercent,
        trend: 'down'
      }
    ])
  }

  fetchData()
}, [])

  return (
    <Card>
      <CardHeader
        title="Fechamento da semana"
       action={
        <IconButton onClick={() => setShowValues(prev => !prev)}>
          {showValues ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      }
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 5 }}>
        <AppReactApexCharts type="bar" height={203} width="100%" series={series} options={options} />

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px 0', verticalAlign: 'middle' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i
                        className="ri-circle-fill"
                        style={{
                          fontSize: 12,
                          color: index === 0 ? '#4b4b4b' : '#7265e6'
                        }}
                      />
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        {row.title}
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 0' }}>
                    <Typography variant="body2">{showValues ? row.sales : '••••'}</Typography>
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {showValues ? row.trendNumber : '••••'}
                      </Typography>
                      <i
                        className={classnames(
                          row.trend === 'up'
                            ? 'ri-arrow-up-s-line text-success'
                            : 'ri-arrow-down-s-line text-error'
                        )}
                        style={{
                          fontSize: 16,
                          color: row.trend === 'up' ? '#4caf50' : '#f44336'
                        }}
                      />
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ExternalLinks
