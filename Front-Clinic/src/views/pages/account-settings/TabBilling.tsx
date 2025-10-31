import React, { useState, useEffect } from 'react'
import { AppDispatch, RootState } from 'src/store';
import { useDispatch, useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import ChangePasswordCard from './security/ChangePasswordCard'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import { Box, DialogContentText, IconButton, Link, Tooltip, Typography } from '@mui/material'
import OptionsMenu from 'src/@core/components/option-menu'
import Icon from 'src/@core/components/icon'
import {PlanType} from 'src/types/apps/clinicsTypes'
import CircularProgress from '@mui/material/CircularProgress'
import { loadPlans, createPlan, deletePlan, updatePlan } from 'src/store/apps/clinics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import ConfirmDialog from 'src/@core/components/confirmDialog';
import toast from 'react-hot-toast';

interface CellType {
  row: PlanType
}

const TabBilling = () => {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [planData, setPlanData] = useState<PlanType>();
  const [dataList, setDataList] = useState<PlanType[]>([])
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.clinic)
  const [planToDelete, setPlanToDelete] = useState<PlanType | null>(null)

  useEffect(()=>{    
    dispatch(loadPlans())
  }, [dispatch])

  useEffect(() => {       
    if(store?.plans){      
      setDataList(store.plans)
    } 
  }, [store?.plans])
  
  const openDialog = () => {
    setDialogMode('add')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
  }

  const savePlan = () => {
    if(typeof planData === 'undefined') return;
   
    const isEditing = dialogMode === 'edit';
    let successMessage = 'Registro incluído com sucesso!';


    console.log(`dialog mode ${dialogMode}`)
   
    if(isEditing){
      const oldPlan = dataList.find(item => item.id === planData.id);
     
      if(oldPlan && oldPlan.name === planData.name && oldPlan.specialty === planData.specialty){        
        setPlanData(undefined)
        closeDialog()
       
        return;
      }
     
      dispatch(updatePlan(planData));
      successMessage = 'Registro alterado com sucesso!';
    } else {      
      dispatch(createPlan(planData));
    }
   
    setPlanData(undefined)
    toast.success(successMessage);
   
    closeDialog()
  }

  const columns = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'specialty', headerName: 'Especialidade', flex: 1 },

    {
      flex: 0.1,
      minWidth: 170,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={() => handleEditPlan(row.id)} title="Editar">
            <Icon icon='mdi:pencil-outline' color='blue'/>
          </Button>
          <Button onClick={() => setPlanToDelete(row)} title="Apagar">
            <Icon icon='mdi:delete-outline' color='red'/>
          </Button>
        </Box>
      )
    }

    // Adicione outras colunas conforme necessário
  ];
  
  function handlePlanDataChange (field: keyof PlanType, value: string) {    
    let _planData = planData
    if (typeof _planData === 'undefined') {
      _planData = {} as PlanType;
    }
    
    setPlanData({
      ..._planData,
      [field]: value
    })
  }

  function _deletePlan() {
    if(planToDelete){      
      dispatch(deletePlan(planToDelete.id))
      setPlanToDelete(null)
    }
  }

  
  function handleEditPlan (id: string): void {    
    const plan = dataList.find(item => item.id === id);
    if(plan){
      setPlanData(plan);
      setDialogMode('edit');
      setDialogOpen(true);
    }
  }

  return (
    <Grid container spacing={12}>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid 
              container
              justifyContent='space-between'
              style={{ marginBottom: 20 }}
            >
                <Grid item xs={12} md={4}>
                  { store?.loadingData && 
                    <Box sx={{ display: 'flex', alignItems:'center' }}>
                    <CircularProgress style={{marginRight: 10}} size={20}/>
                    <p>Carregando dados</p>
                    </Box>
                  }        
                <Grid item>
                  <Typography variant="h5" component="h2">
                    Cadastro de Planos
                  </Typography>
                </Grid>         
                </Grid>  

                <Grid item>
                  <Grid container spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={openDialog}
                      >
                        + NOVO PLANO
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>

                
              </Grid>      
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid rows={dataList} columns={columns} localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}} />
              </div>

          </CardContent>

        </Card>
      </Grid>

      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1 }}>Cadastro de Plano</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} style={{paddingTop: 15}}>
            <Grid item xs={6}>
              <TextField
              label='Nome'
              value={planData?.name ?? ''}
              onChange={e => handlePlanDataChange('name', e.target.value)}
              />    
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='Especialidade'
                value={planData?.specialty ?? ''}
                onChange={e => handlePlanDataChange('specialty', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color='error' variant='outlined' onClick={closeDialog}>
            Cancelar
          </Button>
          <Button color='primary' variant='outlined' onClick={savePlan}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={planToDelete != null}
        onClose={() => setPlanToDelete(null)}
        aria-labelledby='confirm-delete-title'
        aria-describedby='confirm-delete-description'
        maxWidth="xs"
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle 
          id='confirm-delete-title' 
          sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0ff', padding: '12px 24px' }}
        >
          Atenção!
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id='confirm-delete-description' 
            sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', paddingTop: '18px' }}
          >
            Tem certeza que deseja excluir o plano?
          </DialogContentText>
          <DialogContentText 
            sx={{ color: 'text.secondary', mb: 2 }}
          >
            Essa ação não poderá ser desfeita!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPlanToDelete(null)} 
            color='error' 
            variant='outlined'
          >
            Cancelar
          </Button>
          <Button 
            onClick={_deletePlan} 
            color='primary' 
            variant='outlined'
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

    </Grid>
  )
}

export default TabBilling
