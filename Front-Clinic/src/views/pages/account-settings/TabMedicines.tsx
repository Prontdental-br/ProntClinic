import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
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
  DialogContentText,
} from '@mui/material'
import { AppDispatch, RootState } from 'src/store'
import { useDispatch, useSelector } from 'react-redux'
import CircularProgress from '@mui/material/CircularProgress'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import { DataGrid, ptBR } from '@mui/x-data-grid'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

import {
  loadMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from 'src/store/apps/clinics' 
import { MedicineType } from 'src/types/apps/clinicsTypes'

const TabMedicines: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineType[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [medicineData, setMedicineData] = useState<MedicineType | null>(null)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [medicineToDelete, setMedicineToDelete] = useState<MedicineType | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.clinic);

  useEffect(() => {
    dispatch(loadMedicines() as any)
  }, [dispatch])

  useEffect(() => {
    if (store?.documents) {
      setMedicines(store.documents)
    }
  }, [store?.documents])

  const handleEditMedicine = (data: MedicineType) => {
    setDialogMode('edit')
    setMedicineData(data)
    setOpenDialog(true)
  }

  const handleOpenDialog = () => {
    setDialogMode('add')
    setMedicineData(null)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setMedicineData(null)
    setOpenDialog(false)
  }

  const handleSave = async () => {
    if (!medicineData) return
    try {
      if (dialogMode === 'add') {
        const newMedicine = { ...medicineData, type: 'medicine', active: true }
        await dispatch(createMedicine(newMedicine) as any)
        toast.success('Registro incluído com sucesso!')
      } else {
        await dispatch(updateMedicine(medicineData) as any)
        toast.success('Registro alterado com sucesso!')
      }
      setMedicineData(null)
      handleCloseDialog()
    } catch (error) {
      toast.error('Ocorreu um erro ao salvar o Medicamento.')
    }
  }

  const handleDelete = async () => {
    if (!medicineToDelete) return
    try {
      await dispatch(deleteMedicine(medicineToDelete.id) as any)
      toast.success('Registro excluído com sucesso!')
    } catch (error) {
      toast.error('Ocorreu um erro ao excluir o Medicamento.')
    } finally {
      setMedicineToDelete(null)
    }
  }

  const handleMedicineData = (key: keyof MedicineType, value: string | boolean) => {
    const _medicineData = (medicineData || {}) as MedicineType
    setMedicineData({ ..._medicineData, [key]: value })
  }

  const columns: GridColDef<MedicineType>[] = [
    { field: 'title', headerName: 'Nome', flex: 1 },
    { field: 'description', headerName: 'Posologia', flex: 1 },
    { field: 'description1', headerName: 'Descrição Adicional', flex: 1 },
    {
      flex: 0.2,
      minWidth: 170,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: (params: GridRenderCellParams<MedicineType>) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={() => handleEditMedicine(params.row)} title='Editar'>
            <Icon icon='mdi:pencil-outline' color='blue' />
          </Button>
          <Button onClick={() => setMedicineToDelete(params.row)} title='Apagar'>
            <Icon icon='mdi:delete-outline' color='red' />
          </Button>
        </Box>
      ),
    },
  ]

  return (
    <Card>
      <CardContent>
        <Grid container justifyContent='space-between' alignItems='center' style={{ marginBottom: 20 }}>
          <Grid item>
            <Typography variant='h5' component='h2'>
              Cadastro de Medicamentos
            </Typography>
          </Grid>
          <Grid item>
            <Button variant='contained' onClick={handleOpenDialog}>
              + novo medicamento
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
              rows={medicines}
              columns={columns}
              localeText={{ ...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado' }}
            />
          </div>
        )}
      </CardContent>

      {openDialog && (
        <Dialog open={openDialog} onClose={handleCloseDialog} sx={{ '& .MuiPaper-root': { height: 'auto' } }}>
          <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1 }}>
            {dialogMode === 'edit' ? 'Editar Medicamento' : 'Cadastro de Medicamento'}
          </DialogTitle>
          <DialogContent style={{ paddingTop: 30 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label='Nome'
                  value={medicineData?.title ?? ''}
                  onChange={e => handleMedicineData('title', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Posologia'
                  value={medicineData?.description ?? ''}
                  onChange={e => handleMedicineData('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Descrição Adicional'
                  value={medicineData?.description1 ?? ''}
                  onChange={e => handleMedicineData('description1', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant='outlined' color='error' sx={{ mr: 3 }}>
              Cancelar
            </Button>
            <Button onClick={handleSave} variant='outlined'>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog
        open={medicineToDelete != null}
        onClose={() => setMedicineToDelete(null)}
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
            Tem certeza que deseja excluir este medicamento?
          </DialogContentText>
          <DialogContentText sx={{ color: 'text.secondary', mb: 2 }}>
            Essa ação não poderá ser desfeita!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMedicineToDelete(null)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color='primary' variant='outlined'>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default TabMedicines