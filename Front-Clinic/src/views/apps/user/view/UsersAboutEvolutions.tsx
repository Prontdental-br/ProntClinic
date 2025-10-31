// ** React Imports
import { MouseEvent, forwardRef, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Button from '@mui/material/Button'

import MenuItem from '@mui/material/MenuItem'

import CardHeader from '@mui/material/CardHeader'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import SpeedIcon from '@mui/icons-material/Speed'
import CircularProgress from '@mui/material/CircularProgress'

import Grid from '@mui/material/Grid'
import {
  Alert,
  AlertColor,
  Box,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'
import { ContentState, EditorState, convertToRaw } from 'draft-js'
import { EvolutionDataType, EvolutionResponseDataType } from 'src/types/apps/evolutionType'

import { fetchData as fetchDataProfessional } from 'src/store/apps/professional'
import { fetchData, deleteEvolution, addEvolution } from 'src/store/apps/evolution'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from 'src/store'
import moment from 'moment'
import SelectMenuItem from 'src/@core/components/select-menu-item'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import api from 'src/@core/components/api-client'
import { PlanScore } from 'src/views/components/QueryScore/PlanScore'
import { ModalQueryScore } from 'src/views/components/QueryScore/ModalQueryScore'
import { ButtonScore } from 'src/views/components/QueryScore/ButtonScore'
import Link from 'next/link'
import { clearNumber } from 'src/@core/utils/format'
import YouTubeIcon from '@mui/icons-material/YouTube'

import PrintIcon from '@mui/icons-material/Print'
import OptionsMenu from 'src/@core/components/option-menu'

import crypto from 'crypto'
import YouTube from 'react-youtube'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { AutocompleteWithAddButton } from 'src/views/components/AutocompleteWithAddButton'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { EventDateType } from 'src/types/apps/calendarTypes'
import { ProfessionalDataType } from 'src/types/apps/userTypes'
import { NotificationsActiveOutlined } from '@mui/icons-material'

interface Props {
  patientId: string
  patientCPF: string
  patientPhone: string
  patientName: string
}

const ITEM_HEIGHT = 42
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      width: 250,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}

interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

const schema = yup.object().shape({
  treatmentId: yup.string().required('Campo obrigatório'),
  return: yup.string().required('Selecione o aviso de retorno')
})

const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
  return (
    <TextField
      inputRef={ref}
      fullWidth
      {...props}
      label={props.label || ''}
      sx={{ width: '100%' }}
      error={props.error}
    />
  )
})

interface ProfessionalType {
  id: string
  name: string
  specialty: string
}

const AboutEvolutions = ({ patientId, patientCPF, patientPhone, patientName }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [evolutionSelected, setEvolutionSelected] = useState<EvolutionDataType>()
  const [selectedProfessional, setSelectedProfessional] = useState('')
  const [professionals, setProfessionals] = useState<ProfessionalType[]>([])
  const [dateEvolucao, setDateEvolucao] = useState(new Date())
  const [openModalScore, setOpenModalScore] = useState<boolean>(false)
  const [openModalPlanScore, setOpenModalPlanScore] = useState<boolean>(false)
  const [scoreCredit, setScoreCredit] = useState<number | null>(null)
  const [messageValue, setMessageValue] = useState(EditorState.createEmpty(undefined))
  const [scoreList, setScoreList] = useState<any[]>([])
  const [openModalDetailsScore, setOpenModalDetailsScore] = useState<boolean>(false)
  const storeEvolution = useSelector((state: RootState) => state.evolution)
  const storeProfessional = useSelector((state: RootState) => state.professional)
  const [openModalVideo, setOpenModalVideo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openWhatsAppDialog, setOpenWhatsAppDialog] = useState(false)
  const [openModalConfirmReturn, setOpenModalConfirmReturn] = useState<boolean>(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [evolutionToDelete, setEvolutionToDelete] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedMonth, setSelectedMonth] = useState((moment().month() + 1).toString().padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(moment().year().toString())
  const [user, setUser] = useState<any>({})
  const [patientTreatments, setPatientTreatments] = useState<any>([])
  const [avisoRetornos, setAvisoRetornos] = useState('')
  const [values, setValues] = useState({
    start: new Date(),
    end: new Date(),
    allDay: false
  })

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        if (patientId) {
          const { data } = await api.get(`/budget-items?patientId=${patientId}`)

          // const pendingTreatments = data.filter((item: any) => item.status !== 'done')

          setPatientTreatments(data)
        }
      } catch (error) {
        console.error('Erro ao buscar tratamentos do paciente:', error)
      }
    }

    fetchDataAsync()
  }, [])

  const router = useRouter()

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')

  const isAdmin = userData?.isAdmin
  const professionalPermission = userData?.professional?.canAccessPlans ?? false

  const hasPermissionToConsult = !(isAdmin || professionalPermission)

  const toggleVideo = () => {
    setOpenModalVideo(true)
  }

  const fetchOptionsProfessional = async (searchText: string) => {
    try {
      // dispatch(fetchDataProfessional())

      const data = storeProfessional.data
        .filter((item: ProfessionalDataType) => item.specialty !== 'recepcionista')
        .map((item: ProfessionalDataType) => {
          return {
            id: item.id,
            name: item.name
          }
        })

      return data
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const defaultValues = {
    treatmentId: '',
    return: ''
  }

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues, resolver: yupResolver(schema), mode: 'onSubmit' })

  const fetchListScore = async () => {
    try {
      if (patientId) {
        const { data } = await api.get(`score-consultations/all/${patientId}`)
        setScoreList(data)
      }
    } catch (error) {
      console.error('Error fetching score list:', error)
    }
  }

  useEffect(() => {
    fetchListScore()
  }, [patientId])

  const getClassLabel = (classValue: number): string => {
    const classMap: { [key: number]: string } = {
      0: 'A',
      1: 'B',
      2: 'C',
      3: 'D',
      4: 'E'
    }

    return classMap[classValue] || 'N/A' // Retorna 'N/A' se o valor não for mapeado
  }

  const fetchClinicData = async () => {
    const idClinic = userData.clinicId

    const { data } = await api.get(`/clinics/${idClinic}`)

    if (data) {
      setScoreCredit(data.scoreCredit)
    }
  }

  const autocompleteWithAddButtonProfessionalRef = useRef<any>(null)

  let dateStart: string
  let dateEnd: string

  if (!selectedDate) {
    dateStart = moment()
      .month(Number.parseInt(selectedMonth) - 1)
      .year(Number.parseInt(selectedYear))
      .startOf('month')
      .format('YYYY-MM-DD')

    dateEnd = moment()
      .month(Number.parseInt(selectedMonth) - 1)
      .year(Number.parseInt(selectedYear))
      .endOf('month')
      .format('YYYY-MM-DD')
  } else {
    dateStart = moment(selectedDate).format('YYYY-MM-DD')
    dateEnd = moment(selectedDate).format('YYYY-MM-DD')
  }

  const handleStart = (date: Date) => {
    setValues(prevValues => ({ ...prevValues, start: date }))
  }

  const handleAddProfessional = () => {
    router.push('/pages/account-settings/security/')
  }

  const onSubmit = async (data: any) => {
    if (!data.treatmentId) return

    const [value, type] = data.return.split('-')

    try {
      const payload = {
        treatmentId: data.treatmentId,
        startDate: values.start,
        returnValue: Number(value),
        returnType: type as 'D' | 'M',
        patientId: patientId
      }

      await api.post('/return-list', payload)

      setOpenModalConfirmReturn(false)
      reset(defaultValues)
      setValues({
        start: new Date(),
        end: new Date(),
        allDay: false
      })

      toast.success('Retorno cadastrado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar retorno:', error)
      toast.error('Não foi possível salvar o retorno')
    }
  }

  useEffect(() => {
    fetchClinicData()
  }, [])

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchData(patientId))
  }, [dispatch, patientId])

  useEffect(() => {
    dispatch(fetchDataProfessional())
  }, [dispatch])

  useEffect(() => {
    const data = storeProfessional?.data
      ?.filter((item: ProfessionalType) => {
        return item.specialty?.toLowerCase() !== 'recepcionista'
      })
      .map((item: ProfessionalType) => ({
        id: item.id,
        name: item.name,
        specialty: item.specialty
      }))

    setProfessionals(data || [])
  }, [storeProfessional.data])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const createHashDoc = (data: string) => {
    const hash = crypto.createHash('sha256')
    hash.update(data)
    const hashResult = hash.digest('hex')

    return hashResult
  }

  const handlePrintEvolutionContract = async (row: any) => {
    if (row.id) {
      const { data } = await api.get(`/contracts-signature/docId/${row.id}`)

      if (data) {
        window.open(`/evolution/print/${row.id}`, '_blank')

        return
      }

      const hashDoc = createHashDoc(row.description)

      await api.post('/contracts-signature', {
        documentType: 'evolucao',
        hashDoc,
        documentId: row.id
      })

      fetchData(patientId)

      window.open(`/evolution/print/${row.id}`, '_blank')
    } else {
      console.log('Nenhum documentId retornado da criação da evolução')
    }
  }

    const handleOpenDeleteModal = (id: any) => {
        setEvolutionToDelete(id);
        setOpenDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (evolutionToDelete) {
            dispatch(deleteEvolution(evolutionToDelete));
            setOpenDeleteModal(false);
            setEvolutionToDelete(null);
        }
    };

  const handleEmitEvolutionContract = async (row: any) => {
    if (row.id) {
      const { data } = await api.get(`/contracts-signature/docId/${row.id}`)

      if (data) {
        return
      }

      const hashDoc = createHashDoc(row.description)

      await api.post('/contracts-signature', {
        documentType: 'evolucao',
        hashDoc,
        documentId: row.id
      })

      fetchData(patientId)
    } else {
      console.log('Nenhum documentId retornado da criação da evolução')
    }
  }

  const [alert, setAlert] = useState<{ message: string; severity: AlertColor }>({ message: '', severity: 'info' })
  const [showAlert, setShowAlert] = useState(false)

  const handleClickEmail = async (row: any) => {
    handleEmitEvolutionContract(row)

    if (!row.patient.email) {
      setAlert({ message: `O paciente ${row.patient.name} não possui e-mail para envio.`, severity: 'error' })
    } else {
      const response = await api.post('/evolutions/send/email', { contractId: row.id, email: row.patient.email })

      console.log(response.data)

      if (response.data) {
        setAlert({ message: 'Evolução enviada com sucesso!', severity: 'success' })
      }
    }

    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  const handleEmitWhatsApp = async (row: any) => {
    if (row.id) {
      const { data } = await api.get(`/contracts-signature/docId/${row.id}`)

      const message = encodeURI(`Acesse sua evolução: ${process.env.NEXT_PUBLIC_URL_FRONT}/evolution/print/${row.id}`)

      if (data) {
        return window.open(
          `https://wa.me/55${clearNumber(row.patient.cellPhone ? row.patient.cellPhone : '')}?text=${message}`,
          '_blank'
        )
      }

      const hashDoc = createHashDoc(row.description)

      await api.post('/contracts-signature', {
        documentType: 'evolucao',
        hashDoc,
        documentId: row.id
      })

      fetchData(patientId)

      return window.open(
        `https://wa.me/55${clearNumber(row.patient.cellPhone ? row.patient.cellPhone : '')}?text=${message}`,
        '_blank'
      )
    } else {
      console.log('Nenhum documentId retornado da criação da evolução')
    }
  }

  const handleSendWhatsApp = async (row: any) => {
    try {
      setLoading(true)

      const message = `👋 Olá ${row.patient.name}!

Você está recebendo o sua Evolução para assinatura digital através do sistema *Cláiris IA Software*.

Para assinar, basta clicar no link abaixo. Você será direcionado para uma página segura onde poderá revisar e confirmar sua assinatura online.

📄 *Link para assinatura:* ${process.env.NEXT_PUBLIC_URL_FRONT}/evolution/print/${row.id}

Caso tenha qualquer dúvida, nossa equipe está à disposição para ajudar.

*Cláiris IA Software – Clareza e agilidade para sua rotina!*`

      const phone = patientPhone

      if (!message || !phone) {
        toast.error('Mensagem ou telefone não encontrados')
        setLoading(false)

        return
      }

      const { data: contract } = await api.get(`/contracts-signature/docId/${row.id}`)

      if (!contract) {
        const hashDoc = createHashDoc(row.description)

        await api.post('/contracts-signature', {
          documentType: 'evolucao',
          hashDoc,
          documentId: row.id
        })

        fetchData(row.patient.id)
      }

      const { data } = await api.get('/whatsapp')
      const connection = data?.data?.[0]

      if (!connection || !connection.isConnected) {
        setOpenWhatsAppDialog(true)
        setLoading(false)

        return
      }

      await api.post('/whatsapp/send-message', {
        message,
        phone,
        delay: 0
      })

      setLoading(false)
      toast.success('Mensagem enviada com sucesso!')
    } catch (err) {
      console.error(err)
      setLoading(false)
      toast.error('Erro ao enviar mensagem via WhatsApp')
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleViewClickOpen = (evolution: any) => {
    setEvolutionSelected(evolution)
    setOpenEdit(true)
  }

  const handleEditClose = () => setOpenEdit(false)

  const clearEditorContent = () => {
    const emptyContentState = ContentState.createFromText('')
    const newEditorState = EditorState.createWithContent(emptyContentState)
    setMessageValue(newEditorState)
    setSelectedProfessional('')
    setDateEvolucao(new Date())
  }

  const handleAddEvolution = () => {
    const description = getEvolutionDescription(messageValue.getCurrentContent())

    if(!selectedProfessional) {
      setAlert({ message: 'Selecione um profissional!', severity: 'error' });
      
return;
    }

    if(!description) {
      setAlert({ message: 'Escreva a evolução!', severity: 'error' });
      
      return;
    }

    setLoading(true);
    dispatch(
      addEvolution({
        professionalId: selectedProfessional,
        patientId: patientId,
        dateEvolution: moment(dateEvolucao).format('YYYY-MM-DDTHH:mm:ss.sss'),
        description: description
      })
    ).then(() => {
        clearEditorContent();
        setLoading(false);
        
return toast.success('Evolução adicionada com sucesso!');
    });
  }

  const getEvolutionDescription = (content: ContentState) => {
    const contentAsRaw = convertToRaw(content)

    return contentAsRaw.blocks.map(block => block.text).join('\\n')
  }

  const handleDateEvolution = (date: Date) => {
    setDateEvolucao(new Date(date))
  }

  const handleCloseModalScore = () => {
    setOpenModalScore(false)
    fetchListScore()
    fetchClinicData()
  }

  const handleOpenModalScore = () => {
    if (scoreCredit ? scoreCredit : 0 > 0) {
      return setOpenModalScore(true)
    }
    setOpenModalPlanScore(true)
  }

  const handleOpenDetailsScore = () => {
    setOpenModalDetailsScore(!hasPermissionToConsult)
  }

  const getChipData = (isSigned: boolean): { color: 'default' | 'success' | 'warning' | 'error'; label: string } => {
    if (isSigned) {
      return { color: 'success', label: 'Assinado' }
    }

    return { color: 'warning', label: 'Pendente' }
  }

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 1
    }
  }

  const handleCloseModalVideo = () => {
    setOpenModalVideo(false)
  }

  const handleCloseModalConfirmReturn = () => {
    setOpenModalConfirmReturn(false)
    setValues({
      start: new Date(),
      end: new Date(),
      allDay: false
    })
  }

  return (
    <Grid container spacing={4}>
      <PlanScore open={openModalPlanScore} setClose={() => setOpenModalPlanScore(false)} />
      <ModalQueryScore
        open={openModalScore}
        patientCPF={patientCPF}
        patientId={patientId}
        setClose={handleCloseModalScore}
      />
      <Grid item xs={12}>
        <Card>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '1rem' }}>
            <CardHeader title='Adicionar Evolução do Paciente' />
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: { xs: 'column', sm: 'row' } }}
            >
              {/* {scoreList.length >= 1  && (
                <IconButton size='small'
                  onClick={()=> handleOpenDetailsScore()}
                  style={{
                    cursor: `${hasPermissionToConsult ? 'not-allowed' : 'pointer'} `,
                  }}
                
                >
                     <Icon icon='mdi:eye-outline' />
                </IconButton>
              )} */}

              <Button
                variant='contained'
                onClick={() => setOpenModalConfirmReturn(true)}
                style={{
                  backgroundColor: '#0dad6aff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textTransform: 'none'
                }}
              >
                Retorno
                <NotificationsActiveOutlined fontSize='small' />
              </Button>

              <Box>
                <Button sx={{ display: 'flex', alignItems: 'center' }} onClick={() => toggleVideo()}>
                  <YouTubeIcon color='error' />
                  VÍDEOS
                </Button>
              </Box>

              {/* {userData?.planType !== "S" && (
                <>
                  <ButtonScore onClick={handleOpenModalScore} disabled={hasPermissionToConsult}>
                      <SpeedIcon />
                      Consulta Score
                  </ButtonScore>
                <p style={{ 
                    fontSize: '15px', 
                    color: '#5A5FE0', 
                    fontWeight: '600', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    margin: 0,
                    padding: 0,
                    textAlign: 'center'
                  }}>
                  {scoreCredit ? scoreCredit : 0} 
                  <span style={{ fontSize: '11px' }}>
                    {scoreCredit === 1 ? 'Consulta' : 'Consultas'}
                  </span>
                </p>
              </>
              )} */}
            </Box>
          </Box>
          <CardContent>
          {alert.message && (
              <Alert 
                  severity={alert.severity} 
                  onClose={() => setAlert({ message: '', severity: 'info' })}
                  sx={{ mb: 8, mx: 4 }}
              >
                  {alert.message}
              </Alert>
          )}
            <form onSubmit={e => e.preventDefault()}>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SelectMenuItem
                      options={professionals}
                      label={'Profissional'}
                      value={selectedProfessional}
                      onChange={function (item: SelectChangeEvent<string>): void {
                        setSelectedProfessional(item.target.value)
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePickerWrapper>
                    <FormControl fullWidth>
                      <DatePicker
                        selectsStart
                        id='evolution-date'
                        endDate={undefined}
                        selected={dateEvolucao}
                        startDate={undefined}
                        showTimeSelect={false}
                        dateFormat={'dd-MM-yyyy'}
                        customInput={<PickersComponent label='Data da Evolução' registername='start' />}
                        onChange={(date: Date) => setDateEvolucao(new Date(date))}
                        onSelect={handleDateEvolution}
                      />
                    </FormControl>
                  </DatePickerWrapper>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <EditorWrapper
                    sx={{
                      '& .rdw-editor-wrapper': {
                        border: '1 !important'
                      },
                      '& .rdw-editor-toolbar': {
                        p: '0.35rem 1rem !important',
                        '& .rdw-option-wrapper': {
                          minWidth: '1.25rem',
                          borderRadius: '4px !important'
                        },
                        '& .rdw-inline-wrapper, & .rdw-text-align-wrapper': {
                          mb: 0
                        }
                      },
                      '& .rdw-editor-main': {
                        px: '1.25rem'
                      }
                    }}
                  >
                    <ReactDraftWysiwyg
                      editorState={messageValue}
                      onEditorStateChange={editorState => setMessageValue(editorState)}
                      placeholder='Digite a Evolução'
                      toolbarHidden={true}
                    />
                  </EditorWrapper>
                </Grid>
                <Grid item xs={12}>
                  <CardActions>
                    <Button variant='contained' onClick={() => handleAddEvolution()} disabled={loading}>
                      {loading ? <CircularProgress size={24} /> : 'Adicionar'}
                    </Button>
                    <Button color='error' variant='outlined' sx={{ marginLeft: '8px' }}>
                      Cancelar
                    </Button>
                  </CardActions>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Evoluções'
            sx={{ '& .MuiCardHeader-action': { m: 0 } }}
            action={
              <>
                {/* <Button
                  variant='contained'
                  aria-haspopup='true'
                  onClick={handleClick}
                  aria-expanded={open ? 'true' : undefined}
                  endIcon={<Icon icon='mdi:chevron-down' />}
                  aria-controls={open ? 'user-view-overview-export' : undefined}
                >
                  Exportar
                </Button>
                <Menu open={open} anchorEl={anchorEl} onClose={handleClose} id='user-view-overview-export'>
                  <MenuItem onClick={handleClose}>PDF</MenuItem>
                  <MenuItem onClick={handleClose}>XLSX</MenuItem>
                  <MenuItem onClick={handleClose}>CSV</MenuItem>
                </Menu> */}
              </>
            }
          />
          {showAlert && (
            <Alert sx={{ mb: 2, mt: 4 }} severity={alert.severity}>
              {alert.message}
            </Alert>
          )}
          <CardContent>
            {/* Card list */}
            <Grid item xs={12}>
              {storeEvolution.data.map((evolution: EvolutionResponseDataType) => {
                const { color, label } = getChipData(evolution?.isSigned)

                return (
                  <Card key={evolution.id} sx={{ marginBottom: '10px' }}>
                    <CardHeader
                      title={evolution.professional.name}
                      subheader={moment(evolution.dateEvolution).utc().format('DD/MM/YYYY')}
                      action={
                        <CardActions>
                          {userData?.planType !== 'E' && (
                            <Chip label={label} color={color} sx={{ textTransform: 'capitalize' }} />
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {userData?.planType !== 'E' && (
                              <Tooltip title='Assinar Evolução Email'>
                                <IconButton size='small' onClick={() => handleClickEmail(evolution)}>
                                  <Icon icon='mdi:email' fontSize={20} />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Box sx={{ display: 'flex', marginRight: 1 }}>
                              {/* <Tooltip title='Visualizar'>
                                <IconButton size='small'>
                                  <Icon icon='mdi:eye-outline' fontSize={20} />
                                </IconButton>
                              </Tooltip> */}

                              {/* <Tooltip title='editar'>
                                  <IconButton
                                    size='small'
                                    component={Link}
                                    href={
                                      getGraphType({...row, budgetTreatments: row.budgetItems}) === 'estetica'
                                        ? `/budget/face/?id=${row.id}`
                                        : `/budget/odont/?id=${row.id}`}>
                                    <Icon icon='mdi:pencil-outline' fontSize={20} />
                                  </IconButton>
                                </Tooltip> */}

                              {userData?.planType !== 'E' && (
                                <Tooltip title='Assinar Evolução WhatsApp'>
                                  <IconButton size='small' onClick={() => handleSendWhatsApp(evolution)}>
                                    <Icon icon='mdi:whatsapp' fontSize={20} />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title='Imprimir'>
                                <IconButton size='small' onClick={() => handlePrintEvolutionContract(evolution)}>
                                  <PrintIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        <Button variant='contained'  onClick={() => handleViewClickOpen(evolution)}>
                          Visualizar
                        </Button>
                        <Button
                          color='error'
                          variant='outlined'
                          sx={{ marginLeft: '8px' }}
                           onClick={() => handleOpenDeleteModal(evolution.id)}
                      >
                          Deletar
                      </Button>
                      </CardActions>
                    }
                  />
                  <Box sx={{ padding: '16px' }}>
                    <EditorWrapper
                      sx={{
                        '& .rdw-editor-wrapper': {
                          border: '0 !important'
                        },
                        '& .rdw-editor-toolbar': {
                          p: '0.35rem 1rem !important',
                          '& .rdw-option-wrapper': {
                            minWidth: '1.25rem',
                            borderRadius: '0px !important'
                          },
                          '& .rdw-inline-wrapper, & .rdw-text-align-wrapper': {
                            mb: 0
                          }
                        },
                        '& .rdw-editor-main': {
                          px: '1.25rem'
                        }
                      }}
                    >
                    <TextField
                      multiline
                      required
                      type="text"
                      sx={{ width: "100%", border: 0 }}
                      value={evolution.description.replace(/(\\n)/g, "\n")}
                      InputProps={{
                        readOnly: true, 
                      }}
                    />

                        {/* <ReactDraftWysiwyg
                        editorState={messageValue}
                        onEditorStateChange={editorState => setMessageValue(editorState)}
                        toolbarHidden={true}
                      /> */}
                      </EditorWrapper>
                    </Box>
                  </Card>
                )
              })}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Dialog
        open={openEdit}
        onClose={handleEditClose}
        aria-labelledby='user-view-edit'
        aria-describedby='user-view-edit-description'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}
      >
        <DialogTitle
          id='user-view-edit'
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem !important',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          Detalhes da Evolução
        </DialogTitle>
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          <DialogContentText variant='body1' id='user-view-edit-description' sx={{ mb: 7 }}>
            {evolutionSelected?.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button variant='outlined' color='secondary' onClick={handleEditClose}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openModalDetailsScore}
        onClose={() => setOpenModalDetailsScore(false)}
        aria-labelledby='item-view-edit'
        aria-describedby='item-view-edit-description'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 800 } }}
      >
        <DialogTitle
          id='item-view-edit'
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem !important',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          Detalhes da Consulta de Score <span style={{ color: '#5a5fe0', paddingLeft: '.5rem' }}>BETA</span>
        </DialogTitle>
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          <DialogContentText variant='body2' id='item-view-edit-description' sx={{ textAlign: 'center', mb: 7 }}>
            {scoreList.map((item: any, i) => (
              <div key={i} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Nome do Paciente</Typography>
                  <Typography>{item.patientName}</Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>CPF Formatado</Typography>
                  <Typography>{item.documentFormatted}</Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Score de Crédito Atual</Typography>
                  <Typography
                    sx={{
                      color:
                        item.creditScoreD00 < 300
                          ? 'red'
                          : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 600
                          ? 'orange'
                          : 'green'
                    }}
                  >
                    {item.creditScoreD00}
                  </Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Cheque sem fundo</Typography>
                  <Typography
                    sx={{
                      color:
                        item.creditScoreD00 < 300
                          ? 'red'
                          : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 600
                          ? 'orange'
                          : 'green'
                    }}
                  >
                    {item.creditScoreD00 <= 300
                      ? 'Alto Risco'
                      : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 680
                      ? 'Médio Risco'
                      : 'Baixo Risco'}
                  </Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Registros de Protesto</Typography>
                  <Typography
                    sx={{
                      color:
                        item.creditScoreD00 < 300
                          ? 'red'
                          : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 600
                          ? 'orange'
                          : 'green'
                    }}
                  >
                    {item.creditScoreD00 <= 300
                      ? 'Alto Risco'
                      : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 680
                      ? 'Médio Risco'
                      : 'Baixo Risco'}
                  </Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Renda Pessoal</Typography>
                  <Typography>
                    {item.incomePersonal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Risco de Inadimplência</Typography>
                  <Typography>
                    <Typography
                      sx={{
                        color:
                          item.creditScoreD00 < 300
                            ? 'red'
                            : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 600
                            ? 'orange'
                            : 'green'
                      }}
                    >
                      {item.creditScoreD00 <= 300
                        ? 'Alto Risco'
                        : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 680
                        ? 'Médio Risco'
                        : 'Baixo Risco'}
                    </Typography>
                  </Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Renda Familiar</Typography>
                  <Typography>
                    {item.incomeFamily?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Classe Social Pessoal</Typography>
                  <Typography>Classe Social {getClassLabel(item.incomePersonalClass)}</Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Classe Social Familiar</Typography>
                  <Typography>Classe Social {getClassLabel(item.incomeFamilyClass)}</Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Última Atualização</Typography>
                  <Typography>{new Date(item.updatedAt).toLocaleString()}</Typography>
                </div>

                <div style={{ width: '48%', marginBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Data de Criação</Typography>
                  <Typography>{new Date(item.createdAt).toLocaleString()}</Typography>
                </div>
              </div>
            ))}
          </DialogContentText>
        </DialogContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingRight: '1rem',
            padding: '.5rem',
            paddingBottom: '1rem'
          }}
        >
          <Button variant='contained' onClick={() => setOpenModalDetailsScore(false)}>
            Fechar
          </Button>
        </Box>
      </Dialog>

      <Dialog open={openModalVideo} onClose={handleCloseModalVideo} maxWidth='md' fullWidth>
        <DialogTitle>Assistir Vídeo</DialogTitle>
        <DialogContent>
          <YouTube videoId={'hZSXNHg1uNo'} opts={opts} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalVideo} color='primary'>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWhatsAppDialog} onClose={() => setOpenWhatsAppDialog(false)}>
        <DialogTitle>Conexão Necessária</DialogTitle>
        <DialogContent>
          <DialogContentText>Para enviar mensagens via WhatsApp, é necessário conectar sua conta.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWhatsAppDialog(false)} color='primary'>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              setOpenWhatsAppDialog(false)
              router.push('/pages/account-settings/connect-whatsapp')
            }}
          >
            Conectar Agora
                  </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir esta anotação? Esta ação não poderá ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteModal(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Deletar
            </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openModalConfirmReturn}
        onClose={handleCloseModalConfirmReturn}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            overflow: 'visible',
            maxHeight: '80vh'
          }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
          <Box>
            <h2>
              Paciente: <span style={{ fontSize: '1.2rem', fontWeight: 400 }}>{patientName}</span>
            </h2>
          </Box>
          <DatePickerWrapper>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
              {/* <FormControl fullWidth sx={{ mb: 6 }}>
                    <AutocompleteWithAddButton
                      fieldForm='professionalId'
                      control={control}
                      selectedItem={user['professional'] ? { id: user['professional']['id'], name: user['professional']['name'] } : selectedProfessional}
                      fetchDataOptions={fetchOptionsProfessional}
                      onAddEvent={handleAddProfessional}
                      title='Profissional'
                      ref={autocompleteWithAddButtonProfessionalRef}
                      />
                    {errors?.professionalId && (
                      <Typography color='error' variant='caption'>
                        {errors?.professionalId?.message}
                      </Typography>
                    )}
                    
                  </FormControl> */}
              <Controller
                name='treatmentId'
                control={control}
                defaultValue=''
                rules={{ required: 'Selecione o tratamento' }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth sx={{ mb: 6 }} error={!!error}>
                    <InputLabel id='select-treatment-label'>Tratamento</InputLabel>
                    <Select
                      {...field}
                      labelId='select-treatment-label'
                      id='select-treatment'
                      label='Tratamento'
                      value={field.value || ''}
                      onChange={event => {
                        field.onChange(event.target.value)
                      }}
                    >
                      {patientTreatments.map((treatmentItem: any) => (
                        <MenuItem key={treatmentItem.id} value={treatmentItem.id}>
                          {treatmentItem.treatment?.name} – R$ {Number(treatmentItem.value).toFixed(2)}
                          {treatmentItem.session > 0 && (
                            <>
                              {' '}
                              ({treatmentItem.sessionDone} / {treatmentItem.session})
                            </>
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              <Box sx={{ mb: 6 }}>
                <DatePicker
                  selectsStart
                  id='event-start-date'
                  endDate={values.end as EventDateType}
                  selected={values.start as EventDateType}
                  startDate={values.start as EventDateType}
                  showTimeSelect={!values.allDay}
                  timeIntervals={15}
                  timeFormat='HH:mm'
                  dateFormat={!values.allDay ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
                  customInput={<PickersComponent label='Data Inicial' registername='start' />}
                  onChange={(date: Date) => setValues({ ...values, start: new Date(date) })}
                  onSelect={handleStart}
                />
              </Box>
              {/* <Box sx={{ mb: 6 }}>
                    <DatePicker
                      selectsEnd
                      id='event-end-date'
                      endDate={values.end as EventDateType}
                      selected={values.end as EventDateType}
                      minDate={values.start as EventDateType}
                      startDate={values.start as EventDateType}
                      showTimeSelect={!values.allDay}
                      timeIntervals={15}
                      timeFormat='HH:mm'
                      dateFormat={!values.allDay ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
                      customInput={<PickersComponent label='Data Final' registername='end' />}
                      onChange={(date: Date) => setValues({ ...values, end: new Date(date) })}
                      />
                  </Box> */}

              <Box sx={{ mb: 6 }}>
                <Controller
                  name='return'
                  control={control}
                  defaultValue=''
                  rules={{ required: 'Selecione o aviso de retorno' }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth sx={{ mb: 6 }} error={!!error}>
                      <InputLabel id='aviso-retornos-label'>Aviso Retornos</InputLabel>
                      <Select
                        {...field}
                        labelId='aviso-retornos-label'
                        id='aviso-retornos'
                        label='Aviso Retornos'
                        value={field.value || ''}
                        onChange={event => field.onChange(event.target.value)}
                      >
                        <MenuItem value='5-D'>5 dias</MenuItem>
                        <MenuItem value='15-D'>15 dias</MenuItem>

                        {[...Array(12)].map((_, index) => (
                          <MenuItem key={index + 1} value={`${index + 1}-M`}>
                            {index + 1} {index + 1 === 1 ? 'mês' : 'meses'}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: '1rem', mt: 3, justifyContent: 'flex-end' }}>
                <Button variant='outlined' color='error' onClick={() => setOpenModalConfirmReturn(prev => !prev)}>
                  Cancelar
                </Button>

                <Button variant='outlined' color='primary' type='submit'>
                  Salvar
                </Button>
              </Box>
            </form>
          </DatePickerWrapper>
        </Box>
      </Dialog>
    </Grid>
  )
}

export default AboutEvolutions
