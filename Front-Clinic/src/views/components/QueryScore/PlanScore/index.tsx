import { Box } from '@mui/system'

import style from './PlanScore.module.css';
import SpeedIcon from '@mui/icons-material/Speed';
import React, { useEffect, useState } from 'react'
import { Button, CircularProgress, Modal } from '@mui/material';
import { Plans } from './Plans';
import api from 'src/@core/components/api-client';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { Check } from '@mui/icons-material';

type PlanScoreProps = {
    open: boolean;
    setClose: () => void;
}

export type PlansScore = {
   id: string;
   numberOfConsultations: number;
   value: number;
   valuePerConsultation: number;
}

export const PlanScore = ({ open, setClose }: PlanScoreProps) => {

   const [openPlans, setOpenPlans] = useState<boolean>(false);
   const [planScore, setPlanScore] = useState<PlansScore[] | undefined>();
   const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
   const [loading, setLoading] = useState<boolean>(false);
   const [boletoLink, setBoletoLink] = useState<string | null>(null); 
   const [successMessage, setSuccessMessage] = useState<boolean>(false); // Para

   const [selectedPlan, setSelectedPlan] = useState<PlansScore | null>(null);
   const store = useSelector((state: RootState) => state.clinic);

   const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')

   const fetchPlans = async () => {
      const data = await api.get<PlansScore[]>('/score-plans');
      setPlanScore(data.data);
   }

   useEffect(() => {
      fetchPlans();
   }, [])

   const handleSetClose = () => {
      setClose();
      setOpenPlans(false);
      setBoletoLink(null);
      setSuccessMessage(false);
      setSelectedPlan(null);
      setOpenConfirmModal(false);
   }
   
   const handleSetCloseConfirmModal = () => {
      setClose();
      setOpenPlans(false);
      setOpenConfirmModal(false);
   }

   const handleOpenConfirmModal = (plan: PlansScore) => {
      setOpenPlans(false);
      setOpenConfirmModal(true);
      setSelectedPlan(plan);  
   }

   const handleConfirmPayment = async () => {
      if (selectedPlan) {
         setLoading(true); // Inicia o loading
         try {
            const response = await api.post('/score-plans/payment', {
               planId: selectedPlan.id,
               accountId: userData?.accountId
            });
   
            if (response.status === 201) {
               console.log('Pagamento criado com sucesso');
               setBoletoLink(response.data); // Salva o link do boleto retornado pela API
               setSuccessMessage(true); // Exibe a mensagem de sucesso
            } else {
               console.error('Falha ao criar pagamento');
            }
         } catch (error) {
            console.error('Erro ao criar pagamento:', error);
         } finally {
            setLoading(false); // Termina o loading
         }
      }
   };
   
  if(open)
  return (
   <Modal
      open={open}
      onClose={handleSetClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
   >
   <Box
   sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '60%',
      bgcolor: 'background.paper',
      boxShadow: 24,
      borderRadius: 1,
      maxHeight: '90vh',
      overflowY: 'auto',
      
      '@media (min-width: 1600px)': {
         width: '660px',
         fontSize: '14px', // Adjust font size for larger screens
         '& input, & select': {
            fontSize: '14px' // Adjust input and select field font size
         }
      }
   }}
   >  
      {!openPlans && !openConfirmModal && (
       <div>
         <header className={style.header_plan}>
            <p>Pacotes Análise de Crédito</p>
            <SpeedIcon sx={{ fontSize: '32px' }} />
         </header>
         <div className={style.content_plan}>
          <p>
            Realize a análise de crédito e obtenha informações
            financeiras dos seus pacientes, permitindo decisões
            mais assertivas.
          </p>
            <button onClick={() => setOpenPlans(true)}>
               Ver pacotes
            </button>
         </div>
      </div>
      )}
     
       {openPlans && (
         <section className={style.wrapper_plan_score}>
            <h2>Pacotes de Análise de Crédito</h2>
            <div className={style.container_plans}>
              {planScore?.map((plan) => (
                  <Plans key={plan.id} data={plan} openConfirmModal={handleOpenConfirmModal} />
              ))}
            </div>
            <p className={style.wrapper_plan_score_paragraph}>A cada consulta de CPF, um crédito é descontado no seu pacote.</p>
         </section>
       )}

      {openConfirmModal && (
         <section style={{ textAlign: 'center', paddingBottom: '1rem' }}>
            {!successMessage ? (
               <>
                  <h2>Deseja confirmar o pagamento do plano de consulta?</h2>
                  <p style={{ fontSize: '1.1rem' }}><strong>Valor: </strong>R${selectedPlan?.value}</p>
                  <p style={{ fontSize: '1.1rem' }}> <strong>Consultas: </strong> {selectedPlan?.numberOfConsultations}</p>

                  {loading ? (
                     <Button variant='contained' disabled>
                        <CircularProgress size={24} /> 
                     </Button>
                  ) : (
                     <Button variant='contained' onClick={handleConfirmPayment}>Confirmar</Button> 
                  )}
               </>
            ) : (
               <>
                  <h2 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.5rem' }}>
                     Boleto gerado com sucesso <Check fontSize='medium' />
                  </h2>
                  <p style={{width: '50%', textAlign: 'center', margin: '1rem auto 2rem'}}>
                     Efetue o pagamento para realizar as consultas de score dos seus pacientes
                  </p>

                        <Button 
                           href={boletoLink ? boletoLink : ''}
                           variant='contained'
                           target='_blank'
                           rel="noopener noreferrer"
                        >
                        Visualizar Boleto
                     </Button> 
                
               </>
            )}
         </section>
      )}
   
    </Box>
   </Modal>
  )

  return null;
}
