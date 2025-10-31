'use client'

// BARRA LATERAL
// ** React Imports
import { useState, ChangeEvent, ElementType, useEffect } from 'react'
import toast from 'react-hot-toast';

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button, { ButtonProps } from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogContentText from '@mui/material/DialogContentText'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import UserSuspendDialog from 'src/views/apps/user/view/UserSuspendDialog'
import UserSubscriptionDialog from 'src/views/apps/user/view/UserSubscriptionDialog'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import { PatientDataType, UsersType } from 'src/types/apps/userTypes'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import CustomWhatsAppChip from 'src/views/components/CustomWhatsAppChip'
import DialogUploadImagem from 'src/views/components/DialogUploadImagem'
import { PlanMap } from 'src/store/apps/patient'
import moment from 'moment'
import ModalAddPacient from 'src/views/components/ModalAddPacient'
import { PatientType } from 'src/types/apps/budgetTypes'
import api from 'src/@core/components/api-client'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface ColorsType {
  [key: string]: ThemeColor
}

interface Props {
  id: string
  tab: string
  dataPatient: PatientDataType
  refreshPatient?: () => void;
}

const data: UsersType = {
  id: 1,
  role: 'admin',
  status: 'ATIVO',
  username: 'gslixby0',
  avatarColor: 'primary',
  country: 'El Salvador',
  company: 'Yotz PVT LTD',
  contact: '(479) 232-9151',
  currentPlan: 'enterprise',
  fullName: 'Daisy Patterson',
  email: 'gslixby0@abc.net.au',
  avatar: '/images/avatars/user_profile.webp'

  // avatar: '/images/avatars/1.png'
}

const statusColors: ColorsType = {
  ATIVO: 'success',
  pending: 'warning',
  INATIVO: 'secondary'
}

// ** Styled <sup> component
const Sup = styled('sup')(({ theme }) => ({
  top: '0.2rem',
  left: '-0.6rem',
  position: 'absolute',
  color: theme.palette.primary.main
}))

// ** Styled <sub> component
const Sub = styled('sub')({
  fontWeight: 300,
  fontSize: '1rem',
  alignSelf: 'flex-end'
})

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginBottom: 10,
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const menAvatar = ['1','3','5','7'];
const womenAvatar = ['2','4','6','8'];

const UserViewLeft = ({ id, tab, dataPatient, refreshPatient }: Props) => {
  // ** States
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openPlans, setOpenPlans] = useState<boolean>(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState<boolean>(false)
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState<boolean>(false)
  const [treatments, setTreatments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false)

  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/user_profile.webp')
  const [inputValue, setInputValue] = useState<string>('')
  const [plans, setPlans] = useState([]);

  // Handle Edit dialog
  const handleEditClickOpen = () => setOpenEdit(true)
  const handleEditClose = () => setOpenEdit(false)

  // Handle Upgrade Plan dialog
  const handlePlansClickOpen = () => setOpenPlans(true)
  const handlePlansClose = () => setOpenPlans(false)
  const [profilePicFile, setProfilePicFile] = useState<any>(null);

  const [openModalCouncil, setOpenModalCouncil] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false)
  const [insurance, setInsurance] = useState<{ insuranceName: string; insuranceNumber: number  }>();
  const userData = JSON.parse(localStorage?.getItem('userData') || '{}');

  const handleDialogModalInsurance = () => {
    setOpenModalCouncil(!openModalCouncil);
  }


  const handleDialogOpen = () => {
    console.log('Imagens carregadas:', dialogOpen)
    setDialogOpen(!dialogOpen)
  }

  const handleInputImageChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])
      setProfilePicFile(files[0])

      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const handleUpload = (images: string[]) => {
    console.log('Imagens carregadas:', images)
  }

  const fetchDataAsync = async () => {
    try {
      const { data } = await api.get('/budget-items')
      setTreatments(data)
    } catch (error) {
      console.error('Error fetching patient data:', error)
    }
  }

  useEffect(() => {
    fetchDataAsync();
  },[]);

  useEffect(() => {
    if(dataPatient?.avatar){
      if(parseInt(dataPatient.avatar)){
        setImgSrc('/images/avatars/' + dataPatient.avatar + '.png');
      }else{
        setImgSrc(dataPatient.avatar)
      }
    }
    
  }, [dataPatient])

  function getRandomItem(arr: any[]) {
    const randomIndex = Math.floor(Math.random() * arr.length);    
    const item = arr[randomIndex];

    return item;
  }

  const handleSavePatientData = async (data: PatientType) => {
    
    if(dataPatient.gender !== data.gender){
      let avatarValue: string | null = null;
      if(data.gender == 'Masculino'){
        avatarValue = getRandomItem(menAvatar);
      }else if(data.gender == 'Feminino'){
        avatarValue = getRandomItem(womenAvatar);
      }

      if(avatarValue){
        data = {...data, avatar: avatarValue};
      }
    }


    const response = await api.patch('patients/' + dataPatient.id, data);
    
    const {status} = response;
    
    if(status != 200){
      console.log('Erro ao atualizar paciente')
    }

    if (refreshPatient) {
      console.log('EXECUTOU REFRESH')
      refreshPatient();  
    }

  };


  async function handleSaveProfilePicture() {
  if (!profilePicFile) {
     toast('Nenhuma imagem selecionada.', { icon: '⚠️' });
    
return;
  }

  try {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', profilePicFile);

    // Substitua pelo ID da conta (accountId), que você deve ter no contexto
    const accountId = userData?.accountId;

    // Faz o upload para o endpoint da sua API
    const uploadResponse = await api.post(`/upload/${accountId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { url } = uploadResponse.data;

    if (url) {
      const response = await api.patch(`patients/${dataPatient.id}`, {
        avatar: url,
      });

      if (response) {
        toast.success('Avatar salvo com sucesso!');
      } else {
        toast.error('Erro ao salvar avatar.');
      }
    }
  } catch (error) {
    console.error('Erro no upload:', error);
    toast.error('Erro no upload. Tente novamente.');
  } finally {
    setLoading(false);
    setProfilePicFile(null);
  }
}


  const schemaCouncil = yup.object({
    insuranceNumber: yup.string()
    .max(25, 'Número do convênio deve ter no máximo 25 dígitos')
    .required('Número do convênio é obrigatório'),
    insuranceName: yup.string().required('Nome é obrigatório'),
  }).required();

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<{ insuranceNumber: number, insuranceName: string }>({
    resolver: yupResolver(schemaCouncil),
  });


  async function fetchPatientInsurance(){
    try {
      const response = await api.get("patients/" + dataPatient?.id);
      
      setInsurance({ insuranceName: response.data.insuranceName || "", insuranceNumber: response.data.insuranceNumber || 0  })
    

    } catch (error) {
      console.log(error);
    }
   

  }

  useEffect(() => {
    fetchPatientInsurance()
  }, [])

  console.log(insurance)

  const onSubmit = async (data: { insuranceNumber: number, insuranceName: string }) => {
    setLoading(true);

    try {
      const response = await api.patch('patients/' + dataPatient?.id, data);

      if(response) {
        await fetchPatientInsurance();
        toast.success('Dados do convênio atualizados com sucesso!');
      }

    } catch (error) {
      console.error('Erro ao atualizar os dados:', error);
      toast.error('Erro ao atualizar dados do convênio.');
    } finally {
      setLoading(false);
      handleDialogModalInsurance(); // Fecha o modal
    }
  };

  const handleCancel = () => {
   
    handleDialogModalInsurance(); // Fecha o modal
  };

  if (data) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ pt: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              {data.avatar ? (
                <ImgStyled src={imgSrc} alt='Profile Pic' />
              ) : (
                <CustomAvatar
                  skin='light'
                  variant='rounded'
                  color={data.avatarColor as ThemeColor}
                  sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
                >
                  {getInitials(data.fullName)}
                </CustomAvatar>
              )}
              <Typography variant='h6' sx={{ mb: 2 }}>
                {dataPatient?.name}
              </Typography>

              <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
                <ButtonStyled component='label' variant='contained' htmlFor='avatar-settings-upload-image' sx={{ backgroundColor: theme => `${theme.palette.primary.main} !important` }}>
                  Atualizar Avatar
                  <input
                    hidden
                    type='file'
                    value={inputValue}
                    accept='image/png, image/jpeg'
                    onChange={handleInputImageChange}
                    id='avatar-settings-upload-image'
                  />
                </ButtonStyled>
                {profilePicFile && (
                  <Button variant="contained" sx={{ml: 4}} color="success" onClick={handleSaveProfilePicture} disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Salvar'}</Button>
                )}
              </CardActions>
            </CardContent>
            <CardContent sx={{ my: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* <Box sx={{ mr: 8, display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar skin='light' variant='rounded' sx={{ mr: 3 }}>
                    <Icon icon='mdi:currency-usd' />
                  </CustomAvatar>
                  <div>
                    <Typography sx={{ lineHeight: 1.3 }}>R$ 6.968,00</Typography>
                    <Typography variant='body2'>Total Gasto</Typography>
                  </div>
                </Box> */}
                {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar skin='light' variant='rounded' sx={{ mr: 3 }}>
                    <Icon icon='mdi:list-box' />
                  </CustomAvatar>
                  <div>
                    <Typography sx={{ lineHeight: 1.3 }}>16</Typography>
                    <Typography variant='body2'>Procedimentos</Typography>
                  </div>
                </Box> */}
              </Box>
            </CardContent>

            <CardContent>
              <Typography variant='h6'>Dados do Paciente</Typography>
              <Divider sx={{ mt: theme => `${theme.spacing(4)} !important` }} />
              <Box sx={{ pt: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                    E-mail:
                  </Typography>
                  <Typography variant='body2'>{dataPatient?.email || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                    Status:
                  </Typography>
                  <CustomChip
                    skin='light'
                    size='small'
                    label={data.status}
                    color={statusColors[data.status]}
                    sx={{
                      height: 20,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      borderRadius: '5px',
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Idade:</Typography>
                  <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                    {dataPatient?.birthDate && moment().diff(dataPatient?.birthDate, 'years')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Data de Nascimento:</Typography>
                  <Typography variant='body2'>
                    {dataPatient?.birthDate && moment(dataPatient?.birthDate).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Contato:</Typography>
                  {/* <CustomWhatsAppChip phoneNumber={dataPatient?.cellPhone.replaceAll(' ', '')} /> */}
                   <CustomWhatsAppChip phoneNumber={dataPatient?.cellPhone ? dataPatient?.cellPhone.replaceAll(' ', '') : ''} />
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Plano:</Typography>
                  <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>{dataPatient?.planType}</Typography>
                </Box>
                <Box sx={{ display: 'flex' }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Sexo:</Typography>
                  <Typography variant='body2'> {dataPatient?.gender} </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant='contained' sx={{ mr: 2, backgroundColor: theme => `${theme.palette.primary.main} !important` }} onClick={handleEditClickOpen}>
                EDITAR
              </Button>
              {/* <Button color='error' variant='outlined' onClick={() => setSuspendDialogOpen(true)}>
                DESATIVAR
              </Button> */}
            </CardActions>
            { openEdit && (
            <ModalAddPacient
              id={dataPatient?.id}
              open={true}
              onClose={handleEditClose}
              onSave={handleSavePatientData}
            />
            )}
            <UserSuspendDialog open={suspendDialogOpen} setOpen={setSuspendDialogOpen} />
            <UserSubscriptionDialog open={subscriptionDialogOpen} setOpen={setSubscriptionDialogOpen} />
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 'none', border: theme => `2px solid ${theme.palette.primary.main}` }}>
            <CardContent
              sx={{ display: 'flex', flexWrap: 'wrap', pb: '0 !important', justifyContent: 'space-between' }}
            >
              <CustomChip
                skin='light'
                size='small'
                color='primary'
                label='Ativo'
                sx={{ fontSize: '0.75rem', borderRadius: '4px' }}
              />
              <Box sx={{ display: 'flex', position: 'relative' }}>
                <Typography
                  variant='h5'
                  sx={{
                    mb: -1.2,
                    lineHeight: 1,
                    color: 'primary.main'
                  }}
                >
                  Cadastrar Convênio
                </Typography>
              </Box>
            </CardContent>

            <CardContent>
              <Box sx={{ mt: 4, mb: 5 }}>
                <Box
                  sx={{ display: 'flex', mb: 2.5, alignItems: 'center', '& svg': { mr: 2, color: 'text.secondary' } }}
                >
                
                  <Typography component='span' sx={{ fontSize: '0.900rem' }}>
                    Cadastre o convênio do seu paciente
                  </Typography>
                </Box>
                <Box
                  sx={{
                    mt: 2.5,
                    display: 'flex',
                    mb: 2.5,
                    alignItems: 'center',
                    '& svg': { mr: 2, color: 'text.secondary' }
                  }}
                >
                 
                  <Typography component='span' sx={{ fontWeight: 500, fontSize: '0.975rem'  }}>
                    Número: <span style={{ fontWeight: "normal" }}>{insurance?.insuranceNumber ? insurance.insuranceNumber : dataPatient?.insuranceNumber}</span>
                  </Typography>
                </Box>
                <Box
                  sx={{
                    mt: 2.5,
                    display: 'flex',
                    mb: 2.5,
                    alignItems: 'center',
                  }}
                >
                  
                  <Typography component='span' sx={{ fontWeight: 500, fontSize: '0.975rem'  }}>
                    Nome: <span style={{ fontWeight: "normal" }}>{insurance?.insuranceName ? insurance?.insuranceName : dataPatient?.insuranceName}</span>
                  </Typography>
                </Box>
              </Box>

              <Button variant='contained' sx={{ width: '100%', backgroundColor: theme => `${theme.palette.primary.main} !important` }} onClick={handleDialogModalInsurance}>
                Cadastrar
              </Button>
            </CardContent>

            <Dialog
              open={openPlans}
              onClose={handlePlansClose}
              aria-labelledby='user-view-plans'
              aria-describedby='user-view-plans-description'
              sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}
            >
              <DialogTitle
                id='user-view-plans'
                sx={{
                  textAlign: 'center',
                  fontSize: '1.5rem !important',
                  px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                  pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
                }}
              >
                Upgrade Plan
              </DialogTitle>

              <DialogContent
                sx={{ px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`] }}
              >
                <DialogContentText variant='body2' sx={{ textAlign: 'center' }} id='user-view-plans-description'>
                  Choose the best plan for the user.
                </DialogContentText>
              </DialogContent>

              <DialogContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: ['wrap', 'nowrap'],
                  pt: theme => `${theme.spacing(2)} !important`,
                  pb: theme => `${theme.spacing(8)} !important`,
                  px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
                }}
              >
                <FormControl fullWidth size='small' sx={{ mr: [0, 3], mb: [3, 0] }}>
                  <InputLabel id='user-view-plans-select-label'>Choose Plan</InputLabel>
                  <Select
                    label='Choose Plan'
                    defaultValue='Standard'
                    id='user-view-plans-select'
                    labelId='user-view-plans-select-label'
                  >
                    <MenuItem value='Basic'>Basic - $0/month</MenuItem>
                    <MenuItem value='Standard'>Standard - $99/month</MenuItem>
                    <MenuItem value='Enterprise'>Enterprise - $499/month</MenuItem>
                    <MenuItem value='Company'>Company - $999/month</MenuItem>
                  </Select>
                </FormControl>
                <Button variant='contained' sx={{ minWidth: ['100%', 0] }}>
                  Upgrade
                </Button>
              </DialogContent>

              <Divider sx={{ m: '0 !important' }} />

              <DialogContent
                sx={{
                  pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(8)} !important`],
                  px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                  pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
                }}
              >
                <Typography sx={{ fontWeight: 500, mb: 2, fontSize: '0.875rem' }}>
                  User current plan is standard plan
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: ['wrap', 'nowrap'],
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ mr: 3, display: 'flex', ml: 2.4, position: 'relative' }}>
                    <Sup>$</Sup>
                    <Typography
                      variant='h3'
                      sx={{
                        mb: -1.2,
                        lineHeight: 1,
                        color: 'primary.main',
                        fontSize: '3rem !important'
                      }}
                    >
                      99
                    </Typography>
                    <Sub>/ month</Sub>
                  </Box>
                  <Button
                    color='error'
                    sx={{ mt: 2 }}
                    variant='outlined'
                    onClick={() => setSubscriptionDialogOpen(true)}
                  >
                    Cancel Subscription
                  </Button>
                </Box>
              </DialogContent>
            </Dialog>

            <Dialog
              open={openModalCouncil}
              onClose={handleDialogModalInsurance}
               sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650, padding: 1 } }}
            >
              <Box sx={{ paddingLeft: 5 }}>
                <h2>Cadastrar Convênio</h2>
              </Box>
            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 20 }}>
            <TextField
              label="Número do Convênio"
              fullWidth
              margin="normal"
              inputProps={{ maxLength: 25 }}
              {...register('insuranceNumber')}
              error={!!errors.insuranceNumber}
              defaultValue={insurance?.insuranceNumber ? insurance.insuranceNumber : dataPatient?.insuranceNumber}
            />

            <TextField
              label="Nome"
              fullWidth
              margin="normal"
              {...register('insuranceName')}
              error={!!errors.insuranceName}
              defaultValue={insurance?.insuranceName ? insurance.insuranceName : dataPatient?.insuranceName}
              
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button variant="contained" color="primary" type="submit"  disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Salvar'}
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
            
            </Dialog>

            <DialogUploadImagem setOpen={() => dialogOpen} key={0} onUpload={handleUpload} title='Upload de Imagens' />
          </Card>
        </Grid>
      </Grid>
    )
  } else {
    return null
  }
}

export default UserViewLeft
