// ** React Imports
import { Ref, useState, forwardRef, ReactElement } from 'react'

import Image from 'next/image'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Fade, { FadeProps } from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import useBgColor from 'src/@core/hooks/useBgColor'
import { useSettings } from 'src/@core/hooks/useSettings'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

const DialogAuthentication = () => {
  // ** States
  const [show, setShow] = useState<boolean>(false)
  const [authType, setAuthType] = useState<'app' | 'sms'>('app')
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false)

  // ** Hooks
  const bgColors = useBgColor()
  const { settings } = useSettings()
  const phoneNumber = '11998808944'

  // ** Var
  const { direction } = settings

  const handleClose = () => {
    setShow(false)
    setAuthType('app')
  }

  const handleOpenWhatsApp = () => {
    window.open(`https://wa.me/${'+55' + phoneNumber}`, '_blank')
  }

  const handleOpenPhone = () => {
    window.open(`https://wa.me/${'+55' + phoneNumber}`, '_blank')
  }

  const handleAuthDialogClose = () => {
    if (show) {
      setShow(false)
    }
    setShowAuthDialog(false)
    if (authType !== 'app') {
      setTimeout(() => {
        setAuthType('app')
      }, 250)
    }
  }

  const arrowIcon = direction === 'ltr' ? 'mdi:chevron-right' : 'mdi:chevron-left'

  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', '& svg': { mb: 2 } }}>
        <Icon icon='mdi:card-account-phone-outline' fontSize='2rem' />
        <Typography variant='h6' sx={{ mb: 4 }}>
          Entre em contato com a gente
        </Typography>
        <Typography sx={{ mb: 3 }}>Escolha de que forma deseja entrar em contato conosco</Typography>
        <Button variant='contained' onClick={() => setShow(true)}>
          Começar
        </Button>
      </CardContent>
      <Dialog
        fullWidth
        open={show}
        maxWidth='md'
        scroll='body'
        onClose={handleClose}
        onBackdropClick={handleClose}
        TransitionComponent={Transition}
      >
        <DialogContent
          sx={{
            position: 'relative',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <IconButton size='small' onClick={handleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
            <Icon icon='mdi:close' />
          </IconButton>

          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
                  Contate um Suporte especializado
                </Typography>
                <Typography variant='body2'>
                  Escolha a melhor opção para que possamos entrar em contato com você e tirar todas suas dúvidas
                </Typography>
              </Box>
            </Grid>

            <Grid item sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box sx={{ display: 'flex' }}>
                {/* Adicione a imagem aqui */}
                <Image src='/images/logos/c_logo.png' alt={'Clairis'} width={100} height={120} />
              </Box>
            </Grid>
            <Grid item xs={9}>
              <Box
                onClick={() => setAuthType('app')}
                sx={{
                  pt: 4,
                  pb: 2.75,
                  px: 7.2,
                  mb: 5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  ...(authType === 'app' ? { ...bgColors.primaryLight } : { backgroundColor: 'action.hover' }),
                  border: theme =>
                    `1px solid ${authType === 'app' ? theme.palette.primary.main : theme.palette.secondary.main}`,
                  ...(authType === 'app'
                    ? { ...bgColors.primaryLight }
                    : { backgroundColor: bgColors.secondaryLight.backgroundColor })
                }}
              >
                <Box
                  sx={{
                    rowGap: 1.5,
                    columnGap: 3,
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: ['center', 'start'],
                    flexDirection: ['column', 'row']
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    <Icon icon='mdi:whatsapp' fontSize={35} />
                  </Box>
                  <div>
                    <Typography variant='h6' sx={{ mb: 1.25, ...(authType === 'app' && { color: 'primary.main' }) }}>
                      Via WhatsApp
                    </Typography>
                    <Typography sx={{ ...(authType === 'app' && { color: 'primary.main' }) }}>
                      Use esta opção para que o suporte entre em contato através de seu WhatsApp
                    </Typography>
                  </div>
                </Box>
              </Box>

              <Box
                onClick={() => setAuthType('sms')}
                sx={{
                  pt: 4,
                  pb: 2.75,
                  px: 7.2,
                  borderRadius: 1,
                  cursor: 'pointer',
                  ...(authType === 'sms' ? { ...bgColors.primaryLight } : { backgroundColor: 'action.hover' }),
                  border: theme =>
                    `1px solid ${authType === 'sms' ? theme.palette.primary.main : theme.palette.secondary.main}`,
                  ...(authType === 'sms'
                    ? { ...bgColors.primaryLight }
                    : { backgroundColor: bgColors.secondaryLight.backgroundColor })
                }}
              >
                <Box
                  sx={{
                    rowGap: 1.5,
                    columnGap: 3,
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: ['center', 'start'],
                    flexDirection: ['column', 'row']
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    <Icon icon='mdi:phone-in-talk-outline' fontSize={35} />
                  </Box>
                  <div>
                    <Typography
                      variant='h6'
                      sx={{
                        mb: 1.25,
                        fontWeight: 600,

                        ...(authType === 'sms' && { color: 'primary.main' })
                      }}
                    >
                      Telefone - (11) 9.4609-8401
                    </Typography>
                    <Typography sx={{ ...(authType === 'sms' && { color: 'primary.main' }) }}>
                      Use esta opção para que nossa equipe especializada entre em contato através do telefone
                    </Typography>
                  </div>
                </Box>
              </Box>
            </Grid>
            {/* <Grid item xs={9}></Grid> */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant='contained'
                endIcon={<Icon icon={arrowIcon} />}
                onClick={() => {
                  setShow(false)
                  setShowAuthDialog(true)
                }}
              >
                Continuar
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={showAuthDialog}
        onClose={handleAuthDialogClose}
        TransitionComponent={Transition}
        onBackdropClick={handleAuthDialogClose}
      >
        <DialogContent
          sx={{
            position: 'relative',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <IconButton
            size='small'
            onClick={handleAuthDialogClose}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>

          <Grid container spacing={6}>
            <Grid item xs={12}>
              {authType === 'sms' ? (
                <Grid container spacing={6}>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Typography variant='h6'>Iniciar Contato com o Vendedor via telefone</Typography>
                      <Typography variant='body2'>
                        Clique no botão continue para iniciar a chamada no seu telefone
                      </Typography>
                    </div>
                    <Button variant='outlined' color='secondary' onClick={handleAuthDialogClose} sx={{ mr: 4 }}>
                      Cancelar
                    </Button>
                    <Button href='tel:11946098401' variant='contained' endIcon={<Icon icon={arrowIcon} />}>
                      Continuar
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={6}>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Typography variant='h6'>Iniciar Contato com o Vendedor via WhatsApp </Typography>
                      <Typography variant='body2'>Clique no botão continue para abrir o WhatsApp</Typography>
                    </div>
                    <Button variant='outlined' color='secondary' onClick={handleAuthDialogClose} sx={{ mr: 4 }}>
                      Cancelar
                    </Button>
                    <Button variant='contained' endIcon={<Icon icon={arrowIcon} />} onClick={handleOpenWhatsApp}>
                      Continuar
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default DialogAuthentication
