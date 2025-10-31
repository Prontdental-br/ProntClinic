import { Alert, AlertColor, Button, Card, CardContent, CardHeader, Chip, Grid, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import React, { ReactNode, useEffect, useState } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { PacientDebitDataType } from 'src/types/apps/userTypes'
import CustomChip from 'src/@core/components/mui/chip'
import { uniqueId } from 'lodash'
import api from 'src/@core/components/api-client'
import dayjs from 'dayjs'

interface CellType {
  row: {
    date: string
    title: string
    patientName: string
    professionalName: string
    status: string
  }
}

const ContractSignature = () => {
  const [dataContracts, setDataContracts] = useState<any>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [alert, setAlert] = useState<{ message: string; severity: AlertColor }>({ message: '', severity: 'info' })
  const [showAlert, setShowAlert] = useState(false)

  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const professionalId = userData.professional.id

  async function fetchContractsByProfessional() {
    const { data } = await api.get('contracts-signature/findAllContracts/' + professionalId)

    setDataContracts(data)
  }

  const handleClick = async (row: any) => {
    if (!row.patient.email) {
      // Mostrar alerta de erro se não houver e-mail
      setAlert({ message: `O paciente ${row.patient.name} não possui e-mail para envio.`, severity: 'error' })
    } else {
      const response = await api.post('/contract/send/email', { contractId: row.documentId, email: row.patient.email })

      console.log(response.data)

      if (response.data) {
        setAlert({ message: 'Contrato enviado com sucesso!', severity: 'success' })
      }
    }

    // Exibir o alerta e ocultá-lo após 4 segundos
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  useEffect(() => {
    fetchContractsByProfessional()
  }, [])

  const columns: GridColDef[] = [
    {
      flex: 0.15,
      minWidth: 120,
      headerName: 'Data',
      field: 'date',
      renderCell: ({ row }: CellType) => {
        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {dayjs(row.date)?.format?.('DD/MM/YYYY')}
          </Typography>
        )
      }
    },

    {
      flex: 0.75,
      minWidth: 160,
      headerName: 'Nome',
      field: 'description',
      renderCell: ({ row }: CellType) => {
        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {row.title}
          </Typography>
        )
      }
    },

    {
      flex: 0.34,
      minWidth: 160,
      headerName: 'Paciente',
      field: 'patient',
      renderCell: ({ row }: any) => {
        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {row.patient.name}
          </Typography>
        )
      }
    },

    {
      width: 150,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }: CellType) => {
        let color: 'default' | 'success' | 'warning' | 'error' = 'default' // Define as cores
        let label = '' // Define o texto do chip

        // Define a cor e o texto do chip com base no status
        switch (row.status) {
          case 'completed':
            color = 'success'
            label = 'Assinado'
            break
          case 'pending':
            color = 'warning'
            label = 'Pendente'
            break
          case 'canceled':
            color = 'error'
            label = 'Cancelado'
            break
          default:
            label = 'Indefinido'
        }

        return <Chip label={label} color={color} sx={{ textTransform: 'capitalize' }} />
      }
    },

    {
      flex: 0.1,
      minWidth: 170,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Lógica baseada no status */}
          {row.status === 'pending' ? (
            <Button color='secondary' variant='outlined' onClick={() => handleClick(row)}>
              Enviar Email
            </Button>
          ) : row.status === 'completed' ? (
            <Button
              color='secondary'
              variant='outlined'
              onClick={() => window.open(`/contract/print/${row.documentId}`, '_blank')}
            >
              Baixar PDF
            </Button>
          ) : (
            <Button variant='outlined' disabled>
              Ação não disponível
            </Button>
          )}
        </Box>
      )
    }
  ]

  const totalContracts = dataContracts.reduce(
    (totals: any, contract: any) => {
      if (contract.status === 'pending') {
        totals.pending += 1
      } else if (contract.status === 'completed') {
        totals.signed += 1
      }

      return totals
    },
    { pending: 0, signed: 0 }
  )

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Grid container spacing={2} p={3}>
            <Grid item xs={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  padding: 2,
                  borderRight: '1px solid #e0e0e0' // Divisor
                }}
              >
                <Typography variant='h4' sx={{ marginBottom: 1 }}>
                  {totalContracts.pending}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: '#ffc835',
                      borderRadius: '50%',
                      marginRight: 1
                    }}
                  />
                  <Typography>Assinatura pendente</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  padding: 2
                }}
              >
                <Typography variant='h4' sx={{ marginBottom: 1 }}>
                  {totalContracts.signed}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: 'green',
                      borderRadius: '50%',
                      marginRight: 1
                    }}
                  />
                  <Typography sx={{ fontWeight: 400 }}>Assinados</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          {showAlert && (
            <Alert sx={{ mb: 2, mt: 4 }} severity={alert.severity}>
              {alert.message}
            </Alert>
          )}
          <CardHeader title='Lista de assinaturas' sx={{ '& .MuiCardHeader-action': { m: 0 } }} />
          <CardContent>
            <DataGrid
              autoHeight
              columns={columns}
              rows={dataContracts}
              disableRowSelectionOnClick
              pageSizeOptions={[7, 10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
              localeText={{
              ...ptBR.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: 'Nenhum registro encontrado',
              columnMenuManageColumns: 'Gerenciar colunas',
            }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

ContractSignature.aclAbilities = { action: 'read', subject: 'contracts' }

// ContractSignature.requiredRole = 'admin'

ContractSignature.requiredPlan = 'P'

export default ContractSignature
