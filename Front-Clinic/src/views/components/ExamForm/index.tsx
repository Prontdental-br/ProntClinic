import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Typography,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { questionsObjectList } from './questions'
import api from 'src/@core/components/api-client'
import { AutocompleteWithAddButton } from '../AutocompleteWithAddButton'
import { useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/store'
import professional, { fetchData as fetchDataProfessional } from 'src/store/apps/professional'
import { useDispatch } from 'react-redux'
import Arcaria from '../Arcaria'
import { Icon } from '@iconify/react'
import { aW } from '@fullcalendar/core/internal-common'

interface Props {
  patientId: string
  tipoExam?: string
  // eslint-disable-next-line @typescript-eslint/ban-types
  back?: Function
}

const ExamForm = ({ patientId, tipoExam, back }: Props) => {
  const [labs, setLabs] = useState<any>([])
  const [selectedLab, setSelectedLab] = useState<any>({});
  const storeProfessional = useSelector((state: RootState) => state.professional)
  const dispatch = useDispatch<AppDispatch>()
  const [selectedLabId, setSelectedLabId] = useState("");
const [selectedLabEdit, setSelectedLabEdit] = useState(null);
const [editModalOpen, setEditModalOpen] = useState(false);
const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
const [editName, setEditName] = useState('');

const handleSelectLab = (id: string) => {
  const lab = labs.find((l: any) => l.id === id);
  setSelectedLabId(id);
  setSelectedLab(lab);
  setEditName(lab?.name || '');
};

const handleOpenEdit = (lab: any) => {
  setSelectedLab(lab);
  setSelectedLabId(lab.id);
  setEditName(lab.name);
  setEditModalOpen(true);
};

const handleOpenDelete = (lab: any) => {
  setSelectedLab(lab);
  setSelectedLabId(lab.id);  
  setConfirmDeleteOpen(true);
};

const handleSaveEdit = async () => {

  console.log('Laboratório agora:', selectedLabId, editName);

  await api.patch(`/labs/${selectedLabId}`, { name: editName })


  fetchLabs(); 

  setEditModalOpen(false);
};

const handleDeleteLab = async () => {
  
  await api.delete(`/labs/${selectedLabId}`)

  fetchLabs(); 
  setConfirmDeleteOpen(false);
};

  console.log(patientId)

  const createQuestionSchema = (options: any[]) => {
    let schema = yup.object().shape({})
    options.forEach((option, index) => {
      switch (option.type) {
        case 'radio':
          // Para campos radio, é importante garantir que um esteja selecionado
          schema = schema.shape({
            [`question${index}`]: yup.string().required('Resposta obrigatória')
          })
          break
        case 'text':
          // Para campos de texto, validamos se não está vazio
          schema = schema.shape({
            [`infoAdicional${index}`]: yup.string().required('Campo obrigatório')
          })
          break
        case 'check':
          // Para checkboxes, a validação pode ser ajustada conforme a necessidade
          schema = schema.shape({
            [`check${index}`]: yup.boolean()
          })
          break
        default:
          break
      }
    })

    return schema
  }

  const validationSchema = yup.object(
    tipoExam && questionsObjectList[tipoExam]
      ? Object.entries(questionsObjectList[tipoExam]).reduce(
        (acc, [questionKey, options]) => ({
          ...acc,
          [questionKey]: createQuestionSchema(options) // Aqui você cria o esquema para cada pergunta individual
        }),
        {}
      )
      : {}
  )

  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(validationSchema)
  })

  const onSubmit = (event: any) => {
    event.preventDefault(); // Evita que a página seja recarregada

    const btnName = event.nativeEvent.submitter.name;

    if (btnName === 'close')
      location.replace(`/patient/view/exam/${patientId}`)

    const formData = new FormData(event.target); // Obtém os dados do formulário
    const data: any = {};

    for (const [name, value] of formData.entries()) {

      console.log(name, value)

      if (data[name]) {

        console.log(data[name])

        data[name] = Array.isArray(data[name]) ? data[name] : [data[name]];

        data[name].push(value);

        data[name] = data[name].join(',');
      } else {

        data[name] = value;
      }
    }

    console.log(patientId)

    api.post('/exams', { examType: tipoExam, patientId, labId: data.labId, professionalId: data.professionalId, data })
      .then(resp => {
        const { data } = resp;
        if (btnName === 'save') {
          location.replace(`/patient/view/documents/${patientId}/?exam_type=all`)
        }
        else if (btnName === 'emmit')
          location.replace(`/exam/print/${data.id}`)
      })

  }

  const renderQuestionInput = (question: string, options: any[], index: number) => {
    return options.map((option: any, optIndex: any) => {
      switch (option.type) {
        case 'radio':
          return <FormControlLabel key={optIndex} value={option.label} control={<Radio />} label={option.label} name={question} />
        case 'text':
          return (
            <TextField
              key={optIndex}
              {...register(`infoAdicional${index}`, { required: 'Este campo é obrigatório' })}
              placeholder={option.label}
              fullWidth
              margin='normal'
              error={!!errors[`infoAdicional${index}`]}
              helperText={errors[`infoAdicional${index}`]?.message?.toString()}
              name={question}
            />
          )
          break
        case 'check':
          return (
            <FormControlLabel
              key={optIndex}
              control={
                <Checkbox
                  {...register(`check${index}_${optIndex}`, { required: 'Pelo menos uma opção deve ser selecionada' })}
                  value={option.label}
                  name={question}
                />
              }
              label={option.label}
              name={question}
            />
          )
        default:
          return null
      }
    })
  }

 async function fetchLabs() {
    try {
      const { data } = await api.get('/labs');
      console.log(data);
      const labs = data.map((item: any) => {
        return {
          id: item.id,
          name: item.name
        }
      })

      setLabs(labs);
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  useEffect(() => {
    dispatch(fetchDataProfessional());
    fetchLabs();
  }, []);

  return (
    <>
    <form onSubmit={onSubmit}>
      <Grid container spacing={2}>

        <Grid item xs={6}>
          <label>Laboratório</label>
          <Select
  name="labId"
  value={selectedLabId}
  onChange={(e) => handleSelectLab(e.target.value)}
  displayEmpty
  renderValue={(selected) => {
    const lab = labs.find((l: any) => l.id === selected);
    
return lab ? lab.name : 'Selecione um laboratório';
  }}
  
>
  {labs.map((l: any, i: number) => (
    <MenuItem key={i} value={l.id}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{l.name}</span>
        <div onClick={(e) => e.stopPropagation()}>
          <IconButton size="small" onClick={() => handleOpenEdit(l)}>
            <Icon icon="mdi:pencil-outline" />
          </IconButton>
          <IconButton size="small" onClick={() => handleOpenDelete(l)}>
            <Icon icon="mdi:delete" />
          </IconButton>
        </div>
      </div>
    </MenuItem>
  ))}
</Select>
          <Grid item xs={12}>
          </Grid>
          <label>Profissional</label>
          <Select
            name='professionalId'
            title='Profissional'
          >
            {storeProfessional.data
              .filter((l: any) => l.specialty?.toLowerCase() !== 'recepcionista')
              .map((l: any, i: number) => (
                <MenuItem key={i} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
          </Select>
        </Grid>
        <br />
        {['radiografia','tomografia'].includes(tipoExam || '') && <Arcaria /> }
        {tipoExam &&
          Object.entries(questionsObjectList[tipoExam]).map(([question, options], index) => (
            <Grid
            item
            xs={12}
            key={index}
            sm={6}
            lg={6}
            sx={{
              boxShadow: 'none',
              border: theme => `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              marginBottom: 2,
              padding: 2
            }}
            >
              <FormControl component='fieldset' fullWidth margin='normal'>
                <FormLabel component='legend'>{question}</FormLabel>
                {options[0].type === 'radio' && (
                  <RadioGroup {...register(`question${index}`, { required: 'Resposta obrigatória' })}>
                    {renderQuestionInput(question, options, index)}
                  </RadioGroup>
                )}
                {options[0].type === 'text' && renderQuestionInput(question, options, index)}
                {options[0].type === 'check' && renderQuestionInput(question, options, index)}
                {errors[`question${index}`] && (
                  <Typography color='error' variant='caption'>
                    {errors[`question${index}`]?.message?.toString()}
                  </Typography>
                )}
                {options[0].type === 'check' && Object.keys(errors).some(key => key.startsWith(`check${index}`)) && (
                  <Typography color='error' variant='caption'>
                    Pelo menos uma opção deve ser selecionada
                  </Typography>
                )}
              </FormControl>
            </Grid>
          ))}

        {tipoExam &&
          <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }}>
            <Button type='submit' name='save' variant='contained' color='primary'>
              Salvar
            </Button>
            {/*<Button type='submit' variant='contained' name='emmit' color='warning'>
              Emitir Exam
              </Button>*/}
            <Button onClick={() => {
              if(back)
                back();
            }} variant='outlined' name='close' color='inherit'>
              Fechar
                </Button>
          </Grid>}
      </Grid>
    </form>
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Editar Laboratório</DialogTitle>
        <DialogContent>
          <TextField
          sx={{ mt: 2 }}
            label="Nome do laboratório"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} variant='outlined' color='error'>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
  <DialogTitle>Confirmar exclusão</DialogTitle>
  <DialogContent>
    Tem certeza que deseja excluir o laboratório "{selectedLab?.name}"?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
    <Button onClick={handleDeleteLab} variant="contained" color="error">Excluir</Button>
  </DialogActions>
</Dialog>
   </>
  )
}

export default ExamForm
