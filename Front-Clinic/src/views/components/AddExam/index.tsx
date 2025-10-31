import React, { useEffect, useState } from 'react'
import {
  Button,
  CardHeader,
  Card,
  IconButton,
  DialogContent,
  DialogContentText,
  Typography,
  Dialog,
  DialogTitle,
  Tooltip,
  CardContent,
  Grid,
  DialogActions
} from '@mui/material'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import PrintIcon from '@mui/icons-material/Print'
import DeleteIcon from '@mui/icons-material/Delete'
import AddDocumentDialog from './AddDocumentDialog'
import api from 'src/@core/components/api-client'
import dayjs from 'dayjs'
import { Icon } from '@iconify/react'
import { clearNumber } from 'src/@core/utils/format'
import { Box } from '@mui/system'
import CardBudgetVertical from 'src/@core/components/card-statistics/card-budget-vertical'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import ExamForm from '../ExamForm'
import CardExamVertical from 'src/@core/components/card-statistics/card-exam-vertical'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

interface AddExamProps {
  onUpload: (images: string[]) => void
  patientId?: string
  exam_type?: string
}

export default function AddExam({ onUpload, patientId, exam_type }: AddExamProps) {
  const [contratos, setContratos] = useState<any[]>([])
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [openExamForm, setOpenExamForm] = useState(false)
  const [typeExamForm, setTypeOpenExamForm] = useState('')
  const [openModalExamDetails, setOpenModalExamDetails] = useState<string | number | undefined | null>(null)
  const [loading, setLoading] = useState(false)
  const [openWhatsAppDialog, setOpenWhatsAppDialog] = useState(false)
  const router = useRouter()

  const fetchData = async () => {
    const { data } = await api.get(`/exams?patientId=${patientId}`)
    console.log(data)
    setContratos(data)
  }

  useEffect(() => {
    if (exam_type === 'all') {
      setOpenExamForm(false)
    } else if (exam_type) {
      console.log(exam_type)
      setOpenExamForm(true)
      setTypeOpenExamForm(exam_type)
    }
    fetchData()
  }, [])

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleSendWhatsApp = async (row: any) => {
    try {
      setLoading(true)

      const message = `👋 Olá ${row.patient.name}!
  
  Você está recebendo a seu *exame digital* assinada pelo profissional através do sistema *Cláiris IA Software*.
  
  Para visualizar ou baixar sua receita, basta acessar o link abaixo:
  
  📄 *Link da receita:* ${process.env.NEXT_PUBLIC_URL_FRONT}/exam/print/${row.id}
  
  
  Este documento possui *assinatura digital válida*, garantindo segurança e autenticidade.
  
  *Cláiris IA Software – Tecnologia a serviço da sua saúde!*`

      const phone = row.patient.cellPhone

      if (!message || !phone) {
        toast.error('Mensagem ou telefone não encontrados')
        setLoading(false)

        return
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

  const handleEmitExam = async (documentId: string) => {
    if (documentId) {
      const { data } = await api.get(`/contracts-signature/docId/${documentId}`)

      if (data) {
        window.open(`/exam/print/${documentId}`, '_blank')

        return
      }

      await api.post('/contracts-signature', {
        documentType: 'exame',
        documentId: documentId
      })

      fetchData()
      window.open(`/exam/print/${documentId}`, '_blank')
    } else {
      console.log('Nenhum documentId retornado da criação da receita')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'professional',
      headerName: 'Profissional',
      width: 150,
      renderCell: ({ row }) => <>{row.professional?.name}</>
    },
    { field: 'examType', headerName: 'Tipo de exame', width: 300 },
    {
      field: 'date',
      headerName: 'Data',
      width: 300,
      renderCell({ row }) {
        return dayjs(row.created_at)?.format?.('DD/MM/YYYY')
      }
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      renderCell: params => {
        console.log(params)

        //dayjs(data.date)?.format?.('DD/MM/YYYY')

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size='small' onClick={() => setOpenModalExamDetails(params.row.id)}>
              <Icon icon='mdi:eye-outline' />
            </IconButton>

            <IconButton size='small' onClick={() => handleSendWhatsApp(params.row)}>
              <Icon icon='mdi:whatsapp' fontSize={20} />
            </IconButton>

            <Tooltip title='Imprimir'>
              <IconButton size='small' aria-label='imprimir' onClick={() => handleEmitExam(params.row.id)}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => handleDelete(params.row.id)} aria-label='deletar' color='error'>
              <DeleteIcon />
            </IconButton>

            <Dialog
              open={openModalExamDetails === params.row.id}
              onClose={() => setOpenModalExamDetails(null)}
              aria-labelledby='item-view-edit'
              aria-describedby='item-view-edit-description'
              sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 1000 } }}
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
                <iframe src={`/exam/printv2/${params.row.id}`} width='900' height='600'></iframe>
              </DialogTitle>
            </Dialog>
          </Box>
        )
      }
    }
  ]

  const handleDelete = async (id: number) => {
    try {
      console.log(id)
      const data = await api.delete(`/exams/${id}`)
      console.log(data)
      setContratos(prev => prev.filter(a => a.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Card sx={{ mt: 2 }}>
      {openExamForm ? (
        <CardContent>
          <ExamForm
            patientId={patientId || ''}
            tipoExam={typeExamForm}
            back={() => {
              setOpenExamForm(false)
            }}
          />
        </CardContent>
      ) : (
        <>
          <CardHeader
            action={
              <Button variant='contained' color='primary' onClick={handleOpenDialog}>
                + Adicionar Laboratório RX
              </Button>
            }
          />

          <Grid item xs={12}>
            <CardContent>
              <CardHeader title='Pedidos de exames' />
              <ApexChartWrapper>
                <Grid container spacing={6} className='match-height'>
                  <Grid item xs={12} md={6}>
                    <CardExamVertical
                      title='RADIOGRAFIA'
                      imgSrc='/images/buttons/RADIOGRAFIA.png'
                      onClick={() => {
                        setOpenExamForm(true)
                        setTypeOpenExamForm('radiografia')
                      }}
                      descriptionButton={false}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CardExamVertical
                      title='TOMOGRAFIA'
                      imgSrc='/images/buttons/TOMOGRAFIA.png'
                      onClick={() => {
                        setOpenExamForm(true)
                        setTypeOpenExamForm('tomografia')
                      }}
                      descriptionButton={false}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CardExamVertical
                      title='ORTODONTIA'
                      imgSrc='/images/buttons/ORTODONTIA.png'
                      onClick={() => {
                        setOpenExamForm(true)
                        setTypeOpenExamForm('ortodontia')
                      }}
                      descriptionButton={false}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CardExamVertical
                      title='DIGITAIS'
                      imgSrc='/images/buttons/DIGITAIS.png'
                      onClick={() => {
                        setOpenExamForm(true)
                        setTypeOpenExamForm('digitais')
                      }}
                      descriptionButton={false}
                    />
                  </Grid>
                </Grid>
              </ApexChartWrapper>
            </CardContent>
          </Grid>

          <AddDocumentDialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            patientId={patientId}
            fetchData={fetchData}
          />

          <DataGrid
            rows={contratos}
            columns={columns}
            autoHeight
            localeText={{
              ...ptBR.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: 'Nenhum registro encontrado',
              columnMenuManageColumns: 'Gerenciar colunas'
            }}
          />

          <Dialog open={openWhatsAppDialog} onClose={() => setOpenWhatsAppDialog(false)}>
            <DialogTitle>Conexão Necessária</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Para enviar mensagens via WhatsApp, é necessário conectar sua conta.
              </DialogContentText>
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
        </>
      )}
    </Card>
  )
}
