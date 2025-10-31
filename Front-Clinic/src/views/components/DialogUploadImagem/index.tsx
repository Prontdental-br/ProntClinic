import React, { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material'
import ImageGrid from './ImageGrid'
import { useCamera } from 'src/hooks/useCamera'
import CameraDialog from '../CameraDialog'

interface AddDocumentsProps {
  onUpload: (images: string[]) => void
  setOpen: (open: boolean) => void
  title?: string
}

const DialogUploadImagem: React.FC<AddDocumentsProps> = ({ onUpload, setOpen, title = 'Upload de Documentos' }) => {
  const [open, setInternalOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const { openCamera } = useCamera()
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false)

  const handleUpload = () => {
    onUpload(images)
    setOpen(false)
  }

  // Mantém o estado interno e externo sincronizados
  useEffect(() => {
    setOpen(open)
  }, [open, setOpen])

  const handleOpen = () => {
    setInternalOpen(true)
  }

  const handleClose = () => {
    setInternalOpen(false)
  }

  const handleCapture = (imgSrc: string) => {
    setImages(prev => [...prev, imgSrc])
    setCameraDialogOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (fileList) {
      const imageURLs = Array.from(fileList).map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...imageURLs])
    }
  }

  const handleDeleteImage = (imgUrl: string) => {
    setImages(prev => prev.filter(img => img !== imgUrl))
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby='dialog-upload' fullWidth maxWidth='md'>
        <DialogTitle id='dialog-upload-title'>{title}</DialogTitle>
        <DialogContent>
          <Button component='label' fullWidth>
            Carregar do computador
            <input type='file' hidden onChange={handleFileChange} />
          </Button>
          <Button onClick={openCamera} fullWidth>
            Câmera
          </Button>

          <ImageGrid images={images} onDelete={handleDeleteImage} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Fechar
          </Button>
          <Button onClick={handleUpload} color='primary'>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
      <CameraDialog open={cameraDialogOpen} onClose={() => setCameraDialogOpen(false)} onCapture={handleCapture} />
    </>
  )
}

export default DialogUploadImagem
