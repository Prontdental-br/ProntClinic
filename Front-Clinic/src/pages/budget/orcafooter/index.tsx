import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from 'src/store'
import Link from '@mui/material/Link'
import { BudgetStatusEnum } from 'src/types/apps/budgetTypes'
import {Button, Box} from '@mui/material'
import {setShowReceipt, setReceiptGraph} from 'src/store/apps/odontogram'

import api from 'src/@core/components/api-client'

import crypto from 'crypto';

function FooterOrca( 
  props: { 
    save : ((status?: BudgetStatusEnum) => void),
    setBudgetStatus : ((status: string) => void),
    editMode?: boolean
  } ) {
  const [ budgetAproved, setBudgetAproved ] = useState<boolean>(false);
  const store = useSelector((state: RootState) => state.odontogram);
  const dispatch = useDispatch<AppDispatch>();

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

  function handleBudgetStatus(){    
    setBudgetAproved(true);
    props.save(BudgetStatusEnum.APPROVED);
  }

  function handleReceipt(){
    window.open(`/budget/print/${store.budget.id}`)
  }

  return (
    <Box  className='footer'>
      <Box  className='container' style={{display:'flex', gap: '10px'}}>
        <Link underline="none" href="/">
          <button className='btn-cancel'>Fechar</button>
        </Link>

        {props.editMode === true && 
          <Link underline='none' href={`/patient/view/budget/${store.patient.id}/`}>
            <button className='btn-ficha'>Ficha do paciente</button>
          </Link>
        }
        
        { 
          Object.keys(store.budget).length === 0 && store.budgetTreatments.length > 0 &&
          <>
            <button onClick={ handleBudgetStatus  } className='btn-approve'>Aprovar</button>
            <button onClick={ () => props.save() } className='btn-save'>Salvar Orçamento</button>
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
  )
}

export default FooterOrca