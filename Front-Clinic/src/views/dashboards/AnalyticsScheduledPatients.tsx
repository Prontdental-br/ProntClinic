/* eslint-disable @typescript-eslint/no-unused-vars */

// ** React Import
import { forwardRef, ReactElement, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { DataGrid, GridCellParams, GridColDef, GridRowParams, GridRowSelectionModel, ptBR } from '@mui/x-data-grid'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import { Button, Dialog, Input, SelectChangeEvent, TextField } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

import * as yup from 'yup'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { CardContent, CardHeader, Chip } from '@mui/material'
import api from 'src/@core/components/api-client'
import moment from 'moment'
import { FormatMask } from 'src/@core/utils/FormatMask'

import DatePicker from 'react-datepicker'

import { DatePicker as MUIDatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { CalendarColors, EventDateType } from 'src/types/apps/calendarTypes'
import { ProfessionalDataType } from 'src/types/apps/userTypes'
import { Controller, useForm } from 'react-hook-form'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { AutocompleteWithAddButton } from '../components/AutocompleteWithAddButton'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'

// JSON com os anos a partir de 2018
const currentYear = new Date().getFullYear()
const finalYear = 2030

const anosJson = {
  anos: Array.from({ length: finalYear - 2017 + 1 }, (_, index) => {
    const year = 2017 + index

    return { key: String(year), text: String(year) }
  })
}

interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

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

// JSON com os meses do ano
const mesesJson = {
  meses: [
    { key: '01', text: 'Janeiro' },
    { key: '02', text: 'Fevereiro' },
    { key: '03', text: 'Março' },
    { key: '04', text: 'Abril' },
    { key: '05', text: 'Maio' },
    { key: '06', text: 'Junho' },
    { key: '07', text: 'Julho' },
    { key: '08', text: 'Agosto' },
    { key: '09', text: 'Setembro' },
    { key: '10', text: 'Outubro' },
    { key: '11', text: 'Novembro' },
    { key: '12', text: 'Dezembro' }
  ]
}

type PatientPlanType = {
  [key: string]: string
}

const PlanTypes: PatientPlanType = {
  P: 'Particular',
  C: 'Convênio',
  O: 'Outros'
}

interface TableBodyRowType {
  id: string
  name: string
  startDate: string
  professional: { id: string; name: string }
  plan: 'PARTICULAR' | 'CONVENIO' | 'OUTROS'
  email: string
  username: string
  avatarSrc?: string
  fone?: string
  status: string
}

interface CellType {
  row: TableBodyRowType
}

interface RoleObj {
  [key: string]: {
    icon: ReactElement
  }
}

interface StatusObj {
  [key: string]: {
    color: ThemeColor
  }
}

const statusLabels: { [key: string]: string } = {
  SC: 'AGENDADA',
  CP: 'CANC. PACIENTE',
  CF: 'CONFIRMADA',
  AT: 'ATENDIDA',
  MS: 'FALTA',
  CS: 'CANC. PROFISSIONAL',
  AP: 'PACIENTE CHEGOU',
  IS: 'EM ATENDIMENTO',
  CT: 'COMPROMISSO'
}

// Função para obter o significado do status
const getStatusLabel = (status: string): string => {
  return statusLabels[status] || status // Retorna a sigla original se não houver correspondência
}

const calendarColorMap: CalendarColors = {
  MS: 'error',
  SC: 'primary',
  CP: 'warning',
  CS: 'secondary',
  CF: 'success',
  AT: 'info',
  AP: 'orange',
  IS: 'bic',
  CT: 'purple'
}

const getStatusColor = (status: string): ThemeColor => {
  return calendarColorMap[status as keyof CalendarColors] || 'primary'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const roleObj: RoleObj = {
  admin: {
    icon: (
      <Box component='span' sx={{ display: 'flex', mr: 2, color: 'error.main' }}>
        <Icon icon='mdi:laptop' />
      </Box>
    )
  },
  author: {
    icon: (
      <Box component='span' sx={{ display: 'flex', mr: 2, color: 'warning.main' }}>
        <Icon icon='mdi:cog' />
      </Box>
    )
  },
  maintainer: {
    icon: (
      <Box component='span' sx={{ display: 'flex', mr: 2, color: 'success.main' }}>
        <Icon icon='mdi:chart-donut' />
      </Box>
    )
  },
  editor: {
    icon: (
      <Box component='span' sx={{ display: 'flex', mr: 2, color: 'info.main' }}>
        <Icon icon='mdi:pencil-outline' />
      </Box>
    )
  },
  subscriber: {
    icon: (
      <Box component='span' sx={{ display: 'flex', mr: 2, color: 'primary.main' }}>
        <Icon icon='mdi:account-outline' />
      </Box>
    )
  }
}

const renderUserAvatar = (row: TableBodyRowType) => {
  if (row.avatarSrc) {
    return <CustomAvatar src={row.avatarSrc} sx={{ mr: 3, width: 34, height: 34 }} />
  } else {
    return (
      <CustomAvatar skin='light' sx={{ mr: 3, width: 34, height: 34, fontSize: '.8rem' }}>
        {getInitials(row.name ? row.name : 'John Doe')}
      </CustomAvatar>
    )
  }
}

const columns: GridColDef[] = [
  {
    flex: 0.25,
    field: 'name',
    minWidth: 200,
    headerName: 'Paciente',
    renderCell: ({ row }: CellType) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderUserAvatar(row)}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
              {row.name}
            </Typography>
            <Typography variant='caption' sx={{ lineHeight: 1.6667 }}>
              {row.username}
            </Typography>
          </Box>
        </Box>
      )
    }
  },
  {
    flex: 0.2,
    minWidth: 130,
    field: 'Data',
    headerName: 'Data',
    renderCell: ({ row }: CellType) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
          {dayjs(row.startDate)?.format?.('DD/MM HH:mm')}
        </Typography>
      </Box>
    )
  },
  {
    flex: 0.15,
    minWidth: 210,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }: CellType) => (
      <CustomChip
        skin='light'
        size='small'
        label={getStatusLabel(row.status)}
        color={getStatusColor(row.status)}
        sx={{
          textTransform: 'capitalize',
          '& .MuiChip-label': { px: 2.5, lineHeight: 1.385 }
        }}
      />
    )
  },
  {
    flex: 0.3,
    minWidth: 180,
    field: 'fone',
    headerName: 'Contato',
    renderCell: ({ row }: CellType) => (
      <CustomWhatsappChip phoneNumber={row?.fone ? row.fone!.replaceAll(' ', '') : ''} />
    )
  },
  {
    field: 'medico',
    flex: 0.3,
    minWidth: 120,
    headerName: 'Médico',
    renderCell: ({ row }: CellType) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{row.professional.name}</Typography>
      </Box>
    )
  }
]

const CustomWhatsappChip = ({ phoneNumber }: { phoneNumber: string }) => {
  const [clicked, setClicked] = useState(false)
  const formatter = new FormatMask()
  const cleanedNumber = phoneNumber.replace(/\D/g, '')
  const withDDI = cleanedNumber.startsWith('55') ? cleanedNumber : '55' + cleanedNumber
  const formatted = (formatter.setPhoneFormatMask(withDDI) ?? phoneNumber).replace(/^\+55\s*/, '')

  const handleClick = () => {
    setClicked(true)
    window.open(`https://wa.me/${cleanedNumber.startsWith('55') ? cleanedNumber : '55' + cleanedNumber}`, '_blank')
  }

  return (
    <Chip
      variant='filled'
      size='small'
      sx={{
        backgroundColor: '#25D366',
        color: '#FFFFFF',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        padding: '0.25rem',
        cursor: 'pointer'
      }}
      icon={
        <Icon
          icon='mdi:whatsapp'
          style={{
            color: '#FFFFFF',
            marginRight: '0.25rem',
            width: '1.5rem',
            height: '1.5rem'
          }}
        />
      }
      label={formatted}
      onClick={handleClick}
    />
  )
}

const AnalyticsScheduledPatients = () => {
  const [rows, setRows] = useState<TableBodyRowType[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [patientName, setPatientName] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [professionals, setProfessionals] = useState([]) // Estado para lista de profissionais
  const [selectedProfessional, setSelectedProfessional] = useState<string>('') // Estado para o profissional selecionado
  const [selectedProfessionalReturn, setSelectedProfessionalReturn] = useState<any>({}) // Estado para o profissional selecionado
  const [paginationScheduleModel, setPaginationScheduleModel] = useState({ page: 0, pageSize: 10 })
  const [openModalConfirmReturn, setOpenModalConfirmReturn] = useState<boolean>(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [user, setUser] = useState<any>({})
  const [selectedRow, setSelectedRow] = useState<TableBodyRowType | null>(null)
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([])
  const [values, setValues] = useState({
    start: new Date(),
    end: new Date(),
    allDay: false
  })

  const router = useRouter()

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
    dateStart = moment(selectedDate.toDate()).format('YYYY-MM-DD')
    dateEnd = moment(selectedDate.toDate()).format('YYYY-MM-DD')
  }

  const handleStart = (date: Date) => {
    setValues(prevValues => ({ ...prevValues, start: date }))
  }

  const schema = yup.object().shape({
    professionalId: yup.string().required('Campo obrigatório')
  })

  const defaultValues = {
    professionalId: ''
  }

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues, resolver: yupResolver(schema), mode: 'onSubmit' })

  const handleRowClick = (params: GridCellParams) => {
    const selectedId = params.id as number

    setSelectionModel(prevSelection => {
      if (prevSelection.includes(selectedId)) {
        setSelectedRow(null)

        return []
      } else {
        setSelectedRow(params.row as TableBodyRowType)

        return [selectedId]
      }
    })
  }

  useEffect(() => {
    if (selectedRow?.professional) {
      setValue('professionalId', selectedRow.professional.id)
    }
  }, [selectedRow, setValue])

  const handleOpenModalConfirmReturn = () => {
    if (selectedRow) {
      setOpenModalConfirmReturn(true)
    }
  }

  const handleCloseModalConfirmReturn = () => {
    setOpenModalConfirmReturn(false)
    setValues({
      start: new Date(),
      end: new Date(),
      allDay: false
    })
  }

  const handleSave = async (professionalId: string) => {
    try {
      const startDate = values.start.toISOString()
      const endDate = values.end.toISOString()

      const scheduleId = selectedRow?.id

      const response = await api.post(`/schedules/${scheduleId}/return`, {
        startDate,
        endDate,
        professionalId
      })

      setSelectedRow(null)

      if (response.data) {
        fetchSchedules(dateStart, dateEnd)
        handleCloseModalConfirmReturn()
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
    }
  }

  const onSubmit = async (data: any) => {
    console.log(data)

    if (data.professionalId) {
      await handleSave(data.professionalId)
    }
  }

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value as string)
  }

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setSelectedMonth(event.target.value as string)
  }

  const handleProfessionalChange = (event: SelectChangeEvent<string>) => {
    setSelectedProfessional(event.target.value)
  }

  const tableRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      if (tableRef.current) {
        const printContent = tableRef.current.innerHTML
        const originalContent = document.body.innerHTML

        document.body.innerHTML = printContent
        window.print()
        document.body.innerHTML = originalContent
        window.location.reload()
      }
      setIsPrinting(false)
    }, 200)
  }

  function fetchSchedules(dateStart?: string, dateEnd?: string) {
    let url = `/schedules/search/date?patientName=${patientName}&professionalIds=${selectedProfessional}`

    if (dateStart && dateEnd) {
      const start = `${dateStart}T00:00:00.000Z`
      const end = `${dateEnd}T23:59:59.000Z`
      url += `&dateStart=${start}&dateEnd=${end}`
    }

    api
      .get(url)
      .then(response => {
        if (response.data && response.data.length) {
          const sortedData = response.data.sort(
            (a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          )

          setRows(
            sortedData.map((item: any) => ({
              id: item.id,
              plan: PlanTypes[item.patient.plan_type],
              status: item.status,
              name: item.patient.name,
              startDate: item.startDate,
              professional: { ...item.professional },
              username: '',
              email: item.patient.email,
              avatarSrc: '/images/avatars/1.png',
              fone: item.patient.cell_phone
            }))
          )
        } else {
          setRows([])
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  const fetchOptionsProfessionals = async (searchText: string) => {
    const response = await api.get('/professionals')

    const data = response.data
      .filter((item: ProfessionalDataType) => item.specialty !== 'recepcionista')
      .map((item: ProfessionalDataType) => {
        return {
          id: item.id,
          name: item.name
        }
      })

    return data
  }

  const handleAddProfessional = () => {
    router.push('/pages/account-settings/security/')
    console.log('Cadastrar novo profissional')
  }

  useEffect(() => {
    api
      .get('/professionals')
      .then(response => {
        const data = response.data
          .filter((item: ProfessionalDataType) => item.specialty !== 'recepcionista')
          .map((item: ProfessionalDataType) => {
            return {
              id: item.id,
              name: item.name
            }
          })

        setProfessionals(data)
      })
      .catch(err => {
        console.error('Erro ao carregar profissionais', err)
      })
  }, [])

  useEffect(() => {
    console.log(patientName)

    fetchSchedules(dateStart, dateEnd)
  }, [selectedMonth, selectedYear, patientName, selectedDate, selectedProfessional])

  return (
    <Card>
      <CardHeader title='Pacientes Agendados' />
      <Box style={{ display: 'flex', justifyContent: 'left', paddingLeft: 16, paddingRight: 16 }}>
        <FormControl>
          <Select sx={{ height: 30 }} onChange={handleMonthChange} value={selectedMonth} displayEmpty>
            <MenuItem value=''>
              <em>Mês</em>
            </MenuItem>
            {mesesJson.meses.map(mes => (
              <MenuItem key={mes.key} value={mes.key}>
                {mes.text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <Select sx={{ height: 30 }} value={selectedYear} onChange={handleYearChange} displayEmpty>
            <MenuItem value=''>
              <em>Ano</em>
            </MenuItem>
            {anosJson.anos.map(ano => (
              <MenuItem key={ano.key} value={ano.key}>
                {ano.text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <LocalizationProvider adapterLocale='pt-br' dateAdapter={AdapterDayjs}>
            <MUIDatePicker
              label='Data *'
              format='DD/MM/YYYY'
              value={selectedDate || null}
              onChange={(newValue: Dayjs | null) => {
                setSelectedDate(newValue)
              }}
              sx={{
                input: { paddingTop: 1, paddingBottom: 1 },
                'label[data-shrink=false]': { top: -10 }
              }}
            />
          </LocalizationProvider>
        </FormControl>

        <FormControl>
          <Input
            placeholder='Nome do paciente'
            value={patientName}
            onChange={e => setPatientName(e.target.value)}
          ></Input>
        </FormControl>

        <FormControl>
          <Select sx={{ height: 30 }} value={selectedProfessional} onChange={handleProfessionalChange} displayEmpty>
            <MenuItem value='' selected sx={{ opacity: '.3' }}>
              Profissional
            </MenuItem>
            {professionals.map((professional: any) => (
              <MenuItem key={professional.id} value={professional.id}>
                {professional.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(selectedMonth || selectedYear || selectedDate || patientName || selectedProfessional) && (
          <Button
            variant='outlined'
            color='primary'
            onClick={() => {
              setSelectedMonth('')
              setSelectedYear('')
              setSelectedDate(null)
              setPatientName('')
              setSelectedProfessional('')

              // fetchSchedules();
            }}
          >
            Limpar filtros
          </Button>
        )}
      </Box>

      <CardContent>
        <div ref={tableRef}>
          <DataGrid
            autoHeight
            rows={rows}
            onCellClick={params => {
              if (params.field !== '__check__') {
                handleRowClick(params)
              } else {
                handleRowClick(params)
              }
            }}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            pagination={true}
            paginationModel={isPrinting ? { page: 0, pageSize: rows.length } : paginationScheduleModel}
            onPaginationModelChange={setPaginationScheduleModel}
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
              const latestSelection = newSelection.slice(-1)
              setSelectionModel(latestSelection)

              const selectedRowData = rows.find(row => row.id === latestSelection[0]) || null
              setSelectedRow(selectedRowData)
            }}
            sx={{
              '& .MuiDataGrid-row': {
                '&:hover': {
                  cursor: 'pointer'
                }
              }
            }}
            localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}}
          />
        </div>
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Button variant='contained' color='success' onClick={handlePrint}>
            Imprimir Agenda
          </Button>
          <Button variant='contained' color='primary' onClick={handleOpenModalConfirmReturn}>
            Marcar Retorno
          </Button>
        </Box>
      </CardContent>

      <Dialog
        open={openModalConfirmReturn}
        onClose={handleCloseModalConfirmReturn}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            overflow: 'visible', // Evita o scroll
            maxHeight: '80vh' // Limita o crescimento vertical
          }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
          <Box>
            <h2>
              Paciente: <span style={{ fontSize: '1.2rem', fontWeight: 400 }}>{selectedRow?.name}</span>
            </h2>
          </Box>
          <DatePickerWrapper>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <AutocompleteWithAddButton
                  fieldForm='professionalId'
                  control={control}
                  selectedItem={
                    selectedRow?.professional
                      ? { id: selectedRow.professional.id, name: selectedRow.professional.name }
                      : null
                  }
                  fetchDataOptions={fetchOptionsProfessionals}
                  onAddEvent={handleAddProfessional}
                  title='Profissional'
                  ref={autocompleteWithAddButtonProfessionalRef}
                />
                {errors?.professionalId && (
                  <Typography color='error' variant='caption'>
                    {errors?.professionalId?.message}
                  </Typography>
                )}
              </FormControl>
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
              <Box sx={{ mb: 6 }}>
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
              </Box>

              <Box sx={{ display: 'flex', gap: '1rem', mt: 3 }}>
                <Button variant='contained' color='primary' type='submit'>
                  Marcar
                </Button>
                <Button variant='outlined' color='inherit' onClick={() => setOpenModalConfirmReturn(prev => !prev)}>
                  Fechar
                </Button>
              </Box>
            </form>
          </DatePickerWrapper>
        </Box>
      </Dialog>
    </Card>
  )
}

export default AnalyticsScheduledPatients
