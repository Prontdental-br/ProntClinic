import { useEffect, useState } from 'react'
import { IconButton, Grid, Button, CardHeader, Card, Tooltip, DialogContent, DialogTitle, Typography, Dialog, DialogContentText, Box, DialogActions } from '@mui/material'

import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import PrintIcon from '@mui/icons-material/Print'
import DeleteIcon from '@mui/icons-material/Delete'

import PrescriptionForm from './PrescriptionForm'
import api from 'src/@core/components/api-client'
import { co } from '@fullcalendar/core/internal-common'
import { clearNumber } from 'src/@core/utils/format'
import { Icon } from '@iconify/react'
import dayjs from 'dayjs'
import { useAuth } from 'src/hooks/useAuth'
import { removerAcentos } from 'src/@core/utils/remover-acentos'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'

interface AtestadoFormProps {
  data: {}
  onBack: () => void
  patientId: string
}

interface Atestado {
  id: number
  profissional: string
  date: string
  atestado: string
}

type prescriptionType = {
  id: number
  medicamento: string
  quantidade: string
  medida: 'comprimido' | 'capsula' | 'liquido' | 'dose'
  posologia: string
  duration: string
}

const ReceitaFormList: React.FC<AtestadoFormProps> = ({ onBack, patientId }) => {
  const [atestados, setAtestados] = useState<prescriptionType[]>([])
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [prescriptionsList, setPrescriptionsList] = useState<prescriptionType[]>([])
  const [editingData, setEditingData] = useState<any>(null);
  const [openModalPrescriptionDetails, setOpenModalPrescriptionDetails] = useState<string | number | undefined | null>(null)
  const [prescriptionData, setPrescriptionData] = useState({
    id: '',
    patientName: '',
    dateOfBirth: '',
    medication: '',
    dosage: '',
    duration: ''
  })
  const [loading, setLoading] = useState(false);
  const [openWhatsAppDialog, setOpenWhatsAppDialog] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const router = useRouter();

  const { user }: { user: any } = useAuth();
  const notAllowedSpecialty = ['recepcionista', 'secretaria'];

  const fetchData = async () => {
    let { data } = await api.get(`/prescription?patientId=${patientId}`)
    console.log(data)
    data = data.map((d: any) => Object.assign({
      ...d,
      medicamento: d.medicine,
      quantidade: d.quantity,
      medida: d.measure,
      posologia: d.dosage,
      duration: d.duration
    }));
    console.log(data)
    setPrescriptionsList(data);
  }

   const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
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
  }, []);

  const handlePrint = (id: number) => {
    console.log(`Imprimindo atestado com ID: ${id}`)
  }

  const handleOpenModal = (id: number) => {
    setIdToDelete(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (idToDelete !== null) {
      handleDelete(idToDelete);
      setOpenDeleteModal(false);
      toast.success('Receita excluída com sucesso!');
      setIdToDelete(null); 
    }
  };

  const handleDelete = async (id: number) => {
    try {
      console.log(id)
      const data = await api.delete(`/prescription/${id}`);
      console.log(data)
      setPrescriptionsList(prev => prev.filter(a => a.id !== id))
    } catch (e) {
      console.error(e);
    }
  }

  const handlePrescriptionSubmit = async (prescription: any) => {
    try {
      console.log('o que vai ser adicionado', prescription);
      setPrescriptionData(prescription);
  
      const data: any = prescription.map((p: any) => ({
        medicine: p.medicamento,
        quantity: parseFloat(p.quantidade) ?? parseFloat(p.quantity),
        measure: p.medida ?? p.measure,
        dosage: p.posologia ?? p.dosage,
        duration: p.duration,
        professional: p.professional,
        patientId,
        cro: p.cro,
        speciality: p.speciality,
        typeCr: p.typeCr,
        observation: p.observation,
      }));
  
      if (editingData) {
        // Atualização de uma receita existente
        const resp = await api.put(`/prescription/${editingData.id}`, { data });
        fetchData();
  
      } else {
        // Criação de uma nova receita
        const resp = await api.post('/prescription', { data });
        
        fetchData();
        handleDialogClose();
      }
    } catch (e) {
      console.log('Erro na requisição:', e);
    }
  };
  
  const handleEmitReceita = async (documentId: string) => {
    if (documentId) {
      const { data } = await api.get(`/contracts-signature/docId/${documentId}`);
      
      if (data) {
        window.open(`/prescription/print/${documentId}`, '_blank')
        
        return;
      }

      await api.post('/contracts-signature', {
        documentType: 'receita',
        documentId: documentId,
      });
  
      fetchData();
      window.open(`/prescription/print/${documentId}`, '_blank')

    } else {
      console.log('Nenhum documentId retornado da criação da receita');
    }
  };



    const handleSendWhatsApp = async (row: any) => {
        try {
          setLoading(true);


            const messageWithoutCertificateA1 = `👋 Olá *${row.patient.name}*  

  Você está recebendo a sua *receita digital* assinada pelo profissional através do sistema *Cláiris IA Software*.
  
  Para visualizar ou baixar sua receita, basta acessar o link abaixo:
  
  📄 *Link da receita:* ${process.env.NEXT_PUBLIC_URL_FRONT}/prescription/print/${row.id}
  
  
  Este documento possui *assinatura digital válida*, garantindo segurança e autenticidade.
  
  *Cláiris IA Software – Tecnologia a serviço da sua saúde!*`!
      
              const messageWithCertificateA1 = `👋 Olá *${row.patient.name}*!

Você está recebendo sua *receita médica digital assinada*
📄 Link para vizualizar pdf:
${row.pdfUrl ? row.pdfUrl : ''}

No caso de receitas controladas, ela foi assinada com *certificado digital A1* validado pelo *ICP-Brasil, através do sistema **Cláiris IA Software*.

Para acessar e validar, basta inserir o link abaixo no validador oficial do Gov br – ICP-Brasil.
Assim será confirmada sua prescrição digital já assinada:

📄 Link para validação: ${row.pdfUrl ? row.pdfUrl : ''}


🔎 *Passo a passo para farmácia validar:*
1️⃣ Acesse o site do do ITI Validador GOV – ICP-Brasil*
2️⃣ Cole o link da receita no campo indicado
3️⃣ O sistema confirmará a assinatura digital A1 – ICP-Brasil

Em caso de dúvida, nossa equipe está à disposição para ajudar.

*Cláiris IA Software – Clareza, segurança e agilidade em cada prescrição.*
`;
    
          const phone = row.patient.cellPhone;

          const message = row.pdfUrl ? messageWithCertificateA1 : messageWithoutCertificateA1;
       
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
  

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingData(null);
  }

  const handlePrescriptionsChange = (prescriptions: prescriptionType[]) => {
    setPrescriptionsList(prescriptions)
  }

  const columns: GridColDef[] = [
    { field: 'medicamento', headerName: 'Medicamento', width: 300 },
    { 
      field: 'duration', 
      headerName: 'Data', 
      width: 300,
      renderCell: params => (<>
        {dayjs(params.row.created_at)?.format?.('DD/MM/YYYY')}
      </>)
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
              onClick={()=>setOpenModalPrescriptionDetails(params.row.id)}
            >
              <Icon icon='mdi:eye-outline' />
            </IconButton>

          {userData?.planType !== "E" && (
            <Tooltip title='Envie após assinar'>
              <IconButton
                size='small'
                onClick={() => handleSendWhatsApp(params.row)}
              >

                <Icon icon='mdi:whatsapp' fontSize={20} />
              </IconButton>
            </Tooltip>
          ) }
           

            <Tooltip title='Imprimir aqui'>
              <IconButton size='small' aria-label='imprimir' onClick={() => handleEmitReceita(params.row.id)}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            {!params.row.isSigned && (
                <IconButton onClick={() => handleOpenModal(params.row.id)} aria-label='deletar' color='error'>
                 <DeleteIcon />
               </IconButton>
            )}
            <Dialog
            open={openModalPrescriptionDetails === params.row.id}
            onClose={()=>setOpenModalPrescriptionDetails(null)}
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
                  {[
                    { name: 'Profissional', key: 'professional' },
                    { name: 'Medicamento', key: 'medicine' },
                    { name: 'Medida', key: 'measure' },
                    { name: 'Posologia', key: 'dosage' },
                    { name: 'Duração', key: 'duration' }
                  ].map(
                    element =>
                      typeof params.row[element.key] === 'string' && (
                        <>
                          <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{element.name}</Typography>
                          <Typography>{params.row[element.key]}</Typography>
                        </>
                      )
                  )}
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
        title='Receita'
        action={
          user !== null && !notAllowedSpecialty.includes(removerAcentos(user?.professional?.specialty ? user?.professional?.specialty : '').toLowerCase()) ? (<Button variant='contained' color='primary' onClick={() => handleDialogOpen()}>
          + NOVA RECEITA
        </Button>) : null
        }
      />

      <PrescriptionForm
        open={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={v => handlePrescriptionSubmit(v)}
        onPrescriptionsChange={e => handlePrescriptionsChange}
        editingData={ editingData }
      />

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <DataGrid rows={prescriptionsList} columns={columns} autoHeight localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}} />
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
                Tem certeza que deseja excluir esta receita? Esta ação não poderá ser desfeita.
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

export default ReceitaFormList
