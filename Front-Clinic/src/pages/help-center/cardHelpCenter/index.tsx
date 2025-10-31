// ** React Imports
import { Ref, useState, forwardRef, ReactElement } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Switch from '@mui/material/Switch'
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
import Select, { SelectChangeEvent } from '@mui/material/Select'

import YouTube from 'react-youtube'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import CardSnippet from 'src/@core/components/card-snippet'

import RatingsHoverFeedback from 'src/views/components/ratings/RatingsHoverFeedback'

// ** Source code imports
import * as source from 'src/views/components/ratings/RatingsSourceCode'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

interface CardHelpCenterProps {
  data: CardVideoProps
}

type CardVideoProps = {
  id: number
  title: string
  subtitle: string
  idVideo: string
  titleModalVideo: string
  subTitleModalVideo: string
}

const CardHelpCenter: React.FC<CardHelpCenterProps> = ({ data }) => {
  // ** States
  const [show, setShow] = useState<boolean>(false)
  const [languages, setLanguages] = useState<string[]>([])

  const handleChange = (event: SelectChangeEvent<typeof languages>) => {
    const {
      target: { value }
    } = event
    setLanguages(typeof value === 'string' ? value.split(',') : value)
  }

  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', '& svg': { mb: 2 } }}>
        <Icon icon='mdi:youtube' fontSize='2rem' />
        <Typography variant='h6' sx={{ mb: 4 }}>
          {data.title}
        </Typography>
        <Typography sx={{ mb: 3 }}>{data.subtitle}</Typography>
        <Button variant='contained' onClick={() => setShow(true)}>
          Ir Para o Vídeo
        </Button>
      </CardContent>
      <Dialog
        fullWidth
        open={show}
        maxWidth='md'
        scroll='body'
        onClose={() => setShow(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow(false)}
      >
        <DialogContent
          sx={{
            position: 'relative',
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <IconButton
            size='small'
            onClick={() => setShow(false)}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
              {data.titleModalVideo}
            </Typography>
            <Typography variant='body2'>{data.subTitleModalVideo}</Typography>
          </Box>
          <Grid container spacing={6}>
            {/* <Grid item sm={6} xs={12}>
              <TextField fullWidth defaultValue='Oliver' label='First Name' placeholder='John' />
            </Grid> */}

            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <YouTube videoId={data.idVideo} />
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
          <Grid item xs={12}>
            <CardSnippet
              title='Este vídeo te ajudou?'
              code={{
                tsx: source.RatingsHoverFeedbackTSXCode,
                jsx: source.RatingsHoverFeedbackJSXCode
              }}
            >
              <RatingsHoverFeedback />
            </CardSnippet>
          </Grid>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default CardHelpCenter
