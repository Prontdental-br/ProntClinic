// ** React Imports
import { Ref, useState, forwardRef, ReactElement, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Switch from '@mui/material/Switch'
import Select, { SelectChangeEvent } from '@mui/material/Select'
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
import toast from 'react-hot-toast';

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import useBgColor from 'src/@core/hooks/useBgColor'

import initialDocuments from './mocks/models.json'
import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'
import { EditorState, ContentState, convertToRaw } from 'draft-js'
import api from 'src/@core/components/api-client'
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { RootState, store } from 'src/store'
import { useSelector } from 'react-redux'
import { PatientDataType } from 'src/types/apps/userTypes'
import { CircularProgress } from '@mui/material'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

interface AddDocumentDialogProps {
  open: boolean
  onClose: () => void
  fetchData?:  () => void
  patientId?: string
  dataPatient: PatientDataType
}

type DocumentsModelTypes = {
  id: string
  titulo: string
  texto: string
}

const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({ open, onClose, fetchData, patientId, dataPatient }) => {
  // ** States

   const userData = JSON.parse(localStorage.getItem('userData') || '{}');
   const professionalName = userData?.professional?.name || '';
   const professionalCRO = userData?.professional?.cro || '';
   

  const [addressType, setAddressType] = useState<'newModel' | 'existModel'>('newModel')
  const [id, setId] = useState(1)
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [models, setModels] = useState<DocumentsModelTypes[]>(userData?.planType !== "E"  ? initialDocuments : [])
  const [newContract, setNewContract] = useState<any>({
  professional: professionalName });
  const [messageValue, setMessageValue] = useState(EditorState.createEmpty(undefined))
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewContract({ ...newContract, [name]: value })
  }

  const stripHtml = (html: string) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;

  return tmp.textContent || tmp.innerText || "";
};

 const fetchContracts = async () => {
  try {
    const { data } = await api.get('/contract-configs');

    const formattedContracts = data.map((contract: any) => ({
      id: contract.id,
      titulo: contract.title,
      texto: stripHtml(contract.content)
    }));

    setModels((prev) => [...prev, ...formattedContracts]);

  } catch (error) {
    console.error('Erro ao carregar contratos:', error);
  }
};

console.log(dataPatient);


const fetchClinicData = async () => {
  try {
    const response = await api.get('/clinics');
    const clinicData = response.data;

    console.log('Fetched clinic data:', clinicData);
    setClinic(clinicData); 

    return clinicData;
  } catch (error) {
    console.error('Error fetching clinic data:', error);

    return null;
  }
};

useEffect(() => {
  fetchClinicData();
   fetchContracts();
}, []);

 const fillContractTemplate = (
  template: string, 
  dataPatient: any, 
  professionalName: string,
  professionalCRO: string,
  clinic: any
) => {
  const fullAddress = [
    dataPatient?.street,
    dataPatient?.neighborhood,
    dataPatient?.city,
    dataPatient?.state
  ].filter(Boolean).join(' '); 

  const fullAdressClinic = [
  clinic?.street,
  clinic?.neighborhood,
  clinic?.city,
  clinic?.state,
  clinic?.cep
].filter(Boolean).join(' ');


  return template
    .replace(/%paciente%/g, dataPatient?.name || '')
    .replace(/%rg%/g, dataPatient?.rg || '')
    .replace(/%cpf%/g, dataPatient?.cpf || '')
    .replace(/%endereço%/g, fullAddress || '')
    .replace(/%nome-clinica%/g, clinic?.name || '')
    .replace(/%clinica-cnpj%/g, clinic?.docNumber || '')
    .replace(/%cro-dentista%/g, professionalCRO || '')
    .replace(/%cep%/g, dataPatient?.zipCode || '')
    .replace(/%nome-cidade%/g, clinic?.city || '')
    .replace(/%estado%/g, clinic?.state || '')

    .replace(/%endereço-clinica%/g, fullAdressClinic || '')

    .replace(/%Localidade%/g, clinic?.city || '')
  
    
    .replace(/%telefone%/g, dataPatient?.cellPhone || '')
    .replace(/%email%/g, dataPatient?.email || '')
    .replace(/%profissional%/g, professionalName || '');
};

 useEffect(() => {
  if (selectedModel) {
    const selected = models.find(model => model.titulo === selectedModel);
    if (selected) {
      const filledText = fillContractTemplate(
        selected.texto,
        dataPatient,
        newContract?.professional || '',
        professionalCRO || '',
        clinic
      );

      setTitulo(selected.titulo);
      setTexto(filledText);
      setMessageValue(EditorState.createWithContent(ContentState.createFromText(filledText)));
    }
  }
}, [selectedModel, models, dataPatient, newContract?.professional, userData?.account?.name]);

  

const handleModelChange = (event: SelectChangeEvent<string>) => {
  const modelTitle = event.target.value;
  setSelectedModel(modelTitle);

  const selected = models.find(model => model.titulo === modelTitle);

  if (selected) {
    
    const filledText = fillContractTemplate(
      selected.texto,
      dataPatient,                       // paciente
      newContract?.professional || '',   // profissional responsável
      professionalCRO || '',             // cro do profissional
      clinic
    );

    setTitulo(selected.titulo);
    setTexto(filledText);
    setMessageValue(EditorState.createWithContent(ContentState.createFromText(filledText)));
  }
};

  // ** Hooks
  const bgColors = useBgColor()

  const clearForm = () => {
    setNewContract({ professional: professionalName });
    setMessageValue(EditorState.createEmpty(undefined));
  }

  const onSubmit = (event: any) => {
    event.preventDefault(); // Evita que a página seja recarregada

    setLoading(true);

    const formData = new FormData(event.target); // Obtém os dados do formulário
    const data: any = {};

    for (const [name, value] of formData.entries()) {
      console.log(name,value)
      data[name] = value;
    }

    data['text'] = draftToHtml(convertToRaw(messageValue.getCurrentContent()))

    api.post('/contract', { patientId, ...data })
      .then(resp=>{
        if(fetchData)
        fetchData();
        onClose();
        clearForm();
      })
      toast.success('Documento adicionado com sucesso!');
      setLoading(false);

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
            Adicionar contratos
          </Typography>
          <Typography variant='body2'>Escolha entre adicionar um documento novo ou já preenchido</Typography>
        </Box>
        <Grid container spacing={6}>
          <Grid item sm={6} xs={12}>
            <Box
              onClick={() => setAddressType('newModel')}
              sx={{
                py: 3,
                px: 4,
                borderRadius: 1,
                cursor: 'pointer',
                ...(addressType === 'newModel' ? { ...bgColors.primaryLight } : { backgroundColor: 'action.hover' }),
                border: theme =>
                  `1px solid ${addressType === 'newModel' ? theme.palette.primary.main : theme.palette.secondary.main}`,
                ...(addressType === 'newModel'
                  ? { ...bgColors.primaryLight }
                  : { backgroundColor: bgColors.secondaryLight.backgroundColor })
              }}
            >
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', '& svg': { mr: 2 } }}>
                <Icon icon='mdi:text-box-plus-outline' />
                <Typography variant='h6' sx={{ ...(addressType === 'newModel' ? { color: 'primary.main' } : {}) }}>
                  Novo Documento
                </Typography>
              </Box>
              <Typography sx={{ ...(addressType === 'newModel' ? { color: 'primary.main' } : {}) }}>
                Esta opção cria um novo documento
              </Typography>
            </Box>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Box
              onClick={() => setAddressType('existModel')}
              sx={{
                py: 3,
                px: 4,
                borderRadius: 1,
                cursor: 'pointer',
                ...(addressType === 'existModel' ? { ...bgColors.primaryLight } : { backgroundColor: 'action.hover' }),
                border: theme =>
                  `1px solid ${
                    addressType === 'existModel' ? theme.palette.primary.main : theme.palette.secondary.main
                  }`,
                ...(addressType === 'existModel'
                  ? { ...bgColors.primaryLight }
                  : { backgroundColor: bgColors.secondaryLight.backgroundColor })
              }}
            >
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', '& svg': { mr: 2 } }}>
                <Icon icon='mdi:text-box-multiple-outline' />
                <Typography variant='h6' sx={{ ...(addressType === 'existModel' ? { color: 'primary.main' } : {}) }}>
                  Usar um Modelo existente
                </Typography>
              </Box>
              <Typography sx={{ ...(addressType === 'existModel' ? { color: 'primary.main' } : {}) }}>
                Nesta Opção usa um modelo predefinido
              </Typography>
            </Box>
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField fullWidth label='Código' placeholder='#' contentEditable={false} name='code' value={newContract?.code} onChange={handleInputChange} />
          </Grid>

          <Grid item sm={6} xs={12}>
            <TextField fullWidth label='Profissional' placeholder='#' contentEditable={false} name='professional' value={newContract?.professional} onChange={handleInputChange} />
          </Grid>

          {addressType === 'existModel' && (
            <>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='model-select-label'>Modelo</InputLabel>
                  <Select
                    labelId='model-select-label'
                    label='Modelo'
                    value={selectedModel}
                    onChange={e => handleModelChange(e)}
                    fullWidth
                  >
                    {models.map(model => (
                      <MenuItem key={model.id} value={model.titulo}>
                        {model.titulo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Título'
              placeholder='Título do documento'
              name='title' value={newContract?.title} onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <EditorWrapper
              sx={{
                '& .rdw-editor-wrapper': {
                  border: '1 !important'
                },
                '& .rdw-editor-toolbar': {
                  p: '0.35rem 4rem !important',
                  '& .rdw-option-wrapper': {
                    minWidth: '1.25rem',
                    borderRadius: '4px !important'
                  },
                  '& .rdw-inline-wrapper, & .rdw-text-align-wrapper': {
                    mb: 0
                  }
                },
                '& .rdw-editor-main': {
                  px: '2.25rem'
                }
              }}
            >
              <ReactDraftWysiwyg
                editorState={messageValue}
                onEditorStateChange={editorState => setMessageValue(editorState)}
                toolbar={{
                  options: ['inline', 'textAlign', 'list', 'colorPicker', 'emoji', 'history'],
                  inline: {
                    inDropdown: false,
                    options: ['bold', 'italic', 'underline', 'strikethrough']
                  }
                }}
              />
            </EditorWrapper>
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
        <Button variant='contained' sx={{ mr: 2 }} type="submit" disabled={loading}>
          {loading ? <CircularProgress size ={24} /> : 'Adicionar'}
        </Button>
        <Button variant='outlined' color='secondary' onClick={onClose}>
          Cancelar
        </Button>
      </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddDocumentDialog
