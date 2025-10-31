import { Button, Card, CardContent, CardHeader, Dialog, DialogTitle, Grid, IconButton, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { GridCloseIcon } from "@mui/x-data-grid"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import api from "src/@core/components/api-client"
import Icon from "src/@core/components/icon"
import FallbackSpinner from "src/@core/components/spinner"

interface Connection {
  id: string
  isConnected: boolean
  phone: string
}

export const TabConnectAgent = () => {
  const [qrCodeBase64, setQrCodeBase64] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [connectionsData, setConnectionsData] = useState<Connection[]>([])
    const [showConnectionQrCodeModal, setShowConnectionQrCodeModal] = useState(false)

  const createConnection = async () => {
   const { data } = await api.post('/whatsapp')
      setQrCodeBase64(data.qrCode)
    }
  
    const listConnections = async () => {
      // const { data } = await api.get('/whatsapp')
      // setConnectionsData(data.data)
    }
  
    const handleCreateConnection = async () => {
      // setShowConnectionQrCodeModal(true)
      // setLoading(true)
      // await createConnection()
      // setLoading(false)
    }
  
    const handleCloseModal = async () => {
      await listConnections()
      setShowConnectionQrCodeModal(false)
    }
  
    const handleReconnect = async (id: string) => {
      setQrCodeBase64('')
      setShowConnectionQrCodeModal(true)
      setLoading(true)
      const { data } = await api.get('/whatsapp/reconnect/' + id)
      
      setQrCodeBase64(data.qrCode)
      setLoading(false)
    }
  
    const deleteConnection = async (id: string) => {
      await api.delete('/whatsapp/' + id)
    }
  
    const restartConnection = async (id: string) => {
      await api.get('/whatsapp/restart/' + id)
    }
  
    const handleDeleteConnection = async (id: string) => {
      const promise = deleteConnection(id);
      await toast.promise(promise, {
        loading: 'Deletando conexão',
        success: 'Conexão deletada com sucesso',
        error: 'Ocorreu um erro! Tente novamente'
      });
      listConnections();
    }
  
    const handleRestartConnection = async (id: string) => {
      const promise = restartConnection(id);
      await toast.promise(promise, {
        loading: 'Reiniciando conexão',
        success: 'Conexão reiniciada com sucesso',
        error: 'Ocorreu um erro! Tente novamente'
      });
      listConnections();
    }
  
    const disconnectConnection = async (id: string) => {
      await api.get('/whatsapp/disconnect/' + id)
    }
  
    const handleDisconnectConnection = async (id: string) => {
      const promise = disconnectConnection(id);
      await toast.promise(promise, {
        loading: 'Desconectando conexão',
        success: 'Desconectado com sucesso',
        error: 'Ocorreu um erro! Tente novamente'
      });
      listConnections();
    }
  
    useEffect(() => {
      listConnections()
    }, [])

    return (
         <Grid>
              <Card style={{ height: '100%', padding: '20px' }}>

                <Box pl={5.5} display={'flex'} flexDirection={'row'} gap={'12px'} alignItems={'center'} mb={2}>
                  <Icon icon='mdi:check-circle' fontSize={30} />
                  <h2>Seu Agente ProntChat IA foi criado com sucesso!</h2>
                </Box>
                  <Typography fontSize={'14px'} pl={5.5}>Sua chave de acesso foi criada, para utilizar agora a nossa assistente, conecte-se seu WhatsApp</Typography>

                <CardContent>
                  <Button disabled={ connectionsData.length > 0 } onClick={handleCreateConnection}>Criar conexão</Button>
                </CardContent>
                <Grid display={'flex'} flexDirection={'row'} flexWrap={'wrap'} gap={'12px'}>
                  {connectionsData.map(({ id, isConnected, phone }, index) => (
                    <Grid key={id}>
                      <Card style={{ width: '20em', height: '100%' }}>
                        <CardHeader title={`Conexão ${index + 1}`} />
                        <CardContent sx={{ display: 'flex' }}>
                          <Grid>
                            <Grid display={'flex'} flexDirection={'row'} gap={'12px'} justifyContent={'center'} alignItems={'center'}>
                              <Typography
                                width={'fit-content'}
                                color={'white'}
                                padding={'6px'}
                                borderRadius={'8px'}
                                bgcolor={`${isConnected ? 'green' : 'red'}`}
                              >
                                {isConnected ? 'Conectado' : 'Não conectado'}
                              </Typography>
                              <Button sx={{ height: '2.5em' }} variant='contained' onClick={ () => handleDeleteConnection(id) }>Excluir</Button>
                            </Grid>
                            {isConnected === false && (
                              <Grid>
                                <Button onClick={ () => handleReconnect(id) }>Reconectar</Button>
                              </Grid>
                            )}
                            <Grid display={'flex'}>
                              {/* <Button onClick={ () => handleRestartConnection(id) }>Reiniciar</Button> */}
                              <Button onClick={ () => handleDisconnectConnection(id) }>Desconectar</Button>
                            </Grid>
                            {
                              phone && (
                                <Grid display={'flex'}>
                                  <Typography>Telefone: {phone}</Typography>
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
                  {loading === true && <FallbackSpinner sx={{ height: '20em', width: '100%' }} />}
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