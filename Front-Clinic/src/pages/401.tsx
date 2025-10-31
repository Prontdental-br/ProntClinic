// ** React Imports
import { ReactNode } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrations from 'src/views/pages/misc/FooterIllustrations'
import { RegisterIllustration, RegisterIllustrationWrapper } from './register'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Styled Components
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const Img = styled('img')(({ theme }) => ({
  marginTop: theme.spacing(15),
  marginBottom: theme.spacing(15),
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    height: 400
  }
}))

const Error401 = ({ message }: { message?: string }) => {
  const { settings } = useSettings()
  const mode = settings.mode

  return (
    <Box className='content-center'>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <BoxWrapper>
          <Typography variant='h1' sx={{ mb: 2.5 }}>
            401
          </Typography>
          <Typography variant='h5' sx={{ mb: 2.5, fontSize: '1.5rem !important' }}>
            {message ? message : 'Você não é autorizado! 🔐'}
          </Typography>
          <Typography variant='body2'>
            Você não tem permissão para acessar esta página. Vá para a página inicial!
          </Typography>
        </BoxWrapper>

        <Img alt='clairis-logo' width={'55%'} src={`/images/logos/clairis_logo${mode === 'dark' ? '_dark' : ''}.png`} />

        <Button href='/' component={Link} variant='contained' sx={{ px: 5.5 }}>
          Voltar para o início
        </Button>
      </Box>
      {/* <FooterIllustrations image='/images/pages/misc-401-object.png' /> */}
    </Box>
  )
}

Error401.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default Error401
