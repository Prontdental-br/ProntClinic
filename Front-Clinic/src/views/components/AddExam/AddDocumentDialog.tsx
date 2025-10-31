// ** React Imports
import { Ref, useState, forwardRef, ReactElement, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Switch from '@mui/material/Switch'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import Fade, { FadeProps } from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import useBgColor from 'src/@core/hooks/useBgColor'

import initialDocuments from './mocks/models.json'
import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'
import { EditorState, ContentState, convertToRaw } from 'draft-js'
import api from 'src/@core/components/api-client'
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import toast from 'react-hot-toast';
import { CircularProgress } from '@mui/material'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

interface AddDocumentDialogProps {
  open: boolean
  onClose: () => void
  fetchData?:  () => void
  patientId?: string
}

type DocumentsModelTypes = {
  id: string
  titulo: string
  texto: string
}

const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({ open, onClose, fetchData, patientId }) => {
  // ** States

  const [addressType, setAddressType] = useState<'newModel' | 'existModel'>('newModel')
  const [id, setId] = useState(1)
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [models, setModels] = useState<DocumentsModelTypes[]>(initialDocuments)
  const [newContract, setNewContract] = useState<any>({});
  const [messageValue, setMessageValue] = useState(EditorState.createEmpty(undefined))
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewContract({ ...newContract, [name]: value })
  }

  useEffect(() => {
    if (selectedModel) {
      const selected = models.find(model => model.titulo === selectedModel)
      if (selected) {
        setTitulo(selected.titulo)
        setTexto(selected.texto)
        setMessageValue(EditorState.createWithContent(ContentState.createFromText(selected.texto)))
      }
    }
  }, [selectedModel, models])

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    const modelTitle = event.target.value
    setSelectedModel(modelTitle)
    const selected = models.find(model => model.titulo === modelTitle)
    if (selected) {
      setTitulo(selected.titulo)
      setTexto(selected.texto)
      setMessageValue(EditorState.createWithContent(ContentState.createFromText(selected.texto)))
    }
  }

  // ** Hooks
  const bgColors = useBgColor()

  const clearForm = () => {
    setNewContract({});
    setMessageValue(EditorState.createEmpty(undefined));
  }

  const onSubmit = (event: any) => {
    event.preventDefault(); // Evita que a página seja recarregada

    setLoading(true);

    const formData = new FormData(event.target); // Obtém os dados do formulário
    const data: any = {};

    for (const [name, value] of formData.entries()) {
      console.log(name,value)
      data[name] = value;
    }

    data['text'] = draftToHtml(convertToRaw(messageValue.getCurrentContent()))

    api.post('/labs', { ...data })
      .then(resp=>{
        if(fetchData)
          fetchData();
        onClose();
        setLoading(false);
        toast.success('Exame adicionada com sucesso!')
        clearForm();
      })

  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md' scroll='body' TransitionComponent={Transition}>
      <form onSubmit={onSubmit}>
      <DialogContent
        sx={{
          position: 'relative',
          pb: theme => `${theme.spacing(8)} !important`,
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <IconButton size='small' onClick={onClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
          <Icon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 9, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
            Adicionar Laboratório RX
          </Typography>
         
        </Box>
        <Grid container spacing={6}>
          
          <Grid item xs={12}>
            <TextField fullWidth label='Nome do laboratório' placeholder='Nome do laboratório' contentEditable={false} name='name' value={newContract?.name} onChange={handleInputChange} />
          </Grid>


          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Número do whatsapp'
              placeholder='Número do whatsapp'
              name='phone' value={newContract?.phone} onChange={handleInputChange}
            />
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
        <Button variant='contained' sx={{ mr: 2 }} type="submit" disabled={loading}>
          {loading ? <CircularProgress size ={24} /> : 'Adicionar'}
        </Button>
        <Button variant='outlined' color='secondary' onClick={onClose}>
          Cancelar
        </Button>
      </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddDocumentDialog
