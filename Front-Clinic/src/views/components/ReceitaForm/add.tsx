import React, { ForwardedRef, SyntheticEvent, forwardRef, useState } from 'react'
import { Button, TextField, InputLabel, IconButton, Card, Typography, Divider, Tooltip } from '@mui/material'
import Image from 'next/image'

import DeleteIcon from '@mui/icons-material/Delete'

// ** MUI Imports

import Table from '@mui/material/Table'

import TableRow from '@mui/material/TableRow'
import Collapse from '@mui/material/Collapse'
import TableBody from '@mui/material/TableBody'

import Box, { BoxProps } from '@mui/material/Box'
import Grid, { GridProps } from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import TableContainer from '@mui/material/TableContainer'
import { styled, alpha, useTheme } from '@mui/material/styles'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import TableCell, { TableCellBaseProps } from '@mui/material/TableCell'
import CardContent, { CardContentProps } from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Types
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import { InvoiceClientType } from 'src/types/apps/invoiceTypes'

// ** Custom Component Imports
import Repeater from 'src/@core/components/repeater'
import { date } from 'yup'

interface Medicamento {
  id: number
  nome: string
  quantidade: number
  medida: string
  posologia: string
}

interface ReceitaFormProps {
  toggleAddCustomerDrawer: () => void
  invoiceNumber: number
  clients: InvoiceClientType[] | undefined
  selectedClient: InvoiceClientType | null
  setSelectedClient: (val: InvoiceClientType | null) => void
}

const ReceitaFormAdd: React.FC<ReceitaFormProps> = ({ ...ReceitaFormProps }) => {
  // Detalhes da receita
  const [dentista, setDentista] = useState('')
  const [paciente, setPaciente] = useState('')
  const [dataEmissao, setDataEmissao] = useState('')

  // Detalhes do medicamento
  const [nomeMedicamento, setNomeMedicamento] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [medida, setMedida] = useState('')
  const [posologia, setPosologia] = useState('')

  // Lista de medicamentos
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])

  // Para gerar IDs únicos para os medicamentos
  const [nextId, setNextId] = useState(1)

  const handleAddMedicamento = () => {
    const novoMedicamento: Medicamento = {
      id: nextId,
      nome: nomeMedicamento,
      quantidade: parseInt(quantidade),
      medida,
      posologia
    }

    setMedicamentos([...medicamentos, novoMedicamento])
    setNextId(prevId => prevId + 1)

    // Limpa os campos após adicionar
    setNomeMedicamento('')
    setQuantidade('')
    setMedida('')
    setPosologia('')
  }

  const handleRemoveMedicamento = (id: number) => {
    setMedicamentos(prev => prev.filter(medicamento => medicamento.id !== id))
  }

  // ===========================================================================

  const { clients, invoiceNumber, selectedClient, setSelectedClient, toggleAddCustomerDrawer } = ReceitaFormProps

  const now = new Date()
  const tomorrowDate = now.setDate(now.getDate() + 7)

  // ** States
  const [count, setCount] = useState<number>(1)
  const [selected, setSelected] = useState<string>('')
  const [issueDate, setIssueDate] = useState<DateType>(new Date())
  const [dueDate, setDueDate] = useState<DateType>(new Date(tomorrowDate))

  // ** Hook
  const theme = useTheme()

  // ** Deletes form
  const deleteForm = (e: SyntheticEvent) => {
    e.preventDefault()

    // @ts-ignore
    e.target.closest('.repeater-wrapper').remove()
  }

  // ** Handle Invoice To Change
  const handleInvoiceChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value)
    if (clients !== undefined) {
      setSelectedClient(clients.filter(i => i.name === event.target.value)[0])
    }
  }

  const handleAddNewCustomer = () => {
    toggleAddCustomerDrawer()
  }

  interface PickerProps {
    label?: string
  }

  interface Props {
    toggleAddCustomerDrawer: () => void
    invoiceNumber: number
    clients: InvoiceClientType[] | undefined
    selectedClient: InvoiceClientType | null
    setSelectedClient: (val: InvoiceClientType | null) => void
  }

  const CustomInput = forwardRef(({ ...props }: PickerProps, ref: ForwardedRef<HTMLElement>) => {
    return (
      <TextField
        size='small'
        inputRef={ref}
        sx={{ width: { sm: '250px', xs: '170px' }, '& .MuiInputBase-input': { color: 'text.secondary' } }}
        {...props}
      />
    )
  })

  const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
    borderBottom: 0,
    padding: `${theme.spacing(1, 0)} !important`
  }))

  const CalcWrapper = styled(Box)<BoxProps>(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&:not(:last-of-type)': {
      marginBottom: theme.spacing(2)
    }
  }))

  const RepeatingContent = styled(Grid)<GridProps>(({ theme }) => ({
    paddingRight: 0,
    display: 'flex',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    '& .col-title': {
      top: '-1.5rem',
      position: 'absolute'
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.secondary
    },
    [theme.breakpoints.down('lg')]: {
      '& .col-title': {
        top: '0',
        position: 'relative'
      }
    }
  }))

  const RepeaterWrapper = styled(CardContent)<CardContentProps>(({ theme }) => ({
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(5.5),
    '& .repeater-wrapper + .repeater-wrapper': {
      marginTop: theme.spacing(12)
    }
  }))

  const InvoiceAction = styled(Box)<BoxProps>(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: theme.spacing(2, 1),
    borderLeft: `1px solid ${theme.palette.divider}`
  }))

  const CustomSelectItem = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
    color: theme.palette.success.main,
    backgroundColor: 'transparent !important',
    '&:hover': { backgroundColor: `${alpha(theme.palette.success.main, 0.1)} !important` }
  }))

  // ===========================================================================

  return (
    <Card>
      <CardContent>
        <Grid container>
          <Grid item xl={6} xs={12} sx={{ mb: { xl: 0, xs: 4 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Image src='/images/logos/logoClinic.png' alt={'ProntDental'} width={250} height={150} />
            </Box>
          </Grid>
          <Grid item xl={6} xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xl: 'flex-end', xs: 'flex-start' } }}>
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <Typography variant='h6' sx={{ mr: 1, width: '105px' }}>
                  Receita:
                </Typography>
                <TextField
                  size='small'
                  value={11112}
                  sx={{ width: { sm: '250px', xs: '170px' } }}
                  InputProps={{
                    disabled: true,
                    startAdornment: <InputAdornment position='start'>#</InputAdornment>
                  }}
                />
              </Box>
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <Typography variant='h6' sx={{ mr: 1, width: '105px' }}>
                  Data:
                </Typography>

                <TextField
                  size='small'
                  value={Date()}
                  sx={{ width: { sm: '250px', xs: '170px' } }}
                  InputProps={{
                    disabled: true
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <Divider sx={{ my: theme => `${theme.spacing(1)} !important` }} />

      <CardContent sx={{ pb: 2 }}>
        <Grid container>
          <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
            <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.primary' }}>
              Receita para:
            </Typography>

            <Typography variant='body2' sx={{ mb: 1 }}>
              Cliente tal
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: ['flex-start', 'flex-end'] }}>
            --
          </Grid>
        </Grid>
      </CardContent>

      <Divider sx={{ mb: theme => `${theme.spacing(1.25)} !important` }} />

      <RepeaterWrapper>
        <Repeater count={count}>
          {(i: number) => {
            const Tag = i === 0 ? Box : Collapse

            return (
              <Tag key={i} className='repeater-wrapper' {...(i !== 0 ? { in: true } : {})}>
                <Grid container>
                  <RepeatingContent item xs={12}>
                    <Grid container sx={{ py: 4, width: '100%', pr: { lg: 0, xs: 4 } }}>
                      <Grid item lg={6} md={5} xs={12} sx={{ px: 4, my: { lg: 0, xs: 4 } }}>
                        <Typography
                          variant='subtitle2'
                          className='col-title'
                          sx={{ mb: { md: 2, xs: 0 }, color: 'text.primary' }}
                        >
                          Medicamento:
                        </Typography>
                        <Select fullWidth size='small'>
                          <MenuItem value='1'>Dorflex</MenuItem>
                          <MenuItem value='2'>Outros</MenuItem>
                        </Select>
                        <TextField
                          rows={2}
                          fullWidth
                          multiline
                          size='small'
                          sx={{ mt: 3.5 }}
                          defaultValue=''
                          placeholder='Posologia'
                        />
                      </Grid>
                      <Grid item lg={2} md={3} xs={12} sx={{ px: 4, my: { lg: 0, xs: 4 } }}>
                        <Typography
                          variant='subtitle2'
                          className='col-title'
                          sx={{ mb: { md: 2, xs: 0 }, color: 'text.primary' }}
                        >
                          Quantidade:
                        </Typography>
                        <TextField
                          size='small'
                          type='number'
                          placeholder='1'
                          defaultValue='1'
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </Grid>
                      <Grid item lg={4} md={2} xs={12} sx={{ px: 4, my: { lg: 0, xs: 4 } }}>
                        <Typography
                          variant='subtitle2'
                          className='col-title'
                          sx={{ mb: { md: 2, xs: 0 }, color: 'text.primary' }}
                        >
                          Medida:
                        </Typography>
                        <Select fullWidth size='small' defaultValue='comprimido'>
                          <MenuItem value='comprimido'>Comprimido</MenuItem>
                          <MenuItem value='capsula'>Cápsula</MenuItem>
                          <MenuItem value='Líquido'>Líquido</MenuItem>
                          <MenuItem value='dose'>Dose</MenuItem>
                        </Select>
                      </Grid>
                    </Grid>
                    <InvoiceAction>
                      <IconButton size='small' onClick={deleteForm}>
                        <Icon icon='mdi:close' fontSize={20} />
                      </IconButton>
                    </InvoiceAction>
                  </RepeatingContent>
                </Grid>
              </Tag>
            )
          }}
        </Repeater>

        <Grid container sx={{ mt: 4.75 }}>
          <Grid item xs={12} sx={{ px: 0 }}>
            <Button
              size='small'
              variant='contained'
              startIcon={<Icon icon='mdi:plus' fontSize={20} />}
              onClick={() => setCount(count + 1)}
            >
              Adicionar Medicamento
            </Button>
          </Grid>
        </Grid>
      </RepeaterWrapper>
    </Card>
  )
}

export default ReceitaFormAdd
