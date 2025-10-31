import React, { ReactNode } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

interface Props {
  children: ReactNode
  title: string
  open: boolean
  onClose: (value: boolean) => void
  onConfirm: () => void
}

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }: Props) => {
  return (
    <Dialog open={open} onClose={() => onClose(false)} aria-labelledby='confirm-dialog'>
      <DialogTitle id='confirm-dialog'>{title}</DialogTitle>
      <DialogContent dividers>
        <Typography>{children}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' onClick={() => onClose(false)} color='default'>
          Cancelar
        </Button>
        <Button
          variant='contained'
          onClick={() => {
            onClose(false)
            onConfirm()
          }}
          color='secondary'
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationModal
