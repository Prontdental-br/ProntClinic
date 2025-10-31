'use client'
import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Typography
} from '@mui/material'
import { GridCloseIcon } from '@mui/x-data-grid'
import { toast } from 'react-toastify'
import axios from 'axios'

interface Connection {
  id: string
  isConnected: boolean
  phoneNumber: string
}

export default function Page() {
  const [qrCodeBase64, setQrCodeBase64] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [connectionsData, setConnectionsData] = useState<Connection[]>([])
  const [showConnectionQrCodeModal, setShowConnectionQrCodeModal] = useState(false)

  const createConnection = async () => {
    const { data } = await axios.post('/api/whatsapp')

    setQrCodeBase64(data.qrCode)
  }

  const listConnections = async () => {
    const { data } = await axios.get('/api/whatsapp')

    setConnectionsData(data.data)
  }

  const handleCreateConnection = async () => {
    setShowConnectionQrCodeModal(true)
    setLoading(true)
    await createConnection()
    setLoading(false)
  }

  const handleCloseModal = async () => {
    await listConnections()
    setShowConnectionQrCodeModal(false)
  }

  const handleReconnect = async (id: string) => {
    setQrCodeBase64('')
    setShowConnectionQrCodeModal(true)
    setLoading(true)
    const { data } = await axios.get('/api/whatsapp/reconnect/' + id)

    setQrCodeBase64(data.qrCode)
    setLoading(false)
  }

  const deleteConnection = async (id: string) => {
    await axios.delete('/api/whatsapp/' + id)
  }

  const restartConnection = async (id: string) => {
    await axios.get('/api/whatsapp/restart/' + id)
  }

  const handleDeleteConnection = async (id: string) => {
    const promise = deleteConnection(id)

    await toast.promise(promise, {
      pending: 'Deletando conexão',
      success: 'Conexão deletada com sucesso',
      error: 'Ocorreu um erro! Tente novamente'
    })
    listConnections()
  }

  const handleRestartConnection = async (id: string) => {
    const promise = restartConnection(id)

    await toast.promise(promise, {
      pending: 'Reiniciando conexão',
      success: 'Conexão reiniciada com sucesso',
      error: 'Ocorreu um erro! Tente novamente'
    })
    listConnections()
  }

  const disconnectConnection = async (id: string) => {
    await axios.get('/api/whatsapp/disconnect/' + id)
  }

  const handleDisconnectConnection = async (id: string) => {
    const promise = disconnectConnection(id)

    await toast.promise(promise, {
      pending: 'Reiniciando conexão',
      success: 'Conexão reiniciada com sucesso',
      error: 'Ocorreu um erro! Tente novamente'
    })
    listConnections()
  }

  useEffect(() => {
    listConnections()
  }, [])

  return (
    <Grid>
      <Card style={{ height: '100%', padding: '20px' }}>
        <CardContent>
          <Button
          onClick={handleCreateConnection}>
            Criar conexão
          </Button>
        </CardContent>
        <Grid display={'flex'} flexDirection={'row'} flexWrap={'wrap'} gap={'12px'}>
          {connectionsData.map(({ id, isConnected, phoneNumber }, index) => (
            <Grid key={id}>
              <Card style={{ width: '20em', height: '100%' }}>
                <CardHeader title={`Conexão ${index + 1}`} />
                <CardContent sx={{ display: 'flex' }}>
                  <Grid>
                    <Grid
                      display={'flex'}
                      flexDirection={'row'}
                      gap={'12px'}
                      justifyContent={'center'}
                      alignItems={'center'}
                    >
                      <Typography
                        width={'fit-content'}
                        color={'white'}
                        padding={'6px'}
                        borderRadius={'8px'}
                        bgcolor={`${isConnected ? 'green' : 'red'}`}
                      >
                        {isConnected ? 'Conectado' : 'Não conectado'}
                      </Typography>
                      <Button sx={{ height: '2.5em' }} variant='contained' onClick={() => handleDeleteConnection(id)}>
                        Excluir
                      </Button>
                    </Grid>
                    {/* {isConnected === false && (
                      <Grid>
                        <Button onClick={() => handleReconnect(id)}>Reconectar</Button>
                      </Grid>
                    )} */}
                    <Grid display={'flex'}>
                    {/* <Button onClick={() => handleRestartConnection(id)}>Reiniciar</Button> */}
                    {/* <Button onClick={() => handleDisconnectConnection(id)}>Desconectar</Button> */}
                    </Grid>
                    {
                      phoneNumber && (
                        <Grid display={'flex'}>
                          <Typography>Telefone: {phoneNumber}</Typography>
                        </Grid>
                      )
                    }
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Dialog
          open={showConnectionQrCodeModal}
          onClose={handleCloseModal}
          fullWidth
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          {loading === true && (
            <Box
              sx={{
                height: '20em',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <CircularProgress disableShrink sx={{ mt: 6 }} />
            </Box>
          )}
          {loading === false && (
            <Grid
              display={'flex'}
              flexDirection={'column'}
              alignItems={'center'}
              justifyContent={'center'}
              position={'relative'}
            >
              <Grid position={'absolute'} top={'0'} right={'0'}>
                <IconButton onClick={handleCloseModal}>
                  <GridCloseIcon />
                </IconButton>
              </Grid>
              <DialogTitle id='alert-dialog-title'>
                <Typography variant='h5'>Escaneie o QR code com seu WhatsApp Web</Typography>
              </DialogTitle>
              <img
                src={decodeURIComponent(qrCodeBase64)}
                alt='QR Code'
                style={{ width: '50%', height: '50%', marginBottom: '12px' }}
              />
            </Grid>
          )}
        </Dialog>
      </Card>
    </Grid>
  )
}
