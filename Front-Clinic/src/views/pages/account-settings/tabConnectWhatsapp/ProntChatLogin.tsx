import React, { useState } from 'react'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { Container, CssBaseline, makeStyles, TextField } from '@material-ui/core'
import Image from 'next/image'

const useStyles = makeStyles(theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
  },
  inputField: {
    margin: theme.spacing(2, 0),
    '& input': {
      padding: '10px 0'
    },
    '& .MuiInput-underline:before': {
      borderBottom: '2px solid #ccc'
    },
    '& .MuiInput-underline:hover:before': {
      borderBottom: '2px solid #000'
    },
    '& .MuiInput-underline:after': {
      borderBottom: '2px solid #2575fc'
    }
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  link: {
    marginTop: theme.spacing(2),
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}))

type LoginType = {
  email: string,
  password: string,
}

interface Props {
  handleLoginSubmit: (data: LoginType) => Promise<void>,
  setShowRegister: (value: boolean) => void,
}

const ProntChatLogin = ({ handleLoginSubmit, setShowRegister }: Props) => {
  const classes = useStyles()
  const [user, setUser] = useState({ email: '', password: '' })

  const handleChangeInput = (event: any) => {
    setUser({ ...user, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    await handleLoginSubmit(user);
  }

  return (
    <Grid display={'flex'} direction={'column'} alignItems={'center'}>
      <div style={{ width: 'fit-content' }}>
        <Image
          src='/images/logos/pront-chat.png'
          width={300} height={300}
          alt={'Logo Pront Chat'}
        />
      </div>
      <div>
        <Container component='main' maxWidth='xs'>
          <CssBaseline />
          <Grid display={'flex'} direction={'column'} alignItems={'center'}>
            <form className={classes.form} noValidate onSubmit={handleSubmit}>
              <TextField
                variant='standard'
                margin='normal'
                required
                fullWidth
                id='email'
                label={'Email'}
                name='email'
                value={user.email}
                onChange={handleChangeInput}
                autoComplete='email'
                autoFocus
                className={classes.inputField}
              />
              <TextField
                variant='standard'
                margin='normal'
                required
                fullWidth
                name='password'
                label={'Senha'}
                type='password'
                id='password'
                value={user.password}
                onChange={handleChangeInput}
                autoComplete='current-password'
                className={classes.inputField}
              />
              <Button type='submit' fullWidth variant='contained' color='primary' className={classes.submit}>
                Entrar
              </Button>
              <Grid container>
                <Grid item>
                  <Grid className={classes.link}><Button onClick={ () => setShowRegister(true) }>Registre-se, agora mesmo!</Button></Grid>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Container>
      </div>
    </Grid>
  )
}

export default ProntChatLogin
