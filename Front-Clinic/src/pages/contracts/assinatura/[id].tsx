import { Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout';
import { LayoutSignature } from 'src/views/apps/signature/layout';

const Assinatura = () => {

  const router = useRouter();
  
  const id = typeof router.query.id === 'string' ? router.query.id : undefined

  if (router?.query?.id) {
    return <LayoutSignature id={id ? id : ''} />
  } else {
    return <Typography>Página não encontrada</Typography>
  }

}
Assinatura.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
Assinatura.guestGuard = true
export default Assinatura