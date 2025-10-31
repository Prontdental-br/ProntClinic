// ** React Imports
import { FormEvent, useState } from 'react'

import { useSelector, useDispatch } from 'react-redux';

// ** MUI Imports
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import { DialogActions, Grid, Switch } from '@mui/material'
import { SpecialtyType, TreatmentType } from 'src/types/apps/clinicsTypes'
import { RootState, AppDispatch } from 'src/store';
import { createSpecialty } from 'src/store/apps/clinics';
import toast from 'react-hot-toast';

interface TableHeaderProps {
  value: string
  addSpecialty: (obj: SpecialtyType) => void
  handleFilter: (val: string) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { value, handleFilter, addSpecialty } = props
  const [auxDataSpecialty, setAuxDataSpecialty] = useState<SpecialtyType>()
  const [activeSpecialty, setActiveSpecialty] = useState<boolean>(true)
  const store = useSelector( (state:RootState) => state.clinic );
  const dispatch = useDispatch<AppDispatch>(); 

  // ** State
  const [open, setOpen] = useState<boolean>(false)

  const handleDialogToggle = () => setOpen(!open)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    setOpen(false)
    e.preventDefault()
  }

  const handleSave = () => {
    if(typeof auxDataSpecialty === 'undefined') return
    if(auxDataSpecialty.name == '' || auxDataSpecialty.description == '') return

    dispatch(createSpecialty(auxDataSpecialty));
    
    setAuxDataSpecialty(undefined)
    setOpen(false)
    toast.success('Registro incluído com sucesso!');
  }

  function handleAuxSpecialtyData (key: keyof SpecialtyType, value: string | boolean) {
    const _auxDataSpecialty = auxDataSpecialty || {} as SpecialtyType
    setAuxDataSpecialty({ ..._auxDataSpecialty, [key]: value })
  }

  return (
    <>
      <Box
        sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <TextField
          size='small'
          value={value}
          sx={{ mr: 4, mb: 2.5 }}
          placeholder='Filtrar Especialidade'
          onChange={e => handleFilter(e.target.value)}
        />
        <Button sx={{ mb: 2.5 }} variant='contained' onClick={handleDialogToggle}>
          + NOVA ESPECIALIDADE
        </Button>
      </Box>

      <Dialog fullWidth maxWidth='sm' onClose={handleDialogToggle} open={open}>
        <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1 }}>Cadastro de Especialidade</DialogTitle>

        <DialogContent sx={{ mt: 4, mb: -5 }}>
          <Typography variant='body2'>Essas Especialidades serão usadas pela Clínica nos procedimentos</Typography>
        </DialogContent>

        <DialogContent>
          <Grid container spacing={3} sx={{mt: 0}}>
             <Grid item xs={6}>
              <TextField
                fullWidth
                label='Nome da Especialidade'
                placeholder='Digite o nome da Especialidade'
                value={auxDataSpecialty?.name ?? ''}
                onChange={e => handleAuxSpecialtyData('name', e.target.value)}
              />
             </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Descrição da Especialidade'
                placeholder='Digite uma descrição da Especialidade'
                value={auxDataSpecialty?.description ?? ''}
                onChange={e => handleAuxSpecialtyData('description', e.target.value)}
              />
             </Grid>

            <Grid item xs={6}>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={auxDataSpecialty?.active ?? false} 
                    onChange={e => handleAuxSpecialtyData('active', e.target.checked)} 
                    />
                  } 
                label='Ativo' 
                />
             </Grid>
                <Grid item sx={{ mt: 2 }}>
                  <Button type='reset' size='large' variant='outlined' color='error' onClick={handleDialogToggle} sx={{ mr: 3 }}>
                      Cancelar
                    </Button>
                    <Button size='large' variant='outlined' onClick={handleSave}>
                      Salvar
                    </Button> 
                </Grid>

          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TableHeader
