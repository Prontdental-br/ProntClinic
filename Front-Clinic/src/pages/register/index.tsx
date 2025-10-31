// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box, { BoxProps } from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import Typography, { TypographyProps } from '@mui/material/Typography'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Image from 'next/image'
import * as yup from 'yup'
import FormHelperText from '@mui/material/FormHelperText'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { useAuth } from 'src/hooks/useAuth'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useRouter } from 'next/router'
import api, { apiV2 } from 'src/@core/components/api-client'

// ** Styled Components
export const RegisterIllustrationWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

export const RegisterIllustration = styled('img')(({ theme }) => ({
  maxWidth: '30rem',
  [theme.breakpoints.down('xl')]: {
    maxWidth: '24rem'
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '24rem'
  }
}))

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 400
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 450
  }
}))

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
  }
}))

const TypographyStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.18px',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { marginTop: theme.spacing(8) }
}))

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const schema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  email: yup
    .string()
    .email('Formato inválido de email')
    .required('E-mail é obrigatorio')
    .transform(value => value.toLowerCase()),
  cellPhone: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(/^(\d{11})$/, 'Telefone inválido'),
  type: yup.string().required('Função é obrigatório'),
  password: yup.string().min(5, 'Senha deve ter no mínimo 5 caracteres').required('Senha é obrigatório'),
  acceptPrivacy: yup.boolean().oneOf([true], 'Você deve aceitar a política de privacidade'), // <- validação do checkbox
  coupon: yup.string().notRequired()
})
interface FormData {
  name: string
  email: string
  cellPhone: string
  type: string
  password: string

  coupon: string
}

const Register = () => {
  // ** States
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [openSuccessModal, setOpenSuccessModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [couponId, setCouponId] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [couponValid, setCouponValid] = useState<null | boolean>(null)

  const [debouncedValue, setDebouncedValue] = useState('')
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedValue) {
        validateCoupon(debouncedValue)
      }
    }, 800)

    return () => clearTimeout(handler)
  }, [debouncedValue])

  async function validateCoupon(coupon: string) {
    try {
      setValidating(true)
      setCouponValid(null)
      const { data } = await api.get(`/promotional-code/${coupon}`)
      setCouponValid(data?.valid)
      setCouponId(data?.id ?? null)
    } catch (err) {
      setCouponValid(false)
    } finally {
      setValidating(false)
    }
  }

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const mode = settings.mode
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings
  const auth = useAuth()
  const router = useRouter()
  const imageSource = skin === 'bordered' ? 'auth-v2-register-illustration-bordered' : 'auth-v2-register-illustration'

  const onSubmit = (data: FormData) => {
    const { name, email, cellPhone, type, password } = data
    auth.signupReserva(
      {
        name,
        email,
        cellPhone,
        type: 'O',
        password

        // couponId: couponId ?? null
      },
      () => {
        reset()
        setOpenSuccessModal(true)
      },
      err => {
        setError('root', {
          type: 'manual',
          message: err.message
        })
      }
    )
  }

  // useEffect(() => {
  //   if (openSuccessModal) {

  //     const timer = setTimeout(() => {
  //       router.push('/login');
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [openSuccessModal, router]);

  const {
    control,
    setError,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: { name: '', email: '', cellPhone: '', type: '', password: '', acceptPrivacy: false, coupon: '' },
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  return (
    <>
      <Box className='content-right'>
        {!hidden ? (
          <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            <RegisterIllustrationWrapper>
              <RegisterIllustration
                alt='register-illustration'
                src={`/images/logos/prontclinic_logo${mode === 'dark' ? '_dark' : ''}.png`}
              />
            </RegisterIllustrationWrapper>
            {/* <FooterIllustrationsV2 image={`/images/pages/auth-v2-register-mask-${theme.palette.mode}.png`} /> */}
          </Box>
        ) : null}
        <RightWrapper sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
          <Box
            sx={{
              p: 7,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.paper'
            }}
          >
            <BoxWrapper>
              <Box
                sx={{
                  top: 30,
                  left: 40,
                  display: 'flex',
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={`/images/logos/prontclinic_logo${mode === 'dark' ? '_dark' : ''}.png`}
                  alt={'ProntClinic'}
                  width={190}
                />
              </Box>
              <Box sx={{ mb: 6 }}>
                <TypographyStyled variant='h5'>Seu sucesso começa aqui 🚀</TypographyStyled>
                <Typography variant='body2'>Torne o gerenciamento da sua clínica fácil e divertido!</Typography>
              </Box>
              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextField
                        autoFocus
                        label='Nome'
                        value={value}
                        onBlur={onBlur}
                        onChange={onChange}
                        error={Boolean(errors.name)}
                        placeholder='Nome'
                      />
                    )}
                  />
                  {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                </FormControl>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='email'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextField
                        label='Email'
                        value={value}
                        onBlur={onBlur}
                        onChange={e => onChange(e.target.value.toLowerCase())}
                        error={Boolean(errors.email)}
                        placeholder='seuemail@dominio.com'
                      />
                    )}
                  />
                  {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
                </FormControl>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='cellPhone'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextField
                        label='Telefone'
                        value={value}
                        onBlur={onBlur}
                        onChange={e => {
                          const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 11)
                          onChange(onlyNumbers)
                        }}
                        error={Boolean(errors.cellPhone)}
                        placeholder='1199998888'
                        inputProps={{ maxLength: 11 }}
                      />
                    )}
                  />
                  {errors.cellPhone && (
                    <FormHelperText sx={{ color: 'error.main' }}>{errors.cellPhone.message}</FormHelperText>
                  )}
                </FormControl>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <InputLabel htmlFor='auth-login-v2-password'>Senha</InputLabel>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <OutlinedInput
                        value={value}
                        onBlur={onBlur}
                        label='Password'
                        onChange={onChange}
                        id='auth-login-v2-password'
                        error={Boolean(errors.password)}
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} fontSize={20} />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    )}
                  />
                  {errors.password && (
                    <FormHelperText sx={{ color: 'error.main' }} id=''>
                      {errors.password.message}
                    </FormHelperText>
                  )}
                </FormControl>
                <FormControl fullWidth error={!!errors.type} sx={{ mb: 4 }}>
                  <InputLabel id='select-type-label'>Função</InputLabel>

                  <Controller
                    name='type'
                    control={control}
                    rules={{ required: 'Selecione uma função' }}
                    render={({ field, fieldState }) => (
                      <Select
                        {...field}
                        labelId='select-type-label'
                        id='demo-simple-select'
                        label='Função'
                        error={!!fieldState.error}
                      >
                        <MenuItem value='E'>Clínica de Estética</MenuItem>
                        <MenuItem value='O'>Clínica Odontológica</MenuItem>
                        <MenuItem value='D'>Dentista</MenuItem>
                        <MenuItem value='M'>Clínica Médica</MenuItem>
                      </Select>
                    )}
                  />

                  {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                </FormControl>
                {errors.root?.message && (
                  <FormHelperText sx={{ color: 'error.main' }} id=''>
                    {errors.root.message}
                  </FormHelperText>
                )}

                {/* <FormControl fullWidth error={!!errors.type}>
                  <Controller
                    name='coupon'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Cupom de desconto'
                        error={!!errors.coupon || (!!field.value && couponValid === false)}
                        helperText={
                          errors.coupon?.message ||
                          (field.value && couponValid === true && '✅ Cupom válido!') ||
                          (field.value && couponValid === false && '❌ Cupom inválido') ||
                          (field.value && validating && 'Verificando...')
                        }
                        onChange={e => {
                          const value = e.target.value
                          field.onChange(value)

                          if (!value) {
                            setCouponValid(null)
                            setDebouncedValue('')

                            return
                          }

                          setDebouncedValue(value)
                        }}
                      />
                    )}
                  />
                </FormControl> */}

                <FormControlLabel
                  control={
                    <Controller
                      name='acceptPrivacy'
                      control={control}
                      rules={{ required: 'Você deve aceitar a política de privacidade' }}
                      render={({ field }) => <Checkbox {...field} checked={field.value || false} />}
                    />
                  }
                  sx={{ mb: 0, mt: 1.5, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                  label={
                    <>
                      <Typography variant='body2' component='span'>
                        Eu concordo com{' '}
                      </Typography>
                      <LinkStyled href='/politica-privacidade' target='_blank'>
                        política de privacidade e termos
                      </LinkStyled>
                    </>
                  }
                />
                {errors.acceptPrivacy && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.acceptPrivacy.message}</FormHelperText>
                )}
                <Button
                  fullWidth
                  size='large'
                  type='submit'
                  variant='contained'
                  sx={{ mb: 7, mt: 4 }}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Inscrever-se'}
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Typography sx={{ mr: 2, color: 'text.secondary' }}>Já tem uma conta?</Typography>
                  <Typography href='/login' component={Link} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                    Faça login em vez disso
                  </Typography>
                </Box>
              </form>
            </BoxWrapper>
          </Box>
        </RightWrapper>
      </Box>

      <Dialog open={openSuccessModal}>
        <DialogTitle>Conta criada com sucesso!</DialogTitle>
        <DialogContent>
          <Typography>
            Caso você não consiga fazer login, sua conta ainda está em processo de liberação e em breve você receberá em
            seu e-mail o link de acesso para entrar no sistema Clairis. 🚀
            <br />
            <br />
            👉 Fique atento! Nossa mensagem pode chegar na <b>caixa de entrada</b> ou na pasta de{' '}
            <b>spam/lixo eletrônico</b>, então não deixe de conferir por lá também.
            <br />
            <br />
            Seja bem-vindo ao Clairis!
            <br />
            <br />
            <Typography style={{ marginTop: 4, fontWeight: 'bold' }}>
              Clairis — quando a gestão é clara, o crescimento é natural.
            </Typography>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button onClick={() => router.push('/login')} variant='contained'>
            Ir para o login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

Register.guestGuard = true
Register.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
export default Register
