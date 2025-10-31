'use client'

import {useEffect} from 'react';

// ORÇAMENTOS
// ** React Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

import CardHeader from '@mui/material/CardHeader'

import CardContent from '@mui/material/CardContent'

import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import PrintIcon from '@mui/icons-material/Print'
import DeleteIcon from '@mui/icons-material/Delete'

// ** Styles Import
import 'react-credit-cards/es/styles-compiled.css'
import CardBudgetVertical from 'src/@core/components/card-statistics/card-budget-vertical'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import { Alert, AlertColor, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Link, Tooltip, Typography } from '@mui/material'
import OptionsMenu from 'src/@core/components/option-menu'
import { useState } from 'react'
import { ThemeColor } from 'src/@core/layouts/types'
import { BudgetType } from 'src/types/apps/budgetTypes'
import moment from 'moment'
import ModalBudget from 'src/components/ModalBudget'
import {clearNumber} from 'src/@core/utils/format'
import { AppDispatch, RootState } from 'src/store'
import { useSelector, useDispatch } from 'react-redux'
import api from 'src/@core/components/api-client'
import { getPatientBudgets } from 'src/store/apps/patient'
import {getGraphType} from 'src/@core/utils/budget-functions';

import crypto from 'crypto';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

interface Props {
  patientId: string;
}
interface CellType {
  row: BudgetType & any;
}

interface StatusObj {
  [key: string]: {
    color: ThemeColor,
    label: string,
  }
}

const statusObj: StatusObj = {
  A: { color: 'success', label: 'Aprovado' },
  O: { color: 'warning', label: 'Aberto' },
  R: { color: 'error', label: 'Rejeitado' },
  C: { color: 'error', label: 'Cancelado' },
  P: { color: 'success', label: 'Pago' }
};

const UserViewBudget = ({ patientId }: Props) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [viewBudget, setViewBudget] = useState(false)
  const [budgetToView, setBudgetToView] = useState<BudgetType>()
  const [user, setUser] = useState<any>()
  const dispatch = useDispatch<AppDispatch>();
  const patientStore = useSelector((state: RootState) => state.patient)
  const [patientBudgets, setPatientBudgets] = useState<BudgetType[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  const [alert, setAlert] = useState<{ message: string; severity: AlertColor }>({ message: '', severity: 'info' });
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openWhatsAppDialog, setOpenWhatsAppDialog] = useState(false);
  const [openSignatureModal, setOpenSignatureModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const router = useRouter();

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');

  const handleClick = async (row: any) => {

    if (!row.patient.email) {
      // Mostrar alerta de erro se não houver e-mail
      setAlert({ message: `O paciente ${row.patient.name} não possui e-mail para envio.`, severity: 'error' });
    } else {

      const response = await api.post('/budgets/send/email', { contractId: row.id, email: row.patient.email })

      console.log(response.data);

      if(response.data) {
        setAlert({ message: 'Orçamento enviado com sucesso!', severity: 'success' });
      }

    }
    
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  }

 
  // useEffect(() => {
  //   console.log('budgets of patient: ', patientBudgets)
  // }, [patientBudgets])

  const fetchData = async (id: string) => {
    const res = await api.get(`budgets/patient/${id}`);
    setPatientBudgets(res.data);
  }

   const createHashDoc = (data: string) => {
      const hash = crypto.createHash('sha256');
      hash.update(data); 
      const hashResult = hash.digest('hex');
    
      return hashResult;
  }

  const handleEmitBudgetContract = async (row: any, action: 'email' | 'whatsapp' | 'print') => {
    if (row.id) {
      const { data } = await api.get(`/contracts-signature/docId/${row.id}`);
      
      if (!data) {
        const hashDoc = createHashDoc(JSON.stringify(row));
  
        await api.post('/contracts-signature', {
          documentType: 'orcamento',
          hashDoc,
          documentId: row.id,
        });
  
        fetchData(patientId);
      }
  
      // Ações específicas após criar/verificar contrato
      if (action === 'email') {
        console.log('Enviar email');
        await handleClick(row);
      } else if (action === 'whatsapp') {
        const message = encodeURI(`Acesse seu orçamento: ${process.env.NEXT_PUBLIC_URL_FRONT}/budget/print/${row.id}`);
        window.open(`https://wa.me/55${clearNumber(row.patient.cellPhone ? row.patient.cellPhone : '')}?text=${message}`, '_blank');
      } else if (action === 'print') {
        window.open(`/budget/print/${row.id}`, '_blank');
      }
    } else {
      console.log('Nenhum documentId retornado da criação da receita');
    }
  };
  
  const handleEmitEmail = (row: any) => handleEmitBudgetContract(row, 'email');
  const handleEmitWhatsApp = (row: any) => handleEmitBudgetContract(row, 'whatsapp');
  const handleEmitPrint = (row: any) => handleEmitBudgetContract(row, 'print');

  useEffect(() => {
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    setUser(userData)
 
  }, []);

   useEffect(() => {
       fetchData(patientId)
  
       const handleVisibilityChange = () => {
         if (document.visibilityState === 'visible') {
           fetchData(patientId)
         }
       }
  
       document.addEventListener('visibilitychange', handleVisibilityChange)
  
       fetchData(patientId)
  
       return () => {
         document.removeEventListener('visibilitychange', handleVisibilityChange)
       }
     }, [])


  useEffect(() => {
    setPatientBudgets(patientStore.budgets);    
  }, [patientStore.budgets])

  async function handleDeleteBudget(id: string) {
    const res = await api.patch(`/budgets/${id}`, { status: 'R'});
    if (res.status === 200) {
      fetchData(patientId);
    }
  }

  async function handleRealDeleteBudget(id: string) {
    const res = await api.delete(`/budgets/${id}`);
    if (res.status === 200) {
      fetchData(patientId);
    }
  }

  async function handleDuplicateBudget(id: string) {
    const res = await api.post(`/budgets/double/${id}`);
    if (res.status === 201) {
      fetchData(patientId);
    }
  }

  const handleOpenDeleteModal = (id: string) => {
  setSelectedBudgetId(id);
  setOpenDeleteModal(true);
};

const handleConfirmDelete = async () => {
  if (selectedBudgetId) {
    await handleRealDeleteBudget(selectedBudgetId); 
    setOpenDeleteModal(false);
    setSelectedBudgetId(null);
  }
};

 const professional = user?.professional || null

const isAdmin = professional?.isAdmin === true || !professional

const handleSendWhatsApp = async (row: any) => {
    try {
      setLoading(true);
       setSelectedRow(row); 

      //  if (!row.isSigned) {
      // setLoading(false);
      //   setOpenSignatureModal(true); 
        
      //   return;
      // }
  
      const message = `👋 Olá ${row.patient.name}!

Você está recebendo o seu *orçamento* para assinatura digital através do sistema *Cláiris IA Software*.

Para assinar, basta clicar no link abaixo. Você será direcionado para uma página segura onde poderá revisar e confirmar sua assinatura online.

📄 *Link para assinatura:* ${process.env.NEXT_PUBLIC_URL_FRONT}/budget/print/${row.id}

Caso tenha qualquer dúvida, nossa equipe está à disposição para ajudar.

*Cláiris IA Software – Clareza e agilidade para sua rotina!*`;

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
    {
      flex: 0.15,
      minWidth: 120,
      headerName: 'Data',
      field: 'date',
      renderCell: ({ row }: CellType) => {
        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {moment(row.date).format('DD/MM/YYYY')}
          </Typography>
        )
      }
    },

    {
      flex: 0.34,
      minWidth: 160,
      headerName: 'Descrição',
      field: 'description',
      renderCell: ({ row }: CellType) => {
        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {row.description}
          </Typography>
        )
      }
    },

    {
      flex: 0.15,
      minWidth: 100,
      headerName: 'total',
      field: 'Valor',
      renderCell: ({ row }: CellType) => {
        const valor = row.subtotal - (row.discount || 0)
        const valorFormatado = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(valor)

        return (
          <Typography noWrap variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
            {valorFormatado}
          </Typography>
        )
      }
    },
    {
      width: 120,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }: CellType) => (
        <CustomChip
          size='small'
          label={statusObj[row.status]?.label}
          color={statusObj[row.status]?.color}
          sx={{
            textTransform: 'capitalize',
            '& .MuiChip-label': { px: 2.5, lineHeight: 1.385 }
          }}
        />
      )
    },

    {
      flex: 0.1,
      minWidth: 210,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
             {userData?.planType !== "E" && row.status !== "C" && ( 
                <Tooltip title='Assinar Orçamento Email'>
                  <IconButton size='small'
                    onClick={() => handleEmitEmail(row)}
                    >
                    <Icon icon='mdi:email' fontSize={20} />
                  </IconButton>
                </Tooltip>
             )}
         
          <Box sx={{ display: 'flex', marginRight: 1 }}>
            <Tooltip title='Visualizar'>
              <IconButton size='small' component={Link} onClick={() => handleModalBudget(row) }>
                <Icon icon='mdi:eye-outline' fontSize={20} />
              </IconButton>
            </Tooltip>

              {row.status !== "C" && ( 
                <Tooltip title='editar'>
                    <IconButton
                      size='small'
                      component={Link}
                      href={
                        getGraphType({...row, budgetTreatments: row.budgetItems}) === 'estetica'
                          ? `/budget/face/?id=${row.id}`
                          : `/budget/odont/?id=${row.id}`}>
                      <Icon icon='mdi:pencil-outline' fontSize={20} />
                    </IconButton>
                </Tooltip>
              )}  
              
              
                {userData?.planType !== "E" && row.status !== "C" && ( 
                  <Tooltip title='Assinar Orçamento WhatsApp'>
                      <IconButton size='small' onClick={() => handleSendWhatsApp(row)}>
                        <Icon icon='mdi:whatsapp' fontSize={20} />
                      </IconButton>
                  </Tooltip>
                )}
             
            {row.status !== "C" && (
              <Tooltip title='Imprimir'>
                <IconButton size='small' aria-label='imprimir' onClick={() => handleEmitPrint(row)}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            )}
           
            {isAdmin && row.status !== "C" && (
              <Tooltip title='Deletar'>

               <IconButton onClick={() => handleOpenDeleteModal(row.id)} aria-label='deletar' color='error'>
                <DeleteIcon />
              </IconButton>
              </Tooltip>
            )}
          </Box>

       
        </Box>
      )
    }
  ]

  function handleModalBudget(budget: BudgetType) {
    setBudgetToView(budget)
    setViewBudget(true);
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Novo Orçamento' />
          <CardContent>
            <ApexChartWrapper>
              <Grid container spacing={6} className='match-height'>
                {(user?.type === 'O' || user?.type === 'D')  && <Grid item xs={12} md={6}>
                  <CardBudgetVertical
                    title='ODONTOLOGIA'
                    imgSrc='/images/logos/c_logo.png'
                    src={`/budget/odont?patient=${patientId}`}
                    descriptionButton={false}
                  />
                </Grid>}
                {(user?.type === 'E' || user?.type === 'D' || user?.type === 'O')  && <Grid item xs={12} md={6}>
                  <CardBudgetVertical
                    title='ESTÉTICA'
                    imgSrc='/images/logos/c_logo.png'
                    src={`/budget/face?patient=${patientId}`}
                    descriptionButton={false}
                  />
                </Grid>}
              </Grid>
            </ApexChartWrapper>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
            {showAlert && (
                  <Alert sx={{ mb: 2, mt: 4 }} severity={alert.severity}>
                    {alert.message}
                  </Alert>
                )}
          <CardHeader title='Lista de Orçamentos' />
          <CardContent>
            <DataGrid
              autoHeight
              columns={columns}
              rows={patientBudgets}
              disableRowSelectionOnClick
              pageSizeOptions={[7, 10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              localeText={{
                ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                noRowsLabel: 'Nenhum registro encontrado',
                columnMenuManageColumns: 'Gerenciar colunas',
              }}
              sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
            />
          </CardContent>
        </Card>
      </Grid>

      {budgetToView && 
      <ModalBudget        
        open={viewBudget}
        budget={budgetToView}
        setOpen={(open) => setViewBudget(open)}
        />
      }

      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir este orçamento? Esta ação não poderá ser desfeita.
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
          O orçamento ainda não foi assinado pelo profissional. É necessário assinar antes de enviar ao paciente.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenSignatureModal(false)}>Fechar</Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            window.open(`/budget/print/${selectedRow?.id}`, '_blank');
            setOpenSignatureModal(false);
          }}
        >
          Assinar orçamento
        </Button>
      </DialogActions>
     </Dialog>
    </Grid>
  )
}

export default UserViewBudget
