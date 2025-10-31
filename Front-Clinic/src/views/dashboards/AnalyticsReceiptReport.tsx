// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid, GridColDef, MuiEvent } from '@mui/x-data-grid'

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'

// ** Tab
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import React, { SyntheticEvent, useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import api from 'src/@core/components/api-client'
import xlsx from 'json-as-xlsx'
import { MenuItem, TextField } from '@mui/material'
import { ptBR } from '@mui/x-data-grid/locales'
import ModalBudget from 'src/components/ModalBudget'

interface BoxWithExportProps {
  labelText: string
  jsonData?: any
  searchTerm?: string
  setSearchTerm?: (value: string) => void
  professionalFilter?: string
  setProfessionalFilter?: (value: string) => void
  professionals?: string[]
}

interface ProfessionalRow {
  id: string
  name: string
  description: string
  transactionValue: string
  commissionType: 'porcentagem' | 'valor'
  paymentDate: string
  commission: string
  receivable: string
}

const BoxWithExport: React.FC<BoxWithExportProps> = ({
  labelText,
  jsonData = [],
  searchTerm,
  setSearchTerm,
  professionalFilter,
  professionals,
  setProfessionalFilter
}) => {
  const data = [
    {
      sheet: 'Profissionais',
      columns: [
        { label: 'Profissional', value: 'professionalName' },
        { label: 'Descrição', value: 'description' },
        { label: 'Valor da Transação', value: 'transactionValue' },
        { label: 'Tipo de Comissão', value: 'commissionType' },
        { label: 'Valor da Comissão', value: 'commissionValue' },
        { label: 'Valor Recebido', value: 'receivable' },
        { label: 'Data de Pagamento', value: 'paymentDate' }
      ],
      content: jsonData[0]?.map((d: any) =>
        Object.assign({
          professionalName: d.name || d.professionalName || '',
          description: d.description || '',
          transactionValue: d.transactionValue || '',
          commissionType:
            d.commissionType === 'porcentagem' ? 'Porcentagem' : d.commissionType === 'valor' ? 'Valor fixo' : '',
          commissionValue: d.commission || d.commissionValue || '',
          receivable: d.receivable || '',
          paymentDate: d.paymentDate ? new Date(d.paymentDate).toLocaleDateString('pt-BR') : ''
        })
      )
    },

    // {
    //   sheet: 'Planos',
    //   columns: [
    //     { label: 'Nome', value: 'name' },
    //     { label: 'Valor', value: 'value' }
    //   ],
    //   content: jsonData[1]?.map((d: any) => Object.assign({ name: d.name, value: d.receipt }))
    // },

    {
      sheet: 'Tratamentos',
      columns: [
        { label: 'Nome', value: 'name' },
        { label: 'Valor', value: 'value' }
      ],
      content: jsonData[2]?.map((d: any) => Object.assign({ name: d.name, value: d.receipt }))
    }
  ]

  const exportExcel = () => {
    const settings = {
      fileName: 'relatorio',
      extraLength: 3,
      writeMode: 'writeFile',
      writeOptions: {}
    }

    if (jsonData.length > 0) xlsx(data, settings)
  }

  return (
    <Box display='flex' justifyContent={'flex-end'} alignItems='center' padding={2}>
      <Box display='flex' alignItems='flex-end' gap={2}>
        {/* Campo de descrição */}
        {setSearchTerm && (
          <TextField
            size='small'
            placeholder='Pesquisar por descrição'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ width: 220 }}
          />
        )}

        {/* Campo de profissional */}
        {setProfessionalFilter && (
          <TextField
            select
            size='small'
            label='Profissional'
            value={professionalFilter}
            onChange={e => setProfessionalFilter(e.target.value)}
            sx={{ width: 220 }}
          >
            <MenuItem value=''>Todos</MenuItem>
            {professionals?.map((prof, index) => (
              <MenuItem key={index} value={prof}>
                {prof}
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* Botão Exportar */}
        <Button variant='contained' color='primary' onClick={exportExcel}>
          <Icon icon='mdi:download' fontSize={20} style={{ marginRight: 10 }} />
          Exportar
        </Button>
      </Box>
    </Box>
  )
}

const AnalyticsReceiptReport = () => {
  // ** Hook
  const theme = useTheme()
  const [value, setValue] = useState<string>('1')
  const [rowsPlan, setRowPlan] = useState([])
  const [allRowsProfessional, setAllRowsProfessional] = useState<ProfessionalRow[]>([])
  const [rowsProfessional, setRowsProfessional] = useState<ProfessionalRow[]>([])
  const [rowsTreatments, setRowTreatments] = useState([])
  const [filterDaysPanel, setFilterDaysPanel] = useState(0)
  const [paginationOneScheduleModel, setPaginationOneScheduleModel] = useState({ page: 0, pageSize: 5 })
  const [paginationTwoScheduleModel, setPaginationTwoScheduleModel] = useState({ page: 0, pageSize: 10 })
  const [paginationThreeScheduleModel, setPaginationThreeScheduleModel] = useState({ page: 0, pageSize: 10 })
  const [searchTerm, setSearchTerm] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [selectedRowDebits, setSelectedRowDebits] = useState<any>(null)

  const [professionalFilter, setProfessionalFilter] = useState('')
  const [allProfessionals, setAllProfessionals] = useState<string[]>([])

  //const [rowsSpecialties, setRowsSpecialties] = useState([]);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  interface TableBodyRowType {
    id: number
    name: string
    receipt: string
    commission: string
    description: string
    transactionValue: string
    receivable: string
  }

  interface CellType {
    row: TableBodyRowType
  }

  // const fetchPlan = async () => {
  //   const { data } = await api.get(`/budgets/totalbyplan/${filterDaysPanel}`)
  //   console.log(data)
  //   setRowPlan(
  //     data.map((d: any) =>
  //       Object.assign({
  //         id: d.plan?.id || '',
  //         name: d.plan?.name || '',
  //         receipt: `R$ ${d.sumTotal}`
  //       })
  //     )
  //   )
  // }

  const fetchProfessional = async () => {
    const { data } = await api.get(`/budgets/totalbyprofessional/${filterDaysPanel}`)

    const formatted = data.map((d: any) => ({
      id: d.transactionId,
      name: d.professionalName,
      description: d.description,
      transactionValue: `R$ ${d.transactionValue}`,
      commissionType: d.commissionType,
      paymentDate: d.paymentDate,
      entityId: d.entityId,
      commission: d.commissionType === 'porcentagem' ? `${d.commissionValue}%` : `R$ ${d.commissionValue.toFixed(2)}`,
      receivable: `R$ ${d.receivable.toFixed(2)}`
    }))

    setRowsProfessional(formatted)
    setAllRowsProfessional(formatted)
    setAllProfessionals([...new Set(formatted.map((f: any) => f.name))] as string[])
  }

  const fetchTreatment = async () => {
    const { data } = await api.get(`/budget-items/totalbytreatment/${filterDaysPanel}`)

    setRowTreatments(
      data.map((d: any) => ({
        id: d.treatmentId,
        name: d.name,
        unit: d.unit,
        qtd: d.qtd,
        session: d.session,
        receipt: `R$ ${Number(d.sumTotal).toFixed(2)}`
      }))
    )
  }

  /*
  const fetchSpecialty = async ()=>{
    const { data } = await api.get('/budget-items/totalbyspecialty');
    setRowsSpecialties(data.map((d:any)=>
    Object.assign({id: d.treatmentId, name: d.treatment.name, 
      receipt: `R$ ${d.sumTotal.replace('.',',')}`})));
  }
  */

  const handleRowClick = (params: any, event: MuiEvent<React.MouseEvent>) => {
    const target = event.target as HTMLElement
    const tag = target.tagName.toLowerCase()

    if (
      tag === 'button' ||
      tag === 'svg' ||
      tag === 'path' ||
      target.closest('[role="menu"]') ||
      target.closest('[aria-haspopup="menu"]')
    ) {
      return
    }

    const rowData = params.row

    const entityId = rowData.entityId

    if (!entityId) {
      return
    }

    setSelectedRowDebits({ id: entityId })
    setOpenModal(true)
  }

  useEffect(() => {
    let filtered = allRowsProfessional

    // Filtro por descrição
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item => item.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filtro por profissional
    if (professionalFilter.trim() !== '') {
      filtered = filtered.filter(item => item.name?.toLowerCase() === professionalFilter.toLowerCase())
    }

    // Atualiza somente uma vez
    setRowsProfessional(filtered)
  }, [searchTerm, professionalFilter, allRowsProfessional])

  useEffect(() => {
    fetchProfessional()

    // fetchPlan()
    fetchTreatment()
  }, [filterDaysPanel])

  const handleDaysPanelClick = (days: number) => {
    console.log(days)
    setFilterDaysPanel(days)
  }

  /*
  const rowsProfessional: TableBodyRowType[] = [
    {
      id: 1,
      name: 'Jordan Stevenson',
      receipt: 'R$ 1.235,00'
    },
    {
      id: 2,
      name: 'Robert Crawford',
      receipt: 'R$ 890,00'
    },
    {
      id: 3,
      name: 'Lydia Reese',
      receipt: 'R$ 6.290,00'
    }
  ]


  const rowsPlan: TableBodyRowType[] = [
    {
      id: 1,
      name: 'Unimed Odonto',
      receipt: 'R$ 1.235,00'
    },
    {
      id: 2,
      name: 'BRADESCO Odonto',
      receipt: 'R$ 890,00'
    },
    {
      id: 3,
      name: 'Amil Dental',
      receipt: 'R$ 6.290,00'
    },
    {
      id: 4,
      name: 'SulAmerica Odonto',
      receipt: 'R$ 7.100,00'
    }
  ]
  

  const rowsTreatments: TableBodyRowType[] = [
    {
      id: 1,
      name: 'Limpeza dental',
      receipt: 'R$ 2.235,00'
    },
    {
      id: 2,
      name: 'Extração de dente',
      receipt: 'R$ 890,00'
    },
    {
      id: 3,
      name: 'Restauração dentária',
      receipt: 'R$ 3.290,00'
    },
    {
      id: 4,
      name: 'Tratamentos ortodônticos',
      receipt: 'R$ 5.000,00'
    }
  ]

  const rowsSpecialties: TableBodyRowType[] = [
    {
      id: 1,
      name: 'Endodontia',
      receipt: 'R$ 3.235,00'
    },
    {
      id: 2,
      name: 'Ortodontia',
      receipt: 'R$ 1.525,00'
    },
    {
      id: 3,
      name: 'Implantodontia',
      receipt: 'R$ 6.855,00'
    },
    {
      id: 4,
      name: 'Periodontia',
      receipt: 'R$ 2.205,00'
    },
    {
      id: 5,
      name: 'Odontopediatria',
      receipt: 'R$ 4.565,00'
    },
    {
      id: 6,
      name: 'Cirurgia Bucomaxilofacial',
      receipt: 'R$ 5.565,00'
    }
  ]
  */

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      field: 'name',
      minWidth: 200,
      headerName: 'Profissional',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
              {row.name}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.4,
      field: 'description',
      minWidth: 250,
      headerName: 'Descrição',
      renderCell: ({ row }: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {row.description}
        </Typography>
      )
    },
    {
      flex: 0.2,
      field: 'transactionValue',
      minWidth: 120,
      headerName: 'Valor da Transação',
      renderCell: ({ row }: CellType) => (
        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
          {row.transactionValue}
        </Typography>
      )
    },
    {
      flex: 0.2,
      field: 'commission',
      minWidth: 150,
      headerName: 'Comissão',
      renderCell: ({ row }: CellType) => (
        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
          {row.commission}
        </Typography>
      )
    },
    {
      flex: 0.2,
      field: 'receivable',
      minWidth: 150,
      headerName: 'Valor Recebido',
      renderCell: ({ row }: CellType) => (
        <Typography variant='subtitle2' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {row.receivable}
        </Typography>
      )
    }
  ]

  const columnsTreatment: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tratamento',
      flex: 0.3,
      minWidth: 200
    },
    {
      field: 'unit',
      headerName: 'Unidade',
      flex: 0.1,
      minWidth: 100
    },
    {
      field: 'qtd',
      headerName: 'Quantidade',
      flex: 0.15,
      minWidth: 120
    },
    {
      field: 'session',
      headerName: 'Sessões',
      flex: 0.15,
      minWidth: 120
    },
    {
      field: 'receipt',
      headerName: 'Valor Total',
      flex: 0.2,
      minWidth: 150
    }
  ]

  return (
    <>
      <Card sx={{ minHeight: 495 }}>
        <CardHeader
          title='Relatório de Recebimento'
          action={
            <OptionsMenu
              options={[
                { text: 'Hoje', onClick: () => handleDaysPanelClick(0) },
                { text: 'Última Semana', onClick: () => handleDaysPanelClick(7) },
                { text: 'Últimos 20 Dias', onClick: () => handleDaysPanelClick(20) },
                { text: 'Último Mês', onClick: () => handleDaysPanelClick(30) },
                { text: 'Último Ano', onClick: () => handleDaysPanelClick(365) }
              ]}
              iconButtonProps={{ size: 'small', className: 'card-more-options' }}
            />
          }
        />
        <CardContent
          sx={{
            pt: {
              xs: `${theme.spacing(6)} !important`,
              md: `${theme.spacing(0)} !important`
            },
            pb: {
              xs: `${theme.spacing(8)} !important`,
              md: `${theme.spacing(5)} !important`
            }
          }}
        >
          <TabContext value={value}>
            <TabList onChange={handleChange} aria-label='simple tabs example'>
              <Tab value='1' label='Profissionais' />
              {/* <Tab value='2' label='Planos' /> */}
              <Tab value='3' label='Tratamentos' />
              {/*<Tab value='4' label='Especialidades' />*/}
            </TabList>
            <TabPanel value='1'>
              <BoxWithExport
                labelText={`Quantidade ${rowsProfessional.length}`}
                jsonData={[rowsProfessional, rowsPlan, rowsTreatments]}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                professionalFilter={professionalFilter}
                setProfessionalFilter={setProfessionalFilter}
                professionals={allProfessionals}
              />
              <DataGrid
                autoHeight
                pageSizeOptions={[5, 10, 20]}
                rows={rowsProfessional}
                columns={columns}
                disableRowSelectionOnClick
                pagination={true}
                onRowClick={(params, event) => handleRowClick(params, event)}
                paginationModel={paginationOneScheduleModel}
                localeText={{
                  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                  noRowsLabel: 'Nenhum registro encontrado',
                  columnMenuManageColumns: 'Gerenciar colunas'
                }}
                onPaginationModelChange={setPaginationOneScheduleModel}
              />
            </TabPanel>
            <TabPanel value='2'>
              <BoxWithExport labelText={`Quantidade ${rowsPlan.length}`} />

              {/* <DataGrid
                autoHeight
                pageSizeOptions={[5, 10, 20]}
                rows={rowsPlan}
                columns={columnsTreatment}
                disableRowSelectionOnClick
                pagination={true}
                paginationModel={paginationTwoScheduleModel}
                onPaginationModelChange={setPaginationTwoScheduleModel}
                localeText={{
                  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                  noRowsLabel: 'Nenhum registro encontrado',
                  columnMenuManageColumns: 'Gerenciar colunas'
                }}
              /> */}
            </TabPanel>
            <TabPanel value='3'>
              <BoxWithExport labelText={`Quantidade ${rowsTreatments.length}`} />
              <DataGrid
                autoHeight
                rows={rowsTreatments}
                columns={columnsTreatment}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 20]}
                pagination={true}
                paginationModel={paginationThreeScheduleModel}
                onPaginationModelChange={setPaginationThreeScheduleModel}
                localeText={{
                  ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                  noRowsLabel: 'Nenhum registro encontrado',
                  columnMenuManageColumns: 'Gerenciar colunas'
                }}
              />
            </TabPanel>

            {/*<TabPanel value='4' sx={{ maxHeight: 200 }}>
            <BoxWithExport labelText={`Quantidade ${rowsSpecialties.length}`} />
            <DataGrid
              autoHeight
              hideFooter
              rows={rowsSpecialties}
              columns={columns}
              disableRowSelectionOnClick
              pagination={undefined}
              localeText={{...ptBR.components.MuiDataGrid.defaultProps.localeText, noRowsLabel: 'Nenhum registro encontrado', columnMenuManageColumns: 'Gerenciar colunas',}}
          />
          </TabPanel>*/}
          </TabContext>
        </CardContent>
      </Card>

      <ModalBudget
        open={openModal}
        setOpen={setOpenModal}
        budget={selectedRowDebits}

        // clearBudget={() => setSelectedRowDebits(null)}
      />
    </>
  )
}

export default AnalyticsReceiptReport
