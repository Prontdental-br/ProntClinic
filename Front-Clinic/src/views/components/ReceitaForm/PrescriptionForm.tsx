import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Grid,
  DialogActions,
  CircularProgress,
  Link,
  DialogContentText,
  Typography,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import api from 'src/@core/components/api-client'
import { UserDataType } from 'src/context/types'
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

interface PrescriptionFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (prescriptions: PrescriptionType[]) => void
  onPrescriptionsChange?: (prescriptions: PrescriptionType[]) => void
  editingData: null | any
}

type PrescriptionType = {
  id: number
  professional: string
  medicamento: string
  measure?: string
  quantity?: string
  dosage?: string
  quantidade: string
  medida: string
  posologia: string
  duration: string
  speciality: string
  cro: string
  typeCr: string
  observation: string
  cpf: string
  title: string
}

interface Medicines {
  name: string
  usage: string
  bula?: string
}

interface RegisterDocument {
  id: string
  accountId: string
  title: string
  description: string
  description1: string
  type: string
  active: boolean
  userCreated: string | null
  userUpdated: string | null
  createdAt: string
  updatedAt: string
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ open, onClose, onSubmit, editingData }) => {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<PrescriptionType[]>([])
  const [medicines, setMedicines] = useState<Medicines[]>([])
  const [loadingMedicines, setLoadingMedicines] = useState(false)
  const [bula, setBula] = useState('')
  const [showDialog, setShowDialog] = useState(open)
  const [dialogMessages, setDialogMessages] = useState<string[]>([])
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [prescriptionIdToDelete, setPrescriptionIdToDelete] = useState<number | null>(null)
  const [searchMode, setSearchMode] = useState<'api' | 'database'>('api')

  const [newPrescription, setNewPrescription] = useState<PrescriptionType>({
    id: Date.now(),
    professional: '',
    medicamento: '',
    quantidade: '',
    medida: 'default',
    posologia: '',
    duration: '',
    speciality: '',
    cro: '',
    typeCr: '',
    observation: '',
    cpf: '',
    title: ''
  })

  const router = useRouter()
  const medicineSearchRef = useRef<any>()

  const getMedicines = async (medicineName: string) => {
    setLoadingMedicines(true)
    const { data } = await api.get(`/medicines/${medicineName}`)
    setMedicines(data)
    setLoadingMedicines(false)
  }

  const getRegisteredMedicines = async () => {
    setLoadingMedicines(true)
    try {
      const { data } = await api.get<RegisterDocument[]>('/register-documents')
      const mappedMedicines = data.map(doc => ({
        name: doc.title,
        usage: doc.description,
        bula: doc.description1
      }))
      setMedicines(mappedMedicines)
    } catch (error) {
      console.error('Erro ao buscar medicamentos cadastrados:', error)
      toast.error('Erro ao carregar medicamentos cadastrados.')
    } finally {
      setLoadingMedicines(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'observation' && prescriptions.length > 0) {
      setPrescriptions(prevState => {
        const prevData = [...prevState]
        prevData[0].observation = value

        return prevData
      })
    }
    if (name === 'medicamento' && value.length >= 4 && searchMode === 'api') {
      if (medicineSearchRef.current) {
        clearTimeout(medicineSearchRef.current)
      }
      medicineSearchRef.current = setTimeout(() => {
        getMedicines(value)
      }, 1000)
    }
    setNewPrescription({ ...newPrescription, [name]: value })
  }

  const handleSelectChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    const name = event.target.name as keyof typeof newPrescription
    setNewPrescription({
      ...newPrescription,
      [name]: event.target.value as string
    })
  }

  const handleMedicineSelect = (medicine: Medicines) => {
    const isUsageUrl = medicine.usage && (medicine.usage.startsWith('http://') || medicine.usage.startsWith('https://'))
    let newBula = ''
    let newPosologia = ''

    if (isUsageUrl) {
      newBula = medicine.usage
      newPosologia = ''
    } else {
      newPosologia = medicine.usage || ''
    }

    if (medicine.bula) {
      newBula = medicine.bula
    }

    setNewPrescription(prevState => ({
      ...prevState,
      medicamento: medicine.name,
      posologia: newPosologia,
      observation: medicine.bula || prevState.observation || ''
    }))

    setBula(newBula)

    if (searchMode === 'api') {
      setMedicines([])
    }
  }

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { ...newPrescription, id: Date.now() }])
    setNewPrescription({ ...newPrescription, medicamento: '', quantidade: '', posologia: '', duration: '' })
  }

  const handleDeletePrescription = (id: number) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id))
    toast.success('Prescrição excluída com sucesso!')
  }

  const handleOpenDeleteModal = (id: number) => {
    setPrescriptionIdToDelete(id)
    setOpenDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (prescriptionIdToDelete !== null) {
      handleDeletePrescription(prescriptionIdToDelete)
      setOpenDeleteModal(false)
      toast.success('Prescrição excluída com sucesso!')
      setPrescriptionIdToDelete(null)
    }
  }

  const getProfessionalData = async (email: string) => {
    try {
      const { data } = await api.get('/professionals/email/' + email)
      if (typeof data === 'object') {
        setNewPrescription(prevState => ({
          ...prevState,
          cro: data.cro,
          speciality: data.specialty,
          typeCr: data.typeCr,
          professional: data.name,
          cpf: data.cpf
        }))
      }
    } catch (error) {
      toast.error('Não foi possível carregar os dados do profissional.')
    }
  }

  useEffect(() => {
    if (user?.email) {
      getProfessionalData(user?.email)
    }
  }, [user?.email])

  useEffect(() => {
    if (open) {
      const messages: string[] = []
      if (!newPrescription.cro) messages.push('Verifique se a inscrição está preenchida')
      if (!newPrescription.speciality) messages.push('Verifique se a especialidade está preenchida')
      if (!newPrescription.professional) messages.push('Verifique se o nome está preenchido')
      if (!newPrescription.typeCr) messages.push('Verifique se o tipo de inscrição está preenchido')
      if (!newPrescription.cpf) messages.push('Verifique se o cpf está preenchido')

      if (messages.length > 0) {
        setDialogMessages(messages)
        setShowValidationDialog(true)

        return
      }
      setShowDialog(true)
    } else {
      onClose()
      setShowDialog(false)
    }
  }, [open])

  useEffect(() => {
    if (editingData !== null) {
      setNewPrescription(prevState => ({
        ...prevState,
        professional: editingData.professional,
        speciality: editingData.speciality,
        observation: editingData.observation
      }))
      setPrescriptions([editingData, ...editingData.secondaryPrescData])
    }
  }, [editingData])

  function cleanForm() {
    setNewPrescription({
      id: Date.now(),
      professional: newPrescription.professional,
      medicamento: '',
      quantidade: '',
      medida: 'default',
      posologia: '',
      duration: '',
      speciality: newPrescription.speciality,
      cro: newPrescription.cro,
      typeCr: newPrescription.typeCr,
      observation: '',
      cpf: newPrescription.cpf,
      title: ''
    })
    setBula('')
    setPrescriptions([])
    setMedicines([])
  }

  const handleSubmit = () => {
    setLoading(true)
    const data = [...prescriptions]
    if (data[0] && data[0].observation === '') {
      data[0].observation = newPrescription.observation
    }
    onSubmit(data)
    setLoading(false)
    toast.success('Prescrição salva com sucesso!')
    cleanForm()
  }

  function handleClose() {
    cleanForm()
    onClose()
  }

  return (
    <>
      <Dialog open={showDialog} onClose={handleClose} fullWidth maxWidth='md'>
        <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1 }}>
          Cadastro de Receita
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin='none'
                label='Profissional responsável'
                variant='outlined'
                name='professional'
                value={newPrescription.professional}
                disabled={true}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin='none'
                label='Especialidade'
                variant='outlined'
                name='speciality'
                value={newPrescription.speciality}
                disabled={true}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label='Tipo de inscrição'
                margin='none'
                fullWidth
                select
                value={newPrescription?.typeCr}
                name='typeCr'
                onChange={(e: any) => handleInputChange(e)}
                disabled={true}
              >
                <MenuItem value=''></MenuItem>
                <MenuItem value='cro'>CRO</MenuItem>
                <MenuItem value='crm'>CRM</MenuItem>
                <MenuItem value='crefito'>CREFITO</MenuItem>
                <MenuItem value='crbm'>CRBM</MenuItem>
                <MenuItem value='crf'>CRF</MenuItem>
                <MenuItem value='coren'>COREN</MenuItem>
                <MenuItem value='crn'>CRN</MenuItem>
                <MenuItem value='crbio'>CRBio</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin='none'
                label='Inscrição'
                variant='outlined'
                name='cro'
                value={newPrescription.cro}
                disabled={true}
                onChange={handleInputChange}
              />
            </Grid>
            {/*             <Grid item xs={4}>
              <TextField
                fullWidth
                margin='none'
                label='Título da Receita'
                variant='outlined'
                name='title'
                value={newPrescription.title}
                onChange={handleInputChange}
              />
            </Grid> */}
            {/*             <Grid item xs={12}>
              <TextField
                fullWidth
                margin='none'
                label='Observações Gerais'
                variant='outlined'
                name='observation'
                value={newPrescription.observation}
                onChange={handleInputChange}
              />
            </Grid> */}
            <Grid item xs={12}>
              <Tabs
                value={0}
                variant='fullWidth'
                indicatorColor='primary'
                textColor='primary'
                aria-label='tabs'
                sx={{ marginBottom: 4 }}
              >
                <Tab label='Medicamentos' />
              </Tabs>
            </Grid>
            <Grid item xs={12}>
              <FormControl component='fieldset'>
                <RadioGroup
                  row
                  value={searchMode}
                  onChange={e => {
                    setSearchMode(e.target.value as 'api' | 'database')
                    setMedicines([])
                    setNewPrescription({ ...newPrescription, medicamento: '', posologia: '' })
                    if (e.target.value === 'database') {
                      getRegisteredMedicines()
                    }
                  }}
                >
                  <FormControlLabel value='api' control={<Radio />} label='Buscar medicamentos' />
                  <FormControlLabel value='database' control={<Radio />} label='Buscar medicamentos cadastrados' />
                </RadioGroup>
              </FormControl>
            </Grid>
            {searchMode === 'api' ? (
              <Grid position={'relative'} item xs={12}>
                <InputLabel style={{ marginBottom: '3px' }}>Informar as 4 primeiras letras do medicamento</InputLabel>
                <TextField
                  name='medicamento'
                  label='Nome do medicamento'
                  fullWidth
                  margin='none'
                  value={newPrescription.medicamento}
                  onChange={handleInputChange}
                />
                {loadingMedicines && <CircularProgress size={24} sx={{ position: 'absolute', right: 10, top: 40 }} />}
                {medicines.length > 0 && (
                  <Grid
                    zIndex={3}
                    gap={1}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'absolute',
                      width: '100%',
                      top: '65px'
                    }}
                  >
                    {medicines.map((element, index) => (
                      <Button
                        fullWidth
                        onClick={() => handleMedicineSelect(element)}
                        variant='contained'
                        key={element.name}
                      >
                        {`${element.name}`}
                      </Button>
                    ))}
                  </Grid>
                )}
                {bula !== '' && bula.startsWith('https') && (
                  <Link href={bula} target='_blank'>
                    Baixar bula
                  </Link>
                )}
              </Grid>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Selecione um medicamento</InputLabel>
                  <Select
                    name='medicamento'
                    value={newPrescription.medicamento}
                    onChange={event => {
                      const selectedMedicine = medicines.find(m => m.name === event.target.value)
                      if (selectedMedicine) {
                        handleMedicineSelect(selectedMedicine)
                      } else {
                        setNewPrescription(prevState => ({
                          ...prevState,
                          medicamento: '',
                          posologia: '',
                          observation: ''
                        }))
                        setBula('')
                      }
                    }}
                    label='Selecione um medicamento'
                  >
                    {loadingMedicines ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      medicines.map((element, index) => (
                        <MenuItem key={index} value={element.name}>
                          {element.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                {bula !== '' && bula.startsWith('https') && (
                  <Link href={bula} target='_blank'>
                    Baixar bula
                  </Link>
                )}
              </Grid>
            )}
            <Grid item xs={4}>
              <TextField
                name='quantidade'
                label='Quantidade'
                type='number'
                fullWidth
                margin='none'
                value={newPrescription.quantidade}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth margin='none'>
                <Select name='medida' value={newPrescription.medida} onChange={(e: any) => handleSelectChange(e)}>
                  <MenuItem value='default' disabled>Forma Administração</MenuItem>
                  <MenuItem value='capsula'>Cápsula</MenuItem>
                  <MenuItem value='comprimido'>Comprimido</MenuItem>
                  <MenuItem value='creme'>Creme</MenuItem>
                  <MenuItem value='dose'>Dose</MenuItem>
                  <MenuItem value='gel'>Gel</MenuItem>
                  <MenuItem value='injetavel'>Injetável</MenuItem>
                  <MenuItem value='liquido'>Líquido</MenuItem>
                  <MenuItem value='pomada'>Pomada</MenuItem>
                  <MenuItem value='solucao-oral'>Solução oral</MenuItem>
                  <MenuItem value='supositorio'>Supositório</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                name='duration'
                label='Duração'
                fullWidth
                margin='none'
                value={newPrescription.duration}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name='posologia'
                label='Posologia'
                fullWidth
                margin='none'
                value={newPrescription.posologia}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name='observation'
                fullWidth
                label='Observação do Medicamento'
                margin='none'
                value={newPrescription.observation}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
          <Grid display={'flex'} alignItems={'center'} justifyContent={'space-between'} flexWrap={'wrap'} gap={'2px'}>
            <Button style={{ height: '3em' }} variant='contained' onClick={handleAddPrescription} sx={{ mt: 3 }}>
              Adicionar à receita
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Tabs
              value={0}
              variant='fullWidth'
              indicatorColor='primary'
              textColor='primary'
              aria-label='tabs'
              sx={{ marginBottom: 4 }}
            >
              <Tab label='Adicionados à receita' />
            </Tabs>
          </Grid>
          <List>
            {prescriptions.map((prescription, index) => (
              <ListItem key={prescription.id}>
                <ListItemText
                  primary={prescription.medicamento}
                  secondary={`Quantidade: ${prescription.quantidade ?? prescription.quantity}, Medida: ${
                    prescription.medida ?? prescription.measure
                  }, Posologia: ${prescription.posologia ?? prescription.dosage}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge='end' aria-label='delete' onClick={() => handleOpenDeleteModal(prescription.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='error'>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color='primary' variant='outlined' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showValidationDialog} onClose={() => setShowValidationDialog(false)}>
        <DialogTitle>Sem permissão para emitir receita</DialogTitle>
        <DialogContent dividers>
          <List>
            {dialogMessages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText primary={msg} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography>Contate um administrador para liberar o acesso as receitas</Typography>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta prescrição? Esta ação não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)} color='primary'>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained'>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PrescriptionForm
