import { useContext, useState } from 'react'
import {
  DialogActions,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  Tooltip,
  IconButton
} from '@mui/material'
import foulsContext from '../deselectionsContext'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import { Stack, Box } from '@mui/system'
import { Timeline, TimelineSeparator, TimelineConnector, TimelineItem, TimelineContent } from '@mui/lab'
import styles from '../style/deselections.module.css'
import { timelineItemClasses } from '@mui/lab/TimelineItem'
import { Chance, Status, historyLog, Comment } from 'src/context/types'
import Image from 'next/image'
import PersonIcon from '@mui/icons-material/Person'
import NotesIcon from '@mui/icons-material/Notes'
import api from 'src/@core/components/api-client'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { clearNumber } from 'src/@core/utils/format'
import { CalendarMonthOutlined, WhatsApp } from '@mui/icons-material'
import toast from 'react-hot-toast'

export default function EditChanceModalSchedule(props: any) {
  const context = useContext(foulsContext)

  function handleStatus(e: any) {
    context.chanceToEdit.status = e.target.value
    context.chanceToEdit?.history.push({
      text: 'Mudou o status para ' + context.getStatusLabel(context.chanceToEdit?.status),
      date: new Date(),
      author: 'Nome do usuário'
    })
    context.forceUpdate()
  }

  async function handleDelete() {
    if (!window.confirm('Deseja realmente excluir a oportunidade?')) {
      return
    }
    context.chances.splice(
      context.chances.findIndex((item: Chance) => item.id == context.chanceToEdit?.id),
      1
    )
    console.log(context.chanceToEdit)

    if(context.chanceToEdit?.type === 'opportunity'){
      await api.delete(`sales/${context.chanceToEdit?.id}`)
    }else if(context.chanceToEdit?.type === 'sale'){
      await api.delete(`budgets/${context.chanceToEdit?.id}`)
    }
    if (props.fetchData)
      props.fetchData();
    context.setShowEditChanceModal(false)
  }

  return (
    <Dialog {...props}>
      <Grid container>
        <Grid item xs={8}>
          <ModalBody />
        </Grid>
        <Grid item xs={4}>
          <ModalSidebar />
        </Grid>
      </Grid>
      <DialogActions>
        <Button style={{ marginRight: '2px' }} variant='outlined' color='error' onClick={props.closeDialog}>
          Fechar
        </Button>
        {/* <Button style={{ marginRight: '8px' }} onClick={handleDelete} color='error'>
          Excluir
        </Button> */}
      </DialogActions>
    </Dialog>
  )
}

function ModalBody() {
  const context = useContext(foulsContext)

  const [note, setNote] = useState(context.chanceToEdit?.observationCRC || `Olá, ${context.chanceToEdit?.title}! Tudo bem?
Notamos que sua consulta foi desmarcada recentemente.
Se foi por algum imprevisto, estamos à disposição para remarcar em um momento mais conveniente pra você.
Conte com a gente!`)
  const [loading, setLoading] = useState(false)

  const handleSaveNote = async () => {
    try {
      setLoading(true)
      await api.patch(`/schedules/${context.chanceToEdit?.id}`, {
        observationCRC: note,
      })
      setLoading(false)

      context.fetchData();
      toast.success('Observação salva com sucesso!')
    } catch (err) {
      console.error(err)
      setLoading(false)

      toast.error('Erro ao salvar observação')

    }
  }

  const handleSendWhatsApp = async () => {
    try {
      setLoading(true);
  
      const message = note;
      const phone = context.chanceToEdit?.phone;
   
      if (!message || !phone) {
        toast.error('Mensagem ou telefone não encontrados');
        setLoading(false);
        
      return;
      }
  
      await api.post('/whatsapp/send-message', {
        message,
        phone,
        delay: 0
      });
  
      setLoading(false);
      toast.success('Mensagem enviada com sucesso!');
      context.fetchData();
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error('Erro ao enviar mensagem via WhatsApp');
    }
  };

  return (
    <>
      <DialogTitle>
        <Stack direction='row' style={{ alignItems: 'center' }}>
          <Box
            component='div'
            className={styles.modal_chance_icon}
            style={{ backgroundColor: context.getChanceStatusColor(context.chanceToEdit), color: '#fff' }}
            mr={3}
          >
            {context.chanceToEdit?.type == 'opportunity' ? <RocketLaunchIcon /> : <CalendarMonthOutlined />}
          </Box>
          <Stack>
            <Typography variant='h6'>{context.chanceToEdit?.title}</Typography>
            <Typography component='p'>
              Data de criação: {context.chanceToEdit?.createdAt.toLocaleDateString()} -
               Observação: {context.chanceToEdit?.description}
            </Typography>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box mt={4}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          label='Observações internas'
          variant='outlined'
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <Button
          onClick={handleSaveNote}
          variant='contained'
          sx={{ mt: 2 }}
          disabled={loading || !note.trim()}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
          <Button
            onClick={handleSendWhatsApp}
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            disabled={loading || !note.trim()}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {loading ? 'Enviando...' : 'Enviar'}
              <WhatsApp />
            </Box>
          </Button>
      </Box>
      </DialogContent>
    </>
  )
}

function ModalSidebar() {
  const context = useContext(foulsContext)

  return (
    <Box sx={{ width: "100%", height: "100%", padding: "20px" }}>
      {context.chanceToEdit.patient != null && (
        <>
          <Stack direction='row' mb={4}>
            <Box component='div' style={{ display: 'block' }} pr={3} className={styles.profile_pic}>
              <Image src='/images/avatars/user_profile.webp' alt='user picture' width={50} height={50} />
            </Box>
            <Stack>
              <Typography component='p' style={{ lineHeight: '19px', fontSize: '16px', fontWeight: 'bold' }}>
                {context.chanceToEdit.patient}
              </Typography>
              <a href='#teste'>whatsapp do cliente</a>
            </Stack>
          </Stack>
        </>
      )}
      <Stack>
        <Stack direction='row' alignItems='start' mb={2}>
          <PersonIcon />
          <p style={{ marginTop: 0, marginBottom: 0, paddingLeft: '8px' }}>{context.chanceToEdit?.author}</p>
        </Stack>
        <Stack direction='row' alignItems='start' mb={2}>
          <NotesIcon />
          <p style={{ marginTop: 0, marginBottom: 0, paddingLeft: '8px' }}>{context.chanceToEdit?.tag}</p>
        </Stack>
      </Stack>
     {<Box sx={{ display: 'flex', marginRight: 1 }}>
            <Tooltip title='Ficha paciente'>
              <IconButton size='small'
              href={`/patient/view/about/${context.chanceToEdit?.id}`}
              target="_blank"
              >
                <Icon icon='mdi:eye-outline' fontSize={20} />
              </IconButton>
            </Tooltip>

            <Tooltip title='Conversar no WhatsApp'>
              <IconButton
                size='small'
                href={`https://wa.me/55${clearNumber(context.chanceToEdit?.phone ? context.chanceToEdit?.phone : '')}`}
                component={Link}
                target="_blank"
              >
                <Icon icon='mdi:whatsapp' fontSize={20} />
              </IconButton>
            </Tooltip>
        </Box>}
    </Box>
  )
}

function CommentsModule() {
  const context = useContext(foulsContext)

  const [textComment, setTextComment] = useState('')

  async function addComment() {
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    console.log(userData);

    const comment: Comment = {
      text: textComment,
      author: context.chanceToEdit?.author,
      date: new Date()
    }

    context.chanceToEdit?.comments.push(comment)

    context.chanceToEdit?.history.push({
      text: 'Comentou: ' + textComment,
      author: userData.fullName,
      date: comment.date
    })

    console.log(context.chanceToEdit?.history)

    await api.patch(`sales/${context.chanceToEdit?.id}`, { history: context.chanceToEdit?.history });

    setTextComment('')
  }

  function sortComments(c1: Comment, c2: Comment) {
    if (c1.date > c2.date) return -1
    if (c1.date < c2.date) return 1

    return 0
  }

  return (
    <>
      {context.chanceToEdit?.type === 'opportunity' && <Stack direction='row' mt={3}>
        <Box component='div' style={{ display: 'block' }} pr={3} className={styles.profile_pic}>
          <Image src='/images/avatars/user_profile.webp' alt='user picture' width={50} height={50} />
        </Box>
        <div style={{ width: '100%' }}>
          <TextField
            multiline
            minRows={2}
            maxRows={4}
            fullWidth
            variant='outlined'
            label='Escreva um comentário aqui...'
            value={textComment}
            onChange={e => setTextComment(e.currentTarget.value)}
          />
          {textComment != '' && (
            <Stack direction='row-reverse' mt={2}>
              <Button onClick={addComment}>Enviar</Button>
            </Stack>
          )}
        </div>

      </Stack>}
      
      <Timeline
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0
          },
          paddingLeft: 0
        }}
        style={{
          maxHeight: '280px',
          overflowY: 'auto'
        }}
      >
        {context.chanceToEdit.history?.sort(sortComments).map((history: historyLog, index: number) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <Box component='div' style={{ display: 'block' }} className={styles.profile_pic}>
                <Image src='/images/avatars/user_profile.webp' alt='user picture' width={50} height={50} />
              </Box>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Stack>
                <Typography component='p' style={{ lineHeight: '19px', fontSize: '16px', fontWeight: 'bold' }}>
                  {history.author}
                </Typography>
                <Typography component='p' style={{ fontSize: '14px' }}>
                  {history.text} ({typeof history.date === 'string' ? new Date(history.date).toLocaleDateString() : history.date?.toLocaleDateString()})
                </Typography>
                
              </Stack>
            </TimelineContent>
            
          </TimelineItem>
        ))}
      </Timeline>
    </>
  )
}
