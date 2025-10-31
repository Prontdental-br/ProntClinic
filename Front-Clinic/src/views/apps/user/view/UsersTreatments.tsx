// TRATAMENTOS
// ** React Imports
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'

import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'

import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import DialogTitle from '@mui/material/DialogTitle'
import OutlinedInput from '@mui/material/OutlinedInput'
import DialogContent from '@mui/material/DialogContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { Autocomplete, DialogContentText, Menu, MenuItem, Modal, Select, Switch, Tooltip, styled } from '@mui/material'
import CustomChip from 'src/@core/components/mui/chip'

import { EditorState } from 'draft-js'

import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'

// ** Styled Component Imports
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'

// ** Styles
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { DataGrid } from '@mui/x-data-grid/DataGrid'
import { GridColDef, ptBR } from '@mui/x-data-grid'
import { PatientDataType, PatientTreatmentsDataType } from 'src/types/apps/userTypes'
import { ThemeColor } from 'src/@core/layouts/types'
import OptionsMenu from 'src/@core/components/option-menu'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/store'
import { getPatients, getPlans, getProfessionals, getTreatments, saveBudget, setTreatmentPatientPage } from 'src/store/apps/odontogram'
import api from 'src/@core/components/api-client'
import { CheckBox, Description } from '@mui/icons-material'
import dayjs from 'dayjs'
import { loadSpecialties, updateTreatment } from 'src/store/apps/clinics'
import { Stack } from '@mui/system'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { BudgetItemType, BudgetStatusEnum, BudgetType, PatientType, PlanType } from 'src/types/apps/budgetTypes'
import PermanentesSvgComponent from 'src/pages/budget/odont/Permanentes'
import DeciduosSvgComponent from 'src/pages/budget/odont/Deciduos'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import professional from 'src/store/apps/professional'
import toast from 'react-hot-toast'

interface Props {
  treatmentsData: PatientTreatmentsDataType[]
  // eslint-disable-next-line @typescript-eslint/ban-types
  fetchDataAsync: Function
  patientId?: string;
  dataPatient: PatientDataType
  refreshPatient: () => void
}
interface CellType {
  row: PatientTreatmentsDataType
}

interface StatusObj {
  [key: string]: {
    color: ThemeColor
  }
}

const statusObj: StatusObj = {
  CONFIRMADO: { color: 'success' },
  PENDENTE: { color: 'warning' },
  CANCELADO: { color: 'error' }
}

// Styled component for the card's action buttons
const CardActions = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '8px'
})

type ValidPatientKeys =
  | 'currentConsultationForecast'
  | 'performedInThisConsultation'
  | 'nextConsultationForecast';

type Field = {
  title: string;
  key: ValidPatientKeys;
  value: string;
};

const UsersTreatments = ({ treatmentsData, fetchDataAsync, patientId, dataPatient, refreshPatient }: Props) => {
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);
  console.log(treatmentsData)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.odontogram)
  const cItems = useRef(Array<any>())

  console.log(dataPatient);

  // ** States
  const [defaultValues, setDefaultValues] = useState<any>({ mobile: '+1(968) 819-2547' })
  const [mobileNumber, setMobileNumber] = useState<string>(defaultValues.mobile)
  const [openEditMobileNumber, setOpenEditMobileNumber] = useState<boolean>(false)
  const [treatmentsDat, setTreatmentsDat] = useState<any>([]);
  const [treatment, setTreatment] = useState<any>({});

  const [messageValue, setMessageValue] = useState(EditorState.createEmpty(undefined))

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 })

  const [idTreatment, setIdTreatment] = useState<string | number | null>(null)
  const [openModalTreatment, setOpenModalTreatment] = useState(false)

  const [openModalTreatmentDetails, setOpenModalTreatmentDetails] = useState<string | number | undefined | null>(null)

  const [viewDone, setViewDone] = useState(false);

  const [selectedItem, setSelectedItem] = useState('')

  const [specialties, setSpecialities] = useState([]);

  const [user, setUser] = useState({});

  const handleOpenCloseModal = (id: string | number | null) => {
    setIdTreatment(id)
    setOpenModalTreatment(!openModalTreatment)
  }

  // ** Var
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    setTreatmentsDat(treatmentsData.map((el: any, i: number) => Object.assign({ ...el, index: i })));
  }, [treatmentsData]);

  useEffect(() => {
    dispatch(setTreatmentPatientPage(paginationModel))
  }, [paginationModel, dispatch])


  useEffect(() => {
    if (viewDone)
      setTreatmentsDat(treatmentsData.filter((t: any) => t.status === 'done'))
    else setTreatmentsDat(treatmentsData);
  }, [viewDone])

  useEffect(() => {
    dispatch(getPatients());
    dispatch(getPlans());
    dispatch(getTreatments());
    dispatch(getProfessionals());
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    console.log(userData)
    setUser({ ...userData })

    api.get('/specialty').then(({ data }) => {
      setSpecialities(data);
    })

    document.querySelectorAll('.clickable').forEach(item => {
      item.addEventListener('click', e => {
        e.stopImmediatePropagation()
        if (!e.target) {
          return
        }

        const target = e.target as HTMLElement

        target.classList.toggle('active')

        if (target.classList.contains('active')) {
          const denteIndex = cItems.current.findIndex(cItem => cItem.description == target.dataset.dente)
          if (typeof target.dataset.dente == 'undefined') return
          if (denteIndex == -1) {
            const item: any= {
              description: target.dataset.dente as string,
              faces: []
            }

            if (typeof target.dataset.face != 'undefined') {
              item.faces.push(target.dataset.face)
              document.querySelectorAll('path[data-dente="' + target.dataset.dente + '"].is-dente').forEach(el => {
                el.classList.add('active')
              })
            }


            cItems.current.push(item)
            setSelectedItem(item.description)
          } else {
            const item = cItems.current[denteIndex]
            if (typeof target.dataset.face != 'undefined') {
              item.faces.push(target.dataset.face)
            }

            cItems.current.splice(denteIndex, 1, item)
          }
        } else {
          if (typeof target.dataset.face != 'undefined' && target.dataset.face.length > 0) {
            const denteIndex = cItems.current.findIndex(cItem => cItem.description == target.dataset.dente)
            const item = cItems.current[denteIndex]
            const faceIndex = item.faces.findIndex((face: string | undefined) => face == target.dataset.face)
            item.faces.splice(faceIndex, 1)
            cItems.current.splice(denteIndex, 1, item)
          } else {
            const denteIndex = cItems.current.findIndex(cItem => cItem.description == target.dataset.dente)
            cItems.current.splice(denteIndex, 1)
            document
              .querySelectorAll(`path[data-dente="${target.dataset.dente}"]`)
              .forEach(item => item.classList.remove('active'))
          }
        }

        //forceUpdate()
      })
    })
  }, [dispatch])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditMobileNumberClickOpen = () => setOpenEditMobileNumber(true)
  const handleEditMobileNumberClose = () => setOpenEditMobileNumber(false)

  // Handle button click inside the dialog
  const handleCancelClick = () => {
    setMobileNumber(defaultValues.mobile)
    handleEditMobileNumberClose()
  }
  const handleSubmitClick = () => {
    setDefaultValues({ ...defaultValues, mobile: mobileNumber })
    handleEditMobileNumberClose()
  }

  const updateStatus = async (id: string, status: string) => {
    const { data } = await api.patch(`/budget-items/${id}`, { status: status === 'PENDING' ? 'done' : 'PENDING' })
    console.log(data)
    fetchDataAsync();
  }

  const addTreatment = async (treatment: any) => {
    console.log(cItems)
    const { data } = await api.post(`/treatments`, treatment)
    console.log(data)
    
    return data;
  }

  async function saveBudgetOdontogram(treatment: any) {
    console.log(treatment)

    //prepare store
    const dataBudget = {} as BudgetType;

    const budgetTreatments = cItems.current
      .map((item: any) => {
        const nItem = { ...item };

        /*
        if (typeof itemObs != 'undefined') {
          nItem.statusTreatment = itemObs.status_treatment || '';
          nItem.observation = itemObs.observacao;
        }
        */

        return nItem;
      });


    dataBudget.budgetTreatments = budgetTreatments;

    //dataBudget.subtotal = treatment.value;
    dataBudget.total = treatment.total;

    //dataBudget.discount = store.totalDiscount;
    //dataBudget.downPayment = store.downPayment;
    //dataBudget.installments = store.installments;
    //dataBudget.observation = store.observation;
    dataBudget.description = treatment.description ?? '';
    dataBudget.plan = treatment.budget.plan.id;
    dataBudget.professional = treatment.budget.professional_id;
    dataBudget.patient = treatment.patientId;
    dataBudget.date = treatment.data;

    //dataBudget.status = status || store.budgetStatus;

    console.log(dataBudget)

    const data = await addTreatment({ 
      name: treatment.description, 
      description: treatment.description, 
      value: treatment.treatment.value, 
      active: true, 
      specialtyId: treatment.treatment.specialtyId,
      contraindications: '', 
      complexity: 'medium' 
    });


      const items = [{
        description: treatment.description,
        treatmentId: data.id,
        value: treatment!.value,

        //faces: item.faces && Array.isArray(item.faces) && item.faces?.length > 0 ? item.faces.join(',') : null
      }]
      console.log('items',items)

    const dataPostBudget = {
      patientId: patientId,
      observation: dataBudget.observation,
      description: dataBudget.description,
      status: 'A',
      planId: dataBudget.plan,
      professionalId: dataBudget.professional,
      items: items,
      subtotal: dataBudget.subtotal,
      total: dataBudget.total,
      installments: dataBudget.installments,
      downPayment: dataBudget.downPayment,
      discount: dataBudget.discount,
      date: dataBudget.date,
      shapesTabRegiao: dataBudget.shapesTabRegiao || null,
      shapesTabAi: dataBudget.shapesTabAi || null,
      imageCaptured: dataBudget.imageCaptured || null,
      treatmentId: data.id,
    }

    await api.post('budgets', dataPostBudget)

    setTreatment({});
    fetchDataAsync();

  }

  const handleOpenModalTreatmentDetails = (id: string | number | undefined) => {
    setOpenModalTreatmentDetails(id);
  }

  const handleCloseModalTreatmentDetails = () => {
    setOpenModalTreatmentDetails(null);
  }

  const RowOptions = ({ id, index, toggleModal, row }: { id?: string | number; index?: number; row?: any; toggleModal: (id: string | null) => void }) => {
    // ** Hooks
    const dispatch = useDispatch<AppDispatch>()

    // ** State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const rowOptionsOpen = Boolean(anchorEl)

    const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
    }

    const handleRowOptionsClose = () => {
      setAnchorEl(null)
    }

    const handleDelete = async (id: string | number | undefined) => {
      handleRowOptionsClose()
      await api.delete(`/budget-items/${id}`);
      setTreatmentsDat(treatmentsDat.filter((t: any) => t.id !== id));
    }
    const url = `/patient/view/about/${id}`

    return (
      <>
        <IconButton size='small' onClick={handleRowOptionsClick}>
          <Icon icon='mdi:dots-vertical' />
        </IconButton>
        <Menu
          keepMounted
          anchorEl={anchorEl}
          open={rowOptionsOpen}
          onClose={handleRowOptionsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          PaperProps={{ style: { minWidth: '8rem' } }}
        >
          <MenuItem component={Link} sx={{ '& svg': { mr: 2 } }} onClick={() => handleOpenModalTreatmentDetails(id)} href="#">
            <Icon icon='mdi:eye-outline' fontSize={20} />
            Ver
          </MenuItem>
          {/*<MenuItem onClick={() => handleModalItemOpen(index || 0)} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='mdi:pencil' fontSize={20} />
            Editar
          </MenuItem>*/}
          <MenuItem onClick={() => handleDelete(id)} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='mdi:delete-outline' fontSize={20} />
            Apagar
          </MenuItem>
        </Menu>
      </>
    )
  }

  const handleModalItemClose = async (index: number) => {
    const rows = [...treatmentsDat];
    if(rows[index])
    rows[index].isModalOpen = false;
    setTreatmentsDat(rows);
  }

  const handleModalItemOpen = async (index: number) => {
    const rows = [...treatmentsDat];
    rows[index].isModalOpen = true;
    setTreatmentsDat(rows);
  }

  const renameRow = async (index: number, name: string) => {
    const rows = [...treatmentsDat];

    if(rows[index] && rows[index].treatment){
      rows[index].treatment.name = name;
      dispatch(updateTreatment(rows[index].treatment))
    }

    //console.log(rows[index].treatment)

    setTreatmentsDat(rows);

  }

  const columns: GridColDef[] = [
    {
      flex: 0.2,
      minWidth: 350,
      field: 'fullName',
      headerName: 'Tratamentos',
      renderCell: ({ row }: any) => {
        const { budget, treatment } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                variant='subtitle2'
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {isNaN(row.description) ? '' : 'Dente'} {row.description} - {treatment?.name ? treatment.name : ''}
              </Typography>
              {/*<Typography noWrap variant='caption'>
                {doctor}
              </Typography>*/}
            </Box>
          </Box>
        )
      }
    },
    {
  field: 'sessions',
  headerName: 'Sessões',
  width: 120,
  flex: 0.1,
  align: 'center',
  headerAlign: 'center',
  renderCell: ({ row }: any) => {
    const done = row.sessionDone ?? 0
    const total = row.session ?? 0

    if (!total) return <span>-</span>

    return (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {done}/{total}
      </Typography>
    )
  }
},
    {
      field: 'created_at',
      headerName: 'data',
      width: 130,
      renderCell({ row }) {
        return dayjs(row.created_at)?.format?.('DD/MM/YYYY')
      },
    },
    {
      width: 150,
      field: 'status',
      headerName: 'Ações',
      renderCell: ({ row }: any) => (
        <CustomChip
          size='small'
          label={row.status !== 'done' ? 'Finalizar' : 'Finalizado'}
          color={row.status !== 'done' ? 'primary' : 'success'}
          onClick={() => updateStatus(row.id, row.status)}
          sx={{
            textTransform: 'capitalize',
            '& .MuiChip-label': { px: 2.5, lineHeight: 1.385 }
          }}
        />
      )
    },
    {
      width: 250,
      field: 'f',
      headerName: '',
      renderHeader: () => (
        <>
          <Switch
            name='viewDone'
            checked={viewDone}
            onChange={e => setViewDone(e.target.checked)}
          />
          <span>Mostrar finalizados</span>
        </>
      ),
      renderCell: ({ row }: any) => (
        <>
          <Modal open={row.isModalOpen} onClose={() => handleModalItemClose(row.index)}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  backgroundColor: 'background.default',
                  pl: 4,
                  pt: 4,
                  pb: 2
                }}
              >
                <Typography variant='h6' component='div' sx={{ marginBottom: 2 }}>
                  Editar Nome
                </Typography>
                <TextField
                  fullWidth
                  margin='normal'
                  label='Novo nome'
                  variant='outlined'
                  name='name'
                  value={row.treatment?.name || ''}
                  onChange={(e) => renameRow(row.index, e.target.value)}
                />
              </Box>
              <Button sx={{ ml: 3 }} variant='contained' onClick={()=>handleModalItemClose(row.index)}>
                Ok
              </Button>
            </Box>
          </Modal>
          <RowOptions id={row.id} index={row.index} row={row} toggleModal={() => handleOpenModalTreatmentDetails(row.id)} />
          <Dialog
            open={openModalTreatmentDetails === row.id}
            onClose={handleCloseModalTreatmentDetails}
            aria-labelledby='item-view-edit'
            aria-describedby='item-view-edit-description'
            sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 800 } }}
          >
            <DialogTitle
              id='item-view-edit'
              sx={{
                textAlign: 'center',
                fontSize: '1.5rem !important',
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
              }}
            >
              Tratamento
            </DialogTitle>
            <DialogContent
              sx={{
                pb: theme => `${theme.spacing(8)} !important`,
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
              }}
            >
              <DialogContentText variant='body2' id='item-view-edit-description' sx={{ textAlign: 'center', mb: 7 }}>
                <h3>Nome</h3>
                <span>{row.treatment?.name ? row.treatment.name : '' }</span>

                <h3>Valor</h3>
                <span>{row.treatment?.value ? row.treatment.value : ''}</span>

              </DialogContentText>

            </DialogContent>

          </Dialog>
        </>
      )
    }

    // {
    //   flex: 0.1,
    //   minWidth: 130,
    //   sortable: false,
    //   field: 'actions',
    //   headerName: 'Ações',
    //   renderCell: ({ row }: CellType) => (
    //     <Box sx={{ display: 'flex', alignItems: 'center' }}>
    //       <Tooltip title='View'>
    //         <IconButton size='small' component={Link} href={`/apps/invoice/preview/${row.id}`}>
    //           <Icon icon='mdi:eye-outline' fontSize={20} />
    //         </IconButton>
    //       </Tooltip>
    //       <OptionsMenu
    //         iconProps={{ fontSize: 20 }}
    //         iconButtonProps={{ size: 'small' }}
    //         menuProps={{ sx: { '& .MuiMenuItem-root svg': { mr: 2 } } }}
    //         options={[
    //           {
    //             text: 'Download',
    //             icon: <Icon icon='mdi:download' fontSize={20} />
    //           },
    //           {
    //             text: 'Edit',
    //             href: `/apps/invoice/edit/${row.id}`,
    //             icon: <Icon icon='mdi:pencil-outline' fontSize={20} />
    //           },
    //           {
    //             text: 'Duplicate',
    //             icon: <Icon icon='mdi:content-copy' fontSize={20} />
    //           }
    //         ]}
    //       />
    //     </Box>
    //   )
    // }
  ]

  function removeItem(item: string) {
    cItems.current = cItems.current.filter(cItem => cItem.description != item)
    document.querySelectorAll(`path[data-dente="${item}"]`).forEach(item => item.classList.remove('active'));
  }



   const [fields, setFields] = useState<Field[]>([
    { title: 'Previsão para esta consulta', key: 'currentConsultationForecast', value: '' },
    { title: 'Executado nessa consulta', key: 'performedInThisConsultation', value: '' },
    { title: 'Previsão para Próxima consulta', key: 'nextConsultationForecast', value: '' },
  ]);

  useEffect(() => {
    if (dataPatient) {
      setFields(prev =>
        prev.map(field => ({
          ...field,
           value: dataPatient[field.key] || '',
        }))
      );
    }
  }, [dataPatient]);

  const handleChange = (index: number, newValue: string) => {
    const updatedFields = [...fields];
    updatedFields[index].value = newValue;
    setFields(updatedFields);
  };

 const handleSaveAll = async () => {
  const payload = fields.reduce((acc, field) => {
    acc[field.key] = field.value;
    
return acc;
  }, {} as Record<string, string>);

  try {
    await api.patch('/patients/' + patientId, payload);
    toast.success(`Campos salvos com sucesso!`);
    refreshPatient();
  } catch (error) {
    console.error('Erro ao salvar:', error);
  }
};



  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Tratamentos'
            sx={{ '& .MuiCardHeader-action': { m: 0 } }}

          // action={
          //   <>
          //     <Button
          //       variant='contained'
          //       aria-haspopup='true'
          //       onClick={handleClick}
          //       aria-expanded={open ? 'true' : undefined}
          //       endIcon={<Icon icon='mdi:chevron-down' />}
          //       aria-controls={open ? 'user-view-overview-export' : undefined}
          //     >
          //       Exportar
          //     </Button>
          //     <Menu open={open} anchorEl={anchorEl} onClose={handleClose} id='user-view-overview-export'>
          //       <MenuItem onClick={handleClose}>PDF</MenuItem>
          //       <MenuItem onClick={handleClose}>XLSX</MenuItem>
          //       <MenuItem onClick={handleClose}>CSV</MenuItem>
          //     </Menu>
          //   </>
          // }

          />

          <DataGrid
            autoHeight
            columns={columns}
            rows={treatmentsDat}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
            localeText={{
              ...ptBR.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: 'Nenhum registro encontrado',
              columnMenuManageColumns: 'Gerenciar colunas',
            }}
          />
        </Card>
      </Grid>

    <Grid item xs={12}>
      <Card variant='outlined'>
      {fields.map((field, index) => (
        <Grid  key={index} sx={{ mb: 0 }}>
            <CardContent>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                {field.title}
              </Typography>
              <TextField
                multiline
                minRows={4}
                maxRows={6}
                fullWidth
                variant='outlined'
                placeholder='Digite...'
                value={field.value}
                onChange={e => handleChange(index, e.target.value)}
              />
      
            </CardContent>
        </Grid>
      ))}
      <Button variant='contained' size='small' sx={{ m: 4 }} onClick={handleSaveAll}>
        Salvar
      </Button>
      </Card>
    </Grid>

      {/* <Dialog
        open={openEditMobileNumber}
        onClose={handleCancelClick}
        aria-labelledby='user-view-security-edit-mobile-number'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}
        aria-describedby='user-view-security-edit-mobile-number-description'
      >
        <DialogTitle
          id='user-view-security-edit-mobile-number'
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem !important',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          Enable One Time Password
        </DialogTitle>

        <DialogContent
          sx={{
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Typography variant='h6'>Verify Your Mobile Number for SMS</Typography>
          <Typography variant='body2' sx={{ mt: 2, mb: 5 }}>
            Enter your mobile phone number with country code and we will send you a verification code.
          </Typography>
          <form onSubmit={e => e.preventDefault()}>
            <TextField
              autoFocus
              fullWidth
              value={mobileNumber}
              label='Mobile number with country code'
              onChange={e => setMobileNumber(e.target.value)}
            />
            <Box sx={{ mt: 6.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type='reset' color='secondary' variant='outlined' onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button type='submit' sx={{ ml: 3 }} variant='contained' onClick={handleSubmitClick}>
                Send
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog> */}
    </Grid>
  )
}

export default UsersTreatments
