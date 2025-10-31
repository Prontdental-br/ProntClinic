// ** React Imports
import { Ref, useState, forwardRef, ReactElement, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Fade, { FadeProps } from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import { EditorState, ContentState, convertToRaw } from 'draft-js'
import api from 'src/@core/components/api-client'
import draftToHtml from 'draftjs-to-html'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

interface AddFinancialDialogProps {
  open: boolean
  onClose: () => void
  fetchData?: () => void
}

const AddFinancialDialog: React.FC<AddFinancialDialogProps> = ({ open, onClose, fetchData }) => {
  const [newContract, setNewContract] = useState<any>({})
  const [messageValue, setMessageValue] = useState(EditorState.createEmpty(undefined))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewContract({ ...newContract, [name]: value })
  }

  const clearForm = () => {
    setNewContract({})
    setMessageValue(EditorState.createEmpty(undefined))
  }

  const onSubmit = (event: any) => {
    event.preventDefault() // Evita que a página seja recarregada

    const formData = new FormData(event.target) // Obtém os dados do formulário
    const data: any = {}

    for (const [name, value] of formData.entries()) {
      console.log(name, value)
      data[name] = value
    }

    console.log(data)

    data['text'] = draftToHtml(convertToRaw(messageValue.getCurrentContent()))

    api.post('/financial', { ...data }).then(resp => {
      if (fetchData) fetchData()
      onClose()
      clearForm()
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
              Adicionar Financeiro
            </Typography>
          </Box>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Nome do financeiro'
                placeholder='Nome do financeiro'
                contentEditable={false}
                name='name'
                value={newContract?.name}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Número do whatsapp'
                placeholder='Número do whatsapp'
                name='phone'
                value={newContract?.phone}
                onChange={handleInputChange}
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
          <Button variant='contained' sx={{ mr: 2 }} type='submit'>
            Adicionar
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose}>
            Cancelar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddFinancialDialog
