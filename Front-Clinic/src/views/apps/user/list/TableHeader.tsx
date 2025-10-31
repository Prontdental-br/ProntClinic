// ** MUI Imports
import { YoutubeSearchedForRounded } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import YouTube from 'react-youtube'
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

interface TableHeaderProps {
  value: string
  toggle: (id: string | number | null) => void
  handleFilter: (val: string) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { handleFilter, toggle, value } = props

  const [openModal, setOpenModal] = useState(false);

   const toggleVideo = () => {
    setOpenModal(true); 
  };

  const handleClose = () => {
    setOpenModal(false); 
  };

   const opts = {
    height: '390',
    width: '100%', // Faz o vídeo ocupar 100% da largura do modal
    playerVars: {
      autoplay: 1,
    },
  };


  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
       <Button sx={{ mb: 2, display: 'flex', alignItems: 'center' }} onClick={() => toggleVideo()}>
          <YouTubeIcon color='error' />
          VÍDEOS
        </Button>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size='small'
          value={value}
          sx={{ mr: 6, mb: 2 }}
          placeholder='Filtrar paciente'
          onChange={e => handleFilter(e.target.value)}
        />

        <Button sx={{ mb: 2 }} onClick={() => toggle(null)} variant='contained'>
          + Adicionar Paciente
        </Button>
      </Box>

      <Dialog open={openModal} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Assistir Vídeo</DialogTitle>
        <DialogContent>
          <YouTube opts={opts} videoId={'z4BqbKtH4oM'} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TableHeader
