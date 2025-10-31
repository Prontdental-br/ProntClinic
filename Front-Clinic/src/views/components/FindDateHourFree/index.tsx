/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import { Modal, Box, Typography, Stack, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material'
import DatePicker from '@mui/lab/DatePicker'

interface FindDateHourFreeProps {
  open: boolean
  onClose: () => void
  data: string[]
}

const FindDateHourFree: React.FC<FindDateHourFreeProps> = ({ open, onClose, data }) => {
  const [selectedMorningOption, setSelectedMorningOption] = useState('')
  const [selectedAfternoonOption, setSelectedAfternoonOption] = useState('')

  const handleDateChange = (date: Date | null) => {
    // Lógica para tratar a data selecionada
  }

  const handleMorningOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMorningOption(event.target.value)
  }

  const handleAfternoonOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAfternoonOption(event.target.value)
  }

  const handleChooseOption = () => {
    // Lógica para tratar a opção escolhida
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4
        }}
      >
        <Typography variant='h6' component='div' sx={{ marginBottom: 2 }}>
          Sugestão de Horários
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
          <DatePicker label='Selecione uma data' onChange={handleDateChange} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Stack direction='row' spacing={2}>
            <RadioGroup row value={selectedMorningOption} onChange={handleMorningOptionChange}>
              <Typography variant='subtitle1' sx={{ marginRight: 2 }}>
                Manhã:
              </Typography>
              {data.map((option, index) => (
                <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
            <RadioGroup row value={selectedAfternoonOption} onChange={handleAfternoonOptionChange}>
              <Typography variant='subtitle1' sx={{ marginRight: 2 }}>
                Tarde:
              </Typography>
              {data.map((option, index) => (
                <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          </Stack>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <Button onClick={onClose} sx={{ marginRight: 2 }}>
            Fechar
          </Button>
          <Button onClick={handleChooseOption} variant='contained' color='primary'>
            Escolher
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default FindDateHourFree
