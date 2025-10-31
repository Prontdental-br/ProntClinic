import React, { useRef } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import Webcam from 'react-webcam'

interface CameraDialogProps {
  open: boolean
  onClose: () => void
  onCapture: (imgSrc: string) => void
}

const CameraDialog: React.FC<CameraDialogProps> = ({ open, onClose, onCapture }) => {
  const webcamRef = useRef<Webcam | null>(null)

  const videoConstraints = {
    width: 500,
    height: 500,
    facingMode: 'user'
  }

  const capture = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot()
      onCapture(screenshot!)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Câmera</DialogTitle>
      <DialogContent>
        <Webcam
          ref={webcamRef}
          screenshotFormat='image/jpeg'
          height={500}
          width={500}
          videoConstraints={videoConstraints}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={capture} sx={{ color: theme => `${theme.palette.primary.main} !important` }}>Capturar Foto</Button>
        <Button onClick={onClose} sx={{ color: theme => `${theme.palette.primary.main} !important` }}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CameraDialog
