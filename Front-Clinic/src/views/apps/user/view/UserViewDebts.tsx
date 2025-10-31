// DÉBITOS

import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  LinearProgress,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'

import OptionsMenu from 'src/@core/components/option-menu'
import { PacientDebitDataType } from 'src/types/apps/userTypes'
import { ThemeColor } from 'src/@core/layouts/types'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import PaymentDialog from 'src/views/components/PaymentDialog'
import dayjs from 'dayjs'
import api from 'src/@core/components/api-client'

interface Props {
  debitsData: PacientDebitDataType[]
  fetchData: () => void
}
interface CellType {
  row: any
}

interface StatusObj {
  [key: string]: {
    color: ThemeColor
  }
}

const statusObj: StatusObj = {
  PAGO: { color: 'success' },
  ABERTO: { color: 'warning' },
  CANCELADO: { color: 'error' }
}

const UserViewDebts = ({ debitsData, fetchData }: Props) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any | null>(null)
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const [deleteAction, setDeleteAction] = useState<() => Promise<void> | void>(() => () => {})

  const handleOpenDialog = (row: PacientDebitDataType) => {
    setSelectedRow(row)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  async function handleRealDeleteTransaction(id: string) {
    const res = await api.delete(`/transactions/${id}`)
    if (res.status === 200) {
      fetchData()
    }
  }

  const handleEmitRecibo = async (documentId: string, transactionId: string) => {
    if (documentId) {
      const { data } = await api.get(`/contracts-signature/docId/${documentId}`)

      if (data) {
        window.open(`/debt/print/${transactionId}`, '_blank')

        return
      }

      await api.post('/contracts-signature', {
        documentType: 'recibo',
        documentId: documentId
      })

      fetchData()
      window.open(`/debt/print/${transactionId}`, '_blank')
    } else {
      console.log('Nenhum documentId retornado da criação da recibo')
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    fetchData()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const columns: GridColDef[] = [
    {
      flex: 0.15,
      minWidth: 120,
      headerName: 'Data',
      field: 'date',
      renderCell: ({ row }: CellType) => {
        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {row.date}
          </Typography>
        )
      }
    },

    {
      flex: 0.34,
      minWidth: 160,
      headerName: 'Descrição',
      field: 'description',
      renderCell: ({ row }: CellType) => {
        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {row.description}
          </Typography>
        )
      }
    },

    {
      flex: 0.15,
      minWidth: 100,
      headerName: 'total',
      field: 'Valor',
      renderCell: ({ row }: any) => {
        return (
          <Typography noWrap variant='subtitle1'>
            {Number(row.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Typography>
        )
      }
    },

    {
      width: 150,
      headerName: 'Método',
      field: 'Método',
      renderCell: ({ row }: any) => {
        return (
          <Typography noWrap variant='subtitle1'>
            {row.paymentMethod ? row.paymentMethod : ''}
          </Typography>
        )
      }
    },

    {
      width: 120,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }: CellType) => (
        <CustomChip
          size='small'
          label={row.isPaid ? 'Pago' : 'aberto'}
          color={row.isPaid ? 'success' : 'warning'}
          sx={{
            textTransform: 'capitalize',
            '& .MuiChip-label': { px: 2.5, lineHeight: 1.385 }
          }}
        />
      )
    },

    {
      flex: 0.1,
      minWidth: 170,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!row.isPaid ? (
            <Box sx={{ display: 'flex', marginRight: 1 }}>
              <Button color='secondary' variant='outlined' onClick={() => handleOpenDialog(row)}>
                RECEBER
              </Button>
            </Box>
          ) : (
            <Button color='secondary' variant='outlined' onClick={() => handleOpenDialog(row)} disabled>
              {row.paymentType}
            </Button>
          )}

          <Box sx={{ marginLeft: 'auto' }}>
            <OptionsMenu
              iconProps={{ fontSize: 20 }}
              iconButtonProps={{ size: 'small' }}
              menuProps={{ sx: { '& .MuiMenuItem-root svg': { mr: 2 } } }}
              options={[
                {
                  text: row.isPaid ? 'Emitir recibo' : 'Receber',
                  onClick: row.isPaid ? () => handleEmitRecibo(row.entityId, row.id) : () => handleOpenDialog(row)
                },

                ...(row.isSigned
                  ? []
                  : [
                      {
                        text: 'Deletar orçamento',
                        menuItemProps: {
                          onClick: () => {
                            setDeleteAction(() => () => handleRealDeleteTransaction(row.id))
                            setOpenConfirmDelete(true)
                          }
                        }
                      }
                    ])
              ]}
            />
          </Box>
        </Box>
      )
    }
  ]

  const total = debitsData
    .filter((d: any) => d.type === 'R' && d.isPaid)
    .reduce((a: number, c: any) => a + Number(c.value || 0), 0)

  const receber = debitsData
    .filter((d: any) => d.type === 'R' && !d.isPaid)
    .reduce((a: number, c: any) => a + Number(c.value || 0), 0)

  const totalFormatado = Number(total.toFixed(2))
  const receberFormatado = Number(receber.toFixed(2))

  const formatValue = (val: number) =>
    val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  console.log('selectedRow', selectedRow)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Débitos' />
          <CardContent>
            <ApexChartWrapper>
              <Grid container spacing={6} className='match-height'>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>TOTAL PAGO</Typography>
                  <Grid item xs={12} md={6} sx={{ mt: [4, 4, 0] }}>
                    <Box sx={{ display: 'flex', mb: 2, justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>R$ {formatValue(total)}</Typography>
                    </Box>
                    <LinearProgress
                      value={100}
                      color='success'
                      variant='determinate'
                      sx={{ height: 10, borderRadius: '5px' }}
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>À RECEBER</Typography>
                  <Grid item xs={12} md={6} sx={{ mt: [4, 4, 0] }}>
                    <Box sx={{ display: 'flex', mb: 2, justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>R$ {formatValue(receber)}</Typography>
                    </Box>
                    <LinearProgress
                      value={100}
                      color='error'
                      variant='determinate'
                      sx={{ height: 10, borderRadius: '5px' }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </ApexChartWrapper>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title='Lista de débitos' />
          <CardContent>
            <DataGrid
              autoHeight
              columns={columns}
              rows={debitsData}
              disableRowSelectionOnClick
              pageSizeOptions={[7, 10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
              localeText={{
                ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                noRowsLabel: 'Nenhum registro encontrado',
                columnMenuManageColumns: 'Gerenciar colunas'
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      <PaymentDialog
        id={selectedRow?.id || ''}
        typeDialogTitle='R'
        transaction={selectedRow?.entityId}
        open={openDialog}
        onClose={handleCloseDialog}
        nome={selectedRow?.patient || ''}
        codigo={'1' || ''}
        data={dayjs()?.format?.('DD/MM/YYYY') || ''}
        valor={selectedRow?.value}
        fetchData={fetchData}
        servico={selectedRow?.description || ''}
      />

      <Dialog open={openConfirmDelete} onClose={() => setOpenConfirmDelete(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDelete(false)}>Cancelar</Button>
          <Button
            color='error'
            onClick={() => {
              deleteAction()
              setOpenConfirmDelete(false)
            }}
          >
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default UserViewDebts
