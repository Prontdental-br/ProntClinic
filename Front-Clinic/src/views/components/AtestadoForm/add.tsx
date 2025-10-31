import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Grid
} from '@mui/material'

import { GridColDef } from '@mui/x-data-grid'
import PrintIcon from '@mui/icons-material/Print'
import DeleteIcon from '@mui/icons-material/Delete'

interface AtestadoFormProps {
  onBack: () => void
}

interface Atestado {
  id: number
  profissional: string
  data: string
}

const AtestadoFormAdd: React.FC<AtestadoFormProps> = ({ onBack }) => {
  const [profissional, setProfissional] = useState('')
  const [tipoAtestado, setTipoAtestado] = useState('')
  const [data, setData] = useState('')
  const [quantidadeDias, setQuantidadeDias] = useState('')
  const [CID, setCID] = useState('')

  const initialAtestados: Atestado[] = [
    {
      id: 1,
      profissional: 'Dr. João',
      data: '2023-08-25'
    },
    {
      id: 2,
      profissional: 'Dra. Maria',
      data: '2023-08-22'
    },
    {
      id: 3,
      profissional: 'Dr. Carlos',
      data: '2023-08-20'
    },
    {
      id: 4,
      profissional: 'Dra. Ana',
      data: '2023-08-18'
    },
    {
      id: 5,
      profissional: 'Dr. Roberto',
      data: '2023-08-15'
    }
  ]

  const [atestados, setAtestados] = useState<Atestado[]>(initialAtestados)

  const medicos = ['Dr. João', 'Dra. Maria', 'Dr. Carlos'] // Exemplo de dados, pode ser substituído por um fetch a uma API ou outro método.

  const handleGenerate = () => {
    // Lógica para gerar o atestado com os dados do formulário
  }

  const handlePrint = (id: number) => {
    // Lógica de impressão do atestado
    console.log(`Imprimindo atestado com ID: ${id}`)
  }

  const handleDelete = (id: number) => {
    // Lógica para deletar um atestado
    setAtestados(prev => prev.filter(a => a.id !== id))
  }

  const columns: GridColDef[] = [
    { field: 'profissional', headerName: 'Profissional', width: 300 },
    { field: 'data', headerName: 'Data', width: 300 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      renderCell: params => (
        <>
          <IconButton onClick={() => handlePrint(params.row.id)} aria-label='imprimir'>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} aria-label='deletar' color='error'>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ]

  return (
    <Grid container spacing={4} sx={{ mt: 4 }}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Profissional</InputLabel>
          <Select value={profissional} onChange={e => setProfissional(e.target.value as string)}>
            {medicos.map(medico => (
              <MenuItem key={medico} value={medico}>
                {medico}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl component='fieldset'>
          <RadioGroup row value={tipoAtestado} onChange={e => setTipoAtestado(e.target.value)}>
            <FormControlLabel value='dias' control={<Radio />} label='Atestado para dias' />
            <FormControlLabel value='horas' control={<Radio />} label='Atestado para horas' />
          </RadioGroup>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label='Data'
          type='date'
          fullWidth
          value={data}
          onChange={e => setData(e.target.value)}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>

      {tipoAtestado === 'dias' && (
        <Grid item xs={12} md={6}>
          <TextField
            label='Quantidade de dias'
            type='number'
            fullWidth
            value={quantidadeDias}
            onChange={e => setQuantidadeDias(e.target.value)}
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <TextField label='CID' fullWidth value={CID} onChange={e => setCID(e.target.value)} />
      </Grid>

      <Grid item xs={12}>
        <Box display='flex' justifyContent='flex-end'>
          <Button variant='outlined' onClick={onBack} style={{ marginRight: '10px' }}>
            Voltar
          </Button>
          <Button variant='contained' color='primary' onClick={handleGenerate}>
            Gerar Atestado
          </Button>
        </Box>
      </Grid>
    </Grid>
  )
}

export default AtestadoFormAdd
