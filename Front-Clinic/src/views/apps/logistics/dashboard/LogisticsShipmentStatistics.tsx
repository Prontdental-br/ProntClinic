'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'
import type { SyntheticEvent } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Mui Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import ButtonGroup from '@mui/material/ButtonGroup'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import api from 'src/@core/components/api-client'

// Chart Import
const AppReactApexCharts = dynamic(() => import('src/@core/styles/libs/AppReactApexCharts'))

const options = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const MonthButton = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const anchorRef = useRef<HTMLDivElement | null>(null)

  const handleMenuItemClick = (event: SyntheticEvent, index: number) => {
    setSelectedIndex(index)
    setOpen(false)
  }

  const handleToggle = () => setOpen(prevOpen => !prevOpen)
  const handleClose = () => setOpen(false)

  return (
    <>
      <ButtonGroup variant='outlined' ref={anchorRef} aria-label='split button' size='small'>
        <Button>{options[selectedIndex]}</Button>
        <Button
          aria-haspopup='menu'
          onClick={handleToggle}
          aria-label='select merge strategy'
          aria-expanded={open ? 'true' : undefined}
          aria-controls={open ? 'split-button-menu' : undefined}
          sx={{ minWidth: 32, padding: 0 }}
        >
          <ArrowDropDownIcon fontSize='small' />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition placement='bottom-end'>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}
          >
            <Paper elevation={3}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu'>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={event => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

const series = [
  {
    name: 'Total',
    type: 'column',
    data: [0, 40, 32, 90, 32, 48, 45, 40, 42, 37, 44, 39] 
  },
  {
    name: 'Em aberto',
    type: 'line',
    data: [12, 28, 23, 32, 25, 42, 32, 32, 26, 24, 31, 30] 
  }
]

const LogisticsShipmentStatistics = () => {
    const [series, setSeries] = useState([
    { name: 'Total', type: 'column', data: [] },
    { name: 'Abertos', type: 'line', data: [] }
  ]);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await api.get('/crc/budgets'); 
        const data = response.data;

        const total = data.map((item: any) => item.total);
        const open = data.map((item: any) => item.open);

        setSeries([
          { name: 'Total', type: 'column', data: total },
          { name: 'Abertos', type: 'line', data: open }
        ]);
      } catch (error) {
        console.error('Erro ao buscar dados dos orçamentos:', error);
      }
    };

    fetchBudgets();
  }, []);

  const options = {
    tooltip: {
  shared: true,
  intersect: false,
  custom: function(
    { series, seriesIndex, dataPointIndex, w }: 
    { series: any, seriesIndex: any, dataPointIndex: any, w: any }) {
    const categories = w.globals.labels
    const valueTotal = w.globals.series[0][dataPointIndex]
    const valueAbertos = w.globals.series[1][dataPointIndex]

    const colorTotal = w.config.colors[0]
    const colorAbertos = w.config.colors[1]

    return `
      <div style="
        padding: 10px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        color: #333;
        font-size: 13px;
        font-weight: 500;
      ">
        <div style="margin-bottom: 6px;">Mês: <strong>${categories[dataPointIndex]}</strong></div>

        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${colorTotal};"></div>
          <span>Total: ${valueTotal}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${colorAbertos};"></div>
          <span>Abertos: ${valueAbertos}</span>
        </div>
      </div>
    `
  }
},
    chart: {
      type: 'line' as const,
      stacked: false,
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    markers: {
      size: 5,
      colors: ['#fff'],
      strokeColors: '#1976d2',
      hover: { size: 6 },
      radius: 4
    },
    stroke: {
      curve: 'smooth' as const,
      width: [0, 3],
      lineCap: 'round' as const
    },
    legend: {
      show: true,
      position: 'bottom' as const,
      markers: {
        width: 8,
        height: 8,
        offsetY: 1,
        offsetX: -4
      },
      height: 40,
      itemMargin: { horizontal: 10, vertical: 0 },
      fontSize: '15px',
      fontFamily: 'Open Sans',
      fontWeight: 400,
      labels: {
        colors: '#212121'
      },
      offsetY: 10
    },
    grid: {
      strokeDashArray: 8,
      borderColor: '#e0e0e0'
    },
    colors: ['#911BC4', '#1976d2'],
    fill: { opacity: [1, 1] },
    plotOptions: {
      bar: {
        columnWidth: '30%',
        borderRadius: 12,
        startingShape: 'rounded' as const
      }
    },
    dataLabels: { enabled: false },
     xaxis: {
    tickAmount: 12,
    categories: [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ],
    labels: {
      style: {
        colors: '#9e9e9e',
        fontSize: '13px',
        fontWeight: 400
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
    yaxis: {
      tickAmount: 5,
      labels: {
        style: {
          colors: '#9e9e9e',
          fontSize: '13px',
          fontWeight: 400
        }
      }
    }
  }

  return (
    <Card>
     <CardHeader
        title='Estatisticas de Orçamentos'
        subheader='Número total de orçamentos'
      />
      <CardContent>
        <AppReactApexCharts
          id='shipment-statistics'
          type='line'
          height={313}
          width='100%'
          series={series}
          options={options}
        />
      </CardContent>
    </Card>
  )
}

export default LogisticsShipmentStatistics;
