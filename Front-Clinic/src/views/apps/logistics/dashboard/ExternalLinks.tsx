'use client'

import dynamic from 'next/dynamic'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import classnames from 'classnames'
import type { ApexOptions } from 'apexcharts'
import { useEffect, useState } from 'react'
import api from 'src/@core/components/api-client'
import { IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

const AppReactApexCharts = dynamic(() => import('src/@core/styles/libs/AppReactApexCharts'), { ssr: false })

const CHART_COLORS = ['#7F18AC', '#DD95FF'] 

interface ChartData {
  sales: string;
  title: string;
  trendNumber: string;
  trend: 'up' | 'down';
}

const ExternalLinks = () => {
  const [showValues, setShowValues] = useState(false)
  const [data, setData] = useState<ChartData[]>([
    { sales: 'R$0,00', title: 'Aprovados', trendNumber: '0%', trend: 'up' },
    { sales: 'R$0,00', title: 'Reprovados', trendNumber: '0%', trend: 'down' }
  ])
  const [series, setSeries] = useState<number[]>([50, 50])
  
  const valueFormatter = (value: number) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/crc/budgets/weekly-summary')
        const { approved, rejected, totalApproved, totalRejected } = res.data
  
        const total = (totalApproved || 0) + (totalRejected || 0) || 1
  
        const approvedPercentValue = (totalApproved / total) * 100
        const rejectedPercentValue = (totalRejected / total) * 100

        setSeries([
          approvedPercentValue,
          rejectedPercentValue 
        ])
  
        setData([
          {
            title: 'Aprovados',
            sales: `R$ ${totalApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            trendNumber: approvedPercentValue.toFixed(0) + '%',
            trend: 'up'
          },
          {
            title: 'Reprovados',
            sales: `R$ ${totalRejected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            trendNumber: rejectedPercentValue.toFixed(0) + '%',
            trend: 'down'
          }
        ])
      } catch (e) {
        console.error("Erro ao buscar resumo semanal:", e)
      }
    }
    fetchData()
  }, [])
  
  const totalGeral = data.reduce((acc, item) => {
 
    const numericValue = parseFloat(item.sales.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0
    
return acc + numericValue
  }, 0)

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
              
return `${Math.round(n)}%`
            }
          },

          total: {
            show: true,
            label: 'Total Orçado',
            color: '#6B21A8',
            formatter: () => valueFormatter(totalGeral)
          }
        }
      }
    },
    stroke: {
      lineCap: 'round'
    },

    colors: CHART_COLORS, 
    labels: ['Aprovados', 'Reprovados'], 
    legend: { show: false }
  }


  return (
    <Card>
      <CardHeader
        title={
          <Typography 
            variant="h6" 
          >
            Fechamento da Semana
          </Typography>
        }
        action={
          <IconButton onClick={() => setShowValues(prev => !prev)}>
            {showValues ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        }
        sx={{ pb: 0, pt: 4, pl: 4, pr: 4 }} 
      />
      <CardContent 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4, 
          paddingBottom: 4, 
          pt: 2 
        }}
      >

        <AppReactApexCharts 
          type='radialBar' 
          height={330} 
          width="100%" 
          series={series} 
          options={options} 
        />


        <Box sx={{ overflowX: 'auto', mt: 1 }}>
          <Typography variant='body1' sx={{ fontWeight: 600, mb: 1 }}>
            Detalhes:
          </Typography>
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
                          color: CHART_COLORS[index] 
                        }}
                      />
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        {row.title}
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 0' }}>

                    <Typography variant="body2" sx={{ color: CHART_COLORS[index], fontWeight: 600 }}>
                        {showValues ? row.sales : '••••'}
                    </Typography>
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