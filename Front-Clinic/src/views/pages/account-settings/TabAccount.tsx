// ** React Imports
import React, { useState, useEffect, ElementType, ChangeEvent, useContext, forwardRef } from 'react'

import { useDispatch, useSelector } from 'react-redux';

// ** MUI Imports
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Select from '@mui/material/Select'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Button, { ButtonProps } from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import { AppDispatch, RootState } from 'src/store';
import { AuthContext } from 'src/context/AuthContext';
import { EmmitReceiptByType, DocTypeType, ClinicType } from 'src/types/apps/clinicsTypes';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { brazilStates, loadAddressByCEP } from 'src/@core/utils/forms-resources';

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { loadClinic, updateClinic } from 'src/store/apps/clinics';
import dayjs from 'dayjs';
import api from 'src/@core/components/api-client';
import { updateAccount } from 'src/store/apps/account';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import professional, { addProfessional, addProfessionalDentist, updateProfessional } from 'src/store/apps/professional';
import { removerAcentos } from 'src/@core/utils/remover-acentos';
import InputMask from 'react-input-mask';
import Cleave from 'cleave.js/react'
import toast from 'react-hot-toast';
import { DialogTitle, FormLabel, Radio, RadioGroup, Tab, Tabs } from '@mui/material';
import YouTube from 'react-youtube';

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(5),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const CleaveInput = forwardRef(({ options, ...props }: any, ref) => {
  return <Cleave {...props} options={options} htmlRef={ref} />;
});

function PhoneInput(props: any) {
  const { value, onChange, ...rest } = props;

  // Remove caracteres não numéricos
  const digits = value.replace(/\D/g, '');

  // Se tiver 10 dígitos (fixo) => usa 4 + 4
  // Se tiver 11 dígitos (celular) => usa 5 + 4
  const blocks =
    digits.length === 10
      ? [0, 2, 4, 4] // (99) 9999-9999
      : [0, 2, 5, 4]; // (99) 99999-9999

  return (
    <Cleave
      {...rest}
      value={value}
      options={{
        delimiters: ['(', ') ', '-'],
        blocks,
        numericOnly: true
      }}
      onChange={onChange}
    />
  );
}

const TabAccount = () => {
  const [openConfirmSave, setOpenConfirmSave] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [userInput, setUserInput] = useState<string>('yes')
  const [formData, setFormData] = useState<ClinicType>({} as ClinicType)
  const [formAccountData, setFormAccountData] = useState<any>()
  const [profissionalData, setProfissionalData] = useState({ typeCr: '', cro: '', specialty: '', id: '', cpf: '', name: '' });
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const [secondDialogOpen, setSecondDialogOpen] = useState<boolean>(false)
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state.clinic);
  const authContext = useContext(AuthContext);
  const [profilePicFile, setProfilePicFile] = useState<any>(null);
  console.log(authContext.user?.professional);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { checkbox: false } })

  const handleClose = () => setOpenConfirmSave(false)

  const handleSecondDialogClose = () => setSecondDialogOpen(false)

  const onSubmit = () => setOpenConfirmSave(true)

  const [cellPhoneError, setCellPhoneError] = useState<string>('')


function validatePhone(value: string) {
  const onlyDigits = value.replace(/\D/g, '');

  if (/^\d{10,11}$/.test(onlyDigits)) {
    return '';
  }

  return 'Telefone inválido';
}
const userData = JSON.parse(localStorage?.getItem('userData') || '{}');
  

 const handleConfirmSave = async (value: string) => {
  handleClose();
  setUserInput(value);
  if (!formData) return;

  let clinicData = { ...formData };

  const error = validatePhone(formAccountData?.cellPhone ?? '');
  if (error) {
    setCellPhoneError(error);

    return;
  }

  try {
    if (profilePicFile) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', profilePicFile);

      const accountId = userData?.accountId;

      const uploadResponse = await api.post(`/upload/${accountId}`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { url } = uploadResponse.data;

      if (url) {
        setFormData({ ...formData, profilePic: url });
        clinicData = { ...formData, profilePic: url };
      }
    }

    await dispatch(updateClinic(clinicData)).unwrap();
    await dispatch(updateAccount(formAccountData)).unwrap();

    if (
      authContext.user?.professional === '' ||
      (typeof authContext.user?.professional === 'object' &&
        !['recepcionista', 'secretaria'].includes(
          removerAcentos(
            `${authContext.user?.professional?.specialty ?? ''}`
          ).toLowerCase()
        ))
    ) {
      if (profissionalData.id === '') {
        const profissional: any = {
          ...profissionalData,
          email: formAccountData?.email,
          name: formData?.communicationName ?? '',
        };
        delete profissional['id'];
        await dispatch(addProfessionalDentist(profissional)).unwrap();
      } else {
        await dispatch(
          updateProfessional({
            ...profissionalData,
            name: formData?.communicationName ? formData.communicationName : '',
          })
        ).unwrap();
      }
    }

    toast.success('Registro alterado com sucesso!');
  } catch (error) {
    console.error(error);
    toast.error('Erro ao atualizar dados. Verifique os campos e tente novamente.');
  }
};

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => {
        setImgSrc(reader.result as string)
      }
      reader.readAsDataURL(files[0])
      setProfilePicFile(files[0]);

      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const handleInputImageReset = () => {
    setInputValue('')
    setImgSrc('/images/avatars/1.png')
    setProfilePicFile(null);
  }

  const handleFormChange = (field: keyof ClinicType, value: ClinicType[keyof ClinicType]) => {
    const _formData = formData ?? {} as ClinicType;
    setFormData({ ..._formData, [field]: value })
  }

  const handleFormAccountChange = (field: string, value: any) => {
    const _formAccountData = formAccountData ?? {};
    setFormAccountData({ ..._formAccountData, [field]: value })
  }

  const handleFormProfissionalChange = (event: any) => {
    setProfissionalData((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  }

  const fetchAccount = async () => {
    const resp = await api.get('/accounts/me');
    setFormAccountData({ ...authContext.user, ...resp.data });
  }

  const fetchDentistData = async (email: string) => {
    const { data } = await api.get('/professionals/email/' + email);
    if (typeof data === 'object') {
      setProfissionalData({ id: data.id, cro: data.cro, specialty: data.specialty, typeCr: data.typeCr, cpf: data.cpf, name: data.name });
    }
  }

  useEffect(() => {
    //carregar dados da clinica
    const clinicId = authContext.user?.clinicId;
    const email = authContext.user?.email;
    const type = authContext.user?.type;
    if (clinicId) {
      fetchAccount();
      setFormAccountData(authContext);
      dispatch(loadClinic(clinicId));
    }
    if (email) {
      fetchDentistData(email);
    }
  }, [authContext, dispatch]);

  useEffect(() => {
    if (store.clinic) {
      setFormData(store.clinic);
      if (store.clinic.profilePic) {
        setImgSrc(store.clinic.profilePic);
      }
    }
  }, [store.clinic, setFormData]);

  useEffect(() => {
    if (formData?.cep && formData?.cep.length == 10) {
      const cep = formData?.cep.replace(/\D/g, '');
      loadAddressByCEP(cep).then((address) => {
        if (address) {
          const { logradouro, bairro, localidade, uf } = address;
          let addressData = { street: logradouro, neighborhood: bairro, city: localidade, state: '' };
          if (uf in brazilStates) {
            addressData = { ...addressData, state: brazilStates[uf as keyof typeof brazilStates] };
          }
          setFormData({ ...formData, ...addressData });
        }
      });
    }
  }, [formData?.cep]);

  function formatCep(cep: string): string {
    const numericCep = cep.replace(/\D/g, '');
    const formattedCep = numericCep.replace(/(\d{0,2})(\d{0,3})(\d{0,2})/, function (_, p1, p2, p3) {
      let result = '';

      if (p1) result += p1;
      if (p2) result += `.${p2}`;
      if (p3) result += `-${p3}`;

      return result;
    });

    return formattedCep;
  }

  function handleWhatsappNumber(event: any){
    let value = event.target.value;
    
    // Remove tudo o que não é dígito
    value = value.replace(/\D/g, '');
    
    // Limita o número de caracteres a 11 dígitos (incluindo o DDD)
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    // Aplica a máscara de telefone: (99) 99999-9999
    if (value.length <= 10) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
      handleFormChange('whatsappNumber', value)
   }

   const [openModal, setOpenModal] = useState(false);
   
      const toggleVideo = () => {
       setOpenModal(true); 
     };
   
     const handleCloseVideo = () => {
       setOpenModal(false); 
     };
   
      const opts = {
       height: '390',
       width: '100%', 
       playerVars: {
         autoplay: 1,
       },
     };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
              <Grid item sx={{ ml: 3, p: 3 }}>
                <Typography variant="h5" component="h2">
                  Cadastro da Clínica
                </Typography>
              </Grid> 
            <Button sx={{ mb: 2, display: 'flex', alignItems: 'center' }} onClick={() => toggleVideo()}>
              <YouTubeIcon color='error' />
              VÍDEOS
            </Button>
          </Box>

          <form>
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}> 
                <ImgStyled src={imgSrc} alt='Profile Pic' />
                <div>
                  <ButtonStyled component='label' variant='outlined' htmlFor='account-settings-upload-image'>
                    Atualizar Logo
                    <input
                      hidden
                      type='file'
                      value={inputValue}
                      accept='image/png, image/jpeg'
                      onChange={handleInputImageChange}
                      id='account-settings-upload-image'
                    />
                  </ButtonStyled>
                  <Typography sx={{ mt: 5, color: 'text.disabled' }}>
                    PNG ou JPEG permitidos. Tamanho máximo de 800K.
                  </Typography>
                </div>
              </Box>
              { 
                (
                  authContext.user?.professional === '' || 
                  (
                    typeof authContext.user?.professional === 'object' &&
                    !['recepcionista', 'secretaria'].includes(removerAcentos(`${authContext.user?.professional ? authContext.user?.professional.specialty : ''}`).toLowerCase())
                  )
                ) && 
                (
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <Tabs value={0} variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='tabs'>
                      <Tab label='DADOS DO RESPONSÁVEL TÉCNICO' />
                    </Tabs>
                  </Grid>

                  <Grid item xs={12}>
                      <TextField
                          fullWidth
                          label='Nome'
                          placeholder='Nome'
                          value={formData?.communicationName ?? ''}
                          onChange={e => handleFormChange('communicationName', e.target.value)}
                      />
                  </Grid>

                  <Grid container item xs={12} spacing={6}>
                      <Grid item xs={12} sm={4}>
                          <TextField
                              fullWidth
                              label='Especialidade'
                              variant='outlined'
                              name='specialty'
                              value={profissionalData.specialty ?? ''}
                              onChange={handleFormProfissionalChange}
                          />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                              <InputLabel id="typeCr-label">Tipo Inscrição</InputLabel>
                              <Select
                                  labelId="typeCr-label"
                                  label='Tipo Inscrição'
                                  value={profissionalData.typeCr ?? 'crm'}
                                  name='typeCr'
                                  onChange={handleFormProfissionalChange}
                              >
                                  <MenuItem value='crm'>CRM</MenuItem>
                                  <MenuItem value='cro'>CRO</MenuItem>
                                  <MenuItem value='crefito'>CREFITO</MenuItem>
                                  <MenuItem value='crbm'>CRBM</MenuItem>
                                  <MenuItem value='crf'>CRF</MenuItem>
                                  <MenuItem value='coren'>COREN</MenuItem>
                                  <MenuItem value='crn'>CRN</MenuItem>
                                  <MenuItem value='crbio'>CRBio</MenuItem>
                    </Select>
                          </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                          <TextField
                              fullWidth
                              label='Inscrição'
                              variant='outlined'
                              name='cro'
                              value={profissionalData.cro}
                              onChange={handleFormProfissionalChange}
                          />
                      </Grid>
                  </Grid>

                  <Grid container item xs={12} spacing={6}>
                      <Grid item xs={12} sm={6}>
                          <InputMask
                              mask="999.999.999-99"
                              value={profissionalData.cpf}
                              onChange={(e) => {
                                  const event = {
                                      target: {
                                          name: 'cpf',
                                          value: e.target.value.replace(/\D/g, ''),
                                      },
                                  };
                                  handleFormProfissionalChange(event);
                              }}
                          >
                              {(inputProps) => (
                                  <TextField
                                      {...inputProps}
                                      fullWidth
                                      label="CPF"
                                      name="cpf"
                                  />
                              )}
                          </InputMask>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
                              <DatePicker
                                  label='Data de nascimento'
                                  format='DD/MM/YYYY'
                                  value={dayjs(formData?.birthday)}
                                  onChange={newValue => {
                                      handleFormChange('birthday', newValue?.toISOString().split('T')[0]);
                                  }}
                                  slotProps={{ textField: { fullWidth: true } }}
                              />
                          </LocalizationProvider>
                      </Grid>
                  </Grid>
              </Grid>
                ) 
              }
            </CardContent>
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Tabs value={0} variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='tabs'>
                      <Tab label='CONTA' />
                    </Tabs>
                  </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Email'
                    placeholder='Email'
                    value={formAccountData?.email ?? ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
               <TextField
                  fullWidth
                  label="Fone"
                  placeholder="(99) 99999-9999"
                  value={formAccountData?.cellPhone ?? ''}
                  onChange={e => handleFormAccountChange('cellPhone', e.target.value)}
                  onBlur={e => setCellPhoneError(validatePhone(e.target.value))}
                  error={!!cellPhoneError}
                  helperText={cellPhoneError}
                  InputProps={{
                    inputComponent: PhoneInput
                  }}
                />
              </Grid>
                {/* <Grid item xs={12}>
                  <CardHeader title='Integração com Whatsapp' />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Número"
                    placeholder="Número"
                    value={formData?.whatsappNumber ?? ''}
                    inputProps={{ maxLength: 15 }}
                    onChange={handleWhatsappNumber}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label='URL da API'
                    placeholder='URL da API'
                    value={formData?.whatsappApiUrl ?? ''}
                    onChange={e => handleFormChange('whatsappApiUrl', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label='Token da API'
                    placeholder='Token da API'
                    value={formData?.whatsappApiToken ?? ''}
                    onChange={e => handleFormChange('whatsappApiToken', e.target.value)}
                  />
                </Grid> */}
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <Tabs value={0} variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='tabs'>
                      <Tab label='FISCAL' />
                    </Tabs>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <FormControl fullWidth>
                    <InputLabel>Emitir Recibo em nome de</InputLabel>
                    <Select
                      label='Emitir Recibo em nome da'
                      value={formData?.emmitReceiptBy ?? ''}
                      onChange={e => handleFormChange('emmitReceiptBy', e.target.value)}
                    >
                      <MenuItem value=''>Selecione</MenuItem>
                      <MenuItem value='clinic'>Clínica</MenuItem>
                      <MenuItem value='dentist'>Dentista</MenuItem>
                      <MenuItem value='professional'>Médico</MenuItem>
                      <MenuItem value='aesthetic'>Estética</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <Tabs value={0} variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='tabs'>
                      <Tab label='INFORMAÇÕES DA CLÍNICA' />
                    </Tabs>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Nome da Clínica'
                    placeholder='Nome da Clínica'
                    value={formData?.name ?? ''}
                    onChange={e => handleFormChange('name', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={typeof formData?.emmitReceiptBy !== 'undefined' && ['professional', 'dentist'].includes(formData.emmitReceiptBy ?? '') ? 'CPF do Profissional' : 'CNPJ da Clínica'}
                    placeholder='CNPJ da Clínica'
                    value={formData?.docNumber ?? ''}
                    InputProps={{
                      inputComponent: Cleave as any,
                    }}
                    inputProps={{
                      options: {
                        delimiters: ['.', '.', '-', '/'],
                        blocks: formData?.emmitReceiptBy === 'professional' || formData?.emmitReceiptBy === 'dentist'
                          ? [3, 3, 3, 2] //CPF
                          : [2, 3, 3, 4, 2], //CNPJ
                        numericOnly: true,
                      },
                    }}
                    onChange={(e) => handleFormChange('docNumber', e.target.value.replace(/\D/g, ''))}
                  />
                </Grid>
               
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Horário de abertura da Clínica'
                    placeholder='Horário de abertura da Clínica'
                    value={formData?.openHour ?? ''}
                    type='time'
                    onChange={e => handleFormChange('openHour', e.target.value)}
                  />
                </Grid>

                 <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Horário de Fechamento da Clínica'
                    placeholder='Horário de Fechamento da Clínica'
                    value={formData?.closeHour ?? ''}
                    type='time'
                    onChange={e => handleFormChange('closeHour', e.target.value)}
                  />
                </Grid>


                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Responsável pela Clínica'
                    placeholder='Responsável pela Clínica'
                    value={formData?.responsibleName ?? ''}
                    onChange={e => handleFormChange('responsibleName', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Tempo de visualização na agenda (minutos)</FormLabel>
                    <RadioGroup
                      row
                      name="calendarSchedule"
                      value={formData.calendarSchedule || '15'} 
                      onChange={(e) => handleFormChange('calendarSchedule', e.target.value)}
                    >
                      <FormControlLabel value="05" control={<Radio />} label="5" />
                      <FormControlLabel value="10" control={<Radio />} label="10" />
                      <FormControlLabel value="15" control={<Radio />} label="15" />
                      <FormControlLabel value="20" control={<Radio />} label="20" />
                      <FormControlLabel value="30" control={<Radio />} label="30" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
               
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Fuso Horário</InputLabel>
                    <Select
                      label='Fuso Horário'
                      value={formData?.timezone ?? ''}
                      onChange={e => handleFormChange('timezone', e.target.value)}
                    >
                      <MenuItem value='gmt-03'>(GMT-03:00) Brasília - DF (BRT)</MenuItem>
                      <MenuItem value='gmt-12'>(GMT-12:00) International Date Line West</MenuItem>
                      <MenuItem value='gmt-11'>(GMT-11:00) Midway Island, Samoa</MenuItem>
                      <MenuItem value='gmt-10'>(GMT-10:00) Hawaii</MenuItem>
                      <MenuItem value='gmt-09'>(GMT-09:00) Alaska</MenuItem>
                      <MenuItem value='gmt-08'>(GMT-08:00) Pacific Time (US & Canada)</MenuItem>
                      <MenuItem value='gmt-08-baja'>(GMT-08:00) Tijuana, Baja California</MenuItem>
                      <MenuItem value='gmt-07'>(GMT-07:00) Chihuahua, La Paz, Mazatlan</MenuItem>
                      <MenuItem value='gmt-07-mt'>(GMT-07:00) Mountain Time (US & Canada)</MenuItem>
                      <MenuItem value='gmt-06'>(GMT-06:00) Central America</MenuItem>
                      <MenuItem value='gmt-06-ct'>(GMT-06:00) Central Time (US & Canada)</MenuItem>
                      <MenuItem value='gmt-06-mc'>(GMT-06:00) Guadalajara, Mexico City, Monterrey</MenuItem>
                      <MenuItem value='gmt-06-sk'>(GMT-06:00) Saskatchewan</MenuItem>
                      <MenuItem value='gmt-05'>(GMT-05:00) Bogota, Lima, Quito, Rio Branco</MenuItem>
                      <MenuItem value='gmt-05-et'>(GMT-05:00) Eastern Time (US & Canada)</MenuItem>
                      <MenuItem value='gmt-05-ind'>(GMT-05:00) Indiana (East)</MenuItem>
                      <MenuItem value='gmt-04'>(GMT-04:00) Atlantic Time (Canada)</MenuItem>
                      <MenuItem value='gmt-04-clp'>(GMT-04:00) Caracas, La Paz</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
               
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <Tabs value={0} variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='tabs'>
                      <Tab label='LOCALIZAÇÃO' />
                    </Tabs>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='CEP'
                    placeholder='CEP'
                    value={formatCep(formData?.cep ?? '')}
                    onChange={e => handleFormChange('cep', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Rua'
                    placeholder='Rua'
                    value={formData?.street ?? ''}
                    onChange={e => handleFormChange('street', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Número'
                    placeholder='Número'
                    value={formData?.addressNumber ?? ''}
                    onChange={e => handleFormChange('addressNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Complemento'
                    placeholder='Complemento'
                    value={formData?.addressComplement ?? ''}
                    onChange={e => handleFormChange('addressComplement', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Bairro'
                    placeholder='Bairro'
                    value={formData?.neighborhood ?? ''}
                    onChange={e => handleFormChange('neighborhood', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Cidade'
                    placeholder='Cidade'
                    value={formData?.city ?? ''}
                    onChange={e => handleFormChange('city', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Estado'
                    placeholder='Estado'
                    value={formData?.state ?? ''}
                    onChange={e => handleFormChange('state', e.target.value)}
                  />
                </Grid>
              </Grid>
              {/* {store.updatedClinic &&
                <Alert sx={{ mb: 2, mt: 4 }} severity="success">Clinica atualizada com sucesso!</Alert>
              } */}
            </CardContent>
          </form>
        </Card>
      </Grid>
      <Grid item xs={12} display='flex' justifyContent='space-between'>
        <ButtonStyled type='submit' variant='outlined' onClick={handleSubmit(onSubmit)}>
          Salvar
        </ButtonStyled>
        {/* <ResetButtonStyled type='button' variant='contained' color='error' onClick={handleInputImageReset}>
          Reset
        </ResetButtonStyled> */}
      </Grid>

      {/* Delete Account Card */}
      {/* <Grid item xs={12}>
        <Card>
          <CardHeader title='Delete Account' />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 4 }}>
                <FormControl>
                  <Controller
                    name='checkbox'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <FormControlLabel
                        label='I confirm my account deactivation'
                        sx={errors.checkbox ? { '& .MuiTypography-root': { color: 'error.main' } } : null}
                        control={
                          <Checkbox
                            {...field}
                            size='small'
                            name='validation-basic-checkbox'
                            sx={errors.checkbox ? { color: 'error.main' } : null}
                          />
                        }
                      />
                    )}
                  />
                  {errors.checkbox && (
                    <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-checkbox'>
                      Please confirm you want to delete account
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Button variant='contained' color='error' type='submit' disabled={errors.checkbox !== undefined}>
                Deactivate Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid> */}

      <Dialog open={openConfirmSave} keepMounted onClose={handleClose}>
        <DialogContent>Tem certeza de que deseja salvar as alterações?</DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='error'>
            Cancelar
          </Button>
          <Button onClick={() => handleConfirmSave('yes')} color='primary'>
            Sim
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={secondDialogOpen} keepMounted onClose={handleSecondDialogClose}>
        <DialogContent>{`As alterações foram salvas com sucesso? (${userInput})`}</DialogContent>
        <DialogActions>
          <Button onClick={handleSecondDialogClose} color='error'>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openModal} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Assistir Vídeo</DialogTitle>
        <DialogContent>
          <YouTube opts={opts} videoId={'cEDUQGdGJ1k'} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVideo} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default TabAccount