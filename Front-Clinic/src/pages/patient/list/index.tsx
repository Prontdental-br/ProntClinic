/* eslint-disable @typescript-eslint/no-unused-vars */
// ** React Imports
import { useState, useEffect, MouseEvent, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'
import { InferGetStaticPropsType } from 'next/types'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'

import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { DataGrid, GridColDef, GridToolbar, GridToolbarContainer, GridToolbarExport, ptBR } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CardStatisticsHorizontal from 'src/@core/components/card-statistics/card-stats-horizontal'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Actions Imports
import { fetchData, addPatient, updatePatient, deletePatient } from 'src/store/apps/patient'

// ** Third Party Components

// ** Types Imports
import { AppDispatch, RootState } from 'src/store'

// import { CardStatsType } from 'src/@fake-db/types'
import { ThemeColor } from 'src/@core/layouts/types'
import { PatientDataType, PlanType } from 'src/types/apps/userTypes'
import { CardStatsHorizontalProps } from 'src/@core/components/card-statistics/types'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/user/list/TableHeader'
import AddUserDrawer from 'src/views/apps/user/list/AddUserDrawer'
import ModalAddPacient from 'src/views/components/ModalAddPacient'
import { getStaticProps } from '../view/[tab]/[id]'
import CustomWhatsAppChip from 'src/views/components/CustomWhatsAppChip'
import api from 'src/@core/components/api-client'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface UserRoleType {
  [key: string]: { icon: string; color: string }
}

interface UserStatusType {
  [key: string]: ThemeColor
}

// ** Vars
const userRoleObj: UserRoleType = {
  admin: { icon: 'mdi:laptop', color: 'error.main' },
  author: { icon: 'mdi:cog-outline', color: 'warning.main' },
  editor: { icon: 'mdi:pencil-outline', color: 'info.main' },
  maintainer: { icon: 'mdi:chart-donut', color: 'success.main' },
  subscriber: { icon: 'mdi:account-outline', color: 'primary.main' },
  patient: { icon: 'mdi:account-outline', color: 'primary.main' }
}

interface CellType {
  row: PatientDataType
}

const userStatusObj: UserStatusType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

const LinkStyled = styled(Link)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main
  }
}))

const menAvatar = ['1', '3', '5', '7']
const womenAvatar = ['2', '4', '6', '8']

// ** renders client column
const renderClient = (row: PatientDataType) => {
  if (row.avatar.length) {
    return <CustomAvatar src={row.avatar} sx={{ mr: 3, width: 34, height: 34 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={row.avatarColor || 'primary'}
        sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
      >
        {getInitials(row.name ? row.name : 'John Doe')}
      </CustomAvatar>
    )
  }
}

const RowOptions = ({
  id,
  toggleModal,
  name
}: {
  id: string | number
  toggleModal: (id: string | null) => void
  name: string
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | number | null>(null)

  const openDeleteDialog = (id: string | number) => {
    setSelectedPatientId(id)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedPatientId(null)
  }

  const url = `/patient/view/about/${id}`

  return (
    <>
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirmar exclusão: {name}</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja apagar este paciente?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancelar</Button>
          <Button
            onClick={async () => {
              if (selectedPatientId !== null) {
                try {
                  await dispatch(deletePatient(selectedPatientId)).unwrap()
                  toast.success('Paciente removido com sucesso!')
                } catch (error) {
                  toast.error('Erro ao deletar paciente.')
                }
              }
              closeDeleteDialog()
            }}
            color='error'
          >
            Apagar
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton component={Link} href={url}>
          <Icon icon='mdi:eye-outline' fontSize={20} />
        </IconButton>

        <IconButton onClick={() => toggleModal(id.toString())}>
          <Icon icon='mdi:pencil-outline' fontSize={20} />
        </IconButton>

        <IconButton onClick={() => openDeleteDialog(id)}>
          <Icon icon='mdi:delete-outline' fontSize={20} />
        </IconButton>
      </Box>
    </>
  )
}

const UserList = ({ apiData }: InferGetStaticPropsType<typeof getStaticProps>) => {
  // ** State
  const [value, setValue] = useState<string>('')
  const router = useRouter()
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [openModalAddPatient, setOpenModalAddPatient] = useState(false)
  const [plans, setPlans] = useState([])

  useEffect(() => {
    api
      .get('/plan')
      .then(response => {
        console.log(response)
        setPlans(response.data)
      })
      .catch(error => {
        //console.log({ id })
        console.log(error)
      })
      .finally(() => {
        //setLoadingData(false)
      })
  }, [])

  // const [patients, setPatients] = useState<PatientDataType[]>([])
  const [idPatient, setIdPatient] = useState<string | number | null>(null)

  const handleOpenCloseModal = (id: string | number | null) => {
    setIdPatient(id)
    setOpenModalAddPatient(!openModalAddPatient)
  }

  const handleLinkOptionsEdit = (id: string) => {
    setIdPatient(id)
    setOpenModalAddPatient(true)
  }

  const columns: GridColDef[] = [
    {
      flex: 0.3,
      minWidth: 250,
      field: 'name',
      headerName: 'PACIENTE',
      renderCell: ({ row }: CellType) => {
        const { id, name } = row
        const url = '/patient/view/about/'.concat(id.toString())

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <LinkStyled href={url}>{name}</LinkStyled>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 210,
      field: 'cellPhone',
      headerName: 'FONE',
      renderCell: ({ row }: CellType) => (
        <CustomWhatsAppChip phoneNumber={row.cellPhone ? row.cellPhone!.replaceAll(' ', '') : ''} />
      )
    },
    {
      flex: 0.15,
      field: 'planType',
      minWidth: 150,
      headerName: 'PLANO',
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3, color: userRoleObj[row.role].color } }}>
            <Icon icon={userRoleObj[row.role].icon} fontSize={20} />
            <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
              {(plans.find((p: any) => p.id === row.planType) as any)?.name}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 90,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: CellType) => <RowOptions id={row.id} toggleModal={handleOpenCloseModal} name={row.name} />
    }
  ]

  function getRandomItem(arr: any[]) {
    const randomIndex = Math.floor(Math.random() * arr.length)
    const item = arr[randomIndex]

    return item
  }

  const handleSavePaciente = async (data: any) => {
    try {
      if (data.id) {
        await dispatch(updatePatient(data)).unwrap()
        toast.success('Paciente atualizado com sucesso!')
      } else {
        let avatarValue: string | null = null
        if (data.gender === 'Masculino') {
          avatarValue = getRandomItem(menAvatar)
        } else if (data.gender === 'Feminino') {
          avatarValue = getRandomItem(womenAvatar)
        }

        await dispatch(addPatient({ ...data, avatar: avatarValue })).unwrap()
        toast.success('Paciente adicionado com sucesso!')
      }
    } catch (error: any) {
      toast.error('Erro ao salvar paciente: ' + (error?.message || 'Tente novamente.'))
    }
  }

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) =>
    state.patient.data.filter((patient: any) => patient.name !== 'Compromisso')
  )

  useEffect(() => {
    dispatch(fetchData(value))
  }, [dispatch, value])

  const handleFilter = useCallback((val: string) => {
    setValue(val)
  }, [])

  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen)

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <Grid marginBottom={'1em'}>
          {/* <Button>
            <a className='download-model' href={'/excel/modelo.xlsx'}>
              Baixar modelo
            </a>
          </Button>
          <Button variant='contained' component='label' onClick={() => router.push('/pages/account-settings/import-patients/')}>
            <Icon icon='material-symbols:upload' />
            {'Importar Pacientes'}
          </Button> */}
        </Grid>
      </GridToolbarContainer>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        {apiData && (
          <Grid container spacing={6}>
            {apiData.statsHorizontal.map((item: CardStatsHorizontalProps, index: number) => {
              return (
                <Grid item xs={12} md={3} sm={6} key={index}>
                  <CardStatisticsHorizontal {...item} icon={<Icon icon={item.icon as string} />} />
                </Grid>
              )
            })}
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableHeader value={value} handleFilter={handleFilter} toggle={() => handleOpenCloseModal(null)} />
          <DataGrid
            autoHeight
            rows={store}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
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
      <AddUserDrawer open={addUserOpen} toggle={toggleAddUserDrawer} />
      <ModalAddPacient
        id={idPatient}
        open={openModalAddPatient}
        onClose={handleOpenCloseModal}
        onSave={handleSavePaciente}
      />
    </Grid>
  )
}

export default UserList
