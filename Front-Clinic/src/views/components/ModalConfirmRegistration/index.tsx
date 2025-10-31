import { Button, Dialog, DialogActions, DialogContent, Fade, FadeProps, Grid, IconButton, Modal, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useRouter } from 'next/router'
import React, { forwardRef, ReactElement, Ref, useEffect, useState } from 'react'
import YouTube from 'react-youtube'

import Icon from 'src/@core/components/icon'

type ModalConfirmRegistrationProps = { 
    onClose: () => void
    open: boolean
}

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

export const ModalConfirmRegistration = ({ onClose, open }: ModalConfirmRegistrationProps) => {

  const router = useRouter();
  const [showButton, setShowButton] = useState(false); // Estado para controlar a visibilidade do botão
  const [videoEnded, setVideoEnded] = useState(false); // Estado para verificar se o vídeo acabou
  const videoId = '3Xy7fyMfS94';

  const handleFinishRegistration = () => {
    router.push('pages/account-settings/account/');
  };

  // Função chamada após 1 minuto ou quando o vídeo terminar
  const handleShowButton = () => {
    setShowButton(true);
  };

  // Função que é chamada quando o vídeo termina
  const handleVideoEnd = () => {
    setVideoEnded(true);
    handleShowButton();
  };

  // Configuração do temporizador para 1 minuto
  useEffect(() => {
    if (open) {
      const timer = setTimeout(handleShowButton, 60000); // 1 minuto = 60.000ms

      return () => clearTimeout(timer); // Limpar o timer ao desmontar
    }
  }, [open]);

  return (
    <Dialog
        fullWidth
        open={open}
        maxWidth='md'
        scroll='body'
        onClose={onClose}
        TransitionComponent={Transition}
        
      >
        <DialogContent
          sx={{
            position: 'relative',
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <IconButton
            size='small'
            onClick={onClose}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
              Finalize seu cadastro
            </Typography>
            <Typography variant='body2'>
                 Para utilizar o sistema Clairis corretamente, assista ao vídeo abaixo e inicie o cadastro pelo menu Clínica
            </Typography>
          </Box>
          <Grid container spacing={6}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <YouTube videoId={videoId} onEnd={handleVideoEnd} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
        {(showButton || videoEnded) && (
          <Button variant='contained' onClick={handleFinishRegistration}>
            Terminar cadastro clínica
          </Button>
        )}
        </DialogActions>
      </Dialog>
  )
}


