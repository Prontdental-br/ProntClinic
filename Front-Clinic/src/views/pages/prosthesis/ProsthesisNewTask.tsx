
// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Add } from '@mui/icons-material'


const schema = yup.object({
  content: yup
    .string()
    .trim()
    .required('Título é obrigatório')
    .min(1, 'Título deve ter pelo menos 1 caractere')
    .max(30, 'Título deve ter no máximo 30 caracteres'),
});

type FormData = yup.InferType<typeof schema>;

type NewTaskProps = {
  addTask: (task: { title: string }) => void;
};

const ProsthesisNewTask = ({ addTask }: NewTaskProps) => {
    // States
    const [displayNewItem, setDisplayNewItem] = useState(false)
  
    // Hooks
    const {
      control,
      handleSubmit,
      reset,
      formState: { errors }
    } = useForm<FormData>({
      defaultValues: {
        content: ''
      },
      resolver: yupResolver(schema)
    });
  
    // Display the Add New Task form
    const toggleDisplay = () => {
      setDisplayNewItem(!displayNewItem)
    }
  
    // Handle the Add New Task form
    const onSubmit = (data: FormData) => {
      addTask({ title: data.content }); 
      setDisplayNewItem(false);
      reset({ content: '' });
    };
  
    // Handle reset
    const handleReset = () => {
      toggleDisplay()
      reset({ content: '' })
    }
  
    return (
      <div  style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px", 
        alignItems: "flex-start",
      }}>
        <Typography onClick={toggleDisplay} color='text.primary' style={{ display: 'flex', cursor: 'pointer' }}>
          <Add />
          <span>Novo item</span>
        </Typography>
        {displayNewItem && (
          <form  style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px", 
            minInlineSize: "16.5rem", 
          }} onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name='content'
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  multiline
                  autoFocus
                  rows={2}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(onSubmit)(e)
                    }
  
                    if (e.key === 'Escape') {
                      handleReset()
                    }
                  }}
                  label='Adicionar Cartão'
                  variant='outlined'
                  {...field}
                  error={Boolean(errors.content)}
                  helperText={errors.content ? errors.content.message : null}
                />
              )}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
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

export default ProsthesisNewTask
