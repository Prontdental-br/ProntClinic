import React, { useState, useEffect } from 'react'
import qs from 'query-string'

import * as Yup from 'yup'
import { Formik, Form, Field } from 'formik'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'

// import InputMask from 'react-input-mask'
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'

import moment from 'moment'
import prontChatApi from './ProntChatApi'
import translateBackendError from 'src/common/translateBackendError'
import Image from 'next/image'
import toast from 'react-hot-toast'

const Copyright = () => {
  return (
    <Typography variant='body2' color='textSecondary' align='center'>
      {'Copyright © '}
      <Link color='inherit' href='#'>
        PLW
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

const useStyles = makeStyles(theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}))

const UserSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
  password: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!'),
  email: Yup.string().email('Invalid email').required('Required')
})

interface Props {
  setShowRegister: (value: boolean) => void
}

const ProntChatRegister = ({ setShowRegister }: Props) => {
  const classes = useStyles()
  const [allowregister, setallowregister] = useState('enabled')
  const [trial, settrial] = useState('3')
  let companyId = null

  useEffect(() => {
    fetchallowregister()
    fetchtrial()
  }, [])

  const fetchtrial = async () => {
    try {
      const responsevvv = await prontChatApi.get('/settings/trial')
      const allowtrialX = responsevvv.data.value

      //console.log(allowregisterX);
      settrial(allowtrialX)
    } catch (error) {
      console.error('Error retrieving trial', error)
    }
  }

  const fetchallowregister = async () => {
    try {
      const responsevv = await prontChatApi.get('/settings/allowregister')
      const allowregisterX = responsevv.data.value

      //console.log(allowregisterX);
      setallowregister(allowregisterX)
    } catch (error) {
      console.error('Error retrieving allowregister', error)
    }
  }

  // if (allowregister === 'disabled') {
  //   setShowRegister(false)
  // }

  const params = qs.parse(window.location.search)
  if (params.companyId !== undefined) {
    companyId = params.companyId
  }

  const initialState = { name: '', email: '', phone: '', password: '', planId: 'disabled' }

  const [user] = useState(initialState)
  const dueDate = moment().add(trial, 'day').format()
  const handleSignUp = async (values: any) => {
    Object.assign(values, { recurrence: 'MENSAL' })
    Object.assign(values, { dueDate: dueDate })
    Object.assign(values, { status: 't' })
    Object.assign(values, { campaignsEnabled: true })
    try {
      await prontChatApi.post('/companies/cadastro', { ...values, planId: 1 })
      toast.success('Usuário criado com sucesso! Faça seu login!!!.')
      setShowRegister(false)
    } catch (err: any) {
      const errorMsg = err.response?.data?.error
      if (errorMsg) {
        toast.error(translateBackendError(errorMsg))
      }
    }
  }

  const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/signup.png`
  const randomValue = Math.random() // Generate a random number

  const logoWithRandom = `${logo}?r=${randomValue}`

  return (
    <Container component='main' maxWidth='xs'>
      <CssBaseline />
      <div className={classes.paper}>
        <div>
          <Image src='/images/logos/pront-chat.png' width={300} height={300} alt={'Logo Pront Chat'} />
        </div>
        {/*<Typography component="h1" variant="h5">
					{i18n.t("signup.title")}
				</Typography>*/}
        {/* <form className={classes.form} noValidate onSubmit={handleSignUp}> */}
        <Formik
          initialValues={user}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSignUp(values)
              actions.setSubmitting(false)
            }, 400)
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    autoComplete='name'
                    name='name'
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant='outlined'
                    fullWidth
                    id='name'
                    label='Nome da Empresa'
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant='outlined'
                    fullWidth
                    id='email'
                    label={'Email'}
                    name='email'
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    autoComplete='email'
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field

                    // as={InputMask}
                    mask='(99) 99999-9999'
                    variant='outlined'
                    fullWidth
                    id='phone'
                    name='phone'
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                    autoComplete='phone'
                    required
                  >
                    {({ field }: any) => (
                      <TextField
                        {...field}
                        variant='outlined'
                        fullWidth
                        label='DDD988888888'
                        inputProps={{ maxLength: 11 }} // Definindo o limite de caracteres
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant='outlined'
                    fullWidth
                    name='password'
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    label={'Senha'}
                    type='password'
                    id='password'
                    autoComplete='current-password'
                    required
                  />
                </Grid>
              </Grid>
              <Button type='submit' fullWidth variant='contained' color='primary' className={classes.submit}>
                Cadastrar
              </Button>
              <Grid container justify='flex-end'>
                <Grid item>
                  <Typography variant='body2'><Button onClick={ () => setShowRegister(false) }>Já tem uma conta? Entre!</Button></Typography>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </div>
      <Box mt={5}>{/* <Copyright /> */}</Box>
    </Container>
  )
}

export default ProntChatRegister
