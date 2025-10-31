// ** React Imports
import { ReactNode } from 'react'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useRouter } from 'next/router'

// ** Demo Components Imports

import { Typography } from '@mui/material';
import Print from 'src/views/apps/debt/print/PrintPage';

const DebtPrint = () => {
  const router = useRouter();
  
  const id = typeof router.query.id === 'string' ? router.query.id : undefined

  if (router?.query?.id) {
    return <Print id={id} />
  } else {
    return <Typography>Página não encontrada</Typography>
  }
}

DebtPrint.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

DebtPrint.setConfig = () => {
  return {
    mode: 'light'
  }
}

DebtPrint.guestGuard = true
DebtPrint.authGuard = false;

export default DebtPrint