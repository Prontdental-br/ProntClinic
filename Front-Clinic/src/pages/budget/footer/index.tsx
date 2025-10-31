import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { RootState, AppDispatch } from 'src/store'
import Link from '@mui/material/Link'
import { BudgetStatusEnum } from 'src/types/apps/budgetTypes'
import {Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@mui/material'
import {setShowReceipt, setReceiptGraph} from 'src/store/apps/odontogram'

import api from 'src/@core/components/api-client'


import crypto from 'crypto';

function FooterOdontogram( 
  props: { 
    save : ((status?: BudgetStatusEnum) => void),
    setBudgetStatus : ((status: string) => void),
    getGraph: () => any,
    editMode?: boolean
  } ) {
  const [ budgetAproved, setBudgetAproved ] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'save' | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const store = useSelector((state: RootState) => state.odontogram);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter()

  function handleBudgetStatus(){    
    console.log('handleBudgetStatus')
    setBudgetAproved(true);
    props.save(BudgetStatusEnum.APPROVED);
  }

   const createHashDoc = (data: string) => {
          const hash = crypto.createHash('sha256');
          hash.update(data); 
          const hashResult = hash.digest('hex');
        
          return hashResult;
      }

    const handleEmitBudgetContract = async (row: any) => {
        if (row.id) {
          const { data } = await api.get(`/contracts-signature/docId/${row.id}`);
          
          if (!data) {
            const hashDoc = createHashDoc(JSON.stringify(row));
      
            await api.post('/contracts-signature', {
              documentType: 'orcamento',
              hashDoc,
              documentId: row.id,
            });
          }
  
          handleReceipt();
        }
     }

  function handleReceipt(){
    if (store.showReceipt) return;

    dispatch(setReceiptGraph(props.getGraph()));
    dispatch(setShowReceipt(true))
  }

  const handleConfirmAction = () => {
    if (confirmAction === 'approve') {
      setBudgetAproved(true);
      props.save(BudgetStatusEnum.APPROVED);
    } else if (confirmAction === 'save') {
      props.save();
    }
    setOpenConfirm(false);
    setConfirmAction(null);
  };

  function handleClose() {
    router.back()
  }

  return (
    <>
    <Box  className='footer'>
      <Box  className='container' style={{display:'flex', gap: '10px'}}>
        <button className='btn-cancel' onClick={handleClose}>
          Fechar
        </button>

        {props.editMode === true && 
          <Link underline='none' href={`/patient/view/budget/${store.patient.id}/`}>
            <button className='btn-ficha'>Ficha do paciente</button>
          </Link>
        }
        
        
        { 
          Object.keys(store.budget).length === 0 && store.budgetTreatments.length > 0 &&
          <>
              <button
                onClick={() => {
                  setConfirmAction('approve');
                  setOpenConfirm(true);
                }}
                className='btn-approve'
              >
                Aprovar
              </button>
              <button
                onClick={() => {
                  setConfirmAction('save');
                  setOpenConfirm(true);
                }}
                className='btn-save'
              >
                Salvar Orçamento
              </button>
            </>
        }

        {
          store.budget?.id &&
          <Button onClick={() => handleEmitBudgetContract(store.budget)} variant='contained' color='success'>
            Imprimir orçamento
          </Button>
        }
      </Box>
    </Box>
     <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmação de Orçamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja {confirmAction === 'approve' ? 'aprovar' : 'salvar'} o orçamento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={handleConfirmAction} color='primary' variant='contained' autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      </>
  )
}

export default FooterOdontogram