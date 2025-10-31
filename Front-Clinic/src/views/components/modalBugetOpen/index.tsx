import React, { useEffect, useState } from 'react'
import { Modal, Box, Typography, Button, Chip } from '@mui/material'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import { Icon } from '@iconify/react'
import CustomChip from 'src/@core/components/mui/chip'

// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'
import api from 'src/@core/components/api-client'
import dayjs from 'dayjs'

interface TableBodyRowType {
  id: number
  data: string
  paciente: string
  tipo: 'CONSULTA' | 'EXAME' | 'CIRURGIA'
  valor: string
  fone?: string
}

interface CellType {
  row: TableBodyRowType
}

// interface WhatsTypes {
//   label: string
//   phoneNumber: string
// }

interface StatusObj {
  [key: string]: {
    color: ThemeColor
  }
}

const statusObj: StatusObj = {
  CONSULTA: { color: 'success' },
  EXAME: { color: 'warning' },
  CIRURGIA: { color: 'error' }
}

const CustomWhatsappChip = ({ phoneNumber }: { phoneNumber: string }) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true)
    window.open(`https://wa.me/${phoneNumber}`, '_blank')
  }

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
      label={phoneNumber}
      onClick={handleClick}
      disabled={clicked}
    />
  )
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'data', headerName: 'Data', width: 120 },
  { field: 'paciente', headerName: 'Paciente', width: 150 },

  /*{
    width: 140,
    field: 'tipo',
    headerName: 'Tipo',
    renderCell: ({ row }: CellType) => (
      <CustomChip
        skin='light'
        size='small'
        label={row.tipo}
        //color={statusObj[row.tipo].color}
        sx={{
          textTransform: 'capitalize',
          '& .MuiChip-label': { px: 2.5, lineHeight: 1.385 }
        }}
      />
    )
  },*/

  // { field: 'valor', headerName: 'Valor', width: 100 },
  {
    width: 100,
    field: 'valor',
    headerName: 'Valor',
    renderCell: ({ row }: CellType) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>R$ {row.valor}</Typography>
      </Box>
    )
  },
  {
    field: 'fone',
    width: 200,
    headerName: 'Contato',
    renderCell: ({ row }: CellType) => <CustomWhatsappChip phoneNumber={row.fone!} />
  }
]

/*
const rows = [
  { id: 1, data: '2023-06-01', paciente: 'João', tipo: 'CONSULTA', valor: 50, fone: '+5581981818181' },

  { id: 2, data: '2023-06-02', paciente: 'Maria', tipo: 'EXAME', valor: 100, fone: '+5581981818181' },

  { id: 3, data: '2023-06-03', paciente: 'Pedro', tipo: 'CIRURGIA', valor: 500, fone: '+5581981818181' },

  { id: 4, data: '2023-06-04', paciente: 'Ana', tipo: 'CONSULTA', valor: 70, fone: '+5581981818181' },

  { id: 5, data: '2023-06-05', paciente: 'Lucas', tipo: 'EXAME', valor: 120, fone: '+5581981818181' },

  { id: 6, data: '2023-06-05', paciente: 'Lucas', tipo: 'EXAME', valor: 120, fone: '+5581981818181' }
]
*/

const ModalWithGrid = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [rows, setRows] = useState([]);

  const fetchData = async () => {

    try{
      const { data } = await api.get('/budgets/open');
      setRows(
        data.map((d: any, i: number) =>
          Object.assign({
            id: i, 
            data: dayjs(d.created_at).format('YYYY-MM-DD'),
            paciente: d.patient?.name,
            valor: d.total - (d.discount || 0), 
            fone: '55'+d.patient?.cellPhone.replaceAll(' ','')
          }))
      )
    }catch(e){
      console.log(e)
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: {
            xs: '90vw'
          },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4
        }}
      >
        <Typography variant='h6' component='div' gutterBottom>
          Orçamento em Aberto
        </Typography>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid rows={rows} columns={columns} disableColumnMenu localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant='contained' onClick={onClose}>
            Fechar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default ModalWithGrid
