import React from 'react'
import style from './Plans.module.css';
import { PlansScore } from '..';
import { Button, Dialog, Typography } from '@mui/material';
import { useRouter } from 'next/router';

type PlansProps = {
  data: PlansScore;
  openConfirmModal: (plan: PlansScore) => void;
}

export const Plans = ({ data, openConfirmModal }: PlansProps) => {

  const [openAlertAccountAsaas, setOpenAlertAccountAsaas] = React.useState<boolean>(false);

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}');

  const handleOpenConfirmModal = (data: PlansScore) => {
      if(userData.asaasAccount) {
          openConfirmModal(data);
      }
      setOpenAlertAccountAsaas(true);
  }

  const router = useRouter();

  return (
    <>
    <div className={style.wrapper_plan_card}>
      <h1>{data?.numberOfConsultations}</h1>
      <p>Consultas</p>

      <div className={style.content_plan_values}>
        <p>R$ {data?.value}</p>
        <span>R$ {data?.valuePerConsultation} por consulta</span>
      </div>

      <button onClick={() => handleOpenConfirmModal(data)}>
          Comprar
      </button>
    </div>

    <Dialog
       open={openAlertAccountAsaas}
       onClose={() => setOpenAlertAccountAsaas(false)}
    >
      <div style={{ 
          display: 'flex', 
          flexDirection: 'column',  
          alignItems: 'center', 
          padding: '1rem', 
          textAlign: 'center',
          gap: '.6rem'
        }}
      >
        <h2>Crie sua conta no Asaas</h2>
        <Typography>
          Para realizar a compra das consultas score. 
          Primeiro realize o cadastro de sua clínica no Asaas.
          Acesse a página do financeiro
        </Typography>

        <Button 
          variant='contained'
          onClick={() => router.push('/financial')}
        >
          Criar Conta
        </Button>
      </div>
    </Dialog>
    </>
  )
}
