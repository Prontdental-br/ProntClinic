"use client"
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DataGrid } from '@mui/x-data-grid'
import {
  Box,
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

type CouponDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  couponData: any;
}

const CouponDialog = ({ isOpen, onClose, onSave, couponData }: CouponDialogProps) => {
  const [codeData, setCodeData] = useState({
    id: couponData?.id || null,
    name: couponData?.name || '',
    percentage: couponData?.percentage || '',
    seller: couponData?.seller || '',
  });

  const [nameError, setNameError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    setCodeData({
      id: couponData?.id || null,
      name: couponData?.name || '',
      percentage: couponData?.percentage || '',
      seller: couponData?.seller || '',
    });

    setNameError('');
  }, [couponData, isOpen]);

  const handleCodeDataChange = (field: string, value: any) => {
    setCodeData(prev => ({ ...prev, [field]: value }));
  };

  const [sellers, setSellers] = useState([]);


  useEffect(() => {
    async function fetchSellers() {
      try {
        const { data } = await axios.get(`/api/users?role=seller`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSellers(data);
      } catch (error) {
        console.error('Erro ao buscar vendedores:', error);
      }
    }

    fetchSellers();
  }, [token]);


  useEffect(() => {
    if (!codeData.name.trim() || codeData.id) {

      setNameError('');

      return;
    }

    setIsChecking(true);

    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(`/api/promotional-code/code/${codeData.name}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data) {
          setNameError('Cupom já existe');
        } else {
          setNameError('');
        }
      } catch (error) {
        setNameError('');
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [codeData.name]);

  const handleSubmit = async () => {
    if (nameError) return;

    try {
      if (codeData.id) {
        await axios.patch(`/api/promotional-code`, codeData, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
      } else {
        await axios.post('/api/promotional-code', codeData, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
    }
  };


  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{codeData.id ? 'Editar Cupom' : 'Cadastrar Cupom'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 2 }}>
          <Grid item xs={4}>
          <TextField
            label="Nome do Cupom *"
            value={codeData.name}
            onChange={e => handleCodeDataChange('name', e.target.value)}
            error={!!nameError}
            helperText={nameError || (isChecking ? 'Verificando...' : '')}
          />
          </Grid>

          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Porcentagem Desconto *</InputLabel>
              <Select
                value={codeData.percentage}
                onChange={(e) => handleCodeDataChange('percentage', e.target.value)}
              >
                <MenuItem value="10">10%</MenuItem>
                <MenuItem value="20">20%</MenuItem>
                <MenuItem value="30">30%</MenuItem>
                <MenuItem value="40">40%</MenuItem>
                <MenuItem value="50">50%</MenuItem>
                <MenuItem value="60">60%</MenuItem>
                <MenuItem value="70">70%</MenuItem>
                <MenuItem value="80">80%</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth>
              <InputLabel>Vendedor</InputLabel>
              <Select
                value={codeData.seller}
                onChange={(e) => handleCodeDataChange('seller', e.target.value)}
              >
               {sellers.map((seller: any) => (
                    <MenuItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleSubmit} disabled={!!nameError}>
          {codeData.id ? 'Atualizar' : 'Cadastrar'}
        </Button>
        <Button color="secondary" onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function Page() {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [codeData, setCodeData] = useState<any>({});
  const [dataList, setDataList] = useState([])

  function handleCodeDataChange(field: string, value: any) {
    setCodeData({
      ...codeData,
      [field]: value
    })
  }

  const token = localStorage.getItem('token');

  const fetchData = async () => {

    const { data } = await axios.get(`/api/promotional-code`, {
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

  async function handleEditCode(name: string) {
    const token = localStorage.getItem('token');

    const { data } = await axios.get(`/api/promotional-code/code/${name}`, {
      headers: {
        Authorization: `bearer ${token}`
      }
    });


    setCodeData(data);
    setDialogOpen(true);
  }

  // async function updateCode() {
  //   try {

  //     const id = codeData.id

  //     delete codeData.id;
  //     delete codeData.created_at;
  //     delete codeData.updated_at;

  //     await axios.patch(`/api/promotional-code/${id}`, codeData, {
  //       headers: {
  //         Authorization: `bearer ${token}`
  //       }
  //     });

  //     fetchData();
  //     setDialogOpen(false);
  //   } catch (e: any) {
  //     alert(e.response.data.error);
  //   }
  // }

  async function deleteUser(id: string) {
    console.log(id);

    await axios.delete(`/api/promotional-code/${id}`, {
      headers: {
        Authorization: `bearer ${token}`
      }
    });

    fetchData();
  }

  const columns = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'percentage', headerName: 'Porcentagem Desconto %', flex: 1 },
    {field: 'validity', headerName: 'Validade', flex: 1},
    {
      flex: 0.1,
      minWidth: 170,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: any) => (
        <ButtonGroup variant='outlined' color='primary' aria-label='outlined primary button group'>
          <Button onClick={() => handleEditCode(row.name)} title="Editar">
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
         <Box sx={{ mb: 2 }}>
            <h2>Cupons</h2>
          </Box>
        <Card>
          <CardContent>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 2 }}>
          <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
            Adicionar Cupom
          </Button>
        </Box>
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid rows={dataList} columns={columns} />
            </div>
          </CardContent>
        </Card>
      </Grid>
      <CouponDialog
        isOpen={isDialogOpen}
        onClose={() => {setDialogOpen(false)}}
        couponData={codeData}
        onSave={() => { fetchData() }}
      />
    </>

  )
}
