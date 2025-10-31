// ** React Imports
import { ReactNode, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box, { BoxProps } from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography, { TypographyProps } from '@mui/material/Typography'
import Image from 'next/image'
import { Alert, AlertColor } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'
import api from 'src/@core/components/api-client'
import { useRouter } from 'next/router'

// Styled Components
const RecoverPasswordIllustrationWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const RecoverPasswordIllustration = styled('img')(({ theme }) => ({
  maxWidth: '48rem',
  [theme.breakpoints.down('xl')]: {
    maxWidth: '38rem'
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '30rem'
  }
}))

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 400
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 450
  }
}))

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
  }
}))

const TypographyStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.18px',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { marginTop: theme.spacing(8) }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  '& svg': { mr: 1.5 },
  alignItems: 'center',
  textDecoration: 'none',
  justifyContent: 'center',
  color: theme.palette.primary.main
}))

const RegisterIllustrationWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const RegisterIllustration = styled('img')(({ theme }) => ({
  maxWidth: '30rem',
  [theme.breakpoints.down('xl')]: {
    maxWidth: '24rem'
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '24rem'
  }
}))

const RecoverPassword = () => {
  const router = useRouter()
  const {user_id, token} = router.query;
  const theme = useTheme()
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { settings } = useSettings()
  const [alertState, setAlertState] = useState<{ message: string; severity: AlertColor } | null>(null)

   const mode = settings.mode;
   
  // ** Vars
  const { skin } = settings
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const imageSource =
    skin === 'bordered' ? 'auth-v2-forgot-password-illustration-bordered' : 'auth-v2-forgot-password-illustration'


  const recoverPassword = async () => {
    if(newPassword !== confirmPassword) {
      setAlertState({ message: 'As senhas estão diferentes.', severity: 'error' })

      return
    }

    try {
      await api.post(`tokens/reset/${user_id}/${token}`, { password: newPassword })
      setIsSent(true);
      setAlertState({ message: 'Senha redefinida com sucesso!', severity: 'success' })
    } catch (error) {
      setAlertState({ message: 'Ocorreu um erro ao redefinir a senha. Tente novamente.', severity: 'error' })
    }
  }

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        <RegisterIllustrationWrapper>
            <RegisterIllustration
              alt='register-illustration'
              src={`/images/logos/clairis_logo${mode === 'dark' ? '_dark' : ''}.png`}
            />
          </RegisterIllustrationWrapper>
          {/* <FooterIllustrationsV2 image={`/images/pages/auth-v2-forgot-password-mask-${theme.palette.mode}.png`} /> */}


        </Box>
) : null}
      {!isSent ? <RightWrapper sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
        <Box
          sx={{
            p: 7,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper'
          }}
        >
          <BoxWrapper>
            <Box
              sx={{
                top: 30,
                left: 40,
                display: 'flex',
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image src='/images/logos/clairis_logo.png' alt={'Clairis'} width={138} height={40} />
              
            </Box>
            <Box sx={{ mb: 6 }}>
              <TypographyStyled variant='h5'>Redefinir Senha</TypographyStyled>
              <Typography variant='body2'>
                Digite sua nova senha
              </Typography>
            </Box>
            <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
              <TextField autoFocus type='password' label='Senha' sx={{ display: 'flex', mb: 4 }}
                onChange={e => setNewPassword(e.target.value)} value={newPassword} />

              <TextField autoFocus type='password' label='Confirmar senha' sx={{ display: 'flex', mb: 4 }}
                onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword} />
              <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 5.25 }} onClick={recoverPassword}>
                Redefinir
              </Button>
              <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LinkStyled href='/login'>
                  <Icon icon='mdi:chevron-left' fontSize='2rem' />
                  <span>Voltar para login</span>
                </LinkStyled>
              </Typography>
            </form>
          </BoxWrapper>
        </Box>
      </RightWrapper> : <Box
        sx={{
          p: 7,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper'
        }}
      >
        <BoxWrapper>
          <Typography variant='body2'>
            Senha redefinida com sucesso
          </Typography>
        </BoxWrapper>
      </Box>
      }
    </Box>
  )
}

RecoverPassword.guestGuard = true
RecoverPassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default RecoverPassword
