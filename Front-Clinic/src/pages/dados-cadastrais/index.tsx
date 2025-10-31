import {useState, useEffect, ReactNode, forwardRef} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import BlankLayout from "src/@core/layouts/BlankLayout";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    CircularProgress
} from "@mui/material";
import { styled } from '@mui/material/styles'
import FooterIllustrations from 'src/views/pages/misc/FooterIllustrations'
import { ClinicType } from "src/types/apps/clinicsTypes";
import { RootState, AppDispatch } from 'src/store';
import { createClinic } from 'src/store/apps/clinics';
import { useAuth } from 'src/hooks/useAuth';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Cleave from 'cleave.js/react';

const Img = styled('img')(({ theme }) => ({
    marginTop: theme.spacing(15),
    [theme.breakpoints.down('lg')]: {
      height: 450,
      marginTop: theme.spacing(10)
    },
    [theme.breakpoints.down('md')]: {
      height: 400
    }
  }))

   const CleaveInput = forwardRef(({ options, ...props }: any, ref) => {
      return <Cleave {...props} options={options} htmlRef={ref} />;
    });
  

function ClinicFormCreation(){
    const [clinic, setClinic] = useState<ClinicType>({} as ClinicType)
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const store = useSelector((state: RootState) => state.clinic);
    const { user, setUser } = useAuth();

    const [errors, setErrors] = useState({
        name: '',
        docType: '',
        docNumber: '',
        birthday: ''
      })


    useEffect(()=>{
        if(store?.clinic?.id && user?.id){
            console.log('clinic created successfully', store.clinic)            
            setUser({...user, clinicId: store.clinic.id})
            const storedUser = window.localStorage.getItem('userData')
            if(storedUser){
                const objStoredUser = JSON.parse(storedUser)
                window.localStorage.setItem('userData', JSON.stringify({...objStoredUser, clinicId: store.clinic.id}))
            }   
            window.location.href = '/start'         
        }
    }, [store?.clinic])

    function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;

  return rev === parseInt(cpf.charAt(10));
}

function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length += 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return result === parseInt(digits.charAt(1));
}

    function handleClinicData(key: keyof ClinicType, value: any){
        setClinic({...clinic, [key]: value})    
        setErrors(prev => ({ ...prev, [key]: '' })) 
    }

   function validateFields(): boolean {
  const newErrors: any = {};
  const rawDoc = clinic.docNumber.replace(/[^\d]+/g, '');

  if (!clinic.docType) {
    newErrors.docType = 'Tipo de documento é obrigatório';
  }

  if (!clinic.docNumber) {
    newErrors.docNumber = 'Número do documento é obrigatório';
  } else if (clinic.docType === 'cpf' && !isValidCPF(rawDoc)) {
    newErrors.docNumber = 'CPF inválido';
  } else if (clinic.docType === 'cnpj' && !isValidCNPJ(rawDoc)) {
    newErrors.docNumber = 'CNPJ inválido';
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
}

    async function saveClinic(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!validateFields()) return;

        setIsLoading(true);
        try {
            await dispatch(createClinic(clinic)); 
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <Box style={{position:'relative', minHeight:'100vh'}}>            
            <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <Grid container justifyContent="center">
                     <Grid item xs={12} md={4}>
                <Card title="Conclua o cadastro da sua Clínica">
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Quase lá, conclua o cadastro da sua clínica 🚀
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Preencha os dados da sua clínica para que possamos criar o seu perfil.
                                </Typography>
                                <form onSubmit={saveClinic}>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                type='text'
                                                label='Nome da Clínica'     
                                                value={clinic.name}
                                                error={!!errors.name}
                                                helperText={errors.name || ''}
                                                onChange={(e) => handleClinicData('name', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth error={!!errors.docType}>
                                                <InputLabel id='form-layouts-separator-select-label'>Tipo de documento</InputLabel>
                                                <Select
                                                    label='Tipo de documento'
                                                    id='form-layouts-separator-select'
                                                    labelId='form-layouts-separator-select-label'
                                                    value={clinic.docType}
                                                    onChange={(e) => handleClinicData('docType', e.target.value)}
                                                    >
                                                    <MenuItem value='cnpj'>CNPJ</MenuItem>
                                                    <MenuItem value='cpf'>CPF</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                       <TextField
                                        key={clinic.docType}
                                        fullWidth
                                        label='Número do documento'
                                        value={clinic.docNumber}
                                        error={!!errors.docNumber}
                                        helperText={errors.docNumber}
                                        placeholder={clinic.docType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                                        onChange={(e) => {
                                        const value = e.target.value;
                                        handleClinicData('docNumber', value);

                                        const rawValue = value.replace(/[^\d]+/g, '');

                                        if (clinic.docType === 'cpf' && !isValidCPF(rawValue)) {
                                            setErrors({ ...errors, docNumber: 'CPF inválido' });
                                        } else if (clinic.docType === 'cnpj' && !isValidCNPJ(rawValue)) {
                                            setErrors({ ...errors, docNumber: 'CNPJ inválido' });
                                        } else {
                                            setErrors({ ...errors, docNumber: '' });
                                        }
                                        }}
                                        InputProps={{
                                        inputComponent: CleaveInput,
                                        inputProps: {
                                            options:
                                            clinic.docType === 'cnpj'
                                                ? { delimiters: ['.', '.', '/', '-'], blocks: [2, 3, 3, 4, 2], numericOnly: true }
                                                : { delimiters: ['.', '.', '-'], blocks: [3, 3, 3, 2], numericOnly: true },
                                        },
                                        }}
                                    />
                                        </Grid>
                                        {clinic.docType === 'cpf' && <Grid item xs={12}>
                                            <LocalizationProvider adapterLocale='pt-BR' dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                label='Data de nascimento *'
                                                format='DD/MM/YYYY'
                                                value={clinic.birthday}
                                                onChange={v => {
                                                    console.log(dayjs(v)?.format?.('YYYY-MM-DD'));
                                                    handleClinicData('birthday', dayjs(v)?.format?.('YYYY-MM-DD'))
                                                }}
                                                slotProps={{
                                                    textField: {
                                                      fullWidth: true,
                                                      error: !!errors.birthday,
                                                      helperText: errors.birthday
                                                    }
                                                  }}
                                            />
                                            </LocalizationProvider>   
                                        </Grid> }                                    
                                        <Grid item xs={12}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                type="submit"
                                                disabled={isLoading} 
                                            >
                                                {isLoading ? (
                                                    <CircularProgress
                                                        size={24}
                                                        color="inherit"
                                                    />
                                                ) : (
                                                    'Salvar'
                                                )}
                                            </Button>
                                        </Grid>                                        
                                    </Grid>
                                </form>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                </Grid>
                </Grid>
            </Box>
            {/* <FooterIllustrations />
            <Img style={{position:'absolute', left:'50%', bottom:'0', transform:'translateX(-50%)', zIndex:'-1'}} alt='coming-soon-illustration' src='/images/pages/pricing-cta-illustration.png' /> */}
        </Box>
    )
}

ClinicFormCreation.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default  ClinicFormCreation;

