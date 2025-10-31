import { useEffect, useState } from 'react'
import { IconButton, Grid, Button, CardHeader, Card, Tooltip, DialogContent, DialogTitle, Typography, Dialog, DialogContentText, Box } from '@mui/material'

import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import PrintIcon from '@mui/icons-material/Print'
import DeleteIcon from '@mui/icons-material/Delete'

import api from 'src/@core/components/api-client'
import { clearNumber } from 'src/@core/utils/format'
import { Icon } from '@iconify/react'
import dayjs from 'dayjs'

interface ScoreListProps {
  data: {}
  onBack: () => void
  patientId: string
}


const ScoreList: React.FC<ScoreListProps> = ({ onBack, patientId }) => {

  const [scoreList, setScoreList] = useState<any[]>([]);
  const [openModalDetails, setOpenModalDetails] = useState<boolean>(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const isAdminOrProfessionalWithAccess = userData?.professional?.canAccessPlans || userData?.isAdmin;

  const fetchListScore = async () => {
    try {
      if(patientId) {
        const { data } = await api.get(`score-consultations/all/${patientId}`);
        setScoreList(data);
      }
    } catch (error) {
      console.error('Error fetching score list:', error);
    }
  };

  useEffect(() => {
    fetchListScore();
  }, [patientId]);

  const getClassLabel = (classValue: number): string => {
    const classMap: { [key: number]: string } = {
      0: 'A',
      1: 'B',
      2: 'C',
      3: 'D',
      4: 'E',
    };
    
    return classMap[classValue] || 'N/A'; // Retorna 'N/A' se o valor não for mapeado
  }

  const handleDeleteScore = async () => {
    try {
      if(patientId) {
        await api.delete(`score-consultations/${patientId}`);

        await fetchListScore(); 
      }
    } catch (error) {
      console.error('Error to delete Score:', error);
    }
  }

  const columns: GridColDef[] = [
    { 
        field: 'pacientId', 
        headerName: 'Nome Paciente', 
        width: 300,
        renderCell: params => (
          <p>{params.row?.patientName}</p>
        )
      },
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
      width: 150,
      renderCell: params => {
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

          {isAdminOrProfessionalWithAccess && (
               <IconButton size='small'
                  onClick={()=>setOpenModalDetails(true)}
                >
               <Icon icon='mdi:eye-outline' />
             </IconButton>
          )}
           

            {isAdminOrProfessionalWithAccess && (
              <IconButton 
                onClick={() => handleDeleteScore()} aria-label='deletar' color='error'
              >
                <DeleteIcon />
              </IconButton>
            )}
          

            <Dialog
            open={openModalDetails}
            onClose={() => setOpenModalDetails(false)}
            aria-labelledby="item-view-edit"
            aria-describedby="item-view-edit-description"
            sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 800 } }}
          >
            <DialogTitle
              id="item-view-edit"
              sx={{
                textAlign: 'center',
                fontSize: '1.5rem !important',
                px: (theme) => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              }}
            >
              Detalhes da Consulta de Score <span style={{ color: '#5a5fe0', paddingLeft: '.5rem' }}>BETA</span>
            </DialogTitle>
            <DialogContent
              sx={{
                pb: (theme) => `${theme.spacing(8)} !important`,
                px: (theme) => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              }}
            >
        <DialogContentText variant="body2" id="item-view-edit-description" sx={{ textAlign: 'center', mb: 7 }}>
          {scoreList.map((item: any, i) => (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Nome do Paciente</Typography>
                <Typography>{item.patientName}</Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>CPF Formatado</Typography>
                <Typography>{item.documentFormatted}</Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Score de Crédito Atual</Typography>
                <Typography
                  sx={{
                    color:
                      item.creditScoreD00 < 300
                        ? 'red'
                        : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 600
                        ? 'orange'
                        : 'green',
                  }}
                >
                  {item.creditScoreD00}
                </Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Cheque sem fundo</Typography>
                <Typography
                  sx={{
                    color:
                      item.creditScoreD00 < 300
                        ? 'red'
                        : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 600
                        ? 'orange'
                        : 'green',
                  }}
                >
                   {item.creditScoreD00 <= 300 ? "Alto Risco" : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 680 ? "Médio Risco" : "Baixo Risco"}
                </Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Registros de Protesto</Typography>
                <Typography
                  sx={{
                    color:
                      item.creditScoreD00 < 300
                        ? 'red'
                        : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 600
                        ? 'orange'
                        : 'green',
                  }}
                >
                   {item.creditScoreD00 <= 300 ? "Alto Risco" : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 680 ? "Médio Risco" : "Baixo Risco"}
                </Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Renda Pessoal</Typography>
                <Typography>{item.incomePersonal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Risco de Inadimplência</Typography>
                <Typography><Typography
                  sx={{
                    color:
                      item.creditScoreD00 < 300
                        ? 'red'
                        : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 600
                        ? 'orange'
                        : 'green',
                  }}
                >
                  {item.creditScoreD00 <= 300 ? "Alto Risco" : item.creditScoreD00 >= 300 && item.creditScoreD00 <= 680 ? "Médio Risco" : "Baixo Risco"}
                </Typography></Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Renda Familiar</Typography>
                <Typography>{item.incomeFamily?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Classe Social Pessoal</Typography>
                <Typography>Classe Social {getClassLabel(item.incomePersonalClass)}</Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Classe Social Familiar</Typography>
                <Typography>Classe Social {getClassLabel(item.incomeFamilyClass)}</Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Última Atualização</Typography>
                <Typography>{new Date(item.updatedAt).toLocaleString()}</Typography>
              </div>

              <div style={{ width: '48%', marginBottom: '15px' }}>
                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Data de Criação</Typography>
                <Typography>{new Date(item.createdAt).toLocaleString()}</Typography>
              </div>

          

              
            </div>
          ))}
        </DialogContentText>
      </DialogContent>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '1rem', padding: '.5rem', paddingBottom: '1rem' }}>
            <Button  variant='contained' onClick={() => setOpenModalDetails(false)}>Fechar</Button>
          </Box>
        </Dialog>
          </Box>
        );
      }
    }
  ]

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        title='Paciente'
      />

      {/* <PrescriptionForm
        open={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={v => handlePrescriptionSubmit(v)}
        onPrescriptionsChange={e => handlePrescriptionsChange}
      /> */}

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12}>
        <DataGrid rows={scoreList} columns={columns} autoHeight localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}} />
        </Grid>
      </Grid>
    </Card>
  )
}


export default ScoreList
