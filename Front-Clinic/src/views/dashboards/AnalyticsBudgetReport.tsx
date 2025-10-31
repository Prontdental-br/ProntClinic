import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  CardHeader,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container,
  useMediaQuery,
  Theme
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import OptionsMenu from 'src/@core/components/option-menu'
import api from 'src/@core/components/api-client'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const labels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Junho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const chartData = {
  labels,
  datasets: [
    /*{
      label: 'Orçamentos Aprovados',
      data: labels.map(() => 200),
      backgroundColor: '#3f51b5'
    },
    {
      label: 'Orçamentos Reprovados',
      data: labels.map(() => 59),
      backgroundColor: '#f44336'
    },
    {
      label: 'Orçamentos Abertos',
      data: labels.map(() => 340),
      backgroundColor: '#ff9800'
    }
    */
  ]
}

const mesesJson = {
  meses: [
    { key: '01', text: 'Janeiro' },
    { key: '02', text: 'Fevereiro' },
    { key: '03', text: 'Março' },
    { key: '04', text: 'Abril' },
    { key: '05', text: 'Maio' },
    { key: '06', text: 'Junho' },
    { key: '07', text: 'Julho' },
    { key: '08', text: 'Agosto' },
    { key: '09', text: 'Setembro' },
    { key: '10', text: 'Outubro' },
    { key: '11', text: 'Novembro' },
    { key: '12', text: 'Dezembro' }
  ]
}

const currentYear = new Date().getFullYear();
const anosJson = {
  anos: Array.from({ length: currentYear - 2017 }, (_, index) => {
    const year = 2018 + index;

    return { key: String(year), text: String(year) };
  }),
};

export const options = {
  plugins: {
    title: {
      display: true,
      text: 'Chart.js Bar Chart - Stacked'
    }
  },
  responsive: true,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  scales: {
    x: {
      stacked: true
    },
    y: {
      stacked: true
    }
  }
}

const AnalyticsBudgetReport = () => {
  const theme = useTheme()
  const [selectedValue, setSelectedValue] = useState('quantity')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const currentYear = new Date().getFullYear()
  const [filteredChartData, setFilteredChartData] = useState(chartData)

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setSelectedMonth(event.target.value as string)
  }

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value as string)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value)
  }

  const isSmallerScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const handleFilter = async () => {
    // Filtrar os dados com base nas seleções de mês e ano
    /*const filteredData = {
      labels: labels.slice(0, parseInt(selectedMonth, 10)),
      datasets: chartData.datasets.map(dataset => ({
        ...dataset,
        data: dataset.data.slice(0, parseInt(selectedMonth, 10))
      }))
    }*/

    try {

      const { data: qt } = await api.get(`/budgets/graphbarsqt/${selectedYear}`);
      const { data: vl } = await api.get(`/budgets/graphbarsvalue/${selectedYear}`);

      const filteredData = {
        labels: labels.slice(0, parseInt(selectedMonth, 10)),
        datasets: selectedValue === 'value' ? vl : qt
      }
      setFilteredChartData(filteredData);
    } catch (e) {
      console.log(e)
    }

  }

  useEffect(() => {
    handleFilter() // Filtrar os dados inicialmente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue, selectedMonth, selectedYear])

  console.log('selectedValue', selectedValue)
  console.log('selectedMonth', selectedMonth, currentMonth)

  return (
    <Card>
      <CardHeader title='Orçamentos' action={<OptionsMenu options={['Atualizar']} />} />

      <CardContent
        sx={{
          pt: { xs: `${theme.spacing(6)} !important`, md: `${theme.spacing(0)} !important` },
          pb: { xs: `${theme.spacing(8)} !important`, md: `${theme.spacing(5)} !important` }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: isSmallerScreen ? -10 : -2 }}>
          <RadioGroup row value={selectedValue} onChange={handleChange}>
            {/* radioButons ---------------------------------------------- */}
            <FormControlLabel value='quantity' control={<Radio />} label='Por Quantidade' />
            <FormControlLabel value='value' control={<Radio />} label='Por Valor' />
            {/* ---------------------------------------------------------- */}
          </RadioGroup>

          <Box sx={{ display: isSmallerScreen ? null : 'flex' }}>
            <FormControl sx={{ display: 'flex', flexDirection: isSmallerScreen ? 'column' : 'row' }}>
              <p>
                <Select
                  sx={{
                    height: 30,
                    marginRight: isSmallerScreen ? 0 : 2,
                    marginTop: isSmallerScreen ? 3 : 0
                  }}
                  value={selectedMonth || currentMonth.toString()}
                  onChange={handleMonthChange}
                  displayEmpty
                >
                  {mesesJson.meses.map(mes => (
                    <MenuItem key={mes.key} value={mes.key}>
                      {mes.text}
                    </MenuItem>
                  ))}
                </Select>
              </p>
              <p>
                <Select
                  sx={{ height: 30 }}
                  value={selectedYear || currentYear.toString()}
                  onChange={handleYearChange}
                  displayEmpty
                >
                  {anosJson.anos.map(ano => (
                    <MenuItem key={ano.key} value={ano.key}>
                      {ano.text}
                    </MenuItem>
                  ))}
                </Select>
              </p>
            </FormControl>
          </Box>
        </Box>

        <Box
          sx={{
            display: isSmallerScreen ? null : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10
          }}
        >
          {isSmallerScreen ? (
            <Box>
              <Bar data={filteredChartData} options={{ responsive: false }} />
            </Box>
          ) : (
            <Bar
              data={filteredChartData}
              options={{ responsive: true }}
              style={{ paddingLeft: 20, paddingRight: 20 }}
            />
          )}

          {/*<Box sx={{ textAlign: 'center', mr: isSmallerScreen ? 0 : 10 }}>
            <Box
              sx={{
                display: 'flex',
                backgroundColor: '#666CFF',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                margin: '0 auto',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography variant='h5' color='#FFF'>
                16%
              </Typography>
            </Box>
            <Typography variant='h6' color='text.secondary'>
              Aprovação
            </Typography>
            </Box>*/}
        </Box>

        {selectedValue === 'value' && <Container
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: isSmallerScreen ? 'column' : 'row',

            alignContent: 'center',
            alignItems: 'center'
          }}
        >
          <Box sx={{ marginRight: 10 }}>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => {
                console.log('ir para orçamentos aprovados')
              }}
            >
              <Typography variant='body1' color='text.secondary'>
                Orçamentos Aprovados
              </Typography>
              <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
                R$ {(filteredChartData.datasets[0]['data'] as any[]).reduce((acc: number, curr: number) => acc + curr, 0)}
              </Typography>
            </button>
          </Box>

          <Box sx={{ marginRight: 10 }}>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => {
                console.log('ir para Orçamentos Reprovados')
              }}
            >
              <Typography variant='body1' color='text.secondary'>
                Orçamentos Reprovados
              </Typography>

              <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
                R$ {(filteredChartData.datasets[2]['data'] as any[]).reduce((acc: number, curr: number) => acc + curr, 0)}
              </Typography>
            </button>
          </Box>

          <Box sx={{ marginRight: '2%' }}>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => {
                console.log('ir para Orçamentos Abertos')
              }}
            >
              <Typography variant='body1' color='text.secondary'>
                Orçamentos Abertos
              </Typography>

              <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
                R$ {(filteredChartData.datasets[1]['data'] as any[]).reduce((acc: number, curr: number) => acc + curr, 0)}
              </Typography>
            </button>
          </Box>
        </Container>}
      </CardContent>
    </Card>
  )
}

export default AnalyticsBudgetReport
