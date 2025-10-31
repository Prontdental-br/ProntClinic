import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
  Box,
  DialogContentText
} from '@mui/material'
import { CashType } from 'src/types/apps/clinicsTypes'
import { AppDispatch, RootState } from 'src/store'
import { useDispatch, useSelector } from 'react-redux'
import { loadCashs, createCash, updateCash, deleteCash } from 'src/store/apps/clinics'
import CircularProgress from '@mui/material/CircularProgress'
import ConfirmDialog from 'src/@core/components/confirmDialog'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'

import { DataGrid, ptBR } from '@mui/x-data-grid'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

const TabNotifications: React.FC = () => {
  const [cashs, setCashs] = useState<CashType[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [cashData, setCashData] = useState<CashType | null>(null)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [cashToDelete, setCashToDelete] = useState<CashType | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.clinic)

  useEffect(() => {
    console.log('firing load cashs')
    dispatch(loadCashs())
  }, [dispatch])

  useEffect(() => {
    if (store?.cashs) {
      setCashs(store.cashs)
    }
  }, [store?.cashs])

  const handleEditCash = (data: CashType) => {
    setDialogMode('edit')
    setCashData(data)
    setOpenDialog(true)
  }

  const handleOpenDialog = () => {
    setDialogMode('add')
    setCashData(null)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setCashData(null)
    setOpenDialog(false)
  }

  const handleSave = () => {
    if (cashData == null) return

    const isAdding = dialogMode === 'add'

    if (isAdding) {
      dispatch(createCash(cashData))
    } else {
      dispatch(updateCash(cashData))
    }

    setCashData(null)

    const successMessage = isAdding ? 'Registro incluído com sucesso!' : 'Registro alterado com sucesso!'

    toast.success(successMessage)

    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    setCashs(cashs.filter(d => d.id !== id))
  }

  const handleCashData = (key: keyof CashType, value: string | boolean) => {
    const _cashData = cashData || ({} as CashType)
    setCashData({ ..._cashData, [key]: value })
  }

  function _deleteCash() {
    if (cashToDelete) {
      dispatch(deleteCash(cashToDelete.id))
      setCashToDelete(null)
    }
  }

  const columns: GridColDef<CashType>[] = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'description', headerName: 'Descrição', flex: 1 },
    {
      field: 'active',
      headerName: 'Ativo',
      flex: 0.1,
      minWidth: 170,
      renderCell: params => (
        <Typography sx={{ color: params.value ? 'green' : 'red' }}>{params.value ? 'Sim' : 'Não'}</Typography>
      )
    },
    {
      field: 'default',
      headerName: 'Padrão',
      flex: 0.1,
      minWidth: 170,
      renderCell: params => (
        <Typography sx={{ color: params.value ? 'green' : 'red' }}>{params.value ? 'Sim' : 'Não'}</Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 170,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: (params: GridRenderCellParams<CashType>) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={() => handleEditCash(params.row)} title='Editar'>
            <Icon icon='mdi:pencil-outline' color='blue' />
          </Button>
          <Button onClick={() => setCashToDelete(params.row)} title='Apagar'>
            <Icon icon='mdi:delete-outline' color='red' />
          </Button>
        </Box>
      )
    }
  ]

  return (
    <Card>
      <CardContent>
        <Grid container justifyContent='space-between' alignItems='center' style={{ marginBottom: 20 }}>
          <Grid item>
            <Typography variant='h5' component='h2'>
              Cadastro de Bancos
            </Typography>
          </Grid>
          <Grid item>
            <Button variant='contained' onClick={handleOpenDialog}>
              + novo banco
            </Button>
          </Grid>
        </Grid>

        {store?.loadingData ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <CircularProgress style={{ marginRight: 10 }} size={20} />
            <Typography>Carregando dados...</Typography>
          </Box>
        ) : (
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={cashs}
              columns={columns}
              localeText={{
                ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                noRowsLabel: 'Nenhum registro encontrado',
                columnMenuManageColumns: 'Gerenciar colunas'
              }}
            />
          </div>
        )}
      </CardContent>

      {openDialog && (
        <Dialog open={openDialog} onClose={handleCloseDialog} sx={{ '& .MuiPaper-root': { height: 'auto' } }}>
          <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1 }}>
            {dialogMode === 'edit' ? 'Editar Banco' : 'Cadastro de Banco'}
          </DialogTitle>
          <DialogContent style={{ paddingTop: 30 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label='Nome'
                  value={cashData?.name ?? ''}
                  onChange={e => handleCashData('name', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label='Descrição'
                  value={cashData?.description ?? ''}
                  onChange={e => handleCashData('description', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} container alignItems='center' justifyContent='space-between'>
                <Grid item sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked={cashData?.active || false}
                        onChange={e => handleCashData('active', e.target.checked)}
                      />
                    }
                    label='Ativo'
                  />
                </Grid>
                <Grid item sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked={cashData?.default || false}
                        onChange={e => handleCashData('default', e.target.checked)}
                      />
                    }
                    label='Padrão'
                  />
                </Grid>
                <Grid item sx={{ mt: 2 }}>
                  <Button onClick={handleCloseDialog} variant='outlined' color='error' sx={{ mr: 3 }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} variant='outlined'>
                    Salvar
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={cashToDelete != null}
        onClose={() => setCashToDelete(null)}
        aria-labelledby='confirm-dialog-title'
        aria-describedby='confirm-dialog-description'
        maxWidth='xs'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle
          id='confirm-dialog-title'
          sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0ff', padding: '12px 24px' }}
        >
          Atenção!
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id='confirm-dialog-description'
            sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', paddingTop: '18px ' }}
          >
            Tem certeza que deseja excluir o banco?
          </DialogContentText>
          <DialogContentText sx={{ color: 'text.secondary', mb: 2 }}>
            Essa ação não poderá ser desfeita!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCashToDelete(null)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={_deleteCash} color='primary' variant='outlined'>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default TabNotifications
