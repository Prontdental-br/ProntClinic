/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { Select, MenuItem, Button, Modal, SelectChangeEvent, Box, Typography, TextField, IconButton } from '@mui/material'
import Chip from '@mui/material/Chip'
import { ThemeColor } from 'src/@core/layouts/types'
import FormControl from '@mui/material/FormControl'
import { Controller } from 'react-hook-form'

import { AppDispatch } from 'src/store'
import { useDispatch } from 'react-redux'
import { addTag } from 'src/store/apps/tag'
import api from 'src/@core/components/api-client'
import { Icon } from '@iconify/react'

interface Option {
  id: any
  name: string
  color: string
}

interface SelectNewLabelProps {
  data: Option[]
  name: string
  control: any
  selectedTag: any
  reset: (field: any) => void
  fetch: () => void
}

export const SelectNewLabel = React.forwardRef((props: SelectNewLabelProps, ref: any) => {
  const { data, name, control, selectedTag, reset, fetch } = props

  const [formValues, setFormValues] = useState({
    nome: '',
    color: ''
  })

  const [selTag, setSelTag] = useState('')
  const [modalEditTagOpen, setModalEditTagOpen] = useState(false)
  const [modalTagOpen, setModalTagOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')
  const dispatch = useDispatch<AppDispatch>()

 const colorsRotulo = [
  { id: 'error', name: 'Falha', color: '#DC3545' },
  { id: 'primary', name: 'Primário', color: '#007BFF' },
  { id: 'secondary', name: 'Secundário', color: '#6C757D' },
  { id: 'warning', name: 'Alerta', color: '#FFC107' },
  { id: 'success', name: 'Sucesso', color: '#198754' },
  { id: 'info', name: 'Informação', color: '#17A2B8' },

  { id: 'turquoise', name: 'Turquesa Claro', color: '#B2DFDB' },
  { id: 'lightYellow', name: 'Amarelo Suave', color: '#FFF9C4' },
  { id: 'skyBlue', name: 'Azul Céu', color: '#BBDEFB' },
  { id: 'lavender', name: 'Lavanda', color: '#E1BEE7' },
  { id: 'taupe', name: 'Taupe', color: '#BCAAA4' },
  { id: 'periwinkle', name: 'Azul Lilás', color: '#C5CAE9' },
  { id: 'salmon', name: 'Salmão Claro', color: '#FFAB91' },
  { id: 'rose', name: 'Rosa Claro', color: '#FFCDD2' },
  { id: 'lime', name: 'Verde Lima', color: '#AED581' },
  { id: 'orangeMedium', name: 'Laranja Médio', color: '#FFB74D' },
  { id: 'dustyRose', name: 'Rosa Queimado', color: '#CA8686' },
  { id: 'cyan', name: 'Ciano', color: '#00FFFF' },
  { id: 'steelBlue', name: 'Azul Aço', color: '#A1A1B9' },
  { id: 'tealDark', name: 'Verde Petróleo', color: '#008B8B' },
  { id: 'grayDark', name: 'Cinza Escuro', color: '#A9A9A9' },
  { id: 'neonGreen', name: 'Verde Neon', color: '#03F103' },
  { id: 'khakiDark', name: 'Caqui Escuro', color: '#BDB76B' },
  { id: 'purpleDeep', name: 'Roxo Intenso', color: '#8B008B' },
  { id: 'coral', name: 'Coral', color: '#E9967A' },
  { id: 'fuchsia', name: 'Fúcsia', color: '#FF00FF' }
]

  const clear = (value: boolean) => {
    if (value) {
      setSelectedValue('')
      reset({ tagId: '' })
    }
  }

  useEffect(() => {
    if (ref) ref.current = { clear }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])

  useEffect(() => {
    if (selectedTag) {
      setSelectedValue(selectedTag)
    }
  }, [selectedTag])

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setSelectedValue(event.target.value)
  }

  const handleModalTagOpen = () => {
    setModalTagOpen(true)
  }

  const handleModalTagClose = () => {
    setModalTagOpen(false)
  }

  const handleModalEditTagClose = () => {
    setModalEditTagOpen(false)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormValues({ ...formValues, [name]: value })
  }

  const handleInputColorChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target
    setFormValues({ ...formValues, [name]: value })
  }

  const handleTagSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const tag = {
      name: formValues.nome,
      color: formValues.color
    }

    api
    .post('/tags', tag)
    .then(resp => {
      if(fetch)
        fetch()
    })
    .catch(error => {
      console.error(error)
    })
    
    handleModalTagClose()
  }

  const handleTagUpdate = (id: string) => {
    const tag = {
      name: formValues.nome,
      color: formValues.color
    }

    api
    .patch(`/tags/${id}`, tag)
    .then(resp => {
      if(fetch)
        fetch()
    })
    .catch(error => {
      console.error(error)
    })
    
    handleModalEditTagClose()
  }

  const handleTagDelete = (id: string) => {
    api
    .delete(`/tags/${id}`)
    .then(resp => {
      if(fetch)
        fetch()
    })
    .catch(error => {
      console.error(error)
    })
  }

  return (
    <FormControl fullWidth>
      <Controller
        name='tagId'
        control={control}
        defaultValue=''
        render={({ field }) => (
          <Select
            {...field}
            id='tagId'
            value={selectedValue}
            onChange={event => {
              setSelectedValue(event.target.value)
              field.onChange(event.target.value)
            }}
          >
            <MenuItem value=''>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <>{name}</>
              </div>
            </MenuItem>
            {data.map((option, index) => (
              <MenuItem key={index} value={option.id}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={option.name[0]?.toUpperCase()}
                    color={(option.color || colorsRotulo[5].color ) as ThemeColor}
                    size='medium'
                    sx={{ marginRight: '8px', height: '32px' }}
                  />
                  {option.name.toUpperCase()}
                  <IconButton onClick={() => {
                    setSelTag(option.id);
                    setFormValues({ ...formValues, nome: option.name, color: option.color });
                    setModalEditTagOpen(true);
                  }}>
                    <Icon icon='mdi:pencil-outline' />
                  </IconButton>
                  <IconButton onClick={() => {
                    handleTagDelete(option.id)
                  }}>
                    <Icon icon='mdi:delete' />
                  </IconButton>
                </div>
              </MenuItem>
            ))}
            <MenuItem>
              <Button color='primary' onClick={()=>{
                setFormValues({ ...formValues, color: colorsRotulo[1].id });
                handleModalTagOpen()
              }}>
                NOVO RÓTULO
              </Button>
            </MenuItem>
          </Select>
        )}
      />

      <Modal open={modalEditTagOpen} onClose={handleModalEditTagClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 450,
            height: 180,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4
          }}
        >

            <Typography variant='h6' component='div' sx={{ marginBottom: 2 }}>
              Editar rótulo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, gap: 2 }}>
              <Typography variant='body1' sx={{ marginRight: 2 }}>
                Cor:
              </Typography>
              <Select value={formValues.color} sx={{ width: 120 }} onChange={handleInputColorChange} name='color'>
                {colorsRotulo.map(color => (
                  <MenuItem key={color.id} value={color.id}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: color.color,
                        
                        }}
                      ></div>
                      {/* {color.name} */}
                    </div>
                  </MenuItem>
                ))}
              </Select>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  name='nome'
                  id='rotulo-nome'
                  variant='outlined'
                  fullWidth
                  placeholder='Nome do rótulo'
                  value={formValues.nome}
                  onChange={handleInputChange}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleModalEditTagClose} sx={{ marginRight: 2 }}>
                Fechar
              </Button>
              <Button onClick={()=>handleTagUpdate(selTag)} variant='contained' color='primary'>
                Salvar
              </Button>
            </Box>

        </Box>
      </Modal>

      <Modal open={modalTagOpen} onClose={handleModalTagClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 450,
            height: 180,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4
          }}
        >
          <form onSubmit={handleTagSubmit}>
            <Typography variant='h6' component='div' sx={{ marginBottom: 2 }}>
              Novo rótulo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, gap: 2 }}>
              <Typography variant='body1' sx={{ marginRight: 2 }}>
                Cor:
              </Typography>
              <Select value={formValues.color} sx={{ width: 120 }} onChange={handleInputColorChange} name='color'>
                {colorsRotulo.map(color => (
                  <MenuItem key={color.id} value={color.id}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: color.color,
                          
                        }}
                      ></div>
                      {/* {color.name} */}
                    </div>
                  </MenuItem>
                ))}
              </Select>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  name='nome'
                  id='rotulo-nome'
                  variant='outlined'
                  fullWidth
                  placeholder='Nome do rótulo'
                  onChange={handleInputChange}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleModalTagClose} sx={{ marginRight: 2 }}>
                Fechar
              </Button>
              <Button type='submit' variant='contained' color='primary'>
                Salvar
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </FormControl>
  )
})
