import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Icon from 'src/@core/components/icon' // Ajuste o caminho conforme necessário

type ModalQuestionGenericProps = {
  open: boolean
  setOpen: (val: boolean) => void
  title: string
  message: string
  submessage?: string
  confirmButtonText: string
  cancelButtonText: string
  type?: 'question' | 'exclamation' | 'delete' | 'error'
  onConfirm: (value: string) => void
}

function ModalQuestionGeneric(props: ModalQuestionGenericProps) {
  const { open, setOpen, title, message, submessage, confirmButtonText, cancelButtonText, type, onConfirm } = props

  const handleClose = () => setOpen(false)

  const handleConfirmation = (value: string) => {
    handleClose()
    onConfirm(value)
  }

  return (
    <>
      <Dialog fullWidth open={open} onClose={handleClose} sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 } }}>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              '& svg': { mb: 2 }
            }}
          >
            {type === 'question' && <Icon icon={'mdi:help-circle-outline'} fontSize='5rem' />}
            {type === 'exclamation' && <Icon icon={'mdi:alert-circle-outline'} fontSize='5rem' />}
            {type === 'delete' && <Icon icon={'mdi:delete-outline'} fontSize='5rem' />}
            {type === 'error' && <Icon icon={'mdi:alert-octagon-outline'} fontSize='5rem' />}

            <Typography variant='h5' sx={{ mb: 2 }}>
              {title}
            </Typography>
            <Typography variant='h6' sx={{ mb: 5 }}>
              {submessage}
            </Typography>

            <Typography>{message}</Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center'
          }}
        >
          <Button variant='contained' sx={{ mr: 2 }} onClick={() => handleConfirmation('confirm')}>
            {confirmButtonText}
          </Button>
          <Button variant='outlined' color='secondary' onClick={() => handleConfirmation('cancel')}>
            {cancelButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ModalQuestionGeneric
