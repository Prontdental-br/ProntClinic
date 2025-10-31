import React, { useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import { Chip } from '@mui/material'
import api from 'src/@core/components/api-client'

const AnalyticsBugetOpen = () => {
  const [clicked, setClicked] = useState(false)
  const [rowsProfessional, setRowsProfessional] = useState([])
  const [filterDaysPanel, setFilterDaysPanel] = useState(0)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const handleClick = (phoneNumber: string) => {
    setClicked(true)
    window.open(`https://wa.me/${phoneNumber}`, '_blank')
  }

  const fetchProfessional = async () => {
    try {
      const { data } = await api.get(`/budgets/open/${filterDaysPanel}`);
      console.log(data)
      setRowsProfessional(data.map((d: any) =>
        Object.assign({
          id: d.id, name: d.patient?.name,
          receipt: `R$ ${d.total.toFixed(2).replace('.', ',')}`,
          phone: d.patient?.cellPhone
        })));
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchProfessional();
  }, [filterDaysPanel])

  // ** Hook
  const theme = useTheme()

  interface TableBodyRowType {
    id: number
    name: string
    receipt: string
    phone: string
  }

  interface CellType {
    row: TableBodyRowType
  }

  /*
  const rowsProfessional: TableBodyRowType[] = [
    {
      id: 1,
      name: 'Jordan Stevenson',
      receipt: 'R$ 1.235,00',
      phone: '558198765432'
    },
    {
      id: 2,
      name: 'Robert Crawford',
      receipt: 'R$ 890,00',
      phone: '558198765432'
    },
    {
      id: 3,
      name: 'Lydia Reese',
      receipt: 'R$ 6.290,00',
      phone: '558198765432'
    }
  ]
  */

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      field: 'name',
      minWidth: 200,
      headerName: 'Paciente',
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                {row.name}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.25,
      field: 'receipt',
      minWidth: 100,
      headerName: 'Valor',
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                {row.receipt}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.25,
      field: 'contact',
      minWidth: 100,
      headerName: 'Contato',
      renderCell: ({ row }: CellType) => {
        return (
          <Chip
            variant='filled'
            size='small'
            sx={{
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
              cursor: 'pointer'
            }}
            icon={
              <Icon
                icon='mdi:whatsapp'
                style={{
                  color: '#FFFFFF',
                  marginRight: '0.25rem',
                  width: '1.5rem',
                  height: '1.5rem'
                }}
              />
            }
            label={row.phone}
            onClick={() => handleClick(row.phone)}
            disabled={clicked}
          />
        )
      }
    }
  ]

  const handleDaysPanelClick = (days: number) => {
    console.log(days)
    setFilterDaysPanel(days)
  }

  return (
    <Card>
      <CardHeader
        title='Orçamentos em Aberto'
        action={
          <OptionsMenu
            options={[{ text: 'Hoje', onClick: () => handleDaysPanelClick(0) },
            { text: 'Última Semana', onClick: () => handleDaysPanelClick(7) },
            { text: 'Últimos 20 Dias', onClick: () => handleDaysPanelClick(20) },
            { text: 'Último Mês', onClick: () => handleDaysPanelClick(30) },
            { text: 'Último Ano', onClick: () => handleDaysPanelClick(365) },]}
            iconButtonProps={{ size: 'small', className: 'card-more-options' }}
          />
        }
      />
      <CardContent
        sx={{
          pt: {
            xs: `${theme.spacing(6)} !important`,
            md: `${theme.spacing(0)} !important`
          },
          pb: {
            xs: `${theme.spacing(8)} !important`,
            md: `${theme.spacing(5)} !important`
          }
        }}
      >
        <DataGrid
          autoHeight
          pageSizeOptions={[5, 10, 20]}
          rows={rowsProfessional}
          columns={columns}
          disableRowSelectionOnClick
          pagination={true}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}}
        />
      </CardContent>
    </Card>
  )
}

export default AnalyticsBugetOpen
