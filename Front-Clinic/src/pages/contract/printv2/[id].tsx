// ** React Imports
import { ReactNode } from 'react'

// ** Next Import
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext, InferGetStaticPropsType } from 'next/types'

// ** Third Party Imports
import api from 'src/@core/components/api-client';


// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useRouter } from 'next/router'

// ** Demo Components Imports

import { Typography } from '@mui/material';
import Print from 'src/views/apps/contract/print/PrintPage';

const PrescriptionPrint = () => {
  const router = useRouter();
  
  const id = typeof router.query.id === 'string' ? router.query.id : undefined

  if (router?.query?.id) {
    return <Print id={id} />
  } else {
    return <Typography>Página não encontrada</Typography>
  }
}

PrescriptionPrint.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

PrescriptionPrint.setConfig = () => {
  return {
    mode: 'light'
  }
}

PrescriptionPrint.guestGuard = true
export default PrescriptionPrint