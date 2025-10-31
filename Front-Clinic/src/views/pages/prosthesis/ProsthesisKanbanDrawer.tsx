// React Imports
import { useEffect, useState, useRef, useMemo } from 'react'
import type { ChangeEvent } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'

// Type Imports


// Slice Imports 

// Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'
// import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Data Imports
import { Add, Close, Delete, Edit } from '@mui/icons-material'
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { ColumnType, TaskType } from 'src/types/apps/kanbanTypes'
import { ChipProps } from '@material-ui/core'
import { useProsthesis } from 'src/context/ProsthesisContext'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'

type ChipColorType = { color: ChipProps['color'] };


type KanbanDrawerProps = {
  drawerOpen: boolean
  setDrawerOpen: (value: boolean) => void
  task: TaskType
  columns: ColumnType[]
  setColumns: (value: ColumnType[]) => void
}

const schema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Título é obrigatório')
    .min(1, 'Título deve ter pelo menos 1 caractere')
    .max(30, 'Título deve ter no máximo 30 caracteres'),
});

type FormData = yup.InferType<typeof schema>;

const ProsthesisKanbanDrawer = (props: KanbanDrawerProps) => {
  // Props
  const { drawerOpen, setDrawerOpen, task, columns, setColumns } = props

  const { state, editTask, deleteTask, addLabel, editLabel, deleteLabel } = useProsthesis();
  
  const chipColor = useMemo(() => {
    return state.labels.reduce((acc: { [key: string]: ChipColorType }, label: any) => {
      acc[label.name] = { color: label.color as ChipProps['color'] };  
      
return acc;
    }, {});
  }, [state.labels]);


  const [badgeText, setBadgeText] = useState<string[]>(
    Array.isArray(task.badgeText) ? task.badgeText : []
  )
  const [fileName, setFileName] = useState<string>('')
  const [comment, setComment] = useState<string>(task.comments ?? '')
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState<string>('');
  const [editingLabel, setEditingLabel] = useState<any>(null);

  const [labelColor, setLabelColor] = useState<"success" | "error" | "info" | "warning" | "secondary">('success');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [previousLabelName, setPreviousLabelName] = useState<string>('');
  const [statusDate, setStatusDate] = useState<Dayjs | null>(task.statusDate ? dayjs(task.statusDate) : null);
  const [returnDate, setReturnDate] = useState<Dayjs | null>(task.returnDate ? dayjs(task.returnDate) : null);    

  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      title: task.title
    },
    resolver: yupResolver(schema)
  })

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target

    if (files && files.length !== 0) {
      setFileName(files[0].name)
    }
  }

  const handleClose = () => {
    setDrawerOpen(false)
    reset({ title: task.title })
    setBadgeText(Array.isArray(task.badgeText) ? task.badgeText : []);
    setFileName('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateTask = (data: FormData) => {
    editTask({ id: task.id, title: data.title, badgeText, order: task.order, comments: comment, 
    statusDate: statusDate?.toDate() ?? null,
    returnDate: returnDate?.toDate() ?? null 
 })
    handleClose()
  }

  const handleReset = () => {
    setDrawerOpen(false)
    deleteTask(task.id)

    const updatedColumns = columns.map(column => {
      return {
        ...column,
        taskIds: column.taskIds.filter(taskId => taskId !== task.id)
      }
    })

    setColumns(updatedColumns)
  }

  useEffect(() => {
    reset((prev) => {
      if (prev.title !== task.title) {
        return { title: task.title };
      }
      
    return prev;
    });
     setStatusDate(task.statusDate ? dayjs(task.statusDate) : null);
    setReturnDate(task.returnDate ? dayjs(task.returnDate) : null);

    setBadgeText(prev => {
      const newBadges = Array.isArray(task.badgeText) ? task.badgeText : [];
      if (JSON.stringify(prev) !== JSON.stringify(newBadges)) {
        return newBadges;
      }
      
    return prev;
    });
  
  }, [task, reset]);

  useEffect(() => {
    if (drawerOpen) {
      setComment(task.comments ?? '')
    }
  }, [task, drawerOpen])


  const handleLabelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setBadgeText(event.target.value as string[]);
  };

  const handleLabelDelete = (chip: any) => {
    const labelToRemove = state.labels.find((label: any) => label.id === chip.id);

    if (!labelToRemove) return;
  
    if (window.confirm(`Tem certeza que deseja excluir o rótulo "${labelToRemove.name}"?`)) {
     deleteLabel(chip.id)
  

      setBadgeText(current => current.filter(text => text !== labelToRemove.name));
    }
  };

  const handleAddNewLabel = async () => {
    if (newLabel.trim()) {
      
      if (editingLabel && editingLabel.id) {
        await editLabel({ id: editingLabel.id, name: newLabel, color: labelColor });
  
        setBadgeText((current) => [
          ...new Set([...current.filter(l => l !== editingLabel.name), newLabel]),
        ]);
      } else {
     
        const existingLabel = state.labels.find((label: any) => label.name === newLabel);
  
        if (existingLabel) {
          setBadgeText((current) => [...new Set([...current, existingLabel.name])]);
        } else {
          const created = await addLabel({ name: newLabel, color: labelColor });
  
          if (created) {
            setBadgeText((current) => [...new Set([...current, created.name])]);
          }
        }
      }
    }
  
    setNewLabel('');
    setLabelColor('secondary');
    setEditingLabel(null);
    handleCloseDialog();
  };
  
  

  const handleEditLabel = (label: { id: string; name: string; color: string }) => {
    setEditingLabelId(label.id); 
    setPreviousLabelName(label.name); 
    setNewLabel(label.name); 
    setEditingLabel(label);
    setLabelColor(label.color as "success" | "error" | "info" | "warning" | "secondary");
    setDialogOpen(true); 
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };


  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewLabel('');
    setLabelColor('success'); 
  };

  return (
    <div>
      <Drawer
        open={drawerOpen}
        anchor='right'
        variant='temporary'
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
        onClose={handleClose}
      >
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingInline: '1.25rem', 
            paddingBlock: '1rem', 
            borderBottom: '1px solid #e0e0e0' 
        }}>
          <Typography variant='h5'>Editar Tarefa</Typography>
          <IconButton onClick={handleClose} size='small'>
            <Close />
          </IconButton>
        </div>
        <div style={{ padding: 8 }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 10 }} onSubmit={handleSubmit(updateTask)}>
            <Controller
              name='title'
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  label='Título'
                  {...field}
                  error={Boolean(errors.title)}
                  helperText={errors.title?.message}
                />
              )}
            />
            <FormControl fullWidth>
              <InputLabel id="demo-multiple-chip-label">Label</InputLabel>
              <Select
                multiple
                label="Label"
                value={badgeText || []}
                onChange={(e) => setBadgeText(e.target.value as string[])}
                renderValue={(selected) => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(Array.isArray(selected) ? selected : []).map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        variant="filled"
                        size="small"
                        onMouseDown={e => e.stopPropagation()}
                        onDelete={() => setBadgeText(current => current.filter(item => item !== value))}
                        color={chipColor[value]?.color || 'default'}
                      />
                    ))}
                  </div>
                )}
              >
                {state.labels.map((label: any) => (
                  <MenuItem 
                    key={label.name} 
                    value={label.name} 
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Checkbox checked={badgeText.includes(label.name)} />
                      <ListItemText primary={label.name} />
                    </div>

                    {!label.notEditable && (
                      <div style={{ display: "flex", gap: 4 }}>
                        <IconButton size="small" onClick={() => handleEditLabel(label)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleLabelDelete(label)}>
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </div>
                    )}
                  </MenuItem>
                ))}

                <MenuItem onClick={handleOpenDialog} hidden>
                  <Add /> Novo rótulo
                </MenuItem>
              </Select>
            </FormControl>

            {/* <div className='flex flex-col gap-y-1'>
              <Typography variant='body2'>Assigned</Typography>
              <div style={{ display: 'flex', gap: 6 }}>
                {task.assigned?.map((avatar, index) => (
                  <Tooltip title={avatar.name} key={index}>
                    <CustomAvatar key={index} src={avatar.src} size={26} className='cursor-pointer' />
                    <h6>Avatar aqui</h6>
                  </Tooltip>
                ))}
                <CustomAvatar size={26} className='cursor-pointer'>
                  <i className='ri-add-line text-base text-textSecondary' />
                </CustomAvatar>
              </div>
            </div> */}
            {/* <div className='flex items-center gap-4'>
              <TextField
                fullWidth
                label='Choose File'
                variant='outlined'
                value={fileName}
                InputProps={{
                  readOnly: true,
                  endAdornment: fileName ? (
                    <InputAdornment position='end'>
                      <IconButton size='small' edge='end' onClick={() => setFileName('')}>
                        <i className='ri-close-line' />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
              <Button component='label' variant='outlined' htmlFor='contained-button-file'>
                Choose
                <input hidden id='contained-button-file' type='file' onChange={handleFileUpload} ref={fileInputRef} />
              </Button>
            </div> */}

               <div style={{ display: 'flex', gap: 16 }}>
  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='pt-br'>
    <DatePicker
      label='Data da Atuação'
      format='DD/MM/YYYY'
      value={statusDate}
      onChange={(newValue) => {
        setStatusDate(newValue);
      }}
      slotProps={{ textField: { fullWidth: true } }}
    />
  </LocalizationProvider>

  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='pt-br'>
    <DatePicker
      label='Data de Retorno'
      format='DD/MM/YYYY'
      value={returnDate}
      onChange={(newValue) => {
        setReturnDate(newValue);
      }}
      slotProps={{ textField: { fullWidth: true } }}
    />
  </LocalizationProvider>
</div>
            <TextField
              fullWidth
              label='Comentários'
              value={comment}
              onChange={e => setComment(e.target.value)}
              multiline
              rows={4}
              placeholder='Escreva comentários....'
              inputProps={{ maxLength: 250 }}
            />
            <div className='flex gap-4' style={{ display: 'flex', gap: 5 }}>
              <Button variant='contained' color='primary' type='submit'>
                Atualizar
              </Button>
              <Button variant='outlined' color='error' type='reset' onClick={handleReset}>
                Deletar
              </Button>
            </div>
          </form>
        </div>
      </Drawer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Adicionar/Editar Rótulo</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Rótulo"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            fullWidth
            margin="normal"
          />
        <FormControl fullWidth>
            <InputLabel id="label-color-select">Cor</InputLabel>
            <Select
              labelId="label-color-select"
              value={labelColor}
              label="Cor"
              onChange={(e) =>
                setLabelColor(
                  e.target.value as "success" | "error" | "info" | "warning" | "secondary"
                )
              }
              renderValue={(selected) => (
                <Chip
                  sx={{ borderRadius: '50%', width: 24, height: 24 }}
                  color={selected as any}
                />
              )}
            >
              {["success", "error", "info", "warning", "secondary"].map((color) => (
                <MenuItem key={color} value={color}>
                  <Chip
                    color={color as any}
                    sx={{
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleAddNewLabel}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ProsthesisKanbanDrawer