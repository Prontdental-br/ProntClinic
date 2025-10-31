import React, { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import OptionsMenu from 'src/@core/components/option-menu'

import { SelectChangeEvent } from '@mui/material'
import api from 'src/@core/components/api-client'
import moment from 'moment'

// JSON com os meses do ano
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

const currentYear = new Date().getFullYear()
const anosJson = {
  anos: Array.from({ length: currentYear - 2017 }, (_, index) => {
    const year = 2018 + index;

    return { key: String(year), text: String(year) };
  }),
};

interface Item {
  key: string
  total?: number
  valortubTiletop?: number
  valortubTiledown?: number
  subtileTop?: string
  subtileDown?: string
  src?: string
  iconColor?: string | ''
}

interface ListProps {
  data: Item[]
}

/*
const jsonFinanceiro: ListProps = {
  data: [
    {
      key: 'Receita',
      total: 3000,
      subtileTop: 'À receber R$ ',
      valortubTiletop: 1000,
      subtileDown: 'Total previsto R$ ',
      valortubTiledown: 1500,
      src: 'mdi:trending-up',
      iconColor: '#72e128'
    },
    {
      key: 'Despesa',
      total: 2000,
      subtileTop: 'À Pagar R$ ',
      valortubTiletop: 800,
      subtileDown: 'Total previsto R$ ',
      valortubTiledown: 1200,
      src: 'mdi:trending-down',
      iconColor: '#ff4d49'
    },
    {
      key: 'Saldo',
      total: 1000,
      valortubTiledown: 300,
      subtileDown: 'Total previsto R$ ',
      iconColor: '#666CFF'
    }
  ]
}
*/

interface DataType {
  src: string
  title: string
  imgAlt: string
  subtitle: string
  chipText: string
  imgWidth: number
  imgHeight: number
  iconColor: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const data: DataType[] = [
  {
    imgWidth: 22,
    imgHeight: 22,
    chipText: '$6,500',
    title: 'Receitas',
    imgAlt: 'Receitas',
    subtitle: 'Total Previsto R$ 12.500,00',
    src: 'mdi:trending-up',
    iconColor: 'green'
  },
  {
    imgWidth: 22,
    imgHeight: 22,
    chipText: '$6,500',
    title: 'Despesas',
    imgAlt: 'Despesas',
    subtitle: 'Total Previsto R$ 530,00',
    src: 'mdi:trending-down',
    iconColor: 'error.main'
  }
]
const List: React.FC<ListProps> = ({ data }) => {
  return (
    <div>
      {data.map(item => (
        <React.Fragment key={item.key}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>{item.key}</Typography>
            <Box component='span' sx={{ display: 'flex', mr: 2, color: item.iconColor, marginLeft: 2 }}>
              <Icon icon={item.src!} />
            </Box>
          </Box>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: -8
            }}
          >
            <Typography sx={{ color: item.iconColor }}>R$ {item.total}</Typography>
            <Typography sx={{ color: item.iconColor, fontSize: 15 }}>
              {item.subtileTop} {item.valortubTiletop}
            </Typography>
          </div>
          <hr style={{ borderColor: item.iconColor }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: -6
            }}
          >
            <Typography sx={{ color: item.iconColor, fontSize: 15 }}>
              {item.subtileDown} {item.valortubTiledown}
            </Typography>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

const AnalyticsProjectStatistics = () => {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const currentYear = new Date().getFullYear()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const [jsonFinanceiro, setJsonFinanceiro] = useState<ListProps>({data:[]});

  useEffect(() => {

    const dateStart = moment()
        .month(Number.parseInt(selectedMonth) - 1)
        .year(Number.parseInt(selectedYear.toString()))
        .startOf('month')
        .format('YYYY-MM-DD')

    const dateEnd = moment()
        .month(Number.parseInt(selectedMonth) - 1)
        .year(Number.parseInt(selectedYear.toString()))
        .endOf('month')
        .format('YYYY-MM-DD')

    api
      .get(`/budgets/totalallbydate?dateStart=${dateStart}T00:00:00.000Z&dateEnd=${dateEnd}T23:59:59.000Z`)
      .then(response => {
        console.log(response.data);
        if (response.data) {
          setJsonFinanceiro({
            data: [{
              key: 'Receita',
              total: response.data.total,
              src: 'mdi:trending-up',
              iconColor: '#72e128'
            }],
          })
        } 
      })
      .catch(err => {
        console.log(err)
      })
  }, [selectedMonth, selectedYear])

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setSelectedMonth(event.target.value as string)
  }

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value as unknown as number)
  }

  return (
    <Card>
      <CardHeader
        title='Financeiro'
        action={
          <OptionsMenu options={['Atualizar']} iconButtonProps={{ size: 'small', className: 'card-more-options' }} />
        }
      />
      <Box style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 16 }}>
        <FormControl>
          <Select
            sx={{ height: 30 }}
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
        </FormControl>

        <FormControl>
          <Select
            sx={{ height: 30 }}
            value={selectedYear.toString() || currentYear.toString()}
            onChange={handleYearChange}
            displayEmpty
          >
            {anosJson.anos.map(ano => (
              <MenuItem key={ano.key} value={ano.key}>
                {ano.text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <CardContent>
        <List data={jsonFinanceiro.data} />
      </CardContent>
    </Card>
  )
}

export default AnalyticsProjectStatistics
