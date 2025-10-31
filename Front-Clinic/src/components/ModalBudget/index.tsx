'use client'

import React, {useState, useEffect} from 'react'
import {
  TextField,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ValueFunction } from 'react-hot-toast';
import { BudgetItemType, BudgetType } from 'src/types/apps/budgetTypes';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch,  RootState } from 'src/store';
import api from 'src/@core/components/api-client';
import moment from 'moment';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import PrintPage from 'src/views/apps/budget/print/PrintPage';

import crypto from 'crypto';

interface ModalBudgetProps{
  open: boolean;
  setOpen: (value: boolean) => void;
  budget: BudgetType;
  clearBudget?: () => void; // novo
}

const statusLabels = {
  "A": "Aprovado",
  "O": "Aberto",
  "R": "Rejeitado"
}

const statusItemLabels = {
  "PENDING": "Pendente",
  "FINISHED": "Finalizado"
}

export default function ModalBudget({open, setOpen, budget, clearBudget }: ModalBudgetProps){  
  const dispatch = useDispatch<AppDispatch>();
  const selector = useSelector((state: RootState) => state.odontogram)
  const [items, setItems] = useState<BudgetItemType[]>([]);

  const createHashDoc = (data: string) => {
        const hash = crypto.createHash('sha256');
        hash.update(data); 
        const hashResult = hash.digest('hex');
      
        return hashResult;
    }
  
 useEffect(() => {
    if (budget?.id) {
      async function loadItemsAndCreateSignature() {
        try {
        
          const res = await api.get(`/budget-items/${budget.id}`, {
            timeout: 10000,
          });
          setItems(res.data);

  
          const { data } = await api.get(`/contracts-signature/docId/${budget.id}`);
          
          if (!data) {
            const hashDoc = createHashDoc(JSON.stringify(budget));

            await api.post('/contracts-signature', {
              documentType: 'orcamento',
              hashDoc,
              documentId: budget.id,
            });

          }
        } catch (err) {
          console.log('Erro ao carregar dados do orçamento:', err);
        }
      }

      loadItemsAndCreateSignature();
    }

    console.log('budget to show', budget);
  }, [budget]);

  useEffect(() => {
    console.log('budget items:', items)
  }, [items])

  function handleClose(){
    setOpen(false);
    if (clearBudget) clearBudget();
  }
  
  return(
    <Dialog
        fullWidth={true}
        maxWidth="lg"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Dados do orçamento</DialogTitle>
        <DialogContent>
          <PrintPage id={budget?.id} autoPrint={false} />         
        </DialogContent>
        <DialogActions sx={{pt: '20px'}}>
          <Button 
            target='_blank'
            href={`/budget/print/${budget?.id}`}
            color='success'>
            Imprimir orçamento
          </Button>
          <Button onClick={handleClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
  )
}