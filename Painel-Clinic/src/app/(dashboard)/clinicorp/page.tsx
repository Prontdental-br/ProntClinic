/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useState } from 'react';

import { Grid, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, List, ListItem, DialogActions, ListItemText } from '@mui/material'

import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const timezoneBR = 'America/Sao_Paulo';


export default function Page() {
 const [rows, setRows] = useState<any[]>([]);

 const fetchContas = async () => {
      try {
        const { data } = await axios.get(`/api/account?name=`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const lista = data.map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          idSeq: acc.idSeq,
        }));

        setContas(lista);
      } catch (err) {
        console.error("Erro ao buscar contas:", err);
      }
   };


    const fetchMigrations = async () => {
    try {
      const token = localStorage.getItem('token'); 

      const { data } = await axios.get('/api/migrate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formatted = data.map((item: any) => ({
        conta: item.name,
        status: item.status,
        diagnostico: item.statusDiagnostic || '',
        data: dayjs(item.createdAt).tz(timezoneBR).format('DD/MM/YYYY - HH:mm'),
        alteracao: item.updatedAt
  ? dayjs(item.updatedAt).tz(timezoneBR).format('DD/MM/YYYY - HH:mm')
  : '',
        acoes: '',
      }));

      setRows(formatted);
    } catch (err) {
      console.error("Erro ao buscar migrações:", err);
    }
  };


   const [open, setOpen] = useState(false);

  const handleConfirmAccount = async (contaId: string, arquivos: any) => {
  try {

    const contaSelecionada = contas.find((c) => c.id === contaId);

    if (!contaSelecionada) {
      alert("Selecione uma conta antes de continuar.");

      return;
    }


    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    const formData = new FormData();

    console.log('accountId', contaSelecionada.id)
    console.log('accountName', contaSelecionada.name)
    console.log('idSeq', contaSelecionada.idSeq);
    console.log("userId", userData.id)
    
    formData.append("accountId", contaSelecionada.id);
    formData.append("accountName", contaSelecionada.name);
    formData.append("idSeq", String(contaSelecionada.idSeq));
    formData.append("userId", userData.id); 

    arquivos.forEach((file: any) => {
      formData.append('files', file);
    });

    console.log(arquivos);

    await axios.post('/api/migrate', formData, {
      headers: {  
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'multipart/form-data' 
      },
    });


    await fetchMigrations();

    // alert('Migração concluída com sucesso!');
  } catch (err) {
    console.error('Erro ao criar migração:', err);
    alert('Erro ao criar migração. Verifique os logs.');
  }
  finally {
   
    setConta("");
    setArquivos([]);
  }
};

  const [conta, setConta] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [contas, setContas] = useState<{ id: string; name: string; idSeq: number }[]>([]);

  const token = localStorage.getItem('token');

//   const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files) {
//       setArquivos(Array.from(event.target.files));
//     }
//   };

//   const handleConfirm = () => {
//     if (!conta || arquivos.length === 0) {
//       alert("Preencha todos os campos obrigatórios.");

//       return;
//     }

//     handleConfirmAccount(conta, arquivos);
//   };

  const arquivosObrigatorios = [
    "Anamnesis",
    "AnamnesisQuestions",
    "Appointment",
    "BookEntry",
    "Dentist",
    "Patient",
    "PatientAnamnesis",
    "PaymentHeader",
    "PaymentItem",
    "Tabela",
    "TreatmentOperation"
  ];

const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files) return;

  const selectedFiles = Array.from(event.target.files).filter(file =>
    file.name.toLowerCase().endsWith('.xlsx')
  );

  if (selectedFiles.length !== event.target.files.length) {
    alert('Apenas arquivos .xlsx são permitidos.');
  }

  setArquivos(selectedFiles);
};

  const handleConfirm = () => {
    const arquivosNomes = arquivos.map((a) => a.name.split(".")[0]); 

    const faltando = arquivosObrigatorios.filter(
      (nome) => !arquivosNomes.includes(nome)
    );

    if (faltando.length > 0) {
      const continuar = window.confirm(
        `Os seguintes arquivos obrigatórios não foram encontrados:\n\n${faltando.join(
          "\n"
        )}\n\nDeseja continuar mesmo assim?`
      );

      if (!continuar) return;
    }

    handleConfirmAccount(conta, arquivos);
  };



  const confirmarHabilitado = conta && arquivos.length > 0;

   

   
  useEffect(() => {
     fetchContas();
     fetchMigrations();
  }, []);


  return (
    <>
    <Grid container spacing={2} p={2}>
    
      <Grid item xs={12}>
        <h2>Migração de Dados</h2>
      </Grid>

      <Grid item xs={12} display="flex" alignItems="center" justifyContent="space-between">
        <TextField
          placeholder="Pesquisar"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <SearchIcon style={{ marginRight: 8 }} />
          }}
        />
        <Button variant="outlined" color="primary" onClick={() => setOpen(true)}>
          + NOVA MIGRAÇÃO
        </Button>
      </Grid>

      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Conta</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Diagnóstico</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Alteração</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.conta}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.diagnostico}</TableCell>
                  <TableCell>{row.data}</TableCell>
                  <TableCell>{row.alteracao}</TableCell>
                  <TableCell>
                    <IconButton color="primary"><VisibilityIcon /></IconButton>
                    <IconButton color="secondary"><EditIcon /></IconButton>
                    <IconButton color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>

    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Nova Migração</DialogTitle>
      <DialogContent>
    
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Conta / Cliente</InputLabel>
          <Select
            value={conta}
            onChange={(e) => setConta(e.target.value)}
            label="Conta / Cliente"
          >
             {contas?.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name} - {c.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box mt={2}>
          <Button variant="outlined" component="label">
            Selecionar Arquivos
            <input
              type="file"
              hidden
              accept=".xlsx"
              multiple
              onChange={handleSelectFiles}
            />
          </Button>
        </Box>

        {arquivos.length > 0 && (
          <Box mt={2}>
            <List
              sx={{
                maxHeight: 200,
                overflow: "auto",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
            >
              {arquivos.map((file, index) => (
                <ListItem key={index} dense>
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
         <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={!confirmarHabilitado}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

