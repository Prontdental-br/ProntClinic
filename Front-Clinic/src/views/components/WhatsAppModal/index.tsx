import React, { useState, useEffect, useRef } from 'react'
import * as Yup from 'yup'
import { Formik, Form, Field } from 'formik'
import { toast } from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import { makeStyles } from '@material-ui/core/styles'
import { green } from '@material-ui/core/colors'
import { isNil, head } from 'lodash'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@material-ui/core'
import QueueSelect from '../QueueSelect'
import moment from 'moment'
import ConfirmationModal from '../ConfirmationModal'
import translateBackendError from 'src/common/translateBackendError'
import prontChatApi from 'src/views/pages/account-settings/tabConnectWhatsapp/ProntChatApi'

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required')
})

interface WhatsAppModalProps {
  open: boolean
  onClose: () => void
  whatsAppId: any
}

const WhatsAppModal = ({ open, onClose, whatsAppId }: WhatsAppModalProps) => {
  const classes = useStyles()
  const initialState = {
    name: '',
    greetingMessage: '',
    complationMessage: '',
    outOfHoursMessage: '',
    ratingMessage: '',
    isDefault: false,
    token: '',
    provider: 'beta',
    timeSendQueue: 0,
    sendIdQueue: 0,
    expiresInactiveMessage: '',
    expiresTicket: 0,
    timeUseBotQueues: 0,
    maxUseBotQueues: 3,
    attachment: null,
    mediaName: '',
    status: '',
    id: ''
  }
  const [whatsApp, setWhatsApp] = useState(initialState)
  const [selectedQueueIds, setSelectedQueueIds] = useState([])
  const [queues, setQueues] = useState([])
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [prompts, setPrompts] = useState([])
  const [enableImportMessage, setEnableImportMessage] = useState(false)
  const [importOldMessagesGroups, setImportOldMessagesGroups] = useState(false)
  const [closedTicketsPostImported, setClosedTicketsPostImported] = useState(false)
  const [importOldMessages, setImportOldMessages] = useState(moment().add(-1, 'days').format('YYYY-MM-DDTHH:mm'))
  const [importRecentMessages, setImportRecentMessages] = useState(
    moment().add(-1, 'minutes').format('YYYY-MM-DDTHH:mm')
  )
  const [confirmationOpen, setConfirmationOpen] = useState(false)

  const attachmentFile = useRef<any>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await prontChatApi.get('/prompt')
        setPrompts(data.prompts)
      } catch (err: any) {
        const errorMsg = err.response?.data?.error
        if (errorMsg) {
          toast.error(translateBackendError(errorMsg))
        }
      }
    })()
  }, [whatsAppId])

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return

      try {
        const { data } = await prontChatApi.get(`whatsapp/${whatsAppId}?session=0`)

        setWhatsApp(data)
        data.promptId ? setSelectedPrompt(data.promptId) : setSelectedPrompt(null)

        const whatsQueueIds = data.queues?.map((queue: any) => queue.id)
        setSelectedQueueIds(whatsQueueIds)
        if (!isNil(data?.importOldMessages)) {
          setEnableImportMessage(true)
          setImportOldMessages(data?.importOldMessages)
          setImportRecentMessages(data?.importRecentMessages)
          setClosedTicketsPostImported(data?.closedTicketsPostImported)
          setImportOldMessagesGroups(data?.importOldMessagesGroups)
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.error
        if (errorMsg) {
          // toast.error(translateBackendError(errorMsg))
        }
      }
    }
    fetchSession()
  }, [whatsAppId])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await prontChatApi.get('/queue')
        setQueues(data)
      } catch (err: any) {
        const errorMsg = err.response?.data?.error
        if (errorMsg) {
          toast.error(translateBackendError(errorMsg))
        }
      }
    })()
  }, [])

  const handleEnableImportMessage = async (e: any) => {
    setEnableImportMessage(e.target.checked)
  }

  const handleSaveWhatsApp = async (values: any) => {
    const whatsappData = {
      ...values,
      queueIds: selectedQueueIds,
      promptId: selectedPrompt ? selectedPrompt : null,
      importOldMessages: enableImportMessage ? importOldMessages : null,
      importRecentMessages: enableImportMessage ? importRecentMessages : null,
      importOldMessagesGroups: importOldMessagesGroups ? importOldMessagesGroups : null,
      closedTicketsPostImported: closedTicketsPostImported ? closedTicketsPostImported : null
    }
    delete whatsappData['queues']
    delete whatsappData['session']

    try {
      if (whatsAppId) {
        if (whatsAppId && enableImportMessage && whatsApp?.status === 'CONNECTED') {
          try {
            setWhatsApp({ ...whatsApp, status: 'qrcode' })
            await prontChatApi.delete(`/whatsappsession/${whatsApp.id}`)
          } catch (err: any) {
            const errorMsg = err.response?.data?.error
            if (errorMsg) {
              toast.error(translateBackendError(errorMsg))
            }
          }
        }

        await prontChatApi.put(`/whatsapp/${whatsAppId}`, whatsappData)

        if (values.attachment && values.attachment.size) {
          const formData = new FormData()
          formData.append('file', values.attachment)

          await prontChatApi.post(`/whatsapp/${whatsAppId}/media-upload`, formData)
        }
      } else {
        const { data } = await prontChatApi.post('/whatsapp', whatsappData)

        if (values.attachment) {
          const formData = new FormData()
          formData.append('file', values.attachment)

          await prontChatApi.post(`/whatsapp/${data.id}/media-upload`, formData)
        }
      }
      toast.success('WhatsApp salvo com sucesso.')
      handleClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error
      if (errorMsg) {
        toast.error(translateBackendError(errorMsg))
      }
    }
  }

  const handleChangeQueue = (e: any) => {
    setSelectedQueueIds(e)
    setSelectedPrompt(null)
  }

  const handleChangePrompt = (e :any) => {
    setSelectedPrompt(e.target.value)
    setSelectedQueueIds([])
  }

  const handleClose = () => {
    onClose()
    setEnableImportMessage(false)
    setWhatsApp(initialState)
  }

  const removeMedia = async () => {
    await prontChatApi.delete(`/whatsapp/${whatsAppId}/media-upload`)
    handleClose()
  }

  const handleAttach = (e: any, setFile: (field: string, value: any, shouldValidate?: boolean) => Promise<void>) => {
    const file = head(e.target.files)

    console.log(file)

    if (file) {
      setFile('attachment', file)
    }
  }

  return (
    <div className={classes.root}>
      <ConfirmationModal
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeMedia}
        title={'whatsappModal.confirmation.title'}
      >
        {'whatsappModal.confirmation.message'}
      </ConfirmationModal>

      <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth scroll='paper'>
        <DialogTitle>{whatsAppId ? 'Editar WhatsApp' : 'Adicionar WhatsApp'}</DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveWhatsApp(values)
              actions.setSubmitting(false)
            }, 400)
          }}
        >
          {({ values, touched, errors, isSubmitting, setFieldValue }: any) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Grid spacing={2} container>
                    <Grid item>
                      <Field
                        as={TextField}
                        label={'Nome'}
                        autoFocus
                        name='name'
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant='outlined'
                        margin='dense'
                      />
                    </Grid>
                    <Grid style={{ paddingTop: 15 }} item>
                      <FormControlLabel
                        control={<Field as={Switch} color='primary' name='isDefault' checked={values.isDefault} />}
                        label={'Padrão'}
                      />
                    </Grid>
                  </Grid>
                </div>
                <div>
                  <div className={classes.multFieldLine}>
                    <FormControlLabel
                      style={{ marginRight: 7, color: 'gray' }}
                      label={'whatsappModal.form.importOldMessagesEnable'}
                      labelPlacement='end'
                      control={
                        <Switch
                          size='medium'
                          checked={enableImportMessage}
                          onChange={handleEnableImportMessage}
                          name='importOldMessagesEnable'
                          color='primary'
                        />
                      }
                    />

                    {enableImportMessage ? (
                      <>
                        <FormControlLabel
                          style={{ marginRight: 7, color: 'gray' }}
                          label={'whatsappModal.form.importOldMessagesGroups'}
                          labelPlacement='end'
                          control={
                            <Switch
                              size='medium'
                              checked={importOldMessagesGroups}
                              onChange={e => setImportOldMessagesGroups(e.target.checked)}
                              name='importOldMessagesGroups'
                              color='primary'
                            />
                          }
                        />

                        <FormControlLabel
                          style={{ marginRight: 7, color: 'gray' }}
                          label={'whatsappModal.form.closedTicketsPostImported'}
                          labelPlacement='end'
                          control={
                            <Switch
                              size='medium'
                              checked={closedTicketsPostImported}
                              onChange={e => setClosedTicketsPostImported(e.target.checked)}
                              name='closedTicketsPostImported'
                              color='primary'
                            />
                          }
                        />
                      </>
                    ) : (
                      <></>
                    )}
                  </div>

                  {enableImportMessage ? (
                    <Grid style={{ marginTop: 18 }} container spacing={3}>
                      <Grid item xs={6}>
                        <Field
                          fullWidth
                          as={TextField}
                          label={'whatsappModal.form.importOldMessages'}
                          type='datetime-local'
                          name='importOldMessages'
                          inputProps={{
                            max: moment().add(0, 'minutes').format('YYYY-MM-DDTHH:mm'),
                            min: moment().add(-2, 'years').format('YYYY-MM-DDTHH:mm')
                          }}

                          //min="2022-11-06T22:22:55"
                          InputLabelProps={{
                            shrink: true
                          }}
                          error={touched.importOldMessages && Boolean(errors.importOldMessages)}
                          helperText={touched.importOldMessages && errors.importOldMessages}
                          variant='outlined'
                          value={moment(importOldMessages).format('YYYY-MM-DDTHH:mm')}
                          onChange={(e: any) => {
                            setImportOldMessages(e.target.value)
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Field
                          fullWidth
                          as={TextField}
                          label={'whatsappModal.form.importRecentMessages'}
                          type='datetime-local'
                          name='importRecentMessages'
                          inputProps={{
                            max: moment().add(0, 'minutes').format('YYYY-MM-DDTHH:mm'),
                            min: moment(importOldMessages).format('YYYY-MM-DDTHH:mm')
                          }}

                          //min="2022-11-06T22:22:55"
                          InputLabelProps={{
                            shrink: true
                          }}
                          error={touched.importRecentMessages && Boolean(errors.importRecentMessages)}
                          helperText={touched.importRecentMessages && errors.importRecentMessages}
                          variant='outlined'
                          value={moment(importRecentMessages).format('YYYY-MM-DDTHH:mm')}
                          onChange={(e: any) => {
                            setImportRecentMessages(e.target.value)
                          }}
                        />
                      </Grid>
                    </Grid>
                  ) : null}
                </div>
                {enableImportMessage && <span style={{ color: 'red' }}>{'whatsappModal.form.importAlert'}</span>}
                <div>
                  <Field
                    as={TextField}
                    label={'Mensagem de saudação'}
                    type='greetingMessage'
                    multiline
                    rows={4}
                    fullWidth
                    name='greetingMessage'
                    error={touched.greetingMessage && Boolean(errors.greetingMessage)}
                    helperText={touched.greetingMessage && errors.greetingMessage}
                    variant='outlined'
                    margin='dense'
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={'Mensagem de conclusão'}
                    type='complationMessage'
                    multiline
                    rows={4}
                    fullWidth
                    name='complationMessage'
                    error={touched.complationMessage && Boolean(errors.complationMessage)}
                    helperText={touched.complationMessage && errors.complationMessage}
                    variant='outlined'
                    margin='dense'
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={'Mensagem de fora de expediente'}
                    type='outOfHoursMessage'
                    multiline
                    rows={4}
                    fullWidth
                    name='outOfHoursMessage'
                    error={touched.outOfHoursMessage && Boolean(errors.outOfHoursMessage)}
                    helperText={touched.outOfHoursMessage && errors.outOfHoursMessage}
                    variant='outlined'
                    margin='dense'
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={'Mensagem de avaliação'}
                    type='ratingMessage'
                    multiline
                    rows={4}
                    fullWidth
                    name='ratingMessage'
                    error={touched.ratingMessage && Boolean(errors.ratingMessage)}
                    helperText={touched.ratingMessage && errors.ratingMessage}
                    variant='outlined'
                    margin='dense'
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={'Token'}
                    type='token'
                    fullWidth
                    name='token'
                    variant='outlined'
                    margin='dense'
                  />
                </div>
                <QueueSelect
                  selectedQueueIds={selectedQueueIds}
                  onChange={selectedIds => handleChangeQueue(selectedIds)}
                />
                <FormControl margin='dense' variant='outlined' fullWidth>
                  <InputLabel>Prompt</InputLabel>
                  <Select
                    labelId='dialog-select-prompt-label'
                    id='dialog-select-prompt'
                    name='promptId'
                    value={selectedPrompt || ''}
                    onChange={handleChangePrompt}
                    label={'Prompt'}
                    fullWidth
                    MenuProps={{
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left'
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left'
                      },
                      getContentAnchorEl: null
                    }}
                  >
                    {prompts.map((prompt: { id: string, name: string }) => (
                      <MenuItem key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <div>
                  <h3>Redirecionamento de Fila</h3>
                  <p>Selecione uma fila para os contatos que não possuem fila serem redirecionados</p>
                  <Grid spacing={2} container>
                    <Grid xs={6} md={6} item>
                      <FormControl variant='outlined' margin='dense' fullWidth>
                        <InputLabel id='sendIdQueue-selection-label'>Fila</InputLabel>
                        <Field
                          as={Select}
                          name='sendIdQueue'
                          id='sendIdQueue'
                          label={'Fila'}
                          placeholder={'Fila'}
                          labelId='sendIdQueue-selection-label'
                        >
                          <MenuItem value={0}>&nbsp;</MenuItem>
                          {queues.map((queue: { id: string, name: string }) => (
                            <MenuItem key={queue.id} value={queue.id}>
                              {queue.name}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    </Grid>

                    <Grid xs={6} md={6} item>
                      <Field
                        as={TextField}
                        label={'Redirecionar para fila em X minutos'}
                        fullWidth
                        name='timeSendQueue'
                        variant='outlined'
                        margin='dense'
                        error={touched.timeSendQueue && Boolean(errors.timeSendQueue)}
                        helperText={touched.timeSendQueue && errors.timeSendQueue}
                      />
                    </Grid>
                  </Grid>
                  <Grid spacing={2} container>
                    {/* QUANTIDADE MÁXIMA DE VEZES QUE O CHATBOT VAI SER ENVIADO */}
                    <Grid xs={12} md={6} item>
                      <Field
                        as={TextField}
                        label={'Enviar bot x vezes'}
                        fullWidth
                        name='maxUseBotQueues'
                        variant='outlined'
                        margin='dense'
                        error={touched.maxUseBotQueues && Boolean(errors.maxUseBotQueues)}
                        helperText={touched.maxUseBotQueues && errors.maxUseBotQueues}
                      />
                    </Grid>
                    {/* TEMPO PARA ENVIO DO CHATBOT */}
                    <Grid xs={12} md={6} item>
                      <Field
                        as={TextField}
                        label={'Intervalo em minutos entre envio de bot'}
                        fullWidth
                        name='timeUseBotQueues'
                        variant='outlined'
                        margin='dense'
                        error={touched.timeUseBotQueues && Boolean(errors.timeUseBotQueues)}
                        helperText={touched.timeUseBotQueues && errors.timeUseBotQueues}
                      />
                    </Grid>
                  </Grid>
                  <Grid spacing={2} container>
                    {/* ENCERRAR CHATS ABERTOS APÓS X HORAS */}
                    <Grid xs={12} md={12} item>
                      <Field
                        as={TextField}
                        label={'Encerrar chats abertos após x minutos'}
                        fullWidth
                        name='expiresTicket'
                        variant='outlined'
                        margin='dense'
                        error={touched.expiresTicket && Boolean(errors.expiresTicket)}
                        helperText={touched.expiresTicket && errors.expiresTicket}
                      />
                    </Grid>
                  </Grid>
                  {/* MENSAGEM POR INATIVIDADE*/}
                  <div>
                    <Field
                      as={TextField}
                      label={'Mensagem de encerramento por inatividade'}
                      multiline
                      rows={4}
                      fullWidth
                      name='expiresInactiveMessage'
                      error={touched.expiresInactiveMessage && Boolean(errors.expiresInactiveMessage)}
                      helperText={touched.expiresInactiveMessage && errors.expiresInactiveMessage}
                      variant='outlined'
                      margin='dense'
                    />
                  </div>
                </div>

                {/* {values?.attachment || values?.mediaName && ( */}
                <Grid xs={12} item>
                  <Button startIcon={<Icon icon="material-symbols:attach-file" />}>
                    {values?.attachment ? values?.attachment?.name : whatsApp?.mediaName}
                  </Button>
                  <IconButton
                    onClick={() =>
                      values.attachment?.size ? setFieldValue('attachment', null) : setConfirmationOpen(true)
                    }
                    color='secondary'
                  >
                    <Icon icon="ic:outline-delete" />
                  </IconButton>
                </Grid>

                {/* )} */}

                <div style={{ display: 'none' }}>
                  <input type='file' ref={attachmentFile} onChange={e => handleAttach(e, setFieldValue)} />
                </div>
              </DialogContent>
              <DialogActions>
                {!values.attachment && !values.mediaName && (
                  <Button
                    color='primary'
                    onClick={() => {
                      if (attachmentFile.current) {
                        attachmentFile.current.click()
                      }
                    }}
                    disabled={isSubmitting}
                    variant='outlined'
                  >
                    Anexar Arquivo
                  </Button>
                )}

                <Button onClick={handleClose} color='secondary' disabled={isSubmitting} variant='outlined'>
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  color='primary'
                  disabled={isSubmitting}
                  variant='contained'
                  className={classes.btnWrapper}
                >
                  {whatsAppId ? 'Salvar' : 'Adicionar'}
                  {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  )
}

export default React.memo(WhatsAppModal)
