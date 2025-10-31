
// React Imports
import { useState } from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Add } from '@mui/icons-material'


const schema = yup.object({
  title: yup.string().trim().required('Titulo é obrigatório').min(1, 'Título deve ter pelo menos 1 caractere'),
});

type FormData = yup.InferType<typeof schema>;

const ProsthesisNewColumn = ({ addNewColumn }: { addNewColumn: (title: string) => void }) => {
    const [display, setDisplay] = useState(false)
  
    const {
      control,
      handleSubmit,
      reset,
      formState: { errors }
    } = useForm<FormData>({
      defaultValues: {
        title: ''
      },
      resolver: yupResolver(schema)
    })
  
    const toggleDisplay = () => {
      setDisplay(!display)
    }
  
    const onSubmit = (data: FormData) => {
      addNewColumn(data.title)
      setDisplay(false)
      reset({ title: '' })
    }
  
    const handleReset = () => {
      toggleDisplay()
      reset({ title: '' })
    }
  
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'flex-start',
        minInlineSize: '16.5rem',
        inlineSize: '16.5rem',
      }}>
        <Typography variant='h5' onClick={toggleDisplay} style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}>
          <Add />
          <span className='whitespace-nowrap'>Adicionar novo</span>
        </Typography>
        {display && (
          <form
          style={{  display: "flex",
            flexDirection: "column",
            gap: "16px", 
            minInlineSize: "16.5rem", }}
    
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                handleReset()
              }
            }}
          >
            <Controller
              name='title'
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  autoFocus
                  variant='outlined'
                  label='Título'
                  {...field}
                  error={Boolean(errors.title)}
                  helperText={errors.title ? errors.title.message : null}
                />
              )}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant='contained' size='small' color='primary' type='submit'>
                Adicionar
              </Button>
              <Button
                variant='outlined'
                size='small'
                color='secondary'
                onClick={() => {
                  handleReset()
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    )
  }

export default ProsthesisNewColumn
