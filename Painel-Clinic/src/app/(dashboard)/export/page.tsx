"use client"
import { useEffect, useState } from "react";

import { Button, TextField } from "@mui/material";
import axios from "axios";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { toast } from "react-toastify";

export default function Page() {
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [paginateData, setPaginateData] = useState({ data: [], totalPages: 0, totalItems: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState('');
  const apiRef = useGridApiRef();

  const statesObject = {
    'AC': 'Acre',
    'AL': 'Alagoas',
    'AP': 'Amapá',
    'AM': 'Amazonas',
    'BA': 'Bahia',
    'CE': 'Ceará',
    'DF': 'Distrito Federal',
    'ES': 'Espírito Santo',
    'GO': 'Goías',
    'MA': 'Maranhão',
    'MT': 'Mato Grosso',
    'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais',
    'PA': 'Pará',
    'PB': 'Paraíba',
    'PR': 'Paraná',
    'PE': 'Pernambuco',
    'PI': 'Piauí',
    'RJ': 'Rio de Janeiro',
    'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia',
    'RR': 'Roraíma',
    'SC': 'Santa Catarina',
    'SP': 'São Paulo',
    'SE': 'Sergipe',
    'TO': 'Tocantins'
  }


  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const parseGender = (gender: string) => {
    switch (gender) {
      case 'M':
        return 'Masculino';
      case 'F':
        return 'Feminino';
      default:
        return 'Outros';
    }
  }

  const parseBirthdayDate = (dateString: string) => {
    if (dateString === '') {
      return '';
    }

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
  
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome do Paciente', flex: 0.05, minWidth: 50 },
    { field: 'gender', headerName: 'Gênero do Paciente', valueGetter: (value) => parseGender(value) },
    { field: 'birthDate', headerName: 'Data de Nascimento Paciente', valueGetter: (value) => parseBirthdayDate(value) },
    { field: 'cellPhone', headerName: 'Telefone do Paciente' },
    { field: 'rg', headerName: 'RG do Paciente' },
    { field: 'cpf', headerName: 'CPF do Paciente' },
    { field: 'email', headerName: 'Email do Paciente' },
    { field: 'responsibleName', headerName: 'Nome do Responsável' },
    { field: 'responsibleBirthDate', headerName: 'Data de Nascimento do Responsável', valueGetter: (value) => parseBirthdayDate(value) },
    { field: 'responsibleCellPhone', headerName: 'Celular do Responsável' },
    { field: 'responsibleCpf', headerName: 'CPF do Responsável' },
    { field: 'zipCode', headerName: 'CEP' },
    { field: 'state', headerName: 'Estado', valueGetter: (value) => statesObject[value] },
    { field: 'city', headerName: 'Cidade' },
    { field: 'neighborhood', headerName: 'Bairro' },
    { field: 'street', headerName: 'Rua' },
    { field: 'observation', headerName: 'Observação' },
  ];

  const downloadXLSX = async () => {
    const token = localStorage.getItem('token')
    const id = toast.loading("Exportando pacientes...");

    const { data } = await axios.get(`/api/patients/${currentAccountId}/export`, {
      headers: {
        Authorization: `bearer ${token}`
      },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'file.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    toast.update(id, {render: "Dados de pacientes exportados com sucesso!", type: "success", isLoading: false, closeButton: true, autoClose: 3000});
  }

  const fetchData = async (name?: string) => {
    const token = localStorage.getItem('token');

    if (!name || name === '') return;

    const { data } = await axios.get(`/api/account?name=${name || ''}`, {
      headers: {
        Authorization: `bearer ${token}`
      }
    });
  
    setUsers(data);
  };

  const getUserPatients = async (accountId: string, page: number = 1) => {
    setIsLoading(true);
    setUsers([]);
    const token = localStorage.getItem('token')

    const { data } = await axios.get(`/api/patients/${accountId}`, {
      headers: {
        Authorization: `bearer ${token}`
      },
      params: {
        page
      }
    });
  
    const totalItems = data.totalItems;

    setPaginateData((prevState) => {
      return { ...prevState, data: data.data, totalItems, totalPages: Math.ceil(data.totalItems / 10) };
    });
    setIsLoading(false);
  }

  useEffect(() => {
    fetchData(name)
  }, [name])

  useEffect(() => {
    if (currentAccountId !== '') {
      getUserPatients(currentAccountId, paginationModel.page + 1);
    }
  }, [paginationModel]);

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <TextField
            onChange={e => setName(e.target.value)}
            value={name}
            label='Nome'
          />
          <Button disabled={currentAccountId === ''} color="primary" onClick={downloadXLSX}>
            Exportar dados
          </Button>
        </div>
        <div>
          {name !== '' && users.map((data: any) => (
            <div className="bg-primary text-white p-3 w-max cursor-pointer" onClick={ () => {
              setCurrentAccountId(data.id)
              getUserPatients(data.id)
            } } key={data.id}><span>{data.name}</span></div>
          ))}
        </div>
      </div>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          apiRef={apiRef}
          rows={paginateData.data}
          rowCount={paginateData.totalItems}
          loading={isLoading}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          columns={columns}
          />
      </div>
    </div>
  )
}
