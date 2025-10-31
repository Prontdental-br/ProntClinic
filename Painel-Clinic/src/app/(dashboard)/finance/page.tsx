'use client'
import { useEffect, useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DataGrid } from '@mui/x-data-grid'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField
} from '@mui/material'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import axios from 'axios'
import { io } from 'socket.io-client'
import { faCreditCard, faEye, faMoneyBill, faPen, faPrint } from '@fortawesome/free-solid-svg-icons'
import dayjs from 'dayjs'

import OptionsMenu from '../../../@core/components/option-menu'

import Icon from '../../../components/icon'
import { clearNumber } from '@/utils/format'
import Chip from '@/components/chip'

let socket

const Circle = ({ color }: any) => {
  const shapeStyles = { bgcolor: color, width: 20, height: 20, marginTop: '10%', display: 'block' }
  const shapeCircleStyles = { borderRadius: '50%' }

  return <Box component='span' sx={{ ...shapeStyles, ...shapeCircleStyles }} />
}

function daysBetweenDates(dateString: string) {
  // Data atual
  const currentDate: any = new Date()

  // Data definida
  const targetDate: any = new Date(dateString)

  // Cálculo da diferença em milissegundos
  const diffInMs = Math.abs(currentDate - targetDate)

  // Conversão de milissegundos para dias
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  console.log(diffInDays)

  return diffInDays
}

export default function Page({ params }: any) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [userData, setUserData] = useState<any>({})
  const [dataList, setDataList] = useState([])
  const [dataListCharges, setDataListCharges] = useState([])
  const [userIndexSel, setUserIndexSel] = useState(0)
  const [name, setName] = useState('')
  const [value, setValue] = useState('1')

  const userDataStorage = JSON.parse(window.localStorage.getItem('userData') || '{}')

  const role = userDataStorage?.role ? userDataStorage.role : ''

  function handleUserDataChange(field: string, value: any) {
    setUserData({
      ...userData,
      [field]: value
    })
  }

  const fetchData = async (name?: string) => {
    const token = localStorage.getItem('token')

    const { data } = await axios.get(`/api/account?name=${name || ''}`, {
      headers: {
        Authorization: `bearer ${token}`
      }
    })

    console.log(data)

    setDataList(
      data.map((d: any, i: number) =>
        Object.assign({ ...d, index: i, plan: d.plan || 'Standard', isOnline: daysBetweenDates(d.lastSession) < 1 })
      )
    )

    const resp = await axios.get(`/api/charge`, {
      headers: {
        Authorization: `bearer ${token}`
      }
    })

    console.log(resp.data)

    setDataListCharges(resp.data.map((d: any, i: number) => Object.assign({ ...d, index: i })))
  }

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  useEffect(() => {
    fetchData(name)
  }, [name])

  useEffect(() => {
    // eslint-disable-next-line padding-line-between-statements
    ;(async () => {
      const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')

      console.log(userData)

      socket = io(process.env.NEXT_PUBLIC_OWN_URL || '', {
        transports: ['websocket', 'polling', 'flashsocket'],
        timeout: 20000
      })

      socket.on('connect', () => {
        console.log('connected')
      })

      socket.on('new_user', function (data) {
        if (typeof data === 'string') {
          setDataList(dataList => {
            console.log(data)
            const newDataList: any = [...dataList]

            console.log(dataList)
            const index = dataList.findIndex((d: any) => d.id === data)

            console.log(index)

            if (index > -1) {
              console.log(index)
              newDataList[index] = { ...newDataList[index], isOnline: true }
            }

            return newDataList
          })
        }
      })

      socket.on('dis_user', function (data) {
        if (typeof data === 'string') {
          setDataList(dataList => {
            console.log(data)
            const newDataList: any = [...dataList]

            console.log(dataList)
            const index = dataList.findIndex((d: any) => d.id === data)

            console.log(index)

            if (index > -1) {
              console.log(index)
              newDataList[index] = { ...newDataList[index], isOnline: false }
            }

            return newDataList
          })
        }
      })
    })()

    fetchData()
  }, [])

  async function switchUser(id: string) {
    const index = dataList.findIndex((el: any) => el.id === id)
    const newData: any = [...dataList]

    const active = !newData[index].active

    newData[index] = { ...newData[index], active }

    const token = localStorage.getItem('token')

    await axios.patch(
      `/api/account/${id}`,
      { active },
      {
        headers: {
          Authorization: `bearer ${token}`
        }
      }
    )

    setDataList(newData)
  }

  async function switchSubscription(id: string) {
    const index = dataList.findIndex((el: any) => el.id === id)
    const newData: any = [...dataList]

    const expiredSubscription = !newData[index].expiredSubscription

    newData[index] = { ...newData[index], expiredSubscription }

    console.log('DADOS', newData[index])

    console.log('EXPIRED', expiredSubscription)

    const token = localStorage.getItem('token')

    await axios.patch(
      `/api/account/${id}`,
      { expiredSubscription },
      {
        headers: {
          Authorization: `bearer ${token}`
        }
      }
    )

    setDataList(newData)
  }

  const sendBill = async (id: string, email: string, type?: string, plan?: string, dueDate?: string) => {
    console.log(email)
    const token = localStorage.getItem('token')

    const { data } = await axios.post(
      `/api/payment`,
      { userId: id, email, billingType: type, plan, dueDate },
      {
        headers: {
          Authorization: `bearer ${token}`
        }
      }
    )

    console.log(data)

    open(data.invoiceUrl)
  }

  const openBill = async (id: string, email: string) => {
    console.log(email)
    const token = localStorage.getItem('token')

    const { data } = await axios.get(`/api/payment`, {
      params: { userId: id, email },
      headers: {
        Authorization: `bearer ${token}`
      }
    })

    console.log(data)

    open(data.invoiceUrl)
  }

  const openTransaction = async (id: string, email: string) => {
    console.log(email)
    const token = localStorage.getItem('token')

    const { data } = await axios.get(`/api/payment`, {
      params: { userId: id, email },
      headers: {
        Authorization: `bearer ${token}`
      }
    })

    console.log(data)

    open(data.transactionReceiptUrl)
  }

  const waSendBill = async (id: string, email: string, phone: string) => {
    console.log(email)
    const token = localStorage.getItem('token')

    const { data } = await axios.get(`/api/payment`, {
      params: { userId: id, email },
      headers: {
        Authorization: `bearer ${token}`
      }
    })

    console.log(data)

    open(`https://wa.me/55${clearNumber(phone)}?text=${encodeURI(`Acesse sua cobrança: ${data.invoiceUrl}`)}`)
  }

  const waTalk = async (id: string, email: string, phone: string) => {
    console.log(email)
    const token = localStorage.getItem('token')

    const { data } = await axios.get(`/api/payment`, {
      params: { userId: id, email },
      headers: {
        Authorization: `bearer ${token}`
      }
    })

    console.log(data)

    open(`https://wa.me/55${clearNumber(phone)}?text=Olá`)
  }

  const detailsBill = async (id: string, email: string) => {
    console.log(email)
    const token = localStorage.getItem('token')

    const { data } = await axios.get(`/api/payment`, {
      params: { userId: id, email },
      headers: {
        Authorization: `bearer ${token}`
      }
    })

    setDataList(dataList => {
      console.log(data)
      const newDataList: any = [...dataList]

      console.log(dataList)

      const index = dataList.findIndex((d: any) => d.id === id)

      console.log(index)

      if (index > -1) {
        console.log(index)
        newDataList[index] = { ...newDataList[index], status: data.payStatus, value: data.value, dueDate: data.dueDate }
      }

      return newDataList
    })
  }

  const columnsCharges: any = [
    { field: 'name', headerName: 'Nome', flex: 0.05, minWidth: 50 },
    {
      field: 'status',
      headerName: 'Status',
      width: 5,
      flex: 0.02,
      renderCell: ({ row }: any) =>
        row.status ? (
          <Chip
            size='small'
            label={row.status === 'RECEIVED' || row.status === 'CONFIRMED' ? 'PAGO' : 'PENDENTE'}
            color={row.status === 'RECEIVED' || row.status === 'CONFIRMED' ? 'success' : 'secondary'}
            sx={{
              textTransform: 'capitalize',
              '& .MuiChip-label': { px: 2.5, lineHeight: 1.385 }
            }}
          />
        ) : (
          <></>
        )
    },
    {
      field: 'value',
      headerName: 'Valor',
      width: 5,
      flex: 0.02,
      renderCell: ({ row }: any) => (
        <Button title='Status' onClick={() => detailsBill(row.id, row?.users[0]?.email)}>
          {row.value ? row.value : ''}
        </Button>
      )
    },
    {
      field: 'dueDate',
      headerName: 'Data de vencimento',
      width: 5,
      flex: 0.04,
      renderCell: ({ row }: any) => (
        <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
          <DatePicker
            label='Data *'
            format='DD/MM/YYYY'
            value={dayjs(row.dueDate)}
            onChange={(newValue: any) => {
              const newDataList: any = [...dataList]

              newDataList[row.index] = { ...newDataList[row.index], dueDate: newValue.toDate() }
              setDataList(newDataList)
            }}
            sx={{
              input: { paddingTop: 1, paddingBottom: 1 },
              'label[data-shrink=false]': { top: -10 }
            }}

            //renderInput={params => <TextField {...params} />}
          />
        </LocalizationProvider>
      )
    }
  ]

  const columns: any = [
    { field: 'name', headerName: 'Nome', flex: 0.05, minWidth: 50 },

    /*{
      field: 'status', headerName: 'Status', width: 5, flex: 0.02, renderCell: ({ row }: any) => (
        row.status ?
          <Chip
            size='small'
            label={(row.status === 'RECEIVED' || row.status === 'CONFIRMED') ? 'PAGO' : 'PENDENTE'}
            color={(row.status === 'RECEIVED' || row.status === 'CONFIRMED') ? 'success' : 'secondary'}
            sx={{
              textTransform: 'capitalize',
              '& .MuiChip-label': { px: 2.5, lineHeight: 1.385 }
            }}
          /> :
          <></>
      )
    },
    {
      field: 'value', headerName: 'Valor', width: 5, flex: 0.02, renderCell: ({ row }: any) => (
        <Button title="Status" onClick={() => detailsBill(row.id, row?.users[0]?.email)}>
          {row.value ? row.value : ""}
        </Button>
      )
    },*/
    {
      field: 'plan',
      headerName: 'Plano',
      width: 5,
      flex: 0.03,
      renderCell: ({ row }: any) => (
        <Select
          label='Plano'
          value={row.plan}
          onChange={e => {
            const newDataList: any = [...dataList]

            newDataList[row.index] = { ...newDataList[row.index], plan: e.target.value }
            setDataList(newDataList)
          }}
        >
          <MenuItem value='Standard'>Standard</MenuItem>
          <MenuItem value='Premium'>Premium</MenuItem>
        </Select>
      )
    },
    {
      field: 'dueDate',
      headerName: 'Data de vencimento',
      width: 5,
      flex: 0.04,
      renderCell: ({ row }: any) => (
        <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
          <DatePicker
            label='Data *'
            format='DD/MM/YYYY'
            value={dayjs(row.dueDate)}
            onChange={(newValue: any) => {
              const newDataList: any = [...dataList]

              newDataList[row.index] = { ...newDataList[row.index], dueDate: newValue.toDate() }
              setDataList(newDataList)
            }}
            sx={{
              input: { paddingTop: 1, paddingBottom: 1 },
              'label[data-shrink=false]': { top: -10 }
            }}

            //renderInput={params => <TextField {...params} />}
          />
        </LocalizationProvider>
      )
    },
    {
      field: 'lastSession',
      headerName: 'Último login',
      width: 5,
      flex: 0.02,
      renderCell: ({ row }: any) => <p>{row.lastSession ? dayjs(row.lastSession)?.format?.('DD/MM/YYYY') : ''}</p>
    },
    {
      flex: 0.02,
      minWidth: 10,
      sortable: false,
      headerName: 'Online',
      renderCell: ({ row }: any) => <Circle color={row.isOnline ? 'green' : 'red'} />
    },
    {
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: any) => (
        <>
          <Button title='Visualizar cobrança' onClick={() => openBill(row.id, row?.users[0]?.email)}>
            <FontAwesomeIcon icon={faPrint} />
          </Button>
          <Button
            title='Visualizar cliente'
            onClick={() => {
              setUserIndexSel(row.index)
              setDialogOpen(true)
            }}
          >
            <FontAwesomeIcon icon={faEye} />
          </Button>
          {/* <Button title="Emitir cobrança por boleto" onClick={() => sendBill(row.id, row.users[0]?.email, "BOLETO", row.plan, row.dueDate)}>
            <FontAwesomeIcon icon={faMoneyBill} />
          </Button>
          <Button title="Emitir cobrança cartão" onClick={() => sendBill(row.id, row.users[0]?.email, "CREDIT_CARD", row.plan, row.dueDate)}>
            <FontAwesomeIcon icon={faCreditCard} />
          </Button> */}

          {role !== 'finance' && (
            <>
              <Button
                title='Emitir cobrança por boleto'
                onClick={() => sendBill(row.id, row.users[0]?.email, 'BOLETO', row.plan, row.dueDate)}
              >
                <FontAwesomeIcon icon={faMoneyBill} />
              </Button>

              <Button
                title='Emitir cobrança cartão'
                onClick={() => sendBill(row.id, row.users[0]?.email, 'CREDIT_CARD', row.plan, row.dueDate)}
              >
                <FontAwesomeIcon icon={faCreditCard} />
              </Button>
            </>
          )}
          <Button title='Enviar para WhatsApp' onClick={() => waSendBill(row.id, row.users[0]?.email, row.cellPhone)}>
            <Icon icon='mdi:whatsapp' fontSize={20} />
          </Button>

          {role !== 'finance' && <Switch color='success' checked={row.active} onChange={v => switchUser(row.id)} />}

          {role !== 'finance' && (
            <Switch color='success' checked={row.expiredSubscription} onChange={v => switchSubscription(row.id)} />
          )}

          {row.status && row.status === 'RECEIVED' && (
            <OptionsMenu
              iconButtonProps={{ size: 'small' }}
              options={[
                {
                  text: 'Emitir recibo',
                  menuItemProps: {
                    onClick: () => openTransaction(row.id, row.users[0]?.email)
                  }
                },
                {
                  text: 'Conersar no WhatsApp Web',
                  menuItemProps: {
                    onClick: () => waTalk(row.id, row.users[0]?.email, row.cellPhone)
                  }
                }

                /*{
                  text: 'Emitir contrato',
                  href: `/apps/invoice/edit/${row.id}`,
                  icon: <Icon icon='mdi:pencil-outline' fontSize={20} />
                },*/
                /*{
                  text: 'Emitir recibo',
                  icon: <Icon icon='mdi:delete-outline' fontSize={20} />,
                  menuItemProps: {

                  }
                },*/
              ]}
            />
          )}

          {row.status && row.status === 'PENDING' && (
            <OptionsMenu
              iconButtonProps={{ size: 'small' }}
              options={[
                {
                  text: 'Gerar boleto',
                  menuItemProps: {
                    onClick: () => openBill(row.id, row.users[0]?.email)
                  }
                },

                {
                  text: 'Conersar no WhatsApp Web',
                  menuItemProps: {
                    onClick: () => waTalk(row.id, row.users[0]?.email, row.cellPhone)
                  }
                }

                /*{
                  text: 'Emitir contrato',
                  href: `/apps/invoice/edit/${row.id}`,
                  icon: <Icon icon='mdi:pencil-outline' fontSize={20} />
                },*/
                /*{
                  text: 'Emitir recibo',
                  icon: <Icon icon='mdi:delete-outline' fontSize={20} />,
                  menuItemProps: {

                  }
                },*/
              ]}
            />
          )}
        </>
      )
    }
  ]

  return (
    <>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={params.role} />
          <CardContent>
            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChange} aria-label='lab API tabs example'>
                    <Tab label='Clientes' value='1' />
                    <Tab label='Cobranças' value='2' />
                  </TabList>
                </Box>
                <TabPanel value='1'>
                  <TextField onChange={e => setName(e.target.value)} value={name} label='Nome' />
                  <div style={{ height: 400, width: '100%' }}>
                    <DataGrid rows={dataList} columns={columns} />
                  </div>
                </TabPanel>
                <TabPanel value='2'>
                  <div style={{ height: 400, width: '100%' }}>
                    <DataGrid rows={dataListCharges} columns={columnsCharges} />
                  </div>
                </TabPanel>
              </TabContext>
            </Box>

            <p>
              Total pago:{' '}
              {dataList
                .filter((d: any) => d.status === 'RECEIVED')
                .reduce((acc: number, curr: any) => (typeof curr.value === 'number' ? curr.value : 0) + acc, 0)}
            </p>
            <p>Total online: {dataList.filter((d: any) => d.isOnline).length}</p>
          </CardContent>
        </Card>
      </Grid>
      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} fullWidth={true} maxWidth='md'>
        <Grid style={{ display: 'flex', flexDirection: 'row' }}>
          <DialogTitle>Usuário</DialogTitle>
        </Grid>
        <DialogContent>
          <Grid container spacing={2} style={{ paddingTop: 10 }}>
            <Grid item xs={4}>
              {dataList[userIndexSel] &&
                ['name', 'cellPhone'].map((k: string) => (
                  <>
                    <h3>{k}</h3>
                    <p>{dataList[userIndexSel][k]}</p>
                  </>
                ))}
              {dataList[userIndexSel] && dataList[userIndexSel]['users'] && dataList[userIndexSel]['users'][0] && (
                <>
                  <h3>Email</h3>
                  <p>{dataList[userIndexSel]['users'][0]['email']}</p>
                </>
              )}
              {dataList[userIndexSel] && dataList[userIndexSel]['clinic'] && (
                <>
                  <h3>CpfCnpj</h3>
                  <p>{dataList[userIndexSel]['clinic']['doc_number']}</p>
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color='secondary' onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
