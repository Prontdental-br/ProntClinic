// ** React Imports
import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useSelector, useDispatch } from 'react-redux'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AlertTitle from '@mui/material/AlertTitle'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import PageHeader from 'src/@core/components/page-header'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import TableHeader from './TableHeader'
import { CardContent, CardHeader, DialogActions, DialogContentText, Switch } from '@mui/material'
import { Focused } from 'react-credit-cards'
import TableHeaderDetails from './TableHeaderDetails'
import ModalQuestionGeneric from 'src/views/components/ModalQuestionGeneric'
import { RootState, AppDispatch } from 'src/store'
import { TreatmentType, SpecialtyType } from 'src/types/apps/clinicsTypes'
import { loadSpecialties, loadTreatments } from 'src/store/apps/clinics'
import {
  updateSpecialty,
  deleteSpecialty,
  createTreatment,
  updateTreatment,
  deleteTreatment
} from 'src/store/apps/clinics'
import ConfirmDialog from 'src/@core/components/confirmDialog'
import toast from 'react-hot-toast'

interface CellType {
  row: TreatmentType
}

interface SpecialtCellType {
  row: SpecialtyType
}

const defaultColumns: GridColDef[] = [
  {
    flex: 1.25,
    field: 'name',
    minWidth: 450,
    headerName: 'Name',
    renderCell: ({ row }: SpecialtCellType) => <Typography>{row.name}</Typography>
  }
]

const TabTreatment = () => {
  // ** State
  const [value, setValue] = useState<string>('')
  const [treatmentsValue, setTreatmentsValue] = useState<string>('')

  // Estado separado para controle do valor do TextField de filtro de tratamentos
  const [filterValue, setFilterValue] = useState<string>('')

  const [editValue, setEditValue] = useState<string>('')
  const [editDesc, setEditDesc] = useState<string>('')

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)

  const [valueDelete, setValueDelete] = useState<SpecialtyType>()

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const [focus, setFocus] = useState<Focused>()
  const [dialogTitle, setDialogTitle] = useState<string>('Adicionar')
  const [openEditCard, setOpenEditCard] = useState<boolean>(false)
  const [seletecItemSpecialty, setSeletecItemSpecialty] = useState<SpecialtyType>({} as SpecialtyType)

  const [specialtyToDelete, setSpecialtyToDelete] = useState<SpecialtyType | null>(null)
  const [dataSpecialty, setDataSpecialty] = useState<SpecialtyType[]>([])

  const [dataTreatments, setDataTreatments] = useState<TreatmentType[]>([])

  const [filteredDataSpecialty, setFilteredDataSpecialty] = useState(dataSpecialty)
  const [filteredDataTreatments, setFilteredDataTreatments] = useState(dataTreatments)
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | null>(null)

  const store = useSelector((state: RootState) => state.clinic)
  const dispatch = useDispatch<AppDispatch>()

  const [auxDataSpecialty, setAuxDataSpecialty] = useState<SpecialtyType>()

  const [openDialogNotDelete, setOpenDialogNotDelete] = useState<boolean>(false)
  const [treatmentIdToDelete, setTreatmentIdToDelete] = useState<string | null>(null)

  useEffect(() => {
    dispatch(loadSpecialties())
    dispatch(loadTreatments())
  }, [dispatch])

  useEffect(() => {
    if (store.specialties) {
      setDataSpecialty(store.specialties)
      setFilteredDataSpecialty(store.specialties)
    }

    if (store.treatments) {
      setDataTreatments(store.treatments)
      setFilteredDataTreatments(store.treatments)
    }
  }, [store.treatments, store.specialties])

  const handleFormAuxDataSpecialty = (key: keyof SpecialtyType, value: any) => {
    setAuxDataSpecialty({ ...auxDataSpecialty!, [key]: value })
  }

  const handleEditTreatment = (treatment: TreatmentType) => {
    setSelectedTreatment(treatment)
  }

  const addSpecialty = (newSpecialty: SpecialtyType) => {
    // setDataSpecialty([...dataSpecialty, newItem])
    // setFilteredDataSpecialty([...dataSpecialty, newItem]) // Atualizar o dado filtrado
  }

  const addTreatments = (newTreatments: TreatmentType) => {
    // setDataTreatments([...dataTreatments, newItem])
    // setFilteredDataSpecialty([...dataSpecialty, newItem]) // Atualizar o dado filtrado
  }

  const handleAddTreatment = (newTreatment: TreatmentType) => {
    if (typeof newTreatment?.specialtyId == 'undefined') return

    const isAdding = typeof newTreatment.id == 'undefined' || newTreatment.id == ''

    if (isAdding) {
      dispatch(createTreatment(newTreatment))
      toast.success('Registro incluído com sucesso! ')
    } else {
      dispatch(updateTreatment(newTreatment))
      toast.success('Registro alterado com sucesso!')
    }
  }

  const handleDialogConfirm = (value: string) => {
    if (value === 'confirm') {
      handleDeleteSpecialty(valueDelete!.id)
    }
  }

  function _deleteSpecialicity() {
    if (valueDelete) {
      const hasTreatments = dataTreatments.filter(treatment => treatment.specialtyId === valueDelete.id).length > 0
      if (hasTreatments) {
        setOpenDialogNotDelete(true)
        setDeleteDialogOpen(false)
      } else {
        dispatch(deleteSpecialty(valueDelete.id))
        toast.success('Registro excluído com sucesso!')
        setDeleteDialogOpen(false)
      }
    }
  }

  const filterSpecialty = useCallback(
    (val: string) => {
      setValue(val)
      if (val) {
        setFilteredDataSpecialty(dataSpecialty.filter(item => item.name.toLowerCase().includes(val.toLowerCase())))
      } else {
        setFilteredDataSpecialty(dataSpecialty)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [dataSpecialty]
  )

  const filterTreatments = useCallback(
    (val: string) => {
      setTreatmentsValue(val)
      const lowercasedValue = val.toLowerCase()
      if (val) {
        // Filtrar tratamentos pelo nome do tratamento
        setFilteredDataTreatments(dataTreatments.filter(item => item.name.toLowerCase().includes(lowercasedValue)))
      } else {
        // Se não houver valor de pesquisa, exiba todos os tratamentos relacionados à especialidade selecionada
        if (seletecItemSpecialty) {
          setFilteredDataTreatments(
            dataTreatments.filter(treatment => treatment.specialtyId === seletecItemSpecialty.id)
          )
        } else {
          // Se não houver especialidade selecionada, exiba todos os tratamentos
          setFilteredDataTreatments(dataTreatments)
        }
      }
    },
    [dataTreatments, seletecItemSpecialty]
  )

  const handleEditSpecialty = (specialty: SpecialtyType) => {
    console.log('edit specialty:', specialty.name)
    setAuxDataSpecialty(specialty)
    setEditDialogOpen(true)
  }

  const handleOpenDialogDeleteSpecialty = (row: SpecialtyType) => {
    setDeleteDialogOpen(!deleteDialogOpen)
    setValueDelete(row)
  }

  const handleDeleteSpecialty = useCallback(
    (id: string) => {
      //cerificar se especialidade tem tratamentos cadastrados
      /*const hasTreatments = dataTreatments.filter(treatment => treatment.specialtyId === id)
      if (hasTreatments.length > 0) {
        setOpenDialogNotDelete(true)
       
        return
      }*/

      dispatch(deleteSpecialty(id))

      // Filtrar fora a especialidade que deve ser deletada
      const updatedSpecialties = dataSpecialty.filter(speciality => speciality.id !== id)
      setDataSpecialty(updatedSpecialties)

      // Também é necessário atualizar as especialidades filtradas se elas estiverem sendo exibidas
      setFilteredDataSpecialty(updatedSpecialties)

      // Se a especialidade removida estava selecionada, limpe a seleção e os tratamentos filtrados
      if (seletecItemSpecialty && seletecItemSpecialty.id === id) {
        setSeletecItemSpecialty({} as SpecialtyType)
        setFilteredDataTreatments(dataTreatments)
      }
    },
    [dataSpecialty, seletecItemSpecialty, dataTreatments]
  )

  useEffect(() => {
    let filtered = dataTreatments

    // Filtrar por especialidade selecionada
    if (seletecItemSpecialty) {
      filtered = filtered.filter(treatment => treatment.specialtyId === seletecItemSpecialty.id)
    }

    // Filtrar por valor do campo de busca
    if (filterValue) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(filterValue.toLowerCase()))
    }

    setFilteredDataTreatments(filtered)
  }, [seletecItemSpecialty, filterValue, dataTreatments])

  // Atualizado para lidar corretamente com a seleção e filtragem
  const handleSeletecItemSpecialty = useCallback((rowObject: SpecialtyType) => {
    setSeletecItemSpecialty(rowObject)
    setFilterValue('') // Reseta o filtro de tratamento ao selecionar uma nova especialidade
  }, [])

  const handleDialogToggle = () => setEditDialogOpen(!editDialogOpen)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    setEditDialogOpen(false)
    e.preventDefault()
  }

  // Dentro de TabTreatment...
  const handleDeleteTreatment = useCallback(
    (treatmentId: string) => {
      setTreatmentIdToDelete(treatmentId)
    },
    [dataTreatments]
  )

  const handleEditCardClickOpen = (id: number) => {
    return ''
  }

  const handleEditCardClose = () => {
    return ''
  }

  const SpecialtyColumns: GridColDef[] = [
    ...defaultColumns,
    {
      flex: 0.15,
      minWidth: 115,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: SpecialtCellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => handleEditSpecialty(row)}>
            <Icon icon='mdi:pencil-outline' color='blue' />
          </IconButton>
          <IconButton>
            <Icon icon='mdi:delete-outline' color='red' onClick={() => handleOpenDialogDeleteSpecialty(row)} />
          </IconButton>
        </Box>
      )
    }
  ]

  function saveSpecialty() {
    if (auxDataSpecialty?.id) {
      dispatch(updateSpecialty(auxDataSpecialty!))
      toast.success('Registro alterado com sucesso!')
    }

    setEditDialogOpen(false)
  }

  function confirmDeleteTreatment() {
    if (treatmentIdToDelete) {
      dispatch(deleteTreatment(treatmentIdToDelete))
      toast.success('Registro excluído com sucesso!')
      setTreatmentIdToDelete(null)
    }
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader
            title={<Typography variant='h5'>Lista de Tratamentos</Typography>}
            subtitle={<Typography variant='body2'>Cadastre os tratamentos da Clínica, Valores e custos.</Typography>}
          />
        </Grid>
        <Grid item xs={5}>
          <Card>
            <TableHeader value={value} handleFilter={filterSpecialty} addSpecialty={addSpecialty} />
            {/* DataGrid Especialidade */}
            <DataGrid
              autoHeight
              rows={filteredDataSpecialty}
              columns={SpecialtyColumns}
              pageSizeOptions={[10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              onRowClick={obj => {
                handleSeletecItemSpecialty(obj.row)
              }}
              sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
              localeText={{
                ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                noRowsLabel: 'Nenhum registro encontrado',
                columnMenuManageColumns: 'Gerenciar colunas'
              }}
            />
            {/* DataGrid Especialidade */}
          </Card>
        </Grid>

        <Grid item xs={7}>
          <Card>
            <TableHeaderDetails
              value={filterValue}
              handleFilter={setFilterValue}
              addTreatments={handleAddTreatment}
              selectedSpecialty={seletecItemSpecialty}
              selectedTreatment={selectedTreatment}
              onEditTreatment={handleEditTreatment}
              data={dataSpecialty}
            />
          </Card>

          {seletecItemSpecialty.id ? (
            <Grid item xs={12} sx={{ mt: 5 }}>
              <Card>
                <CardHeader title={`Tratamentos para ${seletecItemSpecialty.name}`} />
                <CardContent>
                  {/* Lista de Tratamentos */}
                  {filteredDataTreatments.map((item: TreatmentType, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        p: 5,
                        display: 'flex',
                        borderRadius: 1,
                        flexDirection: ['column', 'row'],
                        justifyContent: ['space-between'],
                        alignItems: ['flex-start', 'center'],
                        mb: index !== dataTreatments.length - 1 ? 4 : undefined,
                        border: theme => `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <div>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 500 }} maxWidth={350}>
                            {item.name}
                          </Typography>
                          {item.active ? (
                            <CustomChip
                              skin='light'
                              size='small'
                              label={'Ativo'}
                              color={'success'}
                              sx={{ height: 20, ml: 2, fontSize: '0.75rem', fontWeight: 600, borderRadius: '5px' }}
                            />
                          ) : (
                            <CustomChip
                              skin='light'
                              size='small'
                              label={'Desativado'}
                              color={'error'}
                              sx={{ height: 20, ml: 2, fontSize: '0.75rem', fontWeight: 600, borderRadius: '5px' }}
                            />
                          )}
                        </Box>
                      </div>

                      <Box sx={{ mt: [3, 0], textAlign: ['start', 'end'] }}>
                        <Switch
                          name='active'
                          checked={item.active}
                          onChange={e => handleAddTreatment({ ...item, active: !item.active })}
                        />
                        <Button
                          variant='outlined'
                          sx={{ mr: 2, alignItems: 'end' }}
                          onClick={() => handleEditTreatment(item)}
                        >
                          Detalhes
                        </Button>
                        <Button variant='outlined' color='error' onClick={() => handleDeleteTreatment(item.id)}>
                          Deletar
                        </Button>
                      </Box>
                    </Box>
                  ))}
                  {/* ******************** */}
                </CardContent>
              </Card>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
      <Dialog maxWidth='sm' fullWidth onClose={handleDialogToggle} open={editDialogOpen}>
        <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1 }}>
          Editar Especialidade
        </DialogTitle>
        <DialogContent>
          {/* <Alert severity='warning' sx={{ maxWidth: '500px' }}>
            <AlertTitle>Cuidado!</AlertTitle>
            Ao editar o nome do Tratamento, você pode interromper a funcionalidade de permissões do sistema. Por favor,
            certifique-se de que você está absolutamente certo antes de prosseguir.
          </Alert> */}

          <Box component='form' sx={{ mt: 8 }} onSubmit={onSubmit}>
            <FormGroup sx={{ mb: 2, alignItems: 'center', flexDirection: 'row', flexWrap: ['wrap', 'nowrap'] }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    value={auxDataSpecialty?.name ?? ''}
                    label='Nome da Especialidade'
                    placeholder='Digite o nome da Especialidade'
                    onChange={e => handleFormAuxDataSpecialty('name', e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    value={auxDataSpecialty?.description ?? ''}
                    label='Descrição do Tratamento'
                    placeholder='Digite a descrição da Especialidade'
                    onChange={e => handleFormAuxDataSpecialty('description', e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={auxDataSpecialty?.active ?? false}
                        onChange={e => handleFormAuxDataSpecialty('active', e.target.checked)}
                      />
                    }
                    label='Ativo'
                  />
                </Grid>

                <Grid container xs={6} style={{ marginTop: 10 }} spacing={3}>
                  <Grid item>
                    <Button onClick={() => setEditDialogOpen(false)} variant='outlined' color='error'>
                      Cancelar
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button onClick={saveSpecialty} variant='outlined'>
                      Atualizar
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </FormGroup>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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
            sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', paddingTop: '18px' }}
          >
            Você tem certeza que deseja remover {valueDelete?.name}?
          </DialogContentText>
          <DialogContentText sx={{ color: 'text.secondary', mb: 2 }}>
            Você não poderá reverter esta ação!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={_deleteSpecialicity} color='primary' variant='outlined'>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialogNotDelete} onClose={() => setOpenDialogNotDelete(false)}>
        <DialogTitle>Atenção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Não é possível excluir esta especialidade, pois existem tratamentos cadastrados para ela.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogNotDelete(false)}>Ok</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!treatmentIdToDelete}
        onClose={() => setTreatmentIdToDelete(null)}
        aria-labelledby='confirm-delete-treatment-title'
        aria-describedby='confirm-delete-treatment-description'
        maxWidth='xs'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle
          id='confirm-delete-treatment-title'
          sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0ff', padding: '12px 24px' }}
        >
          Atenção!
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id='confirm-delete-treatment-description'
            sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', paddingTop: '18px ' }}
          >
            Tem certeza que deseja excluir este tratamento?
          </DialogContentText>
          <DialogContentText sx={{ color: 'text.secondary', mb: 2 }}>
            Essa ação não poderá ser desfeita!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTreatmentIdToDelete(null)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button
            onClick={confirmDeleteTreatment}
            color='primary'
            variant='outlined'
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TabTreatment
