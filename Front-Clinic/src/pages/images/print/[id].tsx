// ** React Imports
import { ReactNode } from 'react'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useRouter } from 'next/router'

// ** Demo Components Imports

import { Typography } from '@mui/material';
import ImagePrintPage from 'src/views/apps/images/print/PrintPage';
import { useSearchParams } from 'next/navigation';

const ImagePrint = () => {
  const router = useRouter();
  const searchParams = useSearchParams()
  const id = typeof router.query.id === 'string' ? router.query.id : undefined
  const images = JSON.parse(searchParams.get('images') || '[]')
  const img1 = images[0]
  const img2 = images[1]

  if (router?.query?.id) {
    return <ImagePrintPage id={id} img1={img1} img2={img2} />
  } else {
    return <Typography>Página não encontrada</Typography>
  }
}

ImagePrint.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

ImagePrint.setConfig = () => {
  return {
    mode: 'light'
  }
}

ImagePrint.guestGuard = true
ImagePrint.authGuard = false;

export default ImagePrint