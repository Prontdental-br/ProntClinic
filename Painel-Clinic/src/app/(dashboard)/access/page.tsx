"use client"
import { useEffect, useState } from "react";

import Link from "next/link";

import {
  Box, Button, Card, CardContent, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, Grid, InputLabel,
  MenuItem, Select, TextField, Typography
} from "@mui/material";
import axios from "axios";

interface IUserLogged {
  id: string;
  name: string;
  email: string;
  role: string;

}

export default function Page() {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [userData, setUserData] = useState<any>({});
  const [homeData, setHomeData] = useState<any>({});

  function handleUserDataChange(field: string, value: any) {
    setUserData({
      ...userData,
      [field]: value
    })
  }

  const saveUser = async () => {
    const token = localStorage.getItem('token');

    console.log(token)

    try {
      if (userData?.password !== userData?.confirmPassword)
        return alert('senha diferentes');

      const user = await axios.post('/api/users', userData, {
        headers: {
          Authorization: `bearer ${token}`
        }
      });

      console.log(user);

      setUserData(undefined);
      setDialogOpen(false);
    } catch (e: any) {
      setDialogOpen(false);
      alert(e.response.data.error);
    }
  }

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');

      const { data } = await axios.get('/api/home', {
        headers: {
          Authorization: `bearer ${token}`
        }
      });

      console.log(data)

      setHomeData(data);
    })();
  }, [])

  const userDataLogged: IUserLogged = JSON.parse(window.localStorage?.getItem("userData") || "{}");

  const roles: any = {
    'Administrador': 'admin',
    'Desenvolvedor': 'dev',
    'Financeiro': 'finance',
    'Suporte': 'support',
    'Vendedor': 'seller',
    'Clientes Cadastrados': 'client'
  }

  const roleCards = {
    admin: ['Administrador', 'Desenvolvedor', 'Financeiro', 'Suporte', 'Clientes Cadastrados', 'Vendedor'],
    dev: ['Desenvolvedor'],
    finance: ['Financeiro'],
    support: ['Suporte'],
    seller: ['Vendedor'],
  };

  const userRole = userDataLogged.role as keyof typeof roleCards;

  const visibleRoles = roleCards[userRole] || [];

  return (
    <Grid container spacing={3}>
      {visibleRoles?.map((role, index) =>
        <Link href={`/access/${roles[role]}`} key={index}>
          <Card  style={{ marginLeft: 12, marginTop: 12, width: 400 }}>
            <CardContent sx={{ py: theme => `${theme.spacing(4.125)} !important` }}>
              <Typography variant='caption'>Total {homeData?.[roles[role]]}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant='h6'>{role}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Link>
      )
      }
       {/* {userData.role === 'admin' && ( */}
          <Card style={{ marginLeft: 12, width: 400, marginTop: 12 }}>
            <CardContent sx={{ py: theme => `${theme.spacing(4.125)} !important` }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                    <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
                      Adicionar Usuário
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
       {/* )} */}

      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} fullWidth={true} maxWidth='md'>
        <Grid style={{ display: 'flex', flexDirection: 'row' }}>
          <DialogTitle>Cadastrar Usuário</DialogTitle>
        </Grid>
        <DialogContent>
          <Grid container spacing={2} style={{ paddingTop: 10 }}>
            <Grid item xs={4}>
              <TextField
                label='Nome'
                value={userData?.name ?? ''}
                onChange={e => handleUserDataChange('name', e.target.value)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Função</InputLabel>
                <Select
                  label='Função'
                  value={userData?.role ?? ''}
                  onChange={e => handleUserDataChange('role', e.target.value)}
                >
                  <MenuItem value='admin'>Administrador</MenuItem>
                  <MenuItem value='dev'>Desenvolvedor</MenuItem>
                  <MenuItem value='finance'>Financeiro</MenuItem>
                  <MenuItem value='support'>Suporte</MenuItem>
                  <MenuItem value='seller'>Vendedor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                label='E-mail'
                value={userData?.email ?? ''}
                onChange={e => handleUserDataChange('email', e.target.value)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label='Telefone'
                value={userData?.phone ?? ''}
                onChange={e => handleUserDataChange('phone', e.target.value)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gênero</InputLabel>
                <Select
                  id="genero"
                  value={userData?.gender ?? ''}
                  label='Gênero'
                  onChange={e => handleUserDataChange('gender', e.target.value)}>
                  <MenuItem value=''>Selecione</MenuItem>
                  <MenuItem value='male'>Masculino</MenuItem>
                  <MenuItem value='female'>Feminino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                type="text"
                label='CPF'
                value={userData?.cpf ?? ''}
                onChange={e => handleUserDataChange('cpf', e.target.value)}
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                type='password'
                label='Senha'
                value={userData?.password ?? ''}
                onChange={e => handleUserDataChange('password', e.target.value)}
                sx={{ width: '100%' }}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                type='password'
                label='Confirmar senha'
                value={userData?.confirmPassword ?? ''}
                onChange={e => handleUserDataChange('confirmPassword', e.target.value)}
                sx={{ width: '100%' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color='primary' onClick={saveUser}>
            Salvar
          </Button>
          <Button color='secondary' onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid >
  )
}
