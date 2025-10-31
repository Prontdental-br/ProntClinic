import React, { useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'

import { read, utils } from 'xlsx'
import { excelDateToJSDate } from 'src/common/excel'
import api from 'src/@core/components/api-client'
import toast from 'react-hot-toast'

const TabImportPatients = () => {
  const [rows, setRows] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
    { resizable: true, field: 'Gênero do Paciente', headerName: 'Gênero do Paciente' },
    { resizable: true, field: 'Data de Nascimento do Paciente', headerName: 'Data de Nascimento do Paciente' },
    { resizable: true, field: 'Telefone do Paciente', headerName: 'Telefone do Paciente', valueGetter: (value) => formatCellphone(`${value.value}`) },
    { resizable: true, field: 'RG do Paciente', headerName: 'RG do Paciente', valueGetter: (value) => formatRG(`${value.value}`) },
    { resizable: true, field: 'CPF do Paciente', headerName: 'CPF do Paciente', valueGetter: (value) => formatCPF(`${value.value}`) },
    { resizable: true, field: 'Email do Paciente', headerName: 'Email do Paciente' },
    { resizable: true, field: 'Nome do Responsável', headerName: 'Nome do Responsável' },
    { resizable: true, field: 'Data de Nascimento do Responsável', headerName: 'Data de Nascimento do Responsável' },
    { resizable: true, field: 'Celular do Responsável', headerName: 'Celular do Responsável', valueGetter: (value) => formatCellphone(`${value.value}`) },
    { resizable: true, field: 'CPF do Responsável', headerName: 'CPF do Responsável', valueGetter: (value) => formatCPF(`${value.value}`) },
    { resizable: true, field: 'CEP', headerName: 'CEP' },
    { resizable: true, field: 'Estado', headerName: 'Estado' },
    { resizable: true, field: 'Cidade', headerName: 'Cidade' },
    { resizable: true, field: 'Bairro', headerName: 'Bairro' },
    { resizable: true, field: 'Rua', headerName: 'Rua' },
    { resizable: true, field: 'Observação', headerName: 'Observação' }
  ]

  async function sendFile() {
    if (selectedFile === null) return;
    const formData = new FormData();
    formData.set('file', selectedFile);
    const res = await api.post('/patients/import-excel-data', formData, {  headers: { "Content-Type": "multipart/form-data" } });
    toast.success('Dados de pacientes importados com sucesso!', { duration: 5000 });
  }

  async function handleExcelFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files === null) return
    const file = event.target.files[0]
    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      toast.error('Formato de arquivo inválido, faça o upload de um arquivo .xlsx', { duration: 5000 });

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

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
        <Button>
          <a className='download-model' href={'/excel/modelo.xlsx'}>
            Baixar modelo
          </a>
        </Button>
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
          <Button disabled={rows.length === 0} onClick={sendFile}>Confirmar inclusão</Button>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <div style={{ width: '100%', height: '400px' }}>
            <DataGrid rows={rows} columns={columns} localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}} />
          </div>
        </Card>
      </Grid>
      <Grid item xs={12} display='flex' justifyContent='space-between'></Grid>
    </Grid>
  )
}

export default TabImportPatients
