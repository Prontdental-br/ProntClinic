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
import PrintPage from 'src/views/apps/budget/print/PrintPage'
import { Typography } from '@mui/material';

const BudgetPrint = () => {
  const router = useRouter();
  
  const id = typeof router.query.id === 'string' ? router.query.id : undefined

  console.log('iddd',id)

  if (router?.query?.id) {
    return <PrintPage id={id} />
  } else {
    return <Typography>Página não encontrada</Typography>
  }
}

BudgetPrint.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

BudgetPrint.setConfig = () => {
  return {
    mode: 'light'
  }
}
BudgetPrint.guestGuard = true
BudgetPrint.authGuard = false;

export default BudgetPrint