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
import toast from 'react-hot-toast'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

interface AddFinancialDialogProps {
  open: boolean
  onClose: () => void
}

interface Tax {
  id: string
  installment: number
  percentValue: number
}

const randomStr = () => {
  const characters = 'ABCFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters[randomIndex]
  }

  return result
}

const defaultValue = [{ id: randomStr(), installment: 1, percentValue: 1 }];

const AddTaxesDialog: React.FC<AddFinancialDialogProps> = ({ open, onClose }) => {
  const [taxData, setTaxData] = useState<Tax[]>(defaultValue)
  const [messageValue, setMessageValue] = useState(EditorState.createEmpty(undefined))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
    const { name, value } = e.target
    setTaxData(prevState => {
      const map = prevState.map(element => {
        if (element.id === id) {
          return { ...element, [name]: value }
        }

        return { ...element }
      })

      return map
    })
  }

  const clearForm = () => {
    // setNewContract({})
    setMessageValue(EditorState.createEmpty(undefined))
  }

  const fetchData = async () => {
    const { data } = await api.get('taxes')
    if (data.length > 0) {
      setTaxData(data)
    }
  }

  const addNewTax = async () => {
    setTaxData(prevState => [...prevState, { id: randomStr(), installment: 1, percentValue: 1 }])
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (open === true) {
      fetchData();
    }
  }, [open])

  const onSubmit = (event: any) => {
    event.preventDefault()
    if (taxData.length === 0) {
      toast.error('Nenhuma taxa encontrada');
      
      return;
    }
   const data = taxData.map(({ id, installment, percentValue }) => {
    if (id.length === 10) {
      return { installment: Number(installment), percentValue: Number(percentValue) };
    }

    return { id, installment: Number(installment), percentValue: Number(percentValue) };
  });

    api.post('/taxes/bulk', { data }).then(resp => {
      toast.success('Taxas adicionadas com sucesso');
      onClose();
    }).catch((err) => {
      toast.error("Ocorreu um erro, tente novamente")
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
              Adicionar taxas
            </Typography>
          </Box>
          <Grid display={'flex'} gap={'16px'} container spacing={6}>
            {taxData.length > 0 &&
              taxData.map(element => (
                <Grid
                  display={'flex'}
                  key={element.id}
                  gap={'12px'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  flexDirection={'row'}
                  xs={12}
                >
                  <TextField
                    label='Parcela'
                    placeholder='Parcela'
                    contentEditable={false}
                    name='installment'
                    type='number'
                    value={element.installment}
                    onChange={(e) => handleInputChange(e, element.id)}
                  />
                  <TextField
                    label='% Desconto'
                    placeholder='% Desconto'
                    type='number'
                    name='percentValue'
                    value={element.percentValue}
                    onChange={(e) => handleInputChange(e, element.id)}
                  />
                </Grid>
              ))}
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '12px',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button variant='contained' sx={{ mr: 2 }} onClick={addNewTax} type='button'>
            Adicionar
          </Button>
          <Grid>
            <Button variant='contained' sx={{ mr: 2 }} type='submit'>
              Salvar
            </Button>
            <Button variant='outlined' color='secondary' onClick={onClose}>
              Cancelar
            </Button>
          </Grid>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddTaxesDialog
