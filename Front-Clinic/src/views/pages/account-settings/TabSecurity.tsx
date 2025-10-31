import React, { useState, useEffect, ChangeEvent, ElementType, EventHandler, useMemo, forwardRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/store';
import ChangePasswordCard from './security/ChangePasswordCard'
import { DataGrid, GridColDef, GridRenderCellParams, ptBR } from '@mui/x-data-grid'
import { FormatMask } from 'src/@core/utils/FormatMask'
import {
  Box,
  MenuItem,
  InputLabel,
  TextField,
  FormControl,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CardHeader,
  CardContent,
  Card,
  Grid,
  ButtonGroup,
  Checkbox,
  Typography,
  ButtonProps,
  IconButton,
  Chip,
  Autocomplete,
  FormHelperText,
  Alert,
  AlertColor,
  Tabs,
  Tab,
  DialogContentText,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import InputMask from 'react-input-mask';

import OptionsMenu from 'src/@core/components/option-menu'
import Icon from 'src/@core/components/icon'
import { ProfessionalDataType } from 'src/types/apps/userTypes'
import { fetchData, addProfessional, updateProfessional, deleteProfessional } from 'src/store/apps/professional'
import CircularProgress from '@mui/material/CircularProgress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import ConfirmDialog from 'src/@core/components/confirmDialog';
import uploadProfilePic from 'src/@core/components/cloudinary';
import Column from 'src/pages/budget/sales/components/Column';
import { styled } from '@mui/system';
import api from 'src/@core/components/api-client';
import { set } from 'nprogress';
import toast from 'react-hot-toast';
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.br';

interface CellType {
  row: ProfessionalDataType
}

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const CleaveInput = forwardRef(({ options, ...props }: any, ref) => {
  return <Cleave {...props} options={options} htmlRef={ref} />
})

const TabSecurity = () => {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [isRecepcionistDialogOpen, setRecepcionistDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [imgSrc, setImgSrc] = useState<string | null>('');
  const [odontologistData, setOdontologistData] = useState<any>({
    commissionWhen: 'Débito recebido do paciente',
    name: ''
  })
  const [dataList, setDataList] = useState<ProfessionalDataType[]>([])
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.professional)
  const [professionalToDelete, setProfessionalToDelete] = useState<ProfessionalDataType | null>(null)
  const [signaturePicFile, setSignaturePicFile] = useState<any>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [certificateA1, setCertificateA1] = useState<any>(null);

  const [file, setFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState<{ message: string; severity: AlertColor } | null>(null)

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');


  useEffect(() => {
    dispatch(fetchData())
  }, [dispatch])

  useEffect(() => {
    if (store?.data) {
      setDataList(store.data)
    }

  }, [store?.data])

  const openDialog = () => {
    setDialogMode('add')
    setDialogOpen(true)
  }

  const openRecepcionistDialog = () => {
    handleOdontologistDataChange('specialty', 'recepcionista')
    setDialogMode('add')
    setRecepcionistDialogOpen(true)
  }

  const closeDialog = () => {
    setOdontologistData(undefined)
    setDialogOpen(false)
    setErrors({})
    setFeedbackAlert(null)
  }

  const closeRecepcionistDialog = () => {
    setOdontologistData(undefined)
    setRecepcionistDialogOpen(false)
    setErrors({})
    setFeedbackAlert(null)
  }

  const handleInputImageChange = async (file: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;
  
    if (files && files.length !== 0) {
      reader.onload = () => {
        setImgSrc(reader.result as string);
      };
  
      reader.readAsDataURL(files[0]);
      setSignaturePicFile(files[0]);
    }
  };
  
  const handleDeleteImg = () => {
    // Se houver uma imagem do odontologistData (já salva no banco), marcar para enviar null
    if (odontologistData?.signaturePic) {
      setSignaturePicFile(null); 

    }
    setImgSrc(null); // Limpa a imagem temporária também
  };
  
  const handleConfirmUploadImage = async () => {
    let signaturePicUrl = odontologistData?.signaturePic || null; 
  
    if (signaturePicFile) {
   
      const uploadData = await uploadProfilePic(signaturePicFile);
      if (uploadData) {
        const { url } = uploadData;
        if (url) {
          signaturePicUrl = url;
          setSignaturePicFile(null);
        }
      }
    }
  
   
    if (!imgSrc) {
      signaturePicUrl = null;
    }
  
    return signaturePicUrl;
  };

const handleUpload = async (professionalId: string) => {
    if (!file || !password) {
      setMessage("Selecione um certificado A1 (.pfx ou .p12)");

      return;
    }

    const formData = new FormData();
    formData.append("cert", file); 
    formData.append("professionalId", professionalId);
    formData.append("password", password);

    try {
      setLoading(true);
      const response = await api.post("/digital-certificate/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.data;
      if (response.status === 200) {
        setMessage("Certificado salvo com sucesso!");
      } else {
        setMessage(`Erro: ${data.message}`);
      }
    } catch (error) {
      setMessage("Erro ao enviar o certificado.");
    } finally {
      setLoading(false);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [emailError, setEmailError] = useState<string>("");

const checkEmailExists = async (email: string, currentId?: string) => {
 try {
            const res = await api.get(`/professionals/email/${email}`);

                if (res.data && res.data.id !== currentId) {
                return true; // já existe em outro profissional
              }

            return false; 

          } catch (err: any) {
            if (err.response?.status === 400) {
            
              setErrors((prev) => {
                const { email, ...rest } = prev;

                return rest;
              });
            } else {
              setErrors((prev) => ({ ...prev, email: "Erro ao verificar e-mail." }));
            }
          }
};
  
 const validateOdontologistFields = () => {
  const newErrors: Record<string, string> = {}

  if (!odontologistData?.name) {
    newErrors.name = 'O nome é obrigatório';
  }

  if (!odontologistData?.email) {
    newErrors.email = 'O e-mail é obrigatório'
  }

  if (!odontologistData?.phone) {
    newErrors.phone = 'O telefone é obrigatório'
  }

  if (dialogMode === "add") {
    // Cadastro novo -> senha sempre obrigatória
    if (!odontologistData?.password) {
      newErrors.password = "A senha é obrigatória"
    } else if (odontologistData.password.length < 5) {
      newErrors.password = "A senha deve ter pelo menos 5 caracteres"
    }

    if (!odontologistData?.confirmPassword) {
      newErrors.confirmPassword = "A confirmação de senha é obrigatória"
    } else if (odontologistData.confirmPassword.length < 5) {
      newErrors.confirmPassword = "A confirmação deve ter pelo menos 5 caracteres"
    }

    if (
      odontologistData?.password &&
      odontologistData?.confirmPassword &&
      odontologistData.password !== odontologistData.confirmPassword
    ) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }
  } else {
   
    if (odontologistData?.password || odontologistData?.confirmPassword) {
      if (!odontologistData?.password) {
        newErrors.password = "A senha é obrigatória"
      } else if (odontologistData.password.length < 5) {
        newErrors.password = "A senha deve ter pelo menos 5 caracteres"
      }

      if (!odontologistData?.confirmPassword) {
        newErrors.confirmPassword = "A confirmação de senha é obrigatória"
      } else if (odontologistData.confirmPassword.length < 5) {
        newErrors.confirmPassword = "A confirmação deve ter pelo menos 5 caracteres"
      }

      if (
        odontologistData?.password &&
        odontologistData?.confirmPassword &&
        odontologistData.password !== odontologistData.confirmPassword
      ) {
        newErrors.confirmPassword = 'As senhas não coincidem'
      }
    }
  }

  if (odontologistData?.specialty !== 'recepcionista') {

     if (!odontologistData?.commissionType) {
       newErrors.commissionType = 'O tipo de comissão é obrigatório'
    }

    if (!odontologistData?.commissionValue) {
      newErrors.commissionValue = 'Valor da comissão é obrigatório'
    } else if (!/^\d+(\.\d+)?$/.test(odontologistData.commissionValue)) {
      newErrors.commissionValue = 'Apenas números são permitidos'
    }
  }

  setErrors(newErrors)

  return Object.keys(newErrors).length === 0
}

  
  const saveOdontologist = async () => {
    // Gere um ID único para o novo registro
    // const newId = dataList.length + 1
    
    //setDataList([...dataList, newData])

    if (!validateOdontologistFields()) return;
    
    const signaturePic = await handleConfirmUploadImage();
    
    const newData = { ...odontologistData, signaturePic }
    newData.type = 'O';

    if (odontologistData?.password !== odontologistData?.confirmPassword) {
      setFeedbackAlert({ message: 'As senhas não coincidem.', severity: 'error' });
      
return;
    }

    if(!odontologistData?.email) {
      setFeedbackAlert({ message: 'O campo e-mail não pode ser vazio.', severity: 'error' });
      
return;
    }

    if(!odontologistData?.commissionValue && odontologistData?.specialty !== 'recepcionista') {
      if(!odontologistData?.commissionValue) {
        setFeedbackAlert({ message: 'O campo valor da comissão não pode ser vazio.', severity: 'error' });
        
return;
      }

    if (!/^\d+(\.\d+)?$/.test(odontologistData.commissionValue) && odontologistData?.specialty !== 'recepcionista') {
        setFeedbackAlert({ message: 'O campo valor da comissão deve conter apenas números.', severity: 'error' });
        
return;
      }
    }

    if (!validateOdontologistFields()) return;

   try {
    setIsSaving(true); 

    const signaturePic = await handleConfirmUploadImage();
    const newData = { ...odontologistData, signaturePic, type: "O" };

    const isAdding = dialogMode === "add";

    if (isAdding) {
      if (!odontologistData?.email) return;

      await checkEmailExists(odontologistData.email);

      const response = await dispatch(addProfessional(newData));
      await handleUpload(response.payload.id);
    } else {
      const emailExists = await checkEmailExists(
        odontologistData.email,
        dialogMode === "edit" ? odontologistData.id : undefined
      );

      if (emailExists) {
        setErrors((prev) => ({
          ...prev,
          email: "Este e-mail já está em uso.",
        }));

        return;
      }

      await dispatch(updateProfessional(newData));
      await handleUpload(odontologistData.id);
    }

    setOdontologistData(undefined);
    closeDialog();
    closeRecepcionistDialog();
    
    const successMessage = isAdding
      ? 'Registro incluído com sucesso!'
      : 'Registro alterado com sucesso!';
    toast.success(successMessage);

    setCertificateA1(null);
  } finally {
    setIsSaving(false); // ✅ reativa botão no fim, mesmo se der erro
  }
  }

  const fetchCertificateByProfessional = async (professionalId: string) => {
    try {
      const response = await api.get(`/digital-certificate/${professionalId}`);
      
      if(response.data) {
        setCertificateA1(response.data);

        return
      }

      setCertificateA1(null);
    } catch (error) {
      
    }      
  }

  const handleDeleteCertificate = async (professionalId: string) => { 
    try {
      const response = await api.delete(`/digital-certificate/${professionalId}`);
      setCertificateA1(null);

      if(response.status === 200){
        toast.success('Certificado excluido com sucesso');
        fetchCertificateByProfessional(professionalId);
      }
      
    } catch (error) {
      console.error("Erro ao excluir certificado", error);
    }
  };

  const planType = userData?.planType;

  const professionalsCount = store?.data?.length ?? 0;


  const formatter = new FormatMask();
  const columns: GridColDef<ProfessionalDataType>[] = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'specialty', headerName: 'Especialidade', flex: 1 },
    { field: 'cro', headerName: 'CRO', flex: 1 },
    { field: 'email', headerName: 'E-mail', flex: 1 },
    {
      field: 'phone',
      headerName: 'Telefone',
      flex: 1,
      renderCell: (params: GridRenderCellParams<ProfessionalDataType, any>) => {
        const value = params.value ?? '';
        const cleanedNumber = value.replace(/\D/g, '');
        const withDDI = cleanedNumber.startsWith('55') ? cleanedNumber : '55' + cleanedNumber;
        const formattedNumber = formatter.setPhoneFormatMask(withDDI);

        return formattedNumber ? formattedNumber.replace(/^\+55\s*/, '') : '';
      },
    },
    {
      flex: 0.1,
      minWidth: 170,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={() => row.specialty === 'recepcionista' ? handleEditRecepcionist(row.id) : handleEditProfessional(row.id)} title="Editar">
            <Icon icon='mdi:pencil-outline' color='blue'/>
          </Button>
          <Button onClick={() => setProfessionalToDelete(row)} title="Apagar">
            <Icon icon='mdi:delete-outline' color='red'/>
          </Button>
        </Box>
      )
    }
  ]

  function handleOdontologistDataChange(field: string, value: any) {
    let _odontologistData = odontologistData
    if (typeof _odontologistData === 'undefined') {
      _odontologistData = {} as ProfessionalDataType;
    }

    setOdontologistData({
      ..._odontologistData,
      [field]: value
    })

    if (errors[field]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        
return newErrors;
      });
    }
  }

  function handleEditProfessional(id: string): void {
    const professional = dataList.find(item => item.id === id);
    if (professional) {
      setOdontologistData(professional);
      fetchCertificateByProfessional(professional.id);
      setDialogMode('edit');
      setDialogOpen(true);
      setImgSrc(professional?.signaturePic);
    }
  }

  function handleEditRecepcionist(id: string): void {
    const professional = dataList.find(item => item.id === id);
    if (professional) {
      setOdontologistData(professional);
      setDialogMode('edit');
      setRecepcionistDialogOpen(true);
    }
  }

  function _deleteProfessional() {
    if (professionalToDelete) {
      dispatch(deleteProfessional(professionalToDelete.id))
      setProfessionalToDelete(null)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setSelectedFile(event.target.files[0].name);
    }
  };
  
  const [isOpenCerticateDialog, setIsOpenCerticateDialog] = useState(false);

  const handleCloseCerticateDialog = () => { 
    setIsOpenCerticateDialog(false);
    }

//     const permissionsOptions = [
//   { label: 'Permissão consulta', value: 'canAccessPlans' },
//   { label: 'Administrador da conta', value: 'isAdmin' },
//   { label: 'Agenda particular', value: 'isPrivate' },
// ];

// // Verifica quais permissões estão ativadas
// const selectedPermissions = permissionsOptions.filter(
//   (opt) => odontologistData?.[opt.value]
// );

// Função para lidar com alteração
// const handlePermissionsChange = (event, newValue) => {
//   const updatedData = {};
//   permissionsOptions.forEach((opt) => {

//     updatedData[opt.value] = newValue.some((item) => item.value === opt.value);
//   });
//   handleOdontologistDataChange(null, updatedData);
// };

const validateEmail = (email: string) => {

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(email);
};

  return (
    <Grid container spacing={6}>
      {/* <Grid item xs={12}>        
        <ChangePasswordCard />
      </Grid> */}

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid
              container
              justifyContent='space-between'
              style={{ marginBottom: 20 }}
            >
              <Grid item xs={12} md={4}>
                {store?.getingData &&
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress style={{ marginRight: 10 }} size={20} />
                    <p>Carregando dados</p>
                  </Box>
                }
                <Grid item>
                  <Typography variant="h5" component="h2">
                    Cadastro de Profissional
                  </Typography>
                </Grid>
              </Grid>

              <Grid item>
                <Grid container spacing={2}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={openRecepcionistDialog}
                      disabled={planType === 'E' && professionalsCount >= 2}
                    >
                      + NOVO RECEPCIONISTA
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={openDialog}
                      disabled={planType === 'E' && professionalsCount >= 2}
                    >
                      + NOVO PROFISSIONAL
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={dataList}
                columns={columns}
                localeText={{ ...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas' }}
              />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={isDialogOpen} onClose={closeRecepcionistDialog} fullWidth={true} maxWidth='md'>
        <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1 }}>{dialogMode == 'add' ? 'Cadastro de' : 'Editar'} Profissional</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ paddingTop: 20 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                label='Nome'
                value={odontologistData?.name ?? ''}
                onChange={e => {
                  const { value } = e.target;
                  handleOdontologistDataChange('name', value);
                  if (value.trim() !== '') {
                    setErrors(prevErrors => ({
                      ...prevErrors,
                      name: ''
                    }));
                  }
                }}
                sx={{ width: '100%' }}
                helperText={errors.name}
                error={!!errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="E-mail"
                value={odontologistData?.email ?? ''}
                onChange={e => {
                  const value = e.target.value.toLowerCase();
                  handleOdontologistDataChange('email', value);

                  if (!!errors.email && validateEmail(value)) {
                    setErrors(prevErrors => {
                      const newErrors = { ...prevErrors };
                      delete newErrors.email;
                      
return newErrors;
                    });
                  } else if (!value.trim()) {
                    setErrors(prevErrors => ({
                      ...prevErrors,
                      email: ''
                    }));
                  } else {
                    if (!validateEmail(value)) {
                      setErrors(prevErrors => ({
                        ...prevErrors,
                        email: 'E-mail inválido'
                      }));
                    }
                  }
                }}
                onBlur={async (e) => {
                  const emailExists = await checkEmailExists(
                    e.target.value.toLowerCase(),
                    odontologistData?.id
                  );
                  if (emailExists) {
                    setErrors(prevErrors => ({
                      ...prevErrors,
                      email: 'Este e-mail já está em uso.'
                    }));
                  } else {
                    setErrors(prevErrors => {
                      const newErrors = { ...prevErrors };
                      delete newErrors.email;
                      
return newErrors;
                    });
                  }
                }}
                error={!!errors.email}
                helperText={errors.email}
                disabled={!dialogMode}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputMask
                mask="999.999.999-99"
                value={odontologistData?.cpf ?? ''}
                onChange={(e: any) => {
                  const numericCpf = e.target.value.replace(/\D/g, '');
                  handleOdontologistDataChange('cpf', numericCpf);
                }}
              >
                {(inputProps: any) => (
                  <TextField
                    {...inputProps}
                    label="CPF"
                    sx={{ width: '100%' }}
                  />
                )}
              </InputMask>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Telefone"
                value={odontologistData?.phone ?? ''}
                onChange={e => {
                  const numericValue = e.target.value.replace(/\D/g, ''); 
                  handleOdontologistDataChange('phone', numericValue);
                  if (numericValue.length >= 10) {
                    setErrors(prevErrors => {
                      const newErrors = { ...prevErrors };
                      delete newErrors.phone;
                      
return newErrors;
                    });
                  }
                }}
                error={!!errors.phone}
                helperText={errors.phone}
                sx={{ width: '100%' }}
                inputProps={{
                  options: { phone: true, phoneRegionCode: 'BR' }
                }}
                InputProps={{
                  inputComponent: CleaveInput
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gênero</InputLabel>
                <Select
                  id="genero"
                  value={odontologistData?.gender ?? ''}
                  label='Gênero'
                  onChange={e => handleOdontologistDataChange('gender', e.target.value)}>
                  <MenuItem value=''>Selecione</MenuItem>
                  <MenuItem value='male'>Masculino</MenuItem>
                  <MenuItem value='female'>Feminino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label='Especialidade'
                value={odontologistData?.specialty ?? ''}
                onChange={e => handleOdontologistDataChange('specialty', e.target.value)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="typeCr-label">Tipo de Inscrição</InputLabel>
                <Select
                  label='Tipo de inscrição'
                  value={odontologistData?.typeCr ?? ''}
                  name='typeCr'
                  onChange={(e: any) => handleOdontologistDataChange('typeCr', e.target.value)}
                  defaultValue='cro'
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
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label='Inscrição'
                value={odontologistData?.cro ?? ''}
                onChange={e => handleOdontologistDataChange('cro', e.target.value)}
                sx={{ width: '100%' }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                type='password'
                label='Senha login'
                value={odontologistData?.password ?? ''}
                onChange={e => {
                  const { value } = e.target;
                  handleOdontologistDataChange('password', value);

                  if (value.length >= 5) {
                    setErrors(prevErrors => {
                      const newErrors = { ...prevErrors };
                      delete newErrors.password;
                      
return newErrors;
                    });
                  }
                }}
                error={!!errors.password}
                helperText={errors.password}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type='password'
                label='Confirmar senha login'
                value={odontologistData?.confirmPassword ?? ''}
                onChange={e => {
                  const { value } = e.target;
                  handleOdontologistDataChange('confirmPassword', value);

                  if (value.length >= 5 && value === odontologistData?.password) {
                    setErrors(prevErrors => {
                      const newErrors = { ...prevErrors };
                      delete newErrors.confirmPassword;
                      
return newErrors;
                    });
                  } else if (value.length >= 5 && value !== odontologistData?.password) {
                    setErrors(prevErrors => ({
                      ...prevErrors,
                      confirmPassword: 'As senhas não coincidem'
                    }));
                  }
                }}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} sm={4} display="flex" flexDirection="column" justifyContent="center" gap={0}>
              <Box display="flex" alignItems="center">
                <Checkbox size="small" name="isAdmin" checked={odontologistData?.isAdmin || false}
                  onChange={() => handleOdontologistDataChange('isAdmin', !(odontologistData?.isAdmin || false))}
                />
                <Typography sx={{ my: 'auto' }}>Administrador da conta</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Checkbox size="small" name="isPrivate" checked={odontologistData?.isPrivate || false}
                  onChange={() => handleOdontologistDataChange('isPrivate', !(odontologistData?.isPrivate || false))}
                />
                <Typography sx={{ my: 'auto' }}>Agenda particular</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12}>
                  {imgSrc && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <img
                        src={imgSrc}
                        alt="Imagem Assinatura"
                        width={200}
                        style={{ objectFit: 'cover', border: '1px dashed black', padding: '5px' }}
                      />
                      <IconButton onClick={() => handleDeleteImg()} aria-label="deletar" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" gap={1}>
                    {userData?.planType !== "S" && (
                      <Button variant='contained' component='label'>
                        Adicionar Assinatura
                        <input
                          hidden
                          type='file'
                          value={inputValue}
                          accept='image/png, image/jpeg'
                          onChange={handleInputImageChange}
                        />
                      </Button>
                    )}
                    <Typography sx={{ color: 'text.disabled', fontSize: '13px' }}>
                      PNG ou JPEG permitidos. Tamanho máximo de 800K.
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    {userData?.planType !== "S" && (
                      <Box>
                        <Button variant="contained"
                          onClick={() => certificateA1 ? handleDeleteCertificate(odontologistData.id) : setIsOpenCerticateDialog(true)}>
                          {certificateA1 ? "Excluir Certificado A1" : "Adicionar Certificado A1"}
                        </Button>
                        {certificateA1 && (
                          <Typography sx={{ mt: 1, color: 'text.disabled', fontSize: '12px' }}>
                            Você já possui um certificado A1 cadastrado. Deseja excluir ?
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
            <Tabs value={0} variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='tabs' sx={{ marginBottom: 4 }}>
              <Tab label='Configuração comissão' />
            </Tabs>
            </Grid>

            <Grid item xs={12} display="flex" gap={2}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Quando você paga o profissional?</InputLabel>
                  <Select
                    label='Quando você paga o profissional?'
                    value={'on_payment'}
                    name='commissionWhen'
                    onChange={(e: any) => handleOdontologistDataChange('commissionWhen', e.target.value)}
                  >
                    <MenuItem value='on_payment'>Débito recebido do paciente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth error={!!errors.commissionType}>
                  <InputLabel>Selecione o tipo de comissão</InputLabel>
                  <Select
                    label='Selecione o tipo de comissão'
                    value={odontologistData?.commissionType ?? ''}
                    name='commissionType'
                    onChange={e => {
                      handleOdontologistDataChange('commissionType', e.target.value);
                      setErrors(prevErrors => {
                        const newErrors = { ...prevErrors };
                        delete newErrors.commissionType;
                        
return newErrors;
                      });
                    }}
                  >
                    <MenuItem value='valor'>Valor</MenuItem>
                    <MenuItem value='porcentagem'>Porcentagem (%)</MenuItem>
                  </Select>
                  {errors.commissionType && (
                    <FormHelperText sx={{ color: '#FF4D49' }}>
                      {errors.commissionType}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  type='number'
                  label='Comissão'
                  value={odontologistData?.commissionValue ?? ''}
                  onChange={e => {
                    handleOdontologistDataChange('commissionValue', e.target.value);

                    if (e.target.value.trim() !== '') {
                      setErrors(prevErrors => {
                        const newErrors = { ...prevErrors };
                        delete newErrors.commissionValue;
                        
return newErrors;
                      });
                    }
                  }}
                  error={!!errors.commissionValue}
                  helperText={errors.commissionValue}
                  sx={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color='error' variant='outlined' onClick={closeDialog}>
            Cancelar
          </Button>
          <Button color='primary' variant='outlined' disabled={isSaving} onClick={saveOdontologist}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isRecepcionistDialogOpen} onClose={closeRecepcionistDialog} fullWidth={true} maxWidth='md'>
        <Grid >
          <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1
          }}>{dialogMode == 'add' ? 'Cadastro de' : 'Editar'} Recepcionista</DialogTitle>
        </Grid>
        <DialogContent>
          <Grid container spacing={2} style={{ paddingTop: 10 }}>
            <Grid item xs={5}>
              <TextField
                label='Nome'
                value={odontologistData?.name ?? ''}
                onChange={e => handleOdontologistDataChange('name', e.target.value)}
                sx={{ width: '100%' }}
                helperText={errors.name}
                error={!!errors.name}
              />
            </Grid>

            <Grid item xs={7}>
            <TextField
                label='E-mail'
                value={odontologistData?.email ?? ''}
                onChange={e => {
                const value = e.target.value.toLowerCase();
                handleOdontologistDataChange('email', value);

                if (!validateEmail(value)) {
                  errors.email = 'E-mail inválido';
                } else {
                  errors.email = '';
                }
              }}
                error={!!errors.email}
                helperText={errors.email}
                disabled={!dialogMode}
                sx={{ width: '100%' }}
            />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gênero</InputLabel>
                <Select
                  id="genero"
                  value={odontologistData?.gender ?? ''}
                  label='Gênero'
                  onChange={e => handleOdontologistDataChange('gender', e.target.value)}>
                  <MenuItem value=''>Selecione</MenuItem>
                  <MenuItem value='male'>Masculino</MenuItem>
                  <MenuItem value='female'>Feminino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
            <InputMask
                mask="999.999.999-99"
                value={odontologistData?.cpf ?? ''}
                onChange={(e: any) => {
                
                  const numericCpf = e.target.value.replace(/\D/g, '');
                  handleOdontologistDataChange('cpf', numericCpf);
                }}
                >
                {(inputProps: any) => (
                  <TextField
                    {...inputProps}
                    label="CPF"
                    sx={{ width: '100%' }}
                  />
                )}
              </InputMask>
            </Grid>
            <Grid item xs={4}>
            <TextField
                label='Telefone'
                value={odontologistData?.phone ?? ''}
                onChange={e => {
                const numericValue = e.target.value.replace(/\D/g, ''); 
                handleOdontologistDataChange('phone', numericValue);
              }}
                error={!!errors.phone}
                helperText={errors.phone}
                sx={{ width: '100%' }}
                placeholder='11 99999 9999'
                inputProps={{
                  options: { phone: true, phoneRegionCode: 'BR' }
                }}
                InputProps={{
                  inputComponent: CleaveInput
                }}
              />

            </Grid>

            <Grid item xs={4}>
              <TextField
                type='password'
                label='Senha login'
                value={odontologistData?.password ?? ''}
                error={!!errors.password}
                helperText={errors.password}
                onChange={e => handleOdontologistDataChange('password', e.target.value)}
                sx={{ width: '100%' }}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                type='password'
                label='Confirmar senha login'
                value={odontologistData?.confirmPassword ?? ''}
                onChange={e => handleOdontologistDataChange('confirmPassword', e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={4}>
              <Grid container direction="column">
                <Grid item>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      size='small'
                      name="canAccessPlans"
                      checked={odontologistData?.canAccessPlans || false}
                      onChange={e => handleOdontologistDataChange('canAccessPlans', !(odontologistData?.canAccessPlans || false))}
                    />
                    <Typography>
                      Permissão consulta
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      size='small'
                      name="isAdmin"
                      checked={odontologistData?.isAdmin || false}
                      onChange={e => handleOdontologistDataChange('isAdmin', !(odontologistData?.isAdmin || false))}
                    />
                    <Typography>
                      Administrador da conta
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color='error' variant='outlined' onClick={closeRecepcionistDialog}>
            Cancelar
          </Button>
          <Button 
            color='primary' 
            variant='outlined' 
            disabled={isSaving} 
            onClick={saveOdontologist}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isOpenCerticateDialog} onClose={handleCloseCerticateDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1, mb: 4 }}>Upload do Certificado</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button variant="outlined" component="label">
                <Box>

                Selecionar Certificado
                <input type="file" accept=".pfx,.p12" onChange={handleFileChange} hidden  />

                {selectedFile && (
                  <Typography variant="body2" color="textSecondary">
                  Arquivo selecionado: {selectedFile}
                </Typography>
                )}
                </Box>
              </Button>
              <TextField
                type="password"
                label="Senha do Certificado"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCerticateDialog} color="error" variant="outlined">
              Cancelar
            </Button>
            <Button onClick={handleCloseCerticateDialog} variant="outlined" color="primary">
              Salvar
            </Button>
          </DialogActions>
       </Dialog>

      <Dialog
        open={professionalToDelete != null}
        onClose={() => setProfessionalToDelete(null)}
        aria-labelledby='confirm-dialog-title'
        aria-describedby='confirm-dialog-description'
        maxWidth="xs"
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle 
          id='confirm-dialog-title' 
          sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0ff', padding: '12px 24px' }}
        >
          Atenção!
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id='confirm-dialog-description' 
            sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', paddingTop: '18px ' }}
          >
            Tem certeza que deseja excluir o profissional?
          </DialogContentText>
          <DialogContentText 
            sx={{ color: 'text.secondary', mb: 2 }}
          >
            Essa ação não poderá ser desfeita!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setProfessionalToDelete(null)} 
            color='error' 
            variant='outlined'
          >
            Cancelar
          </Button>
          <Button 
            onClick={_deleteProfessional} 
            color='primary' 
            variant='outlined'
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )

}

export default TabSecurity