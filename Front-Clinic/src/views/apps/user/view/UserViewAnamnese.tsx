// ANAMNESE

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

import crypto from 'crypto';

import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { PacientAnmneseDataType } from 'src/types/apps/userTypes'
import { Alert, AlertColor, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableRow, Tooltip } from '@mui/material'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import AnamneseForm from 'src/views/components/AnamneseForm'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import api from 'src/@core/components/api-client'
import { Icon } from '@iconify/react'
import { clearNumber } from 'src/@core/utils/format'
import TableHeaderAnamnese from '../list/TableHeaderAnamnese'
import dayjs from 'dayjs'
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

interface Props {
  patientId: string
  anamnesesData: PacientAnmneseDataType[]
}

const UserViewAnamnese = ({ anamnesesData, patientId }: Props) => {
  const [openNewAnamnese, setopenNewAnamnese] = useState(false)
  const [gridData, setGridData] = useState<any[]>([])
  const [patient, setPatient] = useState<any>();
  const [openModalAnamneseDetails, setOpenModalAnamneseDetails] = useState<string | number | undefined | null>(null)
  const [loading, setLoading] = useState(false);
  const [openWhatsAppDialog, setOpenWhatsAppDialog] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const router = useRouter();

  const handleCloseModalAnamneseDetails = () => {
    setOpenModalAnamneseDetails(null);
  }

 const fetchData = async () => {
  try {
    const resp = await api.get(`/patients/${patientId}`);
    setPatient(resp.data);

    const { data } = await api.get(`/anamnese?patientId=${patientId}`);

    const gridMapped = data.map((item: any) => ({
      ...item,
      anamneseType: item.config?.desc || 'Modelo Desconhecido',
      created_at: item.created_at,
      isSigned: item.isSigned,
      status: item.status,
      data: item.items?.map((i: any) => ({
        pergunta: i.question,
        resposta: i.answerOption,
        observacao: i.answerDesc,
      })) || [],
    }));

    setGridData(gridMapped);
  } catch (e) {
    console.error(e);
  }
};

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

  const createHashDoc = (data: string) => {
    const hash = crypto.createHash('sha256');
    hash.update(data); 
    const hashResult = hash.digest('hex');
  
    return hashResult;
}

  const handleEmitAnamnese = async (row: any) => {

    if (row.id) {
      window.open(`/anamnese/print/${row.id}`, '_blank')

    } 
  };

  const [alert, setAlert] = useState<{ message: string; severity: AlertColor }>({ message: '', severity: 'info' });
  const [showAlert, setShowAlert] = useState(false);

  const handleSendWhatsApp = async (row: any) => {
      try {
        setLoading(true);
    
        const message = `👋 Olá ${row.patient.name}!

Você está recebendo o sua *anamnese* para assinatura digital através do sistema *Cláiris IA Software*.

Para assinar, basta clicar no link abaixo. Você será direcionado para uma página segura onde poderá revisar e confirmar sua assinatura online.

📄 *Link para assinatura:* ${process.env.NEXT_PUBLIC_URL_FRONT}/anamnese/print/${row.id}

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

  const handleClick = async (row: any) => {

    if (!row.patient.email) {
      
      setAlert({ message: `O paciente ${row.patient.name} não possui e-mail para envio.`, severity: 'error' });
    } else {

      const response = await api.post('/anamnese/send/email', { contractId: row.id, email: row.patient.email })

      console.log(response.data);

      if(response.data) {
        setAlert({ message: 'Anamnese enviado com sucesso!', severity: 'success' });
      }
    }

    // Exibir o alerta e ocultá-lo após 4 segundos
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const defaultColumns: GridColDef[] = [
    {
      field: 'anamneseType',
      headerName: 'tipo de anamnese',
      width: 300,
    },
    {
      field: 'created_at',
      headerName: 'data',
      width: 170,
      renderCell({row}) {
          return dayjs(row.created_at)?.format?.('DD/MM/YYYY')
      },
    },
  ]

  const handleOpenDeleteModal = (id: any) => {
  setItemIdToDelete(id);
  setOpenDeleteModal(true);
};

  const handleConfirmDelete = async () => {
    if (itemIdToDelete) {
      try {
        await api.delete(`/anamnese/${itemIdToDelete}`);
        setGridData(gridData.filter(d => d.id !== itemIdToDelete));
        setOpenDeleteModal(false);
        setItemIdToDelete(null);
        toast.success('Anamnese excluída com sucesso!');
      } catch (e) {
        console.error(e);
        setOpenDeleteModal(false);
        setItemIdToDelete(null);
        toast.error('Erro ao excluir a anamnese.');
      }
    }
  };

  const RowOptions = ({ row, toggleModal }: { row: any; toggleModal: (id: string | null) => void }) => {

    // ** State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const rowOptionsOpen = Boolean(anchorEl)

    const handleRowOptionsClick = (event: any) => {
      setAnchorEl(event.currentTarget)
    }

    const handleRowOptionsClose = () => {
      setAnchorEl(null)
    }

    return (
      <>
        <IconButton size='small' onClick={handleRowOptionsClick}>
          <Icon icon='mdi:dots-vertical' />
        </IconButton>
        <Menu
          keepMounted
          anchorEl={anchorEl}
          open={rowOptionsOpen}
          onClose={handleRowOptionsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          PaperProps={{ style: { minWidth: '8rem' } }}
        >
          <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={()=>setOpenModalAnamneseDetails(row.id)} href="#">
            <Icon icon='mdi:eye-outline' fontSize={20} />
            Ver
          </MenuItem>
          {!row.isSigned && (
          <MenuItem onClick={() => handleOpenDeleteModal(row.id)} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='mdi:delete-outline' fontSize={20} />
            Apagar
          </MenuItem>
          )}
        </Menu>
      </>
    )
  }



  const columns: GridColDef[] = [
    ...defaultColumns,
    {
      width: 130,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }: any) => {
        let color: 'default' | 'success' | 'warning' | 'error' = 'default'; 
        let label = ''; 
  
        
        switch (row.isSigned) {
          case true:
            color = 'success';
            label = 'Assinado';
            break;
          case false:
            color = 'warning';
            label = 'Pendente';
            break;
        }
  
        return (
          <Chip
            label={label} 
            color={color} 
            sx={{ textTransform: 'capitalize',  }}
          />
        );
      }
    },
    {
      flex: 0.1,
      minWidth: 150,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>

          <Tooltip title='Enviar Anamnese Email'>
            <IconButton size='small'
              onClick={() => handleClick(row)}
              >
              <Icon icon='mdi:email' />
            </IconButton>
          </Tooltip>

          <Tooltip title='Visualizar'>
            <IconButton size='small'
              onClick={()=>setOpenModalAnamneseDetails(row.id)}
            >
              <Icon icon='mdi:eye-outline' fontSize={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Envio Anamnese WhatsApp'>
            <IconButton
              size='small'
              onClick={() => handleSendWhatsApp(row)}
            >
              <Icon icon='mdi:whatsapp' fontSize={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Imprimir'>
            <IconButton
              size='small'
              onClick={() => handleEmitAnamnese(row)}
            >
              <Icon icon='mdi:printer' fontSize={20} />
            </IconButton>
          </Tooltip>

          {!row.isSigned && (
          <Tooltip title='Deletar Item'>
            <IconButton size='small' sx={{ mr: 0.5 }} onClick={() => handleOpenDeleteModal(row.id)}>
              <Icon icon='mdi:delete-outline' />
            </IconButton>
          </Tooltip>
          )}

          <Dialog
            open={openModalAnamneseDetails === row.id}
            onClose={handleCloseModalAnamneseDetails}
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
              Anamnese
            </DialogTitle>
            <DialogContent
              sx={{
                pb: theme => `${theme.spacing(8)} !important`,
                px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
              }}
            >
              <Grid container spacing={4}>
                <Grid item sm={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column' }}>
                      <TableContainer style={{ overflow: 'hidden', height: `${row.data.length * 65}px` }}>
                        <Table>
                          <TableBody>
                            {row.data.map((item: any, index: number) => {
                              if (item.pergunta === 'Observação geral') return null;

                              return (
                                <TableRow hover key={index} sx={{ '&:last-of-type td': { border: 0 } }}>
                                  <TableCell sx={{ fontWeight: 600, display: 'flex', gap: 1, flexDirection: 'column' }}>
                                    {item.pergunta}

                                    {item.observacao && (
                                      <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
                                        <strong>Obs:</strong> {item.observacao}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {item.resposta || '-'}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                </Grid>

                {row.data.find((i: any) => i.pergunta === 'Observação geral')?.observacao && (
                  <Grid item sm={12} sx={{ mt: 4, mb: 7 }}>
                    <Typography sx={{ fontWeight: 900, lineHeight: 1.2, mb: 2 }}>
                      Observação Geral
                    </Typography>
                    <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>
                      {row.data.find((i: any) => i.pergunta === 'Observação geral')?.observacao}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button variant='outlined' color='primary' onClick={handleCloseModalAnamneseDetails}>
                Fechar
              </Button>
            </DialogActions>
          </Dialog>

          <RowOptions row={row} toggleModal={() => setOpenModalAnamneseDetails(row.id)} />

        </Box>
      )
    },
    
  ]

  return (
    <>
      {!anamnesesData || openNewAnamnese ? (
        <Card>
       
          <CardHeader title='Anamnese' />
          <CardContent>
            <ApexChartWrapper>
              <Grid>
                <AnamneseForm patientId={patientId} />
              </Grid>
            </ApexChartWrapper>
          </CardContent>
        </Card>
      ) : (
        gridData.length > 0 ? <Card>
          <CardHeader title='Anamnese' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Card>
                    {showAlert && (
                      <Alert sx={{ mb: 2, mt: 4 }} severity={alert.severity}>
                        {alert.message}
                      </Alert>
                    )}
                  <TableHeaderAnamnese onClick={() => setopenNewAnamnese(!openNewAnamnese)} />
                  <DataGrid
                    autoHeight
                    disableColumnFilter
                    pagination
                    rows={gridData}
                    columns={columns}
                    checkboxSelection={false}
                    localeText={{
                      ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                      noRowsLabel: 'Nenhum registro encontrado',
                      columnMenuManageColumns: 'Gerenciar colunas',
                    }}
                  />
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card> :
          <Box
            sx={{
              height: '50vh',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Image src='/images/logos/clairis_logo.png' alt={'Clairis'} width={180} height={50} />

            <Typography
              sx={{
                mb: 4,
                mt: 10,
                color: 'text.primary'
              }}
            >
              Não há anamnese registrada para o paciente. Deseja registrar agora?
            </Typography>

            <Box sx={{ display: 'flex', marginRight: 1 }}>
              <Button onClick={() => setopenNewAnamnese(!openNewAnamnese)} color='primary' variant='contained'>
                + Nova anamnese
              </Button>
            </Box>
          </Box>
      )}

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
            Tem certeza que deseja excluir esta anamnese? Esta ação não poderá ser desfeita.
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
    </>
  )
}

export default UserViewAnamnese
