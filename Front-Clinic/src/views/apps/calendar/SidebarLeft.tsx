// ** MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import { SidebarLeftType, CalendarFiltersType } from 'src/types/apps/calendarTypes'
import { Box, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'

import { fetchData as fetchDataProfessional } from 'src/store/apps/professional'
import { fetchData as fetchDataPatient } from 'src/store/apps/patient'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import { ProfessionalDataType } from 'src/types/apps/userTypes'
import { Cancel, CheckCircle, KeyboardArrowDown, KeyboardArrowRight, WhatsApp } from '@mui/icons-material'
import AppReactDatepicker from './AppReactDatepicker'
import { updateFilteredEvents } from 'src/store/apps/calendar'
import moment from 'moment'
import api from 'src/@core/components/api-client'
import { fetchData, fetchOne } from 'src/store/apps/tag'
import { Stack } from '@mui/system'
import dayjs from 'dayjs'

interface ProfessionalType {
  id: string
  name: string
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

const SidebarLeft = (props: SidebarLeftType) => {
  const {
    store,
    mdAbove,
    dispatch,
    calendarsColor,
    calendarsColorLabels,
    calendarApi,
    leftSidebarOpen,
    leftSidebarWidth,
    handleSelectEvent,
    handleAllCalendars,
    handleCalendarsUpdate,
    handleCalendarsProfessionalUpdate,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle,
    handleModalItem,
    handleOpenModalAddUser
  } = props

  
  const [user, setUser] = useState<any>({});
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([])
  const [selectedsIds, setSelectedIds] = useState<string[]>([])
  const [professionals, setProfessionals] = useState<ProfessionalType[]>([])
  const colorsArr = calendarsColor ? Object.entries(calendarsColor) : []
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const storeProfessional = useSelector((state: RootState) => state.professional)

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/return-list/pending");
      setReturns(data)
    } catch (error) {
      console.error("Erro ao buscar retornos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfessionalChange = (event: SelectChangeEvent<string[]>) => {
    const selected = event.target.value as string[]
    const ids = selected.map(value => {
      return professionals.find(item => item.name === value)?.id
    })
    setSelectedIds(ids as string[])
    setSelectedProfessionals(selected)
    dispatch(handleCalendarsProfessionalUpdate(ids))
  }

  type ArrayColorLabelKey = {
    key: string
  }

  useEffect(() => {
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    console.log(userData)
    setUser({ ...userData })

    dispatch(fetchDataProfessional())

    dispatch(fetchDataPatient(''))

    fetchReturns();
  }, [])

  
  useEffect(() => {
    const data = storeProfessional.data
    .filter((item: ProfessionalDataType) => item.specialty !== 'recepcionista')
    .map((item: ProfessionalDataType) => {
      return {
        id: item.id,
        name: item.name
      };
    });

    setProfessionals([...data])
  }, [storeProfessional.data])

  useEffect(() => {
    if (store.selectedCalendars.length === 0) {
      dispatch(handleSelectEvent(null)); 
    }
  }, [store.selectedCalendars, dispatch, handleSelectEvent]);

  type CalendarColorsLabels = {
    [key in ArrayColorLabelKey['key']]: {
      value: string
      index: string
    }
  }

  const arrayOfObjects: CalendarColorsLabels = {
    MS: { value: 'Falta', index: 'MS' },
    SC: { value: 'Agendada', index: 'SC' },
    CP: { value: 'Canc. Paciente', index: 'CP' },
    CS: { value: 'Canc. Profissional', index: 'CS' },
    CF: { value: 'Confirmada', index: 'CF' },
    AT: { value: 'Atendida', index: 'AT' },
    AP: { value: 'Paciente Chegou', index: 'AP' },
    IS: { value: 'Em atendimento', index: 'IS' },
    CT: { value: 'Compromisso', index: 'CT' }
  }

  const colorsRotulo = [
  { id: 'error', name: 'Falha', color: '#DC3545' },
  { id: 'primary', name: 'Primário', color: '#007BFF' },
  { id: 'secondary', name: 'Secundário', color: '#6C757D' },
  { id: 'warning', name: 'Alerta', color: '#FFC107' },
  { id: 'success', name: 'Sucesso', color: '#198754' },
  { id: 'info', name: 'Informação', color: '#17A2B8' },

  { id: 'turquoise', name: 'Turquesa Claro', color: '#B2DFDB' },
{ id: 'lightYellow', name: 'Amarelo Suave', color: '#FFF9C4' },
{ id: 'skyBlue', name: 'Azul Céu', color: '#BBDEFB' },
{ id: 'lavender', name: 'Lavanda', color: '#E1BEE7' },
{ id: 'taupe', name: 'Taupe', color: '#BCAAA4' },
{ id: 'periwinkle', name: 'Azul Lilás', color: '#C5CAE9' },
{ id: 'salmon', name: 'Salmão Claro', color: '#FFAB91' },
{ id: 'rose', name: 'Rosa Claro', color: '#FFCDD2' },
{ id: 'lime', name: 'Verde Lima', color: '#AED581' },
{ id: 'orangeMedium', name: 'Laranja Médio', color: '#FFB74D' },
{ id: 'dustyRose', name: 'Rosa Queimado', color: '#CA8686' },
{ id: 'cyan', name: 'Ciano', color: '#00FFFF' },
{ id: 'steelBlue', name: 'Azul Aço', color: '#A1A1B9' },
{ id: 'tealDark', name: 'Verde Petróleo', color: '#008B8B' },
{ id: 'grayDark', name: 'Cinza Escuro', color: '#A9A9A9' },
{ id: 'neonGreen', name: 'Verde Neon', color: '#03F103' },
{ id: 'khakiDark', name: 'Caqui Escuro', color: '#BDB76B' },
{ id: 'purpleDeep', name: 'Roxo Intenso', color: '#8B008B' },
{ id: 'coral', name: 'Coral', color: '#E9967A' },
{ id: 'fuchsia', name: 'Fúcsia', color: '#FF00FF' }
]


  const renderFilters = colorsArr.length
  ? colorsArr.map(([key, value]: [any, string]) => {
      return (
        <FormControlLabel
          key={key}
          label={arrayOfObjects[key].value}
          sx={{ mb: -1.3 }}
          control={
            <Checkbox
              color={value as ThemeColor} 
              checked={store.selectedCalendars.includes(key)}
              onChange={() => dispatch(handleCalendarsUpdate(key as CalendarFiltersType))}
            />
          }
        />
      )
    })
  : null;

  const handleSidebarToggleSidebar = () => {
    handleAddEventSidebarToggle()
    dispatch(handleSelectEvent(null))
  }

   const [open, setOpen] = useState(false)
   const toggleOpen = () => setOpen(!open)

   const [openTags, setOpenTags] = useState(false)
   const toggleOpenTags = () => setOpenTags(!openTags)

   const [openReturns, setOpenReturns] = useState(false);
   const toggleOpenReturns = () => setOpenReturns(!openReturns);

const allEvents = useSelector((state: RootState) => state.calendar.allEvents)
const selectedTags = useSelector((state: RootState) => state.calendar.selectedTags)
const allTags = useSelector((state: RootState) => state.tag.allData);
const [excludedTags, setExcludedTags] = useState<string[]>([])

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

const [actionDialog, setActionDialog] = useState<null | { type: "confirm" | "cancel"; ret: any }>(null);

const handleCloseAction = () => setActionDialog(null);

const handleConfirmAction = async () => {
  if (actionDialog?.type === "confirm") {
    await api.patch(`/return-list/${actionDialog.ret.id}/confirm`);

    fetchReturns();

  } else if (actionDialog?.type === "cancel") {

    await api.patch(`/return-list/${actionDialog.ret.id}/lost`);

    fetchReturns();
   
  }
  setActionDialog(null);
};


  const handleOpenDialog = (ret: any) => {
    setSelectedReturn(ret);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReturn(null);
  };

  const formatReturnTime = (value: number, type: string) => {
    const map: any = { D: "dias", M: "meses", Y: "anos" };

    return `${value} ${map[type] || ""}`;
  };

  const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {

    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (digits.length === 10) {
 
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  return phone; 
};

useEffect(() => {
  const filtered = allEvents.filter((event: any) => {
    const tagId = event?.extendedProps?.tag?.tagId 
    
return !excludedTags.includes(tagId)
  })
  dispatch(updateFilteredEvents(filtered))
}, [excludedTags, allEvents]) 

const toggleTag = (tagId: string) => {
  setExcludedTags(prev =>
    prev.includes(tagId)
      ? prev.filter(id => id !== tagId) 
      : [...prev, tagId]            
  )
}

const handleSelectAll = (checked: boolean) => {
  setExcludedTags(checked ? [] : allTags.map((tag: any) => tag.id)) 
}

 const renderTagFilters = useMemo(() => {
  return allTags.map((tag: any) => {
    const isChecked = !excludedTags.includes(tag.id)
    const colorData = colorsRotulo.find(c => c.id === tag.color)
    
    return (
      <FormControlLabel
        key={tag.id}
        label={tag.name}
        sx={{ mb: -1.3 }}
        control={
          <Checkbox
            checked={isChecked}
            onChange={() => toggleTag(tag.id)}
             sx={{
              color: colorData?.color,
              '&.Mui-checked': {
                color: colorData?.color
              }
            }}
          />
        }
      />
    )
  })
}, [allTags, excludedTags])

const [now, setNow] = useState(new Date());
const [openInService, setOpenInService] = useState(true);
const toggleInService = () => setOpenInService(!openInService);

const eventsAP: any = store.events?.filter(event => event.extendedProps.status === 'AP') || [];

const eventEntryTimes = useRef<Record<string, Date>>({});

useEffect(() => {
  const interval = setInterval(() => {
    setNow(new Date());
  }, 60000);
  
return () => clearInterval(interval);
}, []);

useEffect(() => {
  const now = new Date();
  eventsAP.forEach((event: any) => {
    if (!eventEntryTimes.current[event.id]) {
      eventEntryTimes.current[event.id] = now;
    }
  });
}, [eventsAP]);

const [modalTagOpen, setModalTagOpen] = useState(false)

  const handleModalTagOpen = () => {
    setModalTagOpen(true)
  }

  const handleModalTagClose = () => {
    setModalTagOpen(false)
  }

  const [formValues, setFormValues] = useState({
      nome: '',
      color: ''
    })
  

  const handleTagSubmit = (event: React.FormEvent) => {
      event.preventDefault()
      const tag = {
        name: formValues.nome,
        color: formValues.color
      }
  
      api
      .post('/tags', tag)
      .then(resp => {
          dispatch(fetchData())
      })
      .catch(error => {
        console.error(error)
      })
      
      handleModalTagClose()
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setFormValues({ ...formValues, [name]: value })
      }

    const handleInputColorChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target
        setFormValues({ ...formValues, [name]: value })
      }

  if (renderFilters) {
    return (
      <>
      
      <Drawer
        open={leftSidebarOpen}
        onClose={handleLeftSidebarToggle}
        variant={mdAbove ? 'permanent' : 'temporary'}
        ModalProps={{
          disablePortal: true,
          disableAutoFocus: true,
          disableScrollLock: true,
          keepMounted: true 
        }}
        sx={{
          zIndex: 2,
          display: 'block',
          position: mdAbove ? 'static' : 'absolute',
          '& .MuiDrawer-paper': {
            borderRadius: 1,
            boxShadow: 'none',
            width: leftSidebarWidth,
            borderTopRightRadius: 0,
            alignItems: 'flex-start',
            borderBottomRightRadius: 0,
            p: theme => theme.spacing(5),
            zIndex: mdAbove ? 2 : 'drawer',
            position: mdAbove ? 'static' : 'absolute'
          },
          '& .MuiBackdrop-root': {
            borderRadius: 1,
            position: 'absolute'
          }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <Button fullWidth variant='contained' onClick={handleSidebarToggleSidebar}>
              Fazer Agendamento
            </Button>
          </div>
        </div>
       <Divider style={{ width: '100%' }} />
            <AppReactDatepicker
              inline
              onChange={(date: any) => calendarApi.gotoDate(date)}
              boxProps={{
                style: {
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                },
                sx: {
                  '& .react-datepicker': {
                    boxShadow: 'none !important',
                    border: 'none !important',
                  },
                },
              }}
            />
        <Divider style={{ width: '100%' }} />
         <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2,
              mb: -1.5,
              cursor: 'pointer'
            }}
            onClick={toggleInService}
          >
            <Typography variant='body2' sx={{ textTransform: 'uppercase', flex: 1 }}>
              LISTA DE ESPERA
            </Typography>
            <IconButton size='small'>
              {openInService ? (
                <KeyboardArrowDown sx={{ transition: '0.3s' }} />
              ) : (
                <KeyboardArrowRight sx={{ transition: '0.3s' }} />
              )}
            </IconButton>
          </Box>

        <Collapse in={openInService}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
  {eventsAP.length > 0 ? (
    eventsAP.map((event: any) => {
   
      const waitingCreatedAt = event.extendedProps.waitingCreatedAt
        ? new Date(event.extendedProps.waitingCreatedAt)
        : null;

        console.log(event);

        console.log(waitingCreatedAt);

      const minutesPassed = waitingCreatedAt
        ? Math.max(0, Math.floor((now.getTime() - waitingCreatedAt.getTime()) / 60000))
        : 0;

      return (
        <Box
          key={event.id}
          sx={{
            p: 1,
            cursor: 'pointer',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: '#f1f1f1',
            },
          }}
          onClick={() => {
            handleModalItem();

            const formattedEvent = {
              ...event,
              publicId: event.id,
              start: new Date(moment(event.start).utc().format('YYYY-MM-DDTHH:mm:ss.SSS')),
              end: new Date(moment(event.end).utc().format('YYYY-MM-DDTHH:mm:ss.SSS')),
            };

            dispatch(handleSelectEvent(formattedEvent));
          }}
        >
          <Typography variant="body2" sx={{ color: 'orange !important' }}>
            {event.extendedProps.patientName.length > 30
              ? `${event.extendedProps.patientName.slice(0, 30)}...`
              : event.extendedProps.patientName}
            {' — '}
            {minutesPassed} min
          </Typography>
        </Box>
      );
    })
  ) : (
    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
      Nenhum na lista de espera.
    </Typography>
  )}
</Box>
        </Collapse>  
        </Box>

  <Box>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: 2,
        mb: -1.5,
        cursor: 'pointer'
      }}
      onClick={toggleOpen}
    >
      <Typography variant='body2' sx={{ textTransform: 'uppercase', flex: 1 }}>
        Status
      </Typography>
      <IconButton size='small'>
        {open ? (
          <KeyboardArrowDown sx={{ transition: '0.3s' }} />
        ) : (
          <KeyboardArrowRight sx={{ transition: '0.3s' }} />
        )}
      </IconButton>
    </Box>

  <Collapse in={open}>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
      <FormControlLabel
        label='TODOS'
        sx={{ mb: -1.3 }}
        control={
          <Checkbox
            color='secondary'
            checked={store.selectedCalendars.length === colorsArr.length}
            onChange={e => dispatch(handleAllCalendars(e.target.checked))}
          />
        }
      />
      {renderFilters}
    </Box>
  </Collapse>  
</Box>

  <Box>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: 2,
        mb: -1.5,
        cursor: 'pointer'
      }}
      onClick={toggleOpenTags}
    >
    <Typography variant='body2' sx={{ textTransform: 'uppercase', flex: 1 }}>
      RÓTULOS
    </Typography>
    <IconButton size='small'>
      {openTags ? (
        <KeyboardArrowDown sx={{ transition: '0.3s' }} />
      ) : (
        <KeyboardArrowRight sx={{ transition: '0.3s' }} />
      )}
    </IconButton>
  </Box>

 <Collapse in={openTags}>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
    <FormControlLabel
      label="TODOS"
      sx={{ mb: -1.3 }}
      control={
        <Checkbox
          color="secondary"
          checked={excludedTags.length === 0}
          indeterminate={excludedTags.length > 0 && excludedTags.length < allTags.length}
          onChange={e => handleSelectAll(e.target.checked)}
        />
      }
    />
    {renderTagFilters}

    <Button onClick={handleModalTagOpen}>
      Criar rotulo
    </Button>
  </Box>
</Collapse>
  </Box>

  <Box>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: 2,
        mb: -1.5,
        cursor: 'pointer'
      }}
      onClick={toggleOpenReturns}
    >
    <Typography variant='body2' sx={{ textTransform: 'uppercase', flex: 1 }}>
      RETORNOS
    </Typography>
    <IconButton size='small'>
      {openReturns ? (
        <KeyboardArrowDown sx={{ transition: '0.3s' }} />
      ) : (
        <KeyboardArrowRight sx={{ transition: '0.3s' }} />
      )}
    </IconButton>
  </Box>

<Collapse in={openReturns}>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
    {loading ? (
      <Typography variant="body2">Carregando...</Typography>
    ) : returns.length === 0 ? (
      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
        Nenhum na lista de retorno.
      </Typography>
    ) : (
      returns.map((ret: any) => (
        <Box
          key={ret.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
           
          }}
        >
       <Box
          onClick={() => handleOpenDialog(ret)}
          sx={{
            cursor: "pointer",
            "&:hover": {
              color: "primary.main",
              textDecoration: "underline"
            }
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {ret.patient?.name}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
        <IconButton
          size="small"
          color="success"
          onClick={() =>
            window.open(
              `https://wa.me/55${ret.patient?.cellPhone?.replace(/\D/g, '')}`,
              "_blank"
            )
          }
        >
          <WhatsApp />
        </IconButton>
            <IconButton
              size="small"
              color="success"
              onClick={() => setActionDialog({ type: "confirm", ret })}
            >
              <CheckCircle />
            </IconButton>

            <IconButton
              size="small"
              color="error"
              onClick={() => setActionDialog({ type: "cancel", ret })}
            >
              <Cancel />
            </IconButton>
      </Stack>
        </Box>
      ))
    )}
  </Box>
</Collapse>
  </Box>

    <FormControl sx={{ mt: 5 }}>
      <InputLabel id='label-profissional'>Profissional</InputLabel>
      {(user.professional === '' || user.professional?.isAdmin || user.professional?.specialty === 'recepcionista') && (
        <>
          <Select
            style={{ width: 210 }}
            multiple
            label='Profissional'
            value={selectedProfessionals}
            MenuProps={MenuProps}
            id='multiple-professional'
            onChange={handleProfessionalChange}
            labelId='label-multiple-profissional'
            renderValue={(selected) => (
              `${(selected as string[]).length} selecionado(s)`
            )}
          >
            {professionals.map(item => (
              <MenuItem key={item.id} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
            {selectedProfessionals.map(value => (
              <Chip
                key={value}
                label={professionals.find(item => item.name === value)?.name}
                onDelete={() => {
                  const newSelected = selectedProfessionals.filter(v => v !== value)
                  const newIds = newSelected.map(v => professionals.find(item => item.name === v)?.id)

                  setSelectedProfessionals(newSelected)
                  setSelectedIds(newIds as string[])
                  dispatch(handleCalendarsProfessionalUpdate(newIds))
                }}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </>
      )}
    </FormControl>

      </Drawer>

      <Modal open={modalTagOpen} onClose={handleModalTagClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 450,
              height: 180,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4
            }}
          >
            <form onSubmit={handleTagSubmit}>
              <Typography variant='h6' component='div' sx={{ marginBottom: 2 }}>
                Novo rótulo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, gap: 2 }}>
                <Typography variant='body1' sx={{ marginRight: 2 }}>
                  Cor:
                </Typography>
                <Select value={formValues.color} sx={{ width: 120 }} onChange={handleInputColorChange} name='color'>
                  {colorsRotulo.map(color => (
                    <MenuItem key={color.id} value={color.id}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: color.color,
                            
                          }}
                        ></div>
                        {/* {color.name} */}
                      </div>
                    </MenuItem>
                  ))}
                </Select>
  
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    name='nome'
                    id='rotulo-nome'
                    variant='outlined'
                    fullWidth
                    placeholder='Nome do rótulo'
                    onChange={handleInputChange}
                  />
                </Box>
              </Box>
  
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleModalTagClose} sx={{ marginRight: 2 }}>
                  Fechar
                </Button>
                <Button type='submit' variant='contained' color='primary'>
                  Salvar
                </Button>
              </Box>
            </form>
          </Box>
      </Modal>

       <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Informações do Retorno</DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          {selectedReturn && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nome do Paciente
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedReturn.patient?.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Data Inicial
                </Typography>
                <Typography variant="body1">
                  {dayjs(selectedReturn.startDate).format("DD/MM/YYYY")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tempo para Retorno
                </Typography>
                <Typography variant="body1">
                  {formatReturnTime(
                    selectedReturn.returnValue,
                    selectedReturn.returnType
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Telefone
                </Typography>
                <Typography variant="body1">
                  {selectedReturn.patient?.cellPhone
                    ? formatPhone(selectedReturn.patient.cellPhone)
                    : "Telefone não informado"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tratamento
                </Typography>
                <Typography variant="body1">
                  {selectedReturn.treatment?.treatment?.name}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined" color="error">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
          open={Boolean(actionDialog)}
          onClose={handleCloseAction}
          fullWidth
          maxWidth="xs"
        >
        <DialogTitle>
          {actionDialog?.type === "confirm"
            ? "Confirmar Retorno"
            : "Marcar como Retorno Perdido"}
        </DialogTitle>

        <DialogContent dividers>
          <Typography>
            Tem certeza que deseja{" "}
            {actionDialog?.type === "confirm"
              ? "confirmar o retorno"
              : "marcar como perdido"}{" "}
            do paciente{" "}
            <strong>{actionDialog?.ret?.patient?.name}</strong>?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ mt: 2}}>
          <Button onClick={handleCloseAction} variant="outlined" color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionDialog?.type === "confirm" ? "success" : "error"}
          >
            {actionDialog?.type === "confirm" ? "Confirmar" : "Marcar Perdido"}
          </Button>
        </DialogActions>
      </Dialog>

      </>
    )
  } else {
    return null
  }
}

export default SidebarLeft
