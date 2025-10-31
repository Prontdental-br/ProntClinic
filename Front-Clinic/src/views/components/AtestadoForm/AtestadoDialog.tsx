import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Checkbox,
  List,
  ListItem,
  ListItemText
} from '@mui/material'

import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import profissionais from './mocks/profissionais.json'
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import api from 'src/@core/components/api-client';
import dayjs, { Dayjs } from 'dayjs';
import { CidData, searchByName } from 'src/common/cid';
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast';

interface AtestadoDialogProps {
  open: boolean
  onClose: () => void
  patientId?: string
  fetchData?: () => void
  editingData: null | any
}

const AtestadoDialog: React.FC<AtestadoDialogProps> = ({ open, onClose, fetchData, patientId, editingData }) => {
  const { user }: { user: any } = useAuth();
  const [startTime, setStartTime] = useState<Dayjs | null>();
  const [endTime, setEndTime] = useState<Dayjs | null>();
  const [radio, setRadio] = React.useState('dias');
  const [showDialog, setShowDialog] = useState(open);
  const [dialogMessages, setDialogMessages] = useState<string[]>([]);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [newCertificate, setNewCertificate] = useState<any>({ 
    startDate: new Date(),
    professional: '',
    speciality: '',
    cro: '',
    typeCr: '',
    cpf: '',
    isDeclared: false,
    schoolStatement: false
  });
  const [cidSuggestions, setCidSuggestions] = useState<CidData[]>([]);

  const getProfessionalData = async (email: string) => {
    const { data } = await api.get('/professionals/email/' + email);
    if (typeof data === 'object') {
      setNewCertificate((prevState: any) => ({ ...prevState, cro: data.cro, speciality: data.specialty, typeCr: data.typeCr, professional: data.name, cpf: data.cpf }));
    }
  }

  useEffect(() => {
    if (user?.email) {
      getProfessionalData(user?.email);
    }
  }, [])

 useEffect(() => {
     if (open === true) {
       const messages: string[] = [];
       if (newCertificate.cro === '') {
         messages.push('Verifique se a inscrição está preenchida');
       }
       if (newCertificate.speciality === '') {
         messages.push('Verifique se a especialidade está preenchida');
       }
       if (newCertificate.professional === '') {
         messages.push('Verifique se o nome está preenchido');
       }
       if (newCertificate.typeCr === '') {
         messages.push('Verifique se o tipo de inscrição está preenchido');
       }
       if (newCertificate.cpf === '') {
         messages.push('Verifique se o cpf está preenchido');
       }
   
       if (messages.length > 0) {
         setDialogMessages(messages);
         setShowValidationDialog(true);
 
         return;
       }
   
       setShowDialog(true);
 
       return;
     }
   
     onClose();
     setShowDialog(open);
   }, [open]);

  useEffect(() => {
    if (editingData !== null) {
      if (editingData.startTime) {
        const start = new Date();
        const [hour, minute] = editingData.startTime.split(':');
        start.setHours(parseInt(hour));
        start.setMinutes(parseInt(minute));
        setRadio('horas');
        setStartTime(dayjs(start));
      }
      if (editingData.endTime) {
        const end = new Date();
        const [hour, minute] = editingData.endTime.split(':');
        end.setHours(parseInt(hour));
        end.setMinutes(parseInt(minute));
        setRadio('horas')
        setEndTime(dayjs(end));
      }
      setNewCertificate({ ...editingData, startDate: editingData.startDate ? new Date(editingData.startDate) : new Date(editingData.created_at)});
    }
  }, [editingData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cid' && value.length >= 2) {
      const data = searchByName(value);
      setCidSuggestions(data);
    } else {
      setCidSuggestions([]); 
    }
    setNewCertificate({ ...newCertificate, [name]: value })
  }

  function selectCid(value: string) {
    setNewCertificate({ ...newCertificate, cid: value });
    setCidSuggestions([]);
  }

  function closeDialog() {
    clearForm();
    onClose();
  }

  function handleSaveDate(date: Date) {
    setNewCertificate((prevState: any) => ({ ...prevState,  startDate: date}));
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    setRadio((event.target as HTMLInputElement).value);

    const { name, checked } = event.target;
    setNewCertificate((prev: any) => ({
      ...prev,
      [name]: checked,
    }));

  };

  const clearForm = () => {
    setStartTime(null);
    setEndTime(null);
    setRadio('dias');
    setNewCertificate({
      startDate: new Date(),
      speciality: newCertificate.speciality,
      cro: newCertificate.cro,
      typeCr: newCertificate.typeCr,
      professional: newCertificate.professional,
    });
  }

  const onSubmit = (event: any) => {
    event.preventDefault(); // Evita que a página seja recarregada

    setLoading(true);

    const data: any = {...newCertificate,  isDeclared: newCertificate.schoolStatement || newCertificate.isDeclared };

    data["startTime"] = startTime?.format?.('HH:mm');
    data["endTime"] = endTime?.format?.('HH:mm');
    data['startDate'] = newCertificate.startDate;
    if (editingData) {
      api.put(`/certificate/${editingData.id}`, { patientId, ...data })
        .then(resp => {
          if (fetchData)
            fetchData();
          onClose();
          clearForm();
        })
         toast.success('Atestado editado com sucesso!');
    } else {
      api.post('/certificate', { patientId, ...data })
        .then(resp => {
          if (fetchData)
            fetchData();
         toast.success('Atestado gerado e emitido com sucesso!');
          clearForm();
  
        const documentId = resp?.data?.id;

        if (documentId) {
          api.post('/contracts-signature', {
            documentType: 'atestado',
            documentId: documentId,
          });
          setLoading(false);
          onClose();
        }
      })

    }

  }

  return (
    <>
  
    <Dialog open={showDialog} onClose={closeDialog}>
      <form onSubmit={onSubmit}>
        <DialogTitle>Emitir atestado</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin='normal'>
            <TextField fullWidth margin='normal' label='Profissional' name="professional" variant='outlined' value={newCertificate?.professional} onChange={handleInputChange} disabled={true} />
          </FormControl>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin='normal'
              label='Especialidade'
              variant='outlined'
              name='speciality'
              value={newCertificate?.speciality}
              disabled={true}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
          <InputLabel id='form-layouts-separator-select-label'>Tipo de documento</InputLabel>
            <Select
              label='Tipo de inscrição'
              value={newCertificate?.typeCr}
              disabled={true}
              name='typeCr'
              onChange={(e: any) => handleInputChange(e)}
            >
              <MenuItem value=''></MenuItem>
              <MenuItem value='cro'>CRO</MenuItem>
              <MenuItem value='crm'>CRM</MenuItem>
              <MenuItem value='crefito'>CREFITO</MenuItem>
              <MenuItem value='crbm'>CRBM</MenuItem>
              <MenuItem value='crf'>CRF</MenuItem>
              <MenuItem value='coren'>COREN</MenuItem>
              <MenuItem value='crn'>CRN</MenuItem>
              <MenuItem value='crbio'>CRBio</MenuItem>
            </Select>
            <TextField
              fullWidth
              margin='normal'
              label='Inscrição'
              variant='outlined'
              name='cro'
              disabled={true}
              value={newCertificate?.cro}
              onChange={handleInputChange}
            />
            <DatePickerWrapper>
              <DatePicker
                id='event-start-date'
                name='startDate'
                dateFormat={'dd/MM/yyyy'}
                customInput={
                  <TextField
                    label='Data'
                    fullWidth
                    sx={{ width: '100%' }}
                  />
                }
                
                selected={ newCertificate?.startDate }
                value={ newCertificate?.startDate }
                onChange={ handleSaveDate }
                onSelect={ handleSaveDate }
              />
            </DatePickerWrapper>     
          </Grid>
          <RadioGroup row value={radio}
            onChange={handleChange}>
            <FormControlLabel value='dias' control={<Radio />} label='Atestado para dias' />
            <FormControlLabel value='horas' control={<Radio />} label='Atestado para horas' />
            <FormControlLabel
              label={'Declaração'}
              sx={{ mb: 0.5 }}
              control={<Checkbox
                size='small'
                name='isDeclared'
                checked={newCertificate.isDeclared || false}
                onChange={(value) => handleChange(value)}
                sx={{ mb: -2, mt: -1.75, ml: -1.75 }}
              />}
            />
            <FormControlLabel
              label={'Declaração Escolar'}
              sx={{ mb: 3, ml: 0 }}
              control={<Checkbox
                size='small'
                name='schoolStatement'
                checked={newCertificate.schoolStatement || false}
                onChange={handleChange}
                sx={{ mb: -2, mt: -1.75, ml: -1.75 }}
              />}
            />
          </RadioGroup>
          {/*<TextField
          fullWidth
          margin='normal'
          type='date'
          label='Data'
          variant='outlined'
          InputLabelProps={{ shrink: true }}
            />*/}
          <Grid position='relative'>
            <InputLabel style={ { marginBottom: '3px' } } id='form-layouts-separator-select-label'>Informar as 4 primeiras letras do CID</InputLabel>
            <TextField fullWidth margin='none' label='CID - Classificação Internacional de Doenças' name="cid" variant='outlined' value={newCertificate?.cid} onChange={handleInputChange} />
            { cidSuggestions.length > 0 && (
              <Grid zIndex={3} gap={1} style={{ display: 'flex', flexDirection: 'column', position: 'absolute', overflowY: 'scroll', height: '90px', width: '100%' }}>
                {cidSuggestions.map((element) => (
                  <Button fullWidth onClick={ () => selectCid(element.codigo) } variant="contained" key={ element.codigo }>{`${element.nome} - ${element.codigo}`}</Button>
                ))}
              </Grid>
            ) }
          </Grid>
          {radio === 'dias' ? <TextField fullWidth margin='normal' type='number' label='Quantidade de dias' name="days" variant='outlined' value={newCertificate?.days} onChange={handleInputChange} /> :
            <Grid style={{ display: 'flex', flexDirection: 'row', marginTop: 15 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker label="Hora inicial" onChange={(newValue) => {
                  console.log(newValue);
                  setStartTime(newValue)
                  }} value={startTime} ampm={false} />
                <TimePicker label="Hora final" onChange={(newValue) => setEndTime(newValue)} value={endTime} ampm={false} />
              </LocalizationProvider>
            </Grid>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button variant='contained' color='primary' type="submit">
            {editingData ? 'Editar atestado' : 'Gerar atestado'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>

    <Dialog open={showValidationDialog} onClose={() => setShowValidationDialog(false)}>
      <DialogTitle>Sem permissão para emitir atestado</DialogTitle>
      <DialogContent dividers>
        <List>
          {dialogMessages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText primary={msg} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          sx={{ marginTop: 2 }}
          onClick={() => {
            setShowValidationDialog(false);
    
            router.push('/pages/account-settings/account/');
          }}
        >
          Ir para aba Clínica
        </Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default AtestadoDialog
