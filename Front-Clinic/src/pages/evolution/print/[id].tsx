// ** React Imports
import { ReactNode } from 'react'

// ** Next Import
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext, InferGetStaticPropsType } from 'next/types'

// ** Third Party Imports
import api from 'src/@core/components/api-client';

// ** Types
import { BudgetType } from 'src/types/apps/budgetTypes'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useRouter } from 'next/router'

// ** Demo Components Imports

import { Typography } from '@mui/material';
import EvolutionPrintPage from 'src/views/apps/evolutions/print/PrintPage';


const EvolutionPrint = () => {
  const router = useRouter();
  
  const id = typeof router.query.id === 'string' ? router.query.id : undefined

  if (router?.query?.id) {
    return <EvolutionPrintPage id={id} />
  } else {
    return <Typography>Página não encontrada</Typography>
  }
}

EvolutionPrint.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

EvolutionPrint.setConfig = () => {
  return {
    mode: 'light'
  }
}

EvolutionPrint.guestGuard = true
EvolutionPrint.authGuard = false;

export default EvolutionPrint