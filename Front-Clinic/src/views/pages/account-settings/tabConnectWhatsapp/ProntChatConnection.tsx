import React, { useState, useCallback, useContext, ReactNode, ReactElement } from 'react'
import { toast } from 'react-toastify'
import { format, parseISO } from 'date-fns'

import { makeStyles } from '@material-ui/core/styles'
import { green } from '@material-ui/core/colors'
import {
  Button,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Table,
  TableHead,
  Paper,
  Tooltip,
  Typography,
  CircularProgress
} from '@material-ui/core'

import Icon from 'src/@core/components/icon'

import prontChatApi from './ProntChatApi'
import translateBackendError from 'src/common/translateBackendError'
import { WhatsAppsContext } from 'src/context/WhatsAppsContext'
import WhatsAppModal from 'src/views/components/WhatsAppModal'
import ConfirmationModal from 'src/views/components/ConfirmationModal'
import { Can } from 'src/views/components/Can'
import Title from 'src/views/components/Title'
import MainHeader from 'src/views/components/MainHeader'
import formatSerializedId from 'src/@core/utils/formatSerializedId'
import MainHeaderButtonsWrapper from 'src/views/components/MainHeaderButtonsWrapper'
import MainContainer from 'src/views/components/MainContainer'
import TableRowSkeleton from 'src/views/components/TableRowSkeleton'
import QrcodeModal from 'src/views/components/QrcodeModal'

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: 'scroll'
  },
  customTableCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: theme.typography.pxToRem(14),
    border: '1px solid #dadde9',
    maxWidth: 450
  },
  tooltipPopper: {
    textAlign: 'center'
  },
  buttonProgress: {
    color: green[500]
  }
}))

interface CustomToolTipProps {
  title: string
  content?: string
  children: ReactElement
}

interface Whatsapp {
  id: string
  name: string
  number?: string
  updatedAt: string
  isDefault: boolean
  status: string
}

const CustomToolTip = ({ title, content, children }: CustomToolTipProps) => {
  const classes = useStyles()

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper
      }}
      title={
        <React.Fragment>
          <Typography gutterBottom color='inherit'>
            {title}
          </Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  )
}

const ProntChatConnection = ({ user }: any) => {
  const classes = useStyles()

  const { whatsApps, loading } = useContext(WhatsAppsContext)
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedWhatsApp, setSelectedWhatsApp] = useState<Whatsapp | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const confirmationModalInitialState = {
    action: '',
    title: '',
    message: '',
    whatsAppId: ''
  }
  const [confirmModalInfo, setConfirmModalInfo] = useState(confirmationModalInitialState)

  const restartWhatsapps = async () => {
    // const companyId = localStorage.getItem("companyId");
    try {
      await prontChatApi.post(`/whatsapp-restart/`)
      toast.warn('Aguarde... reiniciando...')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error
      if (errorMsg) {
        toast.error(translateBackendError(errorMsg))
      }
    }
  }

  const handleStartWhatsAppSession = async (whatsAppId: string) => {
    try {
      await prontChatApi.post(`/whatsappsession/${whatsAppId}`)
    } catch (err: any) {
      const errorMsg = err.response?.data?.error
      if (errorMsg) {
        toast.error(translateBackendError(errorMsg))
      }
    }
  }

  const handleRequestNewQrCode = async (whatsAppId: string) => {
    try {
      await prontChatApi.put(`/whatsappsession/${whatsAppId}`)
    } catch (err: any) {
      const errorMsg = err.response?.data?.error
      if (errorMsg) {
        toast.error(translateBackendError(errorMsg))
      }
    }
  }

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null)
    setWhatsAppModalOpen(true)
  }

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false)
    setSelectedWhatsApp(null)
  }, [setSelectedWhatsApp, setWhatsAppModalOpen])

  const handleOpenQrModal = (whatsApp: any) => {
    setSelectedWhatsApp(whatsApp)
    setQrModalOpen(true)
  }

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null)
    setQrModalOpen(false)
  }, [setQrModalOpen, setSelectedWhatsApp])

  const handleEditWhatsApp = (whatsApp: Whatsapp) => {
    setSelectedWhatsApp(whatsApp)
    setWhatsAppModalOpen(true)
  }

  const handleOpenConfirmationModal = (action: string, whatsAppId: string) => {
    if (action === 'disconnect') {
      setConfirmModalInfo({
        action: action,
        title: 'Deletar',
        message: 'Tem certeza? Você precisará ler o QR Code novamente.',
        whatsAppId: whatsAppId
      })
    }

    if (action === 'delete') {
      setConfirmModalInfo({
        action: action,
        title: 'Deletar',
        message: 'Você tem certeza? Essa ação não pode ser revertida.',
        whatsAppId: whatsAppId
      })
    }
    setConfirmModalOpen(true)
  }

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === 'disconnect') {
      try {
        await prontChatApi.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`)
      } catch (err: any) {
        const errorMsg = err.response?.data?.error
        if (errorMsg) {
          toast.error(translateBackendError(errorMsg))
        }
      }
    }

    if (confirmModalInfo.action === 'delete') {
      try {
        await prontChatApi.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`)
        toast.success('Conexão com o WhatsApp excluída com sucesso!')
      } catch (err: any) {
        const errorMsg = err.response?.data?.error
        if (errorMsg) {
          toast.error(translateBackendError(errorMsg))
        }
      }
    }

    setConfirmModalInfo(confirmationModalInitialState)
  }

  const renderActionButtons = (whatsApp: Whatsapp) => {
    return (
      <>
        {whatsApp.status === 'qrcode' && (
          <Button size='small' variant='contained' color='primary' onClick={() => handleOpenQrModal(whatsApp)}>
            QR CODE
          </Button>
        )}
        {whatsApp.status === 'DISCONNECTED' && (
          <>
            <Button
              size='small'
              variant='outlined'
              color='primary'
              onClick={() => handleStartWhatsAppSession(whatsApp.id)}
            >
              Tentar novamente"
            </Button>{' '}
            <Button
              size='small'
              variant='outlined'
              color='secondary'
              onClick={() => handleRequestNewQrCode(whatsApp.id)}
            >
              Novo QR CODE
            </Button>
          </>
        )}
        {(whatsApp.status === 'CONNECTED' || whatsApp.status === 'PAIRING' || whatsApp.status === 'TIMEOUT') && (
          <Button
            size='small'
            variant='outlined'
            color='secondary'
            onClick={() => {
              handleOpenConfirmationModal('disconnect', whatsApp.id)
            }}
          >
            Desconectar
          </Button>
        )}
        {whatsApp.status === 'OPENING' && (
          <Button size='small' variant='outlined' disabled color='default'>
            Conectando
          </Button>
        )}
      </>
    )
  }

  const renderStatusToolTips = (whatsApp: Whatsapp) => {
    return (
      <div className={classes.customTableCell}>
        {whatsApp.status === 'DISCONNECTED' && (
          <CustomToolTip
            title={'Falha ao iniciar sessão do WhatsApp'}
            content={
              'Certifique-se de que seu celular esteja conectado à internet e tente novamente, ou solicite um novo QR Code'
            }
          >
            <Icon icon='ic:baseline-signal-cellular-connected-no-internet-0-bar'/>
            {/* <SignalCellularConnectedNoInternet0Bar color='secondary' /> */}
          </CustomToolTip>
        )}
        {whatsApp.status === 'OPENING' && <CircularProgress size={24} className={classes.buttonProgress} />}
        {whatsApp.status === 'qrcode' && (
          <CustomToolTip
            title={'Esperando leitura do QR Code'}
            content={"Clique no botão 'QR CODE' e leia o QR Code com o seu celular para iniciar a sessão"}
          >
            <Icon icon='material-symbols:crop-free'/>
            {/* <CropFree /> */}
          </CustomToolTip>
        )}
        {whatsApp.status === 'CONNECTED' && (
          <CustomToolTip title={'Conexão estabelecida!'}>
            <Icon icon='ph:cell-signal-full-fill' color={green[500]} />
            {/* <SignalCellular4Bar style={{ color: green[500] }} /> */}
          </CustomToolTip>
        )}
        {(whatsApp.status === 'TIMEOUT' || whatsApp.status === 'PAIRING') && (
          <CustomToolTip
            title={'A conexão com o celular foi perdida'}
            content={
              "Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto, ou clique no botão 'Desconectar' para obter um novo QR Code"
            }
          >
            <Icon icon='ic:baseline-signal-cellular-connected-no-internet-2-bar' />
            {/* <SignalCellularConnectedNoInternet2Bar color='secondary' /> */}
          </CustomToolTip>
        )}
      </div>
    )
  }

  return (
    <MainContainer>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      <QrcodeModal
        open={qrModalOpen}
        onClose={handleCloseQrModal}
        whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
      />
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
      />
      <MainHeader>
        <Title>Conexões</Title>
        <MainHeaderButtonsWrapper>
          <Can
            role={user.profile}
            perform='connections-page:addConnection'
            yes={() => (
              <>
                <Button variant='contained' color='primary' onClick={handleOpenWhatsAppModal}>
                  Adicionar WhatsApp
                </Button>
                <Button variant='contained' color='primary' onClick={restartWhatsapps}>
                  REINICIAR CONEXÕES
                </Button>
              </>
            )}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell align='center'>Nome</TableCell>
              <TableCell align='center'>Número</TableCell>
              <TableCell align='center'>Status</TableCell>
              <Can
                role={user.profile}
                perform='connections-page:actionButtons'
                yes={() => <TableCell align='center'>Sessão</TableCell>}
              />
              <TableCell align='center'>Última atualização</TableCell>
              <TableCell align='center'>Padrão</TableCell>
              <Can
                role={user.profile}
                perform='connections-page:editOrDeleteConnection'
                yes={() => <TableCell align='center'>Ações</TableCell>}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton />
            ) : (
              <>
                {whatsApps?.length > 0 &&
                  whatsApps.map((whatsApp: Whatsapp) => (
                    <TableRow key={whatsApp.id}>
                      <TableCell align='center'>{whatsApp.name}</TableCell>
                      <TableCell align='center'>
                        {whatsApp.number ? (
                          <>
                            {formatSerializedId(whatsApp.number)}
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align='center'>{renderStatusToolTips(whatsApp)}</TableCell>
                      <Can
                        role={user.profile}
                        perform='connections-page:actionButtons'
                        yes={() => <TableCell align='center'>{renderActionButtons(whatsApp)}</TableCell>}
                      />
                      <TableCell align='center'>{format(parseISO(whatsApp.updatedAt), 'dd/MM/yy HH:mm')}</TableCell>
                      <TableCell align='center'>
                        {whatsApp.isDefault && (
                          <div className={classes.customTableCell}>
                            {/* <CheckCircle style={{ color: green[500] }} /> */}
                            <Icon icon='material-symbols:check-circle' color={ green[500] } />
                          </div>
                        )}
                      </TableCell>
                      <Can
                        role={user.profile}
                        perform='connections-page:editOrDeleteConnection'
                        yes={() => (
                          <TableCell align='center'>
                            <IconButton size='small' onClick={() => handleEditWhatsApp(whatsApp)}>
                              {/* <Edit /> */}
                              <Icon icon='ic:baseline-edit'/>
                            </IconButton>

                            <IconButton
                              size='small'
                              onClick={e => {
                                handleOpenConfirmationModal('delete', whatsApp.id)
                              }}
                            >
                              <Icon icon='mdi:delete-outline'/>
                              {/* <DeleteOutline /> */}
                            </IconButton>
                          </TableCell>
                        )}
                      />
                    </TableRow>
                  ))}
              </>
            )}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  )
}

export default ProntChatConnection
