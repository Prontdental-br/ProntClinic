"use client"
import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";
import axios from "axios";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { toast } from 'react-toastify';
import { read, utils } from 'xlsx';

import { excelDateToJSDate } from "@/common/excel";

export default function Page() {
  const [rows, setRows] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>({});
  const [currentAccountId, setCurrentAccountId] = useState('');

  const parseGender = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'masculino':
        return 'M';
      case 'feminino':
        return 'F';
      case 'undefined':
        return '';
      default:
        return 'Outros';
    }
  }

  function formatCPF(string: string) {
    return string
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  function formatRG(string: string) {
    return string
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }
  
  function formatCellphone(string: string) {
    return string.replace(/\D/g, '').replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
  }
  
  const columns: GridColDef[] = [
    { resizable: true, field: 'Nome do Paciente', headerName: 'Nome do Paciente', flex: 0.05, minWidth: 100 },
    { resizable: true, field: 'Gênero do Paciente', headerName: 'Gênero do Paciente', valueGetter: (value) => parseGender(`${value}`)  },
    { resizable: true, field: 'Data de Nascimento do Paciente', headerName: 'Data de Nascimento do Paciente' },
    { resizable: true, field: 'Telefone do Paciente', headerName: 'Telefone do Paciente', valueGetter: (value) => formatCellphone(`${value}`) },
    { resizable: true, field: 'RG do Paciente', headerName: 'RG do Paciente', valueGetter: (value) => formatRG(`${value}`) },
    { resizable: true, field: 'CPF do Paciente', headerName: 'CPF do Paciente', valueGetter: (value) => formatCPF(`${value}`) },
    { resizable: true, field: 'Email do Paciente', headerName: 'Email do Paciente' },
    { resizable: true, field: 'Nome do Responsável', headerName: 'Nome do Responsável' },
    { resizable: true, field: 'Data de Nascimento do Responsável', headerName: 'Data de Nascimento do Responsável' },
    { resizable: true, field: 'Celular do Responsável', headerName: 'Celular do Responsável', valueGetter: (value) => formatCellphone(`${value}`) },
    { resizable: true, field: 'CPF do Responsável', headerName: 'CPF do Responsável', valueGetter: (value) => formatCPF(`${value}`) },
    { resizable: true, field: 'CEP', headerName: 'CEP' },
    { resizable: true, field: 'Estado', headerName: 'Estado' },
    { resizable: true, field: 'Cidade', headerName: 'Cidade' },
    { resizable: true, field: 'Bairro', headerName: 'Bairro' },
    { resizable: true, field: 'Rua', headerName: 'Rua' },
    { resizable: true, field: 'Observação', headerName: 'Observação' }
  ]

  async function sendFile() {
    if (selectedFile === null) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.set('file', selectedFile);
    const id = toast.loading("Importando pacientes...");

    await axios.post(`/api/patients/${currentAccountId}/import`, formData, {  headers: { "Content-Type": "multipart/form-data", Authorization: `bearer ${token}` } });
    toast.update(id, {render: "Dados de pacientes importados com sucesso!", type: "success", isLoading: false, closeButton: true, autoClose: 3000});
  }

  async function handleExcelFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files === null) return
    const file = event.target.files[0]

    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      toast.error('Formato de arquivo inválido, faça o upload de um arquivo .xlsx');

      return;
    }

    const ab = await file.arrayBuffer()
    const wb = read(ab)

    const ws = wb.Sheets[wb.SheetNames[0]]
    const sheetData: any[] = utils.sheet_to_json(ws)

    const data = sheetData.map((element, index) => {
      const birthDate = element['Data de Nascimento do Paciente'] ? excelDateToJSDate(
        element['Data de Nascimento do Paciente'],
      ).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) : '';

      const responsibleBirthDate = element['Data de Nascimento do Responsável'] ? excelDateToJSDate(
        element['Data de Nascimento do Responsável'],
      ).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) : '';

      setSelectedFile(file);

      return { ...element, id: index, 'Data de Nascimento do Paciente': birthDate, 'Data de Nascimento do Responsável': responsibleBirthDate }
    })

    setRows(data)
  }

  const fetchData = async (name?: string) => {
    const token = localStorage.getItem('token');

    if (!name || name === '') return;

    const { data } = await axios.get(`/api/account?name=${name || ''}`, {
      headers: {
        Authorization: `bearer ${token}`
      }
    });

    console.log(data);
    setUsers(data);
  };

  useEffect(() => {
    fetchData(name)
  }, [name])


  return (
    <div>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <TextField
            onChange={e => setName(e.target.value)}
            value={name}
            label='Nome'
          />
          <div>
            <Button variant='contained' component='label'>
              Upload arquivo
              <input
                type='file'
                onChange={handleExcelFile}
                accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                hidden
              />
            </Button>
            <Button disabled={rows.length === 0 || selectedUser.name === undefined} onClick={sendFile}>Confirmar inclusão</Button>
          </div>
        </div>
        <div>
          {name !== '' && users.map((data: any) => (
            <div className="bg-primary text-white p-3 w-max cursor-pointer" onClick={ () => {
              setCurrentAccountId(data.id)
              setSelectedUser(data);
              setUsers([]);
            } } key={data.id}><span>{data.name}</span></div>
          ))}
        </div>
      </div>
      { selectedUser && selectedUser.name && (
        <div>
          <span>Usuário selecionado: {selectedUser.name}</span>
        </div>
      )}
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} />
      </div>
    </div>
  )
}
