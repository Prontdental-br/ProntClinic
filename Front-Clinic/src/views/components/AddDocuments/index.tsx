import React, { useEffect, useState } from 'react'
import { Button, CardHeader, Card, IconButton, DialogContent, DialogContentText, Typography, Dialog, DialogTitle, Tooltip, Alert, AlertColor, DialogActions } from '@mui/material'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import PrintIcon from '@mui/icons-material/Print'
import DeleteIcon from '@mui/icons-material/Delete'
import AddDocumentDialog from './AddDocumentDialog'
import api from 'src/@core/components/api-client'
import dayjs from 'dayjs'

import crypto from 'crypto';

import { Icon } from '@iconify/react'
import { clearNumber } from 'src/@core/utils/format'
import { Box } from '@mui/system'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { PatientDataType } from 'src/types/apps/userTypes'

interface AddDocumentsProps {
  onUpload: (images: string[]) => void
  patientId?: string
  dataPatient: PatientDataType
}


export default function AddDocuments({ onUpload, patientId, dataPatient }: AddDocumentsProps) {
  const [contratos, setContratos] = useState<any[]>([])
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [openModalContractDetails, setOpenModalContractDetails] = useState<string | number | undefined | null>(null)
  const [loading, setLoading] = useState(false);
  const [openWhatsAppDialog, setOpenWhatsAppDialog] = useState(false);
  const [alert, setAlert] = useState<{ message: string; severity: AlertColor }>({ message: '', severity: 'info' });
  const [showAlert, setShowAlert] = useState(false);
  const [openSignatureModal, setOpenSignatureModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
   const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const router = useRouter();

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');

  const fetchData = async () => {
    const { data } = await api.get(`/contract?patientId=${patientId}`)
    console.log(data)
    setContratos(data);
  }

  // useEffect(() => {
  //   fetchData();
  // }, []);

    useEffect(() => {
      fetchData()
  
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchData()
        }
      }
  
      document.addEventListener('visibilitychange', handleVisibilityChange)
  
      fetchData()
  
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }, [])

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const createHashDoc = (data: string) => {
    const hash = crypto.createHash('sha256');
    hash.update(data); 
    const hashResult = hash.digest('hex');
  
    return hashResult;
}

  const handleEmitContract = async (row: any) => {

    if (row.id) {
      const { data } = await api.get(`/contracts-signature/docId/${row.id}`);
      
      if (data) {
        window.open(`/contract/print/${row.id}`, '_blank')
        
        return;
      }
      
      const hashDoc = createHashDoc(row.text);

      await api.post('/contracts-signature', {
        documentType: 'contrato',
        hashDoc,
        documentId: row.id,
      });
  
      fetchData();
      window.open(`/contract/print/${row.id}`, '_blank')

    } else {
      console.log('Nenhum documentId retornado da criação da receita');
    }
  };

  const handleClick = async (row: any) => {

    if (!row.patient.email) {
      // Mostrar alerta de erro se não houver e-mail
      setAlert({ message: `O paciente ${row.patient.name} não possui e-mail para envio.`, severity: 'error' });
    } else {

      const response = await api.post('/contract/send/email', { contractId: row.id, email: row.patient.email })

      console.log(response.data);

      if(response.data) {
        setAlert({ message: 'Contrato enviado com sucesso!', severity: 'success' });
      }
    }

    // Exibir o alerta e ocultá-lo após 4 segundos
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };



   const handleSendWhatsApp = async (row: any) => {
          try {
            setLoading(true);

             setSelectedRow(row); 
        
               if (!row.isSigned) {
                setLoading(false);
                setOpenSignatureModal(true); 
                
                return;
              }
        
            const message = `👋 Olá *${row.patient.name}*!

Você está recebendo o seu *termo* para assinatura digital através do sistema *Cláiris IA Software*.

Para assinar, basta clicar no link abaixo. Você será direcionado para uma página segura onde poderá revisar e confirmar sua assinatura online.

📄 *Link para assinatura:* ${process.env.NEXT_PUBLIC_URL_FRONT}/contract/print/${row.id}

Caso tenha qualquer dúvida, nossa equipe está à disposição para ajudar.

*Cláiris IA Software – Clareza e agilidade para sua rotina!*
`;
      
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

        // const handleSendWhatsApp = async (row: any) => {
        //     try {
        //       setLoading(true);
        //        setSelectedRow(row); 
        
        //        if (!row.isSigned) {
        //       setLoading(false);
        //         setOpenSignatureModal(true); 
                
        //         return;
        //       }
          
        //       const message = `👋 Olá ${row.patient.name}!
        
        // Você está recebendo o seu *orçamento* para assinatura digital através do sistema *Cláiris IA Software*.
        
        // Para assinar, basta clicar no link abaixo. Você será direcionado para uma página segura onde poderá revisar e confirmar sua assinatura online.
        
        // 📄 *Link para assinatura:* ${process.env.NEXT_PUBLIC_URL_FRONT}/budget/print/${row.id}
        
        // Caso tenha qualquer dúvida, nossa equipe está à disposição para ajudar.
        
        // *Cláiris IA Software – Clareza e agilidade para sua rotina!*`;
        
        //       const phone = row.patient.cellPhone;
           
        //       if (!message || !phone) {
        //         toast.error('Mensagem ou telefone não encontrados');
        //         setLoading(false);
                
        //       return;
        //       }
          
        //       const { data } = await api.get('/whatsapp');
        //       const connection = data?.data?.[0]; 
          
        //       if (!connection || !connection.isConnected) {
        
        //         setOpenWhatsAppDialog(true);
        //         setLoading(false);
          
        //         return;
        //       }
          
        //       await api.post('/whatsapp/send-message', {
        //         message,
        //         phone,
        //         delay: 0
        //       });
          
        //       setLoading(false);
        //       toast.success('Mensagem enviada com sucesso!');
        
        //     } catch (err) {
        //       console.error(err);
        //       setLoading(false);
        //       toast.error('Erro ao enviar mensagem via WhatsApp');
        //     }
        //   };


const columns: GridColDef[] = [
  { field: 'title', headerName: 'Título', width: 300 },
  {
    field: 'date', headerName: 'Data', width: 300, renderCell({ row }) {
      return dayjs(row.created_at)?.format?.('DD/MM/YYYY')
    },
  },
  {
    field: 'actions',
    headerName: 'Ações',
    width: 190,
    renderCell: params => {
  
      //dayjs(data.date)?.format?.('DD/MM/YYYY')

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
           {userData?.planType !== "E" && (
            <Tooltip title='Enviar contrato Email'>
              <IconButton size='small'
                onClick={() => handleClick(params.row)}
                >
                <Icon icon='mdi:email' />
              </IconButton>
            </Tooltip>
           )}
      

          <IconButton size='small'
            onClick={() => setOpenModalContractDetails(params.row.id)}
          >
            <Icon icon='mdi:eye-outline' />
          </IconButton>
            {userData?.planType !== "E" && (
              <Tooltip title='Enviar contrato WhatsApp'>
                <IconButton
                  size='small'
                  onClick={() => handleSendWhatsApp(params.row)}
                >
                  <Icon icon='mdi:whatsapp' fontSize={20} />
                </IconButton>
              </Tooltip>
            )}
  

            <Tooltip title='Imprimir'>
              <IconButton size='small' aria-label='imprimir' onClick={() => handleEmitContract(params.row)}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            {/* {!params.row.isSigned && ( */}
                <IconButton onClick={() => handleOpenDeleteModal(params.row.id)} aria-label='deletar' color='error'>
                 <DeleteIcon />
               </IconButton>
            {/* )}   */}

          <Dialog
            open={openModalContractDetails === params.row.id}
            onClose={() => setOpenModalContractDetails(null)}
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
              <iframe src={`/contract/printv2/${params.row.id}`} width="900" height="600"></iframe>
              
            </DialogTitle>
            
          </Dialog>

        </Box>
      );
    }
  }
]

  const handleOpenDeleteModal = (id: number) => {
      setIdToDelete(id);
      setOpenDeleteModal(true);
    };
  
    const handleConfirmDelete = async () => {
      if (idToDelete !== null) {
        try {
          await api.delete(`/contract/${idToDelete}`);
          setContratos(prev => prev.filter(a => a.id !== idToDelete));
          toast.success('Contrato excluído com sucesso!');
        } catch (e) {
          console.error(e);
          toast.error('Erro ao excluir o Contrato.');
        } finally {
          setOpenDeleteModal(false);
          setIdToDelete(null);
        }
      }
    };


  return (
    <Card sx={{ mt: 2 }}>
        {showAlert && (
        <Alert sx={{ mb: 2, mt: 4 }} severity={alert.severity}>
          {alert.message}
        </Alert>
      )}
      <CardHeader
        action={
          <Button variant='contained' color='primary' onClick={handleOpenDialog}>
            + Adicionar Contratos
          </Button>
        }
      />

      <AddDocumentDialog open={isDialogOpen} onClose={handleCloseDialog} patientId={patientId} fetchData={fetchData} dataPatient={dataPatient} />

      <DataGrid rows={contratos} columns={columns} autoHeight localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}} />

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

           <Dialog open={openSignatureModal} onClose={() => setOpenSignatureModal(false)}>
                 <DialogTitle>Assinatura pendente</DialogTitle>
                 <DialogContent>
                   <Typography>
                     O contrato ainda não foi assinado pelo profissional. É necessário assinar antes de enviar ao paciente.
                   </Typography>
                 </DialogContent>
                 <DialogActions>
                   <Button onClick={() => setOpenSignatureModal(false)}>Fechar</Button>
                   <Button
                     color="primary"
                     variant="contained"
                     onClick={() => {
                       handleEmitContract(selectedRow);
                       setOpenSignatureModal(false);
                     }}
                   >
                     Assinar contrato
                   </Button>
                 </DialogActions>
               </Dialog>

          <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja excluir este contrato? Esta ação não poderá ser desfeita.
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
