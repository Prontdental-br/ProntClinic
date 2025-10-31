import React, { useState } from 'react'
import { Button, CircularProgress, Grid, Input, Modal, SpeedDialIcon, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import SpeedIcon from '@mui/icons-material/Speed';
import api from 'src/@core/components/api-client';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';


type ModalQueryScoreProps = {
    open: boolean;
    setClose: () => void;
    patientCPF: string;
    patientId: string;
}

export const ModalQueryScore = ({ open, setClose, patientCPF, patientId }: ModalQueryScoreProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [scoreData, setScoreData] = useState<any | null>(null); // Armazena os dados da consulta de score
  const [error, setError] = useState<string | null>(null);
  const storeProfessional = useSelector((state: RootState) => state.user);
    
  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}');

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

  const handleAnalyzeCPF = async () => {
    setLoading(true);
    setError(null);

    try {
        const response = await api.post('/score-plans/consultation', {
            id: userData.professional.id,
            patientId,
            accountId: userData.accountId,
            document: patientCPF
        });

        if (response.data.status === "success") {
            
          setScoreData(response.data.response); 
      } else {
          setError('Falha ao realizar consulta de crédito.');
      }
    } catch (err) {
        console.error('Erro ao consultar CPF:', err);
      
    } finally {
        setLoading(false); 
    }
  };

  return (
    <Modal
    open={open}
    onClose={setClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
>
    <Box
        sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 1,
            padding: 4,
            maxHeight: '90vh',
            overflowY: 'auto',
            '@media (min-width: 1600px)': {
                width: '750px',
                fontSize: '14px',
                '& input, & select': { fontSize: '14px' }
            }
        }}
    >
        <h2>Análise de Crédito</h2>
        <Box mb={8} />
        <TextField 
            value={patientCPF ? patientCPF : "Não informado"} 
            fullWidth 
            id="outlined-basic" 
            label="Seu CPF*" 
            variant="outlined" 
        />

        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem', margin: '2.5rem 0' }}>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {scoreData ? (
            <section style={{ marginTop: '0rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>Resultado da Análise <SpeedIcon /></h2>
    
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <div>
                    <p>
                    <strong>Score de Crédito Atual:</strong> 
                        <span style={{
                            display: 'flex',
                            flexDirection: 'column',
                            color:
                            scoreData['CreditScore D00'] < 300
                                ? 'red'
                                : scoreData['CreditScore D00'] >= 300 && scoreData['CreditScore D00'] <= 600
                                ? 'orange'
                                : 'green',
                            }}>    
                            {scoreData['CreditScore D00']}
                        </span>
                    </p>
                     <p>
                            <strong>Registro de Protesto:</strong> 
                            <span style={{
                                    display: 'block',
                                    color:
                                    scoreData['CreditScore D00']< 300
                                        ? 'red'
                                        : scoreData['CreditScore D00'] >= 300 && scoreData['CreditScore D00'] <= 600
                                        ? 'orange'
                                        : 'green',
                                }}>    
                                 {scoreData['CreditScore D00']<= 300 ? "Alto Risco" : scoreData['CreditScore D00'] >= 300 && scoreData['CreditScore D00'] <= 600 ? "Médio Risco" : "Baixo Risco"}
                            </span>
                    </p>
                    <p style={{ fontWeight: 'bold', lineHeight: 1.2, display: 'flex', flexDirection: 'column' }}>Risco de Inadimplência: 
                    <strong style={{
                        fontWeight: 'normal',
                        color:
                        scoreData['CreditScore D00']< 300
                            ? 'red'
                            : scoreData['CreditScore D00'] >= 300 && scoreData['CreditScore D00'] <= 600
                            ? 'orange'
                            : 'green',
                      }}>
                        {scoreData['CreditScore D00']<= 300 ? "Alto Risco" : scoreData['CreditScore D00'] >= 300 && scoreData['CreditScore D00'] <= 600 ? "Médio Risco" : "Baixo Risco"}
                        </strong> 
                        </p>
                        <p style={{ display: 'flex', flexDirection: 'column' }}> <strong>Classe Social Pessoal:</strong> Classe Social {getClassLabel(scoreData['Income PersonalClass'])}</p>
                    </div>
                </Grid>
    
                <Grid item xs={12} sm={6}>
                    <div>
                        <p style={{ display: 'flex', flexDirection: 'column' }}><strong>CPF Formatado:</strong> {scoreData.DocumentFormatted}</p>   
                        <p style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong>Cheque sem fundo:</strong> 
                            <span style={{
                                    
                                    color:
                                    scoreData['CreditScore D00']< 300
                                        ? 'red'
                                        : scoreData['CreditScore D00'] >= 300 && scoreData['CreditScore D00'] <= 600
                                        ? 'orange'
                                        : 'green',
                                }}>    
                                 {scoreData['CreditScore D00']<= 300 ? "Alto Risco" : scoreData['CreditScore D00'] >= 300 && scoreData['CreditScore D00'] <= 600 ? "Médio Risco" : "Baixo Risco"}
                            </span>
                    </p>  
                        <p style={{ display: 'flex', flexDirection: 'column' }}><strong>Renda Pessoal:</strong> {scoreData['Income Personal']?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p style={{ display: 'flex', flexDirection: 'column' }}><strong>Renda Familiar:</strong> {scoreData['Income Family']?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p style={{ display: 'flex', flexDirection: 'column' }}><strong>Classe Social Familiar:</strong> Classe Social {getClassLabel(scoreData['Income FamilyClass'])}</p>
                        
                    </div>
                </Grid>
    
                <Grid item xs={12} sm={6}>
                <div>
                
              </div>
                </Grid>
    
                <Grid item xs={12} sm={6}>
                    <div>
                      
                        
                      

               
              </div>
                </Grid>
    
            </Grid>
    
                {/* Exibe o CPF formatado abaixo de todas as informações */}
            </section>
            ): (
              <>
                <img src="/images/icone.png" alt="Imagem de medição" width={160} />
                <p style={{ width: "50%" }}>Saiba o score e o risco de crédito do paciente para minimizar a inadimplência</p>
              </>
            )}
        </section>

        <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: 1 }}>
            <Button onClick={setClose}>Fechar</Button>
            <Button variant='contained' onClick={handleAnalyzeCPF} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Analisar CPF'}
            </Button>
        </Box>

    </Box>
    </Modal>
  )
}
