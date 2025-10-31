"use client"
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DataGrid } from '@mui/x-data-grid'
import {
  Button, ButtonGroup, Card, CardContent, CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import axios from "axios";
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'

export default function Page({ params }: any) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [userData, setUserData] = useState<any>({});
  const [dataList, setDataList] = useState([])

  function handleUserDataChange(field: string, value: any) {
    setUserData({
      ...userData,
      [field]: value
    })
  }

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    const { data } = await axios.get(`/api/users?role=${params.role}`, {
      headers: {
        Authorization: `bearer ${token}`
      }
    });

    console.log(data)

    setDataList(data);
  };

  useEffect(() => {
    fetchData();
  }, [])

  async function handleEditUser(id: string) {
    const token = localStorage.getItem('token');

    const { data } = await axios.get(`/api/users/${id}`, {
      headers: {
        Authorization: `bearer ${token}`
      }
    });

    console.log(data)

    delete data.password;

    setUserData(data);
    setDialogOpen(true);
  }

  async function updateUser() {
    try {
      const token = localStorage.getItem('token');
      const id = userData.id

      delete userData.id;
      delete userData.created_at;
      delete userData.updated_at;

      await axios.patch(`/api/users/${id}`, userData, {
        headers: {
          Authorization: `bearer ${token}`
        }
      });

      fetchData();
      setDialogOpen(false);
    } catch (e: any) {
      alert(e.response.data.error);
    }
  }

  async function deleteUser(id: string) {
    console.log(id)
    const token = localStorage.getItem('token');

    await axios.delete(`/api/users/${id}`, {
      headers: {
        Authorization: `bearer ${token}`
      }
    });

    fetchData();
  }

  const columns = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'role', headerName: 'Função', flex: 1 },
    { field: 'email', headerName: 'E-mail', flex: 1 },
    { field: 'phone', headerName: 'Telefone', flex: 1 },
    {
      flex: 0.1,
      minWidth: 170,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: any) => (
        <ButtonGroup variant='outlined' color='primary' aria-label='outlined primary button group'>
          <Button onClick={() => handleEditUser(row.id)} title="Editar">
            <FontAwesomeIcon icon={faPen} />
          </Button>
          <Button onClick={() => deleteUser(row.id)} title="Apagar">
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </ButtonGroup>
      )
    }
  ]

  return (
    <>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={params.role} />
          <CardContent>
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid rows={dataList} columns={columns} />
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} fullWidth={true} maxWidth='md'>
        <Grid style={{ display: 'flex', flexDirection: 'row' }}>
          <DialogTitle>Atualizar Usuário</DialogTitle>
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
          <Button color='primary' onClick={()=>updateUser()}>
            Atualizar
          </Button>
          <Button color='secondary' onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>

  )
}
