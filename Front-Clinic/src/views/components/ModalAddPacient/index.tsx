import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import {
  Modal,
  Box,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Tab,
  Tabs,
  Typography,
  Select,
  MenuItem,
  Grid,
} from '@mui/material'
import { useForm, Controller, DefaultValues } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import api from 'src/@core/components/api-client'
import moment from 'moment'
import axios from 'axios'
import Cleave from 'cleave.js/react'
import 'cleave.js/dist/addons/cleave-phone.br'
import CircularProgress from '@mui/material/CircularProgress'
import toast from 'react-hot-toast';

// Calendar
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'

// ** Store Imports
// import { useDispatch, useSelector } from 'react-redux'

// ** Types Imports
// import { AppDispatch, RootState } from 'src/store'
import select from './../../../@core/theme/overrides/select';

const defaultValues = {
  name: '',
  birthDate: '',
  gender: '',
  cpf: '',
  rg: '',
  cellPhone: '',
  internationalPhone: '',
  email: '',
  planType: '',
  responsibleName: '',
  responsibleBirthDate: '',
  responsibleRg: '',
  responsibleCpf: '',
  responsibleCellPhone: '',
  observation: '',
  zipCode: '',
  street: '',
  neighborhood: '',
  city: '',
  state: ''
}

type ModalAddPatientProps = {
  id?: any
  open: boolean
  onClose: (id: string | null) => void
  onSave: (data: any) => void
  initialData?: Partial<typeof defaultValues>
}

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

const schema = yup.object().shape({
  name: yup.string().required('Campo obrigatório'),
  gender: yup.string().nullable(),
  birthDate: yup.string().nullable(),
  email: yup
    .string()
    .nullable()
    .notRequired()
    .test('is-valid-email', 'E-mail inválido', (value) => {
      if (!value) return true; 

      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }),

  cpf: yup.string().nullable(),
  rg: yup
    .string().nullable(),

    // .matches(/^[0-9]{1,9}[0-9Xx]?$/, 'RG inválido'),
  cellPhone: yup.string().required('Campo obrigatório'),
  internationalPhone: yup.string().nullable().notRequired(),
  planType: yup.string().nullable(),
  responsibleName: yup.string().nullable(),

  // responsibleBirthDate: yup.string().matches(dateRegex, 'Data inválida'),
  responsibleCpf: yup.string().nullable(),
  responsibleCellPhone: yup.string().nullable(),
  observation: yup.string().nullable(),
  

  zipCode: yup.string().nullable(),
  street: yup.string().nullable(),
  neighborhood: yup.string().nullable(),
  city: yup.string().nullable(),
  state: yup.string().nullable()
})

const objectKeys = <Obj extends object>(obj: Obj): (keyof Obj)[] => {
  return Object.keys(obj) as (keyof Obj)[];
};



const ModalAddPacient: React.FC<ModalAddPatientProps> = ({ id, open, onClose, onSave, initialData }) => {
  // ** Hooks
  // const dispatch = useDispatch<AppDispatch>()
  // const store = useSelector((state: RootState) => state.patient)
  const [loadingData, setLoadingData] = React.useState(false);
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = useState<boolean>(false)

  const CleaveInput = forwardRef(({ options, ...props }: any, ref) => {
    return <Cleave {...props} options={options} htmlRef={ref} />;
  });

   const inputProps = useMemo(
    () => ({
      inputComponent: CleaveInput
    }),
    []
  );

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange', // Valida enquanto digita
    
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (initialData) {
      function setPreData(obj: object) {
        objectKeys(obj).forEach(key => setValue(key, obj[key]));
      }

      setPreData({ ...initialData });
    }

    api.get('/plan')
      .then(response => {
        console.log(response)
        setPlans(response.data);
      })
      .catch(error => {
        console.log({ id })
        console.log(error)
      })
      .finally(() => {
        setLoadingData(false)
      })
  }, [initialData, setValue]);

  useEffect(() => {
    console.log('id', id)

    return () => {
      id = null;
    }
  })

  useEffect(() => {
    console.log('carregar cliente')
    reset(defaultValues)
    setLoadingData(true)
    if (id) {
      api
        .get('/patients/'.concat(id))
        .then(response => {
          const patient = response.data
          setValue('name', patient.name)
          setValue('birthDate', moment(patient.birthDate).format('YYYY-MM-DD'))
          setValue('gender', patient.gender)
          setValue('cpf', patient.cpf)
          setValue('rg', patient.rg)
          setValue('cellPhone', patient.cellPhone)
          setValue('internationalPhone', patient.internationalPhone)
          setValue('planType', patient.planType)
          setValue('email', patient.email)
          setValue('responsibleName', patient.responsibleName)

          if (patient.responsibleBirthDate) {
            setValue('responsibleBirthDate', moment(patient.responsibleBirthDate).format('YYYY-MM-DD'))
          }

          setValue('responsibleRg', patient.responsibleRg)
          setValue('responsibleCpf', patient.responsibleCpf)
          setValue('responsibleCellPhone', patient.responsibleCellPhone)
          setValue('observation', patient.observation)
          setValue('zipCode', patient.zipCode)
          setValue('street', patient.street)
          setValue('neighborhood', patient.neighborhood)
          setValue('city', patient.city)
          setValue('state', patient.state)
        })
        .catch(error => {
          console.log({ id })
          console.log(error)
        })
        .finally(() => {
          setLoadingData(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSave = handleSubmit(data => {
    setLoading(true);
    if (id) {
      onSave({ id, ...data })
      toast.success('Dados salvo com sucesso!');
    } else {
      onSave(data)
    }
    onClose(null)
    reset(defaultValues)
    setLoading(false);
  })

  const apiCEP = axios.create({ timeout: 3600 })
  const getCEP = (cep: string) => {
    return apiCEP
      .get(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => {
        setValue('street', response.data.logradouro)
        setValue('neighborhood', response.data.bairro)
        setValue('city', response.data.localidade)
        setValue('state', response.data.uf)
      })
      .catch(error => {
        console.error('Erro ao consultar o CEP ' + error)
      })
  }

  function handleClose() {
    onClose(null)
  }

  return (
    <Modal open={open} onClose={handleClose}
       slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '14px',

          width: {
            xs: '90%',
            sm: '90%',
            md: '90%',
            lg: '80%',
            xl: '70%'
          },
          maxWidth: '1600px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            backgroundColor: '#e0e0e0ff',
            pl: 4,
            pt: 3,
            pb: 1
          }}
        >
          <Typography variant='h6' component='div' sx={{ marginBottom: 2, marginLeft: 4 }}>
            Cadastro de Paciente {loadingData && '(Carregando)'}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 4
          }}
        >
          <form onSubmit={handleSave}>
            <Tabs value={0} variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='tabs'>
              <Tab label='Dados do Paciente' />
            </Tabs>

            <Grid container spacing={2} mt={4}>
                <Grid item xs={12} md={8}>
                  <Controller
                    name='name'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <TextField
                        {...field}
                        key={field.name}
                        label='Nome do Paciente'
                        fullWidth
                        error={!!errors?.name}
                        helperText={errors?.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors?.gender}>
                    <Controller
                      name="gender"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                        select
                        label='Selecione um gênero'
                        >
                          <MenuItem value="Masculino">Masculino</MenuItem>
                          <MenuItem value="Feminino">Feminino</MenuItem>
                          <MenuItem value="Outros">Outros</MenuItem>
                        </TextField>
                      )}
                    />
                    {errors?.gender && (
                      <Typography color="error" variant="caption">
                        {errors?.gender?.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <LocalizationProvider adapterLocale="pt-br" dateAdapter={AdapterDayjs}>
                    <Controller
                      name="birthDate"
                      control={control}
                      defaultValue={''}
                      render={({ field }) => (
                        <DatePicker<Dayjs>
                          label="Data de Nascimento"
                          format="DD/MM/YYYY"
                          value={field.value ? dayjs(field.value) : null}
                          maxDate={dayjs()}
                          minDate={dayjs('1900-01-01')}
                          onChange={(newValue) => {
                            const formatted = newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
                            field.onChange(formatted)
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors?.birthDate,
                              helperText: errors?.birthDate?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name='cpf'
                    control={control}
                    rules={{ required: false }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        type='text'
                        value={value}
                        label='CPF'
                        fullWidth
                        onChange={onChange}
                        placeholder='999.999.999-99'
                        inputProps={{
                          options: { delimiters: ['.', '.', '-'], blocks: [3, 3, 3, 2], numericOnly: true }
                        }}
                        InputProps={{
                          inputComponent: CleaveInput
                        }}
                        error={!!errors?.cpf}
                        helperText={errors?.cpf?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Controller
                    name='rg'
                    control={control}
                    defaultValue=''
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        label='RG'
                        fullWidth
                        error={!!errors?.rg}
                        helperText={errors?.rg?.message}
                        value={value}
                        InputProps={{
                          inputComponent: CleaveInput,
                        }}
                        inputProps={{
                          options: {
                            delimiters: ['.', '.', '-'],
                            blocks: [2, 3, 3, 1, 4],
                            uppercase: true,
                          },
                        }}
                        onChange={(e) => {
                          const onlyNumbersAndX = e.target.value.replace(/[^0-9Xx]/g, '');
                          onChange(onlyNumbersAndX);
                        }}
                        onBeforeInput={(e: React.FormEvent<HTMLInputElement> & { data?: string }) => {
                          if (!e.data || !/[0-9xX]/.test(e.data)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name='planType'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors?.planType}>
                        <TextField
                          {...field}
                          select
                          label='Selecione um Plano'
                          error={!!errors?.planType}
                          helperText={errors?.planType?.message}
                        >
                          <MenuItem value=''>Selecione um Plano</MenuItem>
                          {plans.map((p: any) => (
                            <MenuItem value={p.id} key={p.id}>{p.name}</MenuItem>
                          ))}
                        </TextField>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name='email'
                    control={control}
                    rules={{ required: false }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        type='email'
                        value={value}
                        label='E-mail'
                        fullWidth
                        onChange={e => onChange(e.target.value.toLowerCase())}
                        placeholder='nome@host'
                        InputProps={inputProps}
                        error={!!errors?.email}
                        helperText={errors?.email?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name='cellPhone'
                    control={control}
                    rules={{ required: false }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        type='text'
                        value={value}
                        label='Telefone'
                        fullWidth
                        onChange={onChange}
                        placeholder='11 99999 9999'
                        inputProps={{
                          options: { phone: true, phoneRegionCode: 'BR' }
                        }}
                        InputProps={{
                          inputComponent: CleaveInput
                        }}
                        error={!!errors?.cellPhone}
                        helperText={errors?.cellPhone?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name='internationalPhone'
                    control={control}
                    rules={{ required: false }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        type='text'
                        value={value || ''}
                        label='Telefone Internacional'
                        fullWidth
                        onChange={onChange}
                        placeholder='11 99999 9999'
                        inputProps={{
                          options: { phone: true, phoneRegionCode: '' }
                        }}
                        InputProps={{
                          inputComponent: CleaveInput
                        }}
                      />
                    )}
                  />
                </Grid>
            </Grid>

             <Tabs value={0} variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='tabs'>
              <Tab label='Dados do Responsável' />
            </Tabs>

            <Grid container spacing={2} justifyContent={'space-between'} mt={4}>
              <Grid item xs={12} md={4}>
                <Controller
                  name='responsibleName'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Nome do Responsável'
                      fullWidth
                      error={!!errors?.responsibleName}
                      helperText={errors?.responsibleName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider adapterLocale="pt-br" dateAdapter={AdapterDayjs}>
                  <Controller
                    name="responsibleBirthDate"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <DatePicker<Dayjs>
                        label="Data de Nascimento"
                        format="DD/MM/YYYY"
                        value={field.value ? dayjs(field.value) : null}
                        maxDate={dayjs()}
                        minDate={dayjs('1900-01-01')}
                        onChange={(newValue) => {
                          const formatted = newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
                          field.onChange(formatted)
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors?.responsibleBirthDate,
                            helperText: errors?.responsibleBirthDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name='responsibleCpf'
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      type='text'
                      value={value}
                      label='CPF do Responsável'
                      fullWidth
                      onChange={onChange}
                      placeholder='999.999.999-99'
                      inputProps={{
                        options: { delimiters: ['.', '.', '-'], blocks: [3, 3, 3, 2], numericOnly: true }
                      }}
                      InputProps={{
                        inputComponent: CleaveInput
                      }}
                      error={!!errors?.responsibleCpf}
                      helperText={errors?.responsibleCpf?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Controller
                  name='responsibleCellPhone'
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      type='text'
                      value={value}
                      label='Celular do Responsável'
                      fullWidth
                      onChange={onChange}
                      placeholder='11 99999 9999'
                      inputProps={{
                        options: { phone: true, phoneRegionCode: 'BR' }
                      }}
                      InputProps={{
                        inputComponent: CleaveInput
                      }}
                      error={!!errors?.responsibleCellPhone}
                      helperText={errors?.responsibleCellPhone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: -4 }}>
                <Controller
                  name='observation'
                  control={control}
                  defaultValue=''
                  render={({ field }) => <TextField {...field} label='Observação' fullWidth margin='normal' />}
                />
              </Grid>
            </Grid>

            <Tabs value={0} variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='tabs'>
              <Tab label='Endereço' />
            </Tabs>

            <Grid container spacing={2} sx={{ mt: 4 }}>
              <Grid item xs={12} md={2}>
                <Controller
                  name='zipCode'
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      type='text'
                      value={value}
                      label='CEP'
                      fullWidth
                      onChange={onChange}
                      onBlur={e => getCEP(e.target.value)}
                      placeholder='99999-999'
                      inputProps={{
                        options: {
                          numericOnly: true,
                          delimiters: ['-'],
                          blocks: [5, 3],
                        },
                      }}
                      InputProps={{
                        inputComponent: CleaveInput,
                      }}
                      error={!!errors?.zipCode}
                      helperText={errors?.zipCode?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Controller
                  name='street'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Rua'
                      fullWidth
                      error={!!errors?.street}
                      helperText={errors?.street?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Controller
                  name='neighborhood'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Bairro'
                      fullWidth
                      error={!!errors?.neighborhood}
                      helperText={errors?.neighborhood?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='city'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Cidade'
                      fullWidth
                      error={!!errors?.city}
                      helperText={errors?.city?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='state'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors?.state}>
                      <TextField {...field}
                        select
                        label='Selecione um Estado'
                      >
                        <MenuItem value='AC'>Acre</MenuItem>
                        <MenuItem value='AL'>Alagoas</MenuItem>
                        <MenuItem value='AP'>Amapá</MenuItem>
                        <MenuItem value='AM'>Amazonas</MenuItem>
                        <MenuItem value='BA'>Bahia</MenuItem>
                        <MenuItem value='CE'>Ceará</MenuItem>
                        <MenuItem value='DF'>Distrito Federal</MenuItem>
                        <MenuItem value='ES'>Espírito Santo</MenuItem>
                        <MenuItem value='GO'>Goiás</MenuItem>
                        <MenuItem value='MA'>Maranhão</MenuItem>
                        <MenuItem value='MT'>Mato Grosso</MenuItem>
                        <MenuItem value='MS'>Mato Grosso do Sul</MenuItem>
                        <MenuItem value='MG'>Minas Gerais</MenuItem>
                        <MenuItem value='PA'>Pará</MenuItem>
                        <MenuItem value='PB'>Paraíba</MenuItem>
                        <MenuItem value='PR'>Paraná</MenuItem>
                        <MenuItem value='PE'>Pernambuco</MenuItem>
                        <MenuItem value='PI'>Piauí</MenuItem>
                        <MenuItem value='RJ'>Rio de Janeiro</MenuItem>
                        <MenuItem value='RN'>Rio Grande do Norte</MenuItem>
                        <MenuItem value='RS'>Rio Grande do Sul</MenuItem>
                        <MenuItem value='RO'>Rondônia</MenuItem>
                        <MenuItem value='RR'>Roraima</MenuItem>
                        <MenuItem value='SC'>Santa Catarina</MenuItem>
                        <MenuItem value='SP'>São Paulo</MenuItem>
                        <MenuItem value='SE'>Sergipe</MenuItem>
                        <MenuItem value='TO'>Tocantins</MenuItem>
                      </TextField>
                      {errors?.state && (
                        <Typography color='error' variant='caption'>
                          {errors?.state?.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 4, justifyContent: 'end', alignItems: 'end' }}>
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6, mb: 4 }}>

              <Button
                variant='outlined'
                color='error'
                size='large'
                onClick={() => {
                  onClose(null)
                  reset(defaultValues)
                }}
                sx={{ mr: 4 }}
              >
                CANCELAR
              </Button>

              <Button
                variant='outlined'
                color='primary'
                type='submit'
                disabled={loading}
                size='large'
              >
                {loading ? <CircularProgress size={24} /> : 'SALVAR'}
              </Button>
            </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Modal>
  )
}

export default ModalAddPacient
