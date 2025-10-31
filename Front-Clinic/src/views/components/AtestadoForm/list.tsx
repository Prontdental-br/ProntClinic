import { useEffect, useState } from 'react'
import { IconButton, Grid, Button, Card, CardHeader, DialogTitle, Dialog, Tooltip, Box, DialogContentText, DialogContent, Typography, DialogActions } from '@mui/material'

import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import PrintIcon from '@mui/icons-material/Print'
import DeleteIcon from '@mui/icons-material/Delete'

import initialAtestados from './mocks/atestados.json'
import AtestadoDialog from './AtestadoDialog'
import api from 'src/@core/components/api-client'
import dayjs from 'dayjs'
import { Icon } from '@iconify/react'
import { clearNumber } from 'src/@core/utils/format'
import { useAuth } from 'src/hooks/useAuth'
import { removerAcentos } from 'src/@core/utils/remover-acentos'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

interface AtestadoFormProps {
  onBack: () => void
  patientId?: string
}

interface Atestado {
  id: number
  profissional: string
  data: string
  infoPaciente: {
    paciente: string
    nasc: string
    codplano: string
  }
  infoMedico: {
    doctor: string
    especialidade: string
    crm: string
  }
  infoAtestado: {
    motivoAtestado: string
    periodoAfastamento: string
    diagnostico: string
    tratamentoPrescrito: string
    restricoes: string
  }
}

const AtestadoFormList: React.FC<AtestadoFormProps> = ({ onBack, patientId }) => {
  const [atestados, setAtestados] = useState<Atestado[]>([])
  const [openModalCertifitateDetails, setOpenModalCertifitateDetails] = useState<string | number | undefined | null>(null)
  const [editingData, setEditingData] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const [openWhatsAppDialog, setOpenWhatsAppDialog] = useState(false);
  const router = useRouter();
  const { user }: { user: any } = useAuth();
  const notAllowedSpecialty = ['recepcionista', 'secretaria'];
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');

  const fetchData = async () => {
    const { data } = await api.get(`/certificate?patientId=${patientId}`)
    setAtestados(data);
  }

  useEffect(()=>{
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData(); 
      }
    };
  
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
    fetchData();
  
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  },[]);

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }
  const handleDialogClose = () => {
    setEditingData(null);
    setDialogOpen(false)
  }

  const handlePrint = (id: number) => {
    // Lógica de impressão do atestado
    console.log(`Imprimindo atestado com ID: ${id}`)
  }

  
  const handleOpenDeleteModal = (id: number) => {
    setIdToDelete(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (idToDelete !== null) {
      try {
        await api.delete(`/certificate/${idToDelete}`);
        setAtestados(prev => prev.filter(a => a.id !== idToDelete));
        toast.success('Atestado excluído com sucesso!');
      } catch (e) {
        console.error(e);
        toast.error('Erro ao excluir o atestado.');
      } finally {
        setOpenDeleteModal(false);
        setIdToDelete(null);
      }
    }
  };

  const handleSendWhatsApp = async (row: any) => {
          try {
            setLoading(true);
        
            const message = `👋 Olá ${row.patient.name}!
  
  Você está recebendo a sua *atestado digital* assinada pelo profissional através do sistema *Cláiris IA Software*.
  
  Para visualizar ou baixar sua receita, basta acessar o link abaixo:
  
  📄 *Link da receita:* ${process.env.NEXT_PUBLIC_URL_FRONT}/certificate/print/${row.id}
  
  
  Este documento possui *assinatura digital válida*, garantindo segurança e autenticidade.
  
  *Cláiris IA Software – Tecnologia a serviço da sua saúde!*`;
      
            const phone = row.patient.cellPhone;
         
            if (!message || !phone) {
              toast.error('Mensagem ou telefone não encontrados');
              setLoading(false);
              
            return;
            }
        
            const { data } = await api.get('/whatsapp');
            const connection = data?.data?.[0]; 
        
            if (!connection || !connection.isConnected) {
      
              setOpenWhatsAppDialog(true);
              setLoading(false);
        
              return;
            }
        
            await api.post('/whatsapp/send-message', {
              message,
              phone,
              delay: 0
            });
        
            setLoading(false);
            toast.success('Mensagem enviada com sucesso!');
      
          } catch (err) {
            console.error(err);
            setLoading(false);
            toast.error('Erro ao enviar mensagem via WhatsApp');
          }
        };

  const columns: GridColDef[] = [
    { field: 'professional', headerName: 'Profissional', width: 300 },
    {
      field: 'created_at',
      headerName: 'data',
      width: 250,
      renderCell({row}) {
          return row.startDate ? dayjs(row.startDate)?.format?.('DD/MM/YYYY') : dayjs(row.created_at)?.format?.('DD/MM/YYYY')
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 200,
      renderCell: params => {

        //dayjs(data.date)?.format?.('DD/MM/YYYY')
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size='small'
              onClick={()=>{
                handleDialogOpen()
                setEditingData(params.row)
              }}
            >
              <Icon icon='mdi:pen' />
            </IconButton>
            <IconButton size='small'
              onClick={()=>setOpenModalCertifitateDetails(params.row.id)}
            >
              <Icon icon='mdi:eye-outline' />
            </IconButton>

            {userData?.planType !== "E" && (
                  <IconButton
                  size='small'
                  onClick={() => handleSendWhatsApp(params.row)}
                  >

                  <Icon icon='mdi:whatsapp' fontSize={20} />
                </IconButton>
            )}
            

            <Tooltip title='Imprimir'>
              <IconButton size='small' aria-label='imprimir' href={`/certificate/print/${params.row.id}`} target="_blank">
                <PrintIcon />
              </IconButton>
            </Tooltip>
            {!params.row.isSigned && (
              <IconButton onClick={() => handleOpenDeleteModal(params.row.id)} aria-label='deletar' color='error'>
                <DeleteIcon />
              </IconButton>
            )}

            <Dialog
            open={openModalCertifitateDetails === params.row.id}
            onClose={()=>setOpenModalCertifitateDetails(null)}
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
              Receita
            </DialogTitle>
            <DialogContent
              sx={{
                pb: theme => `${theme.spacing(8)} !important`,
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
              }}
            >
              <DialogContentText variant='body2' id='item-view-edit-description' sx={{ textAlign: 'center', mb: 7 }}>
                {['professional','cid','days','startTime','endTime'].map((k: any) =>
                  params.row[k] !== null  && <>
                    <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                      {k}
                    </Typography>
                    <Typography>
                      {params.row[k]}
                    </Typography>
                  </>)}
              </DialogContentText>

            </DialogContent>

          </Dialog>

          </Box>
        );
      }
    }
  ]

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        title='Atestado'
        action={
          user !== null && !notAllowedSpecialty.includes(removerAcentos(user?.professional?.specialty ? user?.professional?.specialty : '').toLowerCase()) ? (<Button variant='contained' color='primary' onClick={() => handleDialogOpen()}>
          + Emitir Atestado
        </Button>) : null
        }
      />

      <AtestadoDialog open={isDialogOpen} onClose={handleDialogClose} patientId={patientId} fetchData={fetchData} editingData={ editingData } />

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Grid item xs={12}>
            <DataGrid rows={atestados} columns={columns} autoHeight localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}} />
          </Grid>
        </Grid>
      </Grid>

           <Dialog open={openWhatsAppDialog} onClose={() => setOpenWhatsAppDialog(false)}>
              <DialogTitle>Conexão Necessária</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Para enviar mensagens via WhatsApp, é necessário conectar sua conta.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenWhatsAppDialog(false)} color="primary">
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setOpenWhatsAppDialog(false);
                    router.push('/pages/account-settings/connect-whatsapp'); 
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
                Tem certeza que deseja excluir este atestado? Esta ação não poderá ser desfeita.
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
    </Card>
  )
}

export default AtestadoFormList
