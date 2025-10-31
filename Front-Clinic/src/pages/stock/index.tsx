// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import { GridColDef, GridRowId, GridValueGetterParams, ptBR } from '@mui/x-data-grid'
import { DataGrid } from '@mui/x-data-grid/DataGrid' 
import toast from 'react-hot-toast';

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { AddCircleOutline, RemoveCircleOutline, DeleteOutline } from '@mui/icons-material'

// ** Types Imports

import { InvoiceType } from 'src/types/apps/invoiceTypes'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import TableHeaderStock from './tableHeaderStock'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CardContent,
  CardHeader,
  Input,
  FormHelperText
} from '@mui/material'
import api from 'src/@core/components/api-client'
import { usePathname } from 'next/navigation'
import { createAsyncThunk } from '@reduxjs/toolkit'
import CurrencyFormat from 'react-currency-format'

interface CellType {
  row: StockFieldsType
}

interface StockFieldsType {
  id: string
  nomeProduto: string;
  categoria: string;
  unidadeDeMedida: string;
  quantidade: number;
  preco: number;
  fornecedor: string;
  fabricante: string;
  validade: string;
  dataFabricacao: string;
  precoVenda: number;
  LocalEstoque: string;
  lote: string;
  armazenamento: string;
  status: number;
  obs: string;
  minimoAlerta: number;
}

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const defaultColumns: GridColDef[] = [
  {
    field: 'nomeProduto',
    headerName: 'Nome do Produto',
    width: 400
  },
  { field: 'quantidade', headerName: 'Quantidade', width: 200 },
  {
    field: 'preco',
    headerName: 'Preço',
    width: 200,
    renderCell: ({ row }: CellType) => <Typography variant='body2'>{`R$ ${row.preco || 0}`}</Typography>
  },
]

const Stock = () => {
  const pathname = usePathname();
  const [counter, setCounter] = useState(1)
  const [gridData, setGridData] = useState<any[]>([])
  const [allData, setAllData] = useState<any[]>([]) 
  const [value, setValue] = useState<string>('')
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [openWithdrawal, setOpenWithdrawal] = useState<boolean>(false)
  const [openAddStock, setOpenAddStock] = useState<boolean>(false)
  const [openDetails, setOpenDetails] = useState<boolean>(false)
  const [nameWithdrawal, setNameWithdrawal] = useState<string>('')
  const [selectQ, setSelectQ] = useState<number>(0)
  const [qWithdrawal, setQWithdrawal] = useState<number>(0)
  const [limitQWithdrawal, setLimitQWithdrawal] = useState<number>(0)
  const [selectedRowId, setSelectedRowId] = useState('');
  const [selectedRow, setSelectedRow] = useState<StockFieldsType | null>(null)
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null)
  const [itemToDeleteName, setItemToDeleteName] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [openConfirmWithdrawal, setOpenConfirmWithdrawal] = useState(false)
  const [pendingWithdrawal, setPendingWithdrawal] = useState<{ rowId: string; quantity: number } | null>(null)

  const [formData, setFormData] = useState({
    nomeProduto: '',
    categoria: '',
    unidadeDeMedida: '',
    quantidade: '',
    preco: '',
    fornecedor: '',
    fabricante: '',
    validade: '',
    dataFabricacao: '',
    precoVenda: '',
    LocalEstoque: '',
    lote: '',
    armazenamento: '',
    status: '',
    obs: '',
    minimoAlerta: ''
  })
  const [isPrinting, setIsPrinting] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    setIsPrinting(true); 
    setTimeout(() => {
      if (tableRef.current) {
        const printContent = tableRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
  
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
      }
      setIsPrinting(false); 
    }, 200);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.nomeProduto.trim()) {
      newErrors.nomeProduto = 'O nome do produto é obrigatório.';
      isValid = false;
    }
    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      newErrors.quantidade = 'A quantidade deve ser um número positivo.';
      isValid = false;
    }
    setErrors(newErrors);
    
return isValid;
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return '-'

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    
return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR')
  }

  const statusMap: Record<number, string> = {
    0: 'Ativo',
    1: 'Inativo',
    2: 'Em Falta'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  // ** Hooks
  const resetStates = () => {
    setFormData({
      nomeProduto: '',
      categoria: '',
      unidadeDeMedida: '',
      quantidade: '',
      preco: '',
      fornecedor: '',
      fabricante: '',
      validade: '',
      dataFabricacao: '',
      precoVenda: '',
      LocalEstoque: '',
      lote: '',
      armazenamento: '',
      status: '',
      obs: '',
      minimoAlerta: ''
    });
    setValue('')
    setOpenEdit(false)
    setOpenWithdrawal(false)
    setNameWithdrawal('')
    setQWithdrawal(0)
    setLimitQWithdrawal(0)
    setSelectedRow(null)
    setSelectQ(0);
    setSelectedRowId(''); 
  }

  const handleEditClose = () => {
    setOpenEdit(false); 
    resetStates();
  }

  const handleEditCloseWithdrawal = () => {
    setOpenWithdrawal(false);
    resetStates();
  }

  const handleEditCloseAddStock = () => {
    setOpenAddStock(false);
    resetStates();
  };

  const handleOpenDetailsClose = () => setOpenDetails(false)

  const handleOpenCloseModal = (id: string | number | null, name?: string, qtd?: number) => {
    setOpenEdit(!openEdit)
  }

  const handleOpenCloseModalAddStock = (id: string, name?: string, minimoAlerta?: number, qtd?: number) => {
    setSelectQ(qtd as number);
    setSelectedRowId(id);
    setNameWithdrawal(name as string);
    setOpenAddStock(!openAddStock);
  }

  const handleOpenCloseModalWithdrawal = (id: string, name?: string, minimoAlerta?: number, qtd?: number) => {
    setSelectQ(qtd as number);
    setSelectedRowId(id);
    setNameWithdrawal(name as string);
    setLimitQWithdrawal(minimoAlerta as number);
    setOpenWithdrawal(!openWithdrawal);
    setOpenDetails(false);
  }

  const handleOpenDeleteModal = (id: string, nome: string) => {
    setItemToDeleteId(id)
    setItemToDeleteName(nome)
    setOpenDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (itemToDeleteId) {
      await deleteItem(itemToDeleteId)
      setOpenDeleteModal(false)
      toast.success('Item excluido com sucesso');
      setItemToDeleteId(null)
    }
  }

  const handleAddStock = async (rowId: string, quantity: number) => {
    try {
      const data = {
        id: rowId,
        quantity
      };


      await api.post('/stocks/add', data);
      handleEditCloseAddStock();
      fetchData();
      setFormData({
        nomeProduto: '',
        categoria: '',
        unidadeDeMedida: '',
        quantidade: '',
        preco: '',
        fornecedor: '',
        fabricante: '',
        validade: '',
        dataFabricacao: '',
        precoVenda: '',
        LocalEstoque: '',
        lote: '',
        armazenamento: '',
        status: '',
        obs: '',
        minimoAlerta: ''
      })

    } catch (e) {
      console.error(e);
    }
  }

  const handleEditItem = async (itemId: string) => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const data = {
        productName: formData.nomeProduto,
        category: formData.categoria,
        unitOfMeasure: formData.unidadeDeMedida,
        quantidade: parseInt(formData.quantidade),
        preco: parseFloat(formData.preco.replaceAll(',', '.')),
        supplier: formData.fornecedor,
        manufacturer: formData.fabricante,
        expiryDate: new Date(formData.validade),
        manufactureDate: new Date(formData.dataFabricacao),
        sellingPrice: parseFloat(formData.precoVenda.replaceAll(',', '.')),
        storageLocation: formData.LocalEstoque,
        batch: formData.lote,
        storage: formData.armazenamento,
        status: parseInt(formData.status),
        observation: formData.obs,
        minimumquantityalert: parseInt(formData.minimoAlerta)
      };

      await api.put(`/stocks/${itemId}`, data); 
      
      fetchData();
      handleEditClose();
      toast.success('Item atualizado com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Ocorreu um erro ao atualizar o item.');
    }
  };

  const handleOpenEditModal = (row: StockFieldsType) => {
    setFormData({
      nomeProduto: row.nomeProduto || '',
      categoria: row.categoria || '',
      unidadeDeMedida: row.unidadeDeMedida || '',
      quantidade: (row.quantidade || 0).toString(),
      preco: (row.preco || 0).toString(),
      fornecedor: row.fornecedor || '',
      fabricante: row.fabricante || '',
      validade: row.validade ? row.validade.split('T')[0] : '',
      dataFabricacao: row.dataFabricacao ? row.dataFabricacao.split('T')[0] : '',
      precoVenda: (row.precoVenda || 0).toString(),
      LocalEstoque: row.LocalEstoque || '',
      lote: row.lote || '',
      armazenamento: row.armazenamento || '',
      status: (row.status || 0).toString(),
      obs: row.obs || '',
      minimoAlerta: (row.minimoAlerta || 0).toString(),
    });
    setSelectedRowId(row.id);
    setOpenEdit(true);
  };

  const handleWithdrawal = async (rowId: string, quantity: number) => {
    try {
      if (limitQWithdrawal >= selectQ - quantity) {
        setPendingWithdrawal({ rowId, quantity });
        setOpenConfirmWithdrawal(true);
        
return;
      }
      await executeWithdrawal({ rowId, quantity });
    } catch (e) {
      console.error(e);
    }
  };

  const confirmWithdrawal = async () => {
    if (!pendingWithdrawal) return;
    await executeWithdrawal(pendingWithdrawal);
    setPendingWithdrawal(null);
    setOpenConfirmWithdrawal(false);
  };

  const executeWithdrawal = async ({ rowId, quantity }: { rowId: string; quantity: number }) => {
    try {
      await api.post('/stocks/withdrawal', { id: rowId, quantity });
      resetStates();
      handleEditClose();
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };


  const handleAddItem = async (newItem: StockFieldsType) => {
    if (!validateForm()) {
      return;
    }
    try {
      console.log(newItem)
      if (newItem) {
        const newItem = {
          ...formData
        }
        setCounter(counter + 1)

        const data = {
          productName: formData.nomeProduto,
          category: formData.categoria,
          unitOfMeasure: formData.unidadeDeMedida,
          quantity: parseInt(formData.quantidade),
          price: parseFloat(formData.preco.replaceAll(',','.')),
          supplier: formData.fornecedor,
          manufacturer: formData.fabricante,
          expiryDate: formData.validade ? new Date(formData.validade) : null,
          manufactureDate: formData.dataFabricacao ? new Date(formData.dataFabricacao) : null,
          sellingPrice: parseFloat(formData.precoVenda.replaceAll(',','.')),
          storageLocation: formData.LocalEstoque,
          batch: formData.lote,
          storage: formData.armazenamento,
          status: parseInt(formData.status),
          observation: formData.obs,
          minimumquantityalert: parseInt(formData.minimoAlerta)
        };

        console.log('data', data)
const resp = await api.post('/stocks', data);
        let d = resp.data;
        d = {
          "id": d.id,
          "nomeProduto": d.productName,
          "categoria": d.category,
          "unidadeDeMedida": d.unitOfMeasure,
          "quantidade": d.quantity,
          "preco": d.price,
          "fornecedor": d.supplier,
          "fabricante": d.manufacturer,
          "validade": d.expiryDate.replaceAll("/", "-"),
          "dataFabricacao": d.manufactureDate.replaceAll("/", "-"),
          "precoVenda": d.sellingPrice,
          "LocalEstoque": d.storageLocation,
          "lote": d.batch,
          "armazenamento": d.storage,
          "status": d.status,
          "obs": d.observation,
          "minimoAlerta": d.minimumquantityalert
        }
        fetchData()
        resetStates();
        handleEditClose();
        toast.success('Item adicionado com sucesso!');
      }
    } catch (e) {
      console.error(e);
      toast.error('Ocorreu um erro ao adicionar o item.');
    }
  }


  const handleRowClick = (rowId: string) => {
    const item = gridData.find((data) => data.id === rowId)
    console.log(item)
    if (item) {
      setSelectedRow(item)
      setOpenDetails(true);
    }
  }

 const handleFilter = (val: string) => {
  setValue(val)
  const filtered = allData.filter(item =>
    item.nomeProduto?.toLowerCase().includes(val.toLowerCase())
  )
  setGridData(filtered)
}

  const deleteItem = async (id: string) => {
    try {
      const { data } = await api.delete(`/stocks/${id}`);
      console.log(data);
      setGridData(gridData.filter(d => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  const columns: GridColDef[] = [
    ...defaultColumns,
    {
      field: 'dataFabricacao',
      headerName: 'Data de fabricação',
      type: 'date',
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        if (params) {
          const dateParts = params.row.dataFabricacao.split('-');
          
return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        }
      }
    },
    {
      field: 'validade',
      headerName: 'Validade',
      type: 'date',
      width: 400,
      valueGetter: (params: GridValueGetterParams) => {
        if (params) {
          const dateParts = params.row.validade.split('-');
          
return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        }
      }
    },
    {
      flex: 0.1,
      minWidth: 300,
      sortable: false,
      field: 'actions',
      headerName: 'Ações',
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='Adicionar'>
            <IconButton size='small' sx={{ mr: 0.5 }} onClick={() => handleOpenCloseModalAddStock(row.id, row.nomeProduto, row.minimoAlerta, row.quantidade)}>
              <AddCircleOutline sx={{ color: 'green' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Retirada'>
            <IconButton size='small' sx={{ mr: 0.5 }} onClick={() => handleOpenCloseModalWithdrawal(row.id, row.nomeProduto, row.minimoAlerta, row.quantidade)}>
              <RemoveCircleOutline sx={{ color: 'blue' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Editar Item'>
            <IconButton size='small' sx={{ mr: 0.5 }}  onClick={() => handleOpenEditModal(row)}>
              <Icon icon='mdi:pencil-outline' color='blue' />
            </IconButton>
          </Tooltip>

          <Tooltip title='Deletar Item'>
            <IconButton size='small' sx={{ mr: 0.5 }} onClick={() => handleOpenDeleteModal(row.id, row.nomeProduto)}>
              <Icon icon='mdi:delete-outline' color='red' />
            </IconButton>
          </Tooltip>

        </Box>
      )
    }
  ]

const columnsToPrint = columns.filter(col => col.field !== 'actions');

  const categorias = [
    { id: 1, desc: 'Instrumentos de Diagnóstico' },
    { id: 2, desc: 'Materiais Restauradores' },
    { id: 3, desc: 'Produtos de Higiene Oral' },
    { id: 4, desc: 'Equipamentos Odontológicos' },
    { id: 5, desc: 'Soluções Anestésicas' },
    { id: 6, desc: 'Instrumentos Cirúrgicos' },
    { id: 7, desc: 'Produtos de Proteção e Segurança' },
    { id: 8, desc: 'Materiais de Moldagem' },
    { id: 9, desc: 'Instrumentos Endodônticos' },
    { id: 10, desc: 'Próteses e Implantes' },
    { id: 11, desc: 'Estética' },
    { id: 12, desc: 'Produtos estéticos' },
    { id: 13, desc: 'Medicamentos' },
    { id: 14, desc: 'Pós Operatório' },
  ]

  const unidadesDeMedida = ['Unidade', 'Caixa', 'Pacote', 'Frasco', 'Tubo', 'Litro', 'Kilograma']

  const fetchData = async () => {
    let { data } = await api.get('/stocks');
    console.log(data)
    data = data.map((d: any) => Object.assign(
      {
        "id": d.id,
        "nomeProduto": d.productName,
        "categoria": d.category,
        "unidadeDeMedida": d.unitOfMeasure,
        "quantidade": d.quantity,
        "preco": d.price,
        "fornecedor": d.supplier,
        "fabricante": d.manufacturer,
        "validade": d.expiryDate.replaceAll("/", "-"),
        "dataFabricacao": d.manufactureDate.replaceAll("/", "-"),
        "precoVenda": d.sellingPrice,
        "LocalEstoque": d.storageLocation,
        "lote": d.batch,
        "armazenamento": d.storage,
        "status": d.status,
        "obs": d.observation,
        "minimoAlerta": d.minimumquantityalert

      }));
    setGridData(data);
    setAllData(data);
  };

  useEffect(() => {
    fetchData();
  }, [pathname]);

  return (
    <DatePickerWrapper>
      <Card>
        <CardHeader title='Estoque' />
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <TableHeaderStock print={handlePrint} value={value} handleFilter={handleFilter} toggle={() => handleOpenCloseModal(null)} toggleWithdrawal={() => handleOpenCloseModalWithdrawal('')} />
                <div ref={tableRef}>
                <DataGrid
                  autoHeight
                  disableColumnFilter
                  rows={gridData}
                  columns={isPrinting ? columnsToPrint : columns}
                  pagination={true}
                  hideFooterPagination={isPrinting}
                  onCellClick={params => {
                    console.log(params.field);
                    if (params.field === 'nomeProduto')
                      handleRowClick(params.id as string)
                  }}
                  checkboxSelection={false}
                  localeText={{
                    ...ptBR.components.MuiDataGrid.defaultProps.localeText,
                    noRowsLabel: 'Nenhum registro encontrado',
                    columnMenuManageColumns: 'Gerenciar colunas',
                  }}
                  />
                </div>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog
        open={openEdit}
        onClose={handleEditClose}
        aria-labelledby='item-view-edit'
        aria-describedby='item-view-edit-description'
        sx={{ '& .MuiPaper-root': { 
          width: {
            xs: '90%',
            sm: '90%',
            md: '90%',
            lg: '80%',
            xl: '70%'
          },
          maxWidth: '1600px', 
        } }}
      >
        <DialogTitle
          id='item-view-edit'
          sx={{
            display: 'flex',
            backgroundColor: '#e0e0e0ff',
            pl: 4,
            pt: 3,
            pb: 1
          }}
        >
          <Typography variant='h6' component='div' sx={{ marginBottom: 2, marginLeft: 4 }}>
            Cadastrar item para Estoque
          </Typography>
          
        </DialogTitle>
        <DialogContent
        >
          <DialogContentText variant='body2' id='item-view-edit-description' sx={{ textAlign: 'center', m: 5 }}>
            Os detalhes atualizados passarão por uma auditoria de conformidade.
          </DialogContentText>
          <form>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Nome do Produto'
                  name='nomeProduto'
                  value={formData.nomeProduto}
                  onChange={handleInputChange}
                  error={!!errors.nomeProduto}
                  helperText={errors.nomeProduto}
                />
              </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.categoria}>
                <InputLabel id='item-view-category-label'>Categoria</InputLabel>
                <Select
                  label='Categoria'
                  id='item-view-category'
                  labelId='item-view-category-label'
                  name='categoria'
                  value={formData.categoria}
                  onChange={(e: SelectChangeEvent<string>) => handleInputChange(e as any)}
                >
                  {categorias.map(categoria => (
                    <MenuItem key={categoria.id} value={categoria.desc}>
                      {categoria.desc}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoria && <FormHelperText>{errors.categoria}</FormHelperText>}
              </FormControl>
            </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Fabricante'
                  name='fabricante'
                  value={formData.fabricante}
                  onChange={handleInputChange}
                  error={!!errors.fabricante}
                  helperText={errors.fabricante}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Fornecedor'
                  name='fornecedor'
                  value={formData.fornecedor}
                  onChange={handleInputChange}
                  error={!!errors.fornecedor}
                  helperText={errors.fornecedor}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label='Número do Lote'
                  name='lote'
                  value={formData.lote}
                  onChange={handleInputChange}
                  error={!!errors.lote}
                  helperText={errors.lote}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth error={!!errors.unidadeDeMedida}>
                  <InputLabel id='item-view-unidade-label'>Unidade de Medida</InputLabel>
                  <Select
                    label='Unidade de Medida'
                    id='item-view-unidade'
                    labelId='item-view-unidade-label'
                    name='unidadeDeMedida'
                    value={formData.unidadeDeMedida}
                    onChange={(e: SelectChangeEvent<string>) => handleInputChange(e as any)}
                  >
                    {unidadesDeMedida.map((unidade, index) => (
                      <MenuItem key={index} value={unidade}>
                        {unidade}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.unidadeDeMedida && <FormHelperText>{errors.unidadeDeMedida}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label='Quantidade em Estoque'
                  name='quantidade'
                  value={formData.quantidade}
                  onChange={handleInputChange}
                  error={!!errors.quantidade}
                  helperText={errors.quantidade}
                  disabled={!!selectedRowId}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label='Minimo de quantidade de alerta'
                  name='minimoAlerta'
                  value={formData.minimoAlerta}
                  onChange={handleInputChange}
                  error={!!errors.minimoAlerta}
                  helperText={errors.minimoAlerta}
                />
              </Grid>
             <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Localização no Estoque'
                  name='LocalEstoque'
                  value={formData.LocalEstoque}
                  onChange={handleInputChange}
                  error={!!errors.LocalEstoque}
                  helperText={errors.LocalEstoque}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  placeholder="Preço de Compra"
                  label="Preço de Compra"
                  name='preco'
                  value={formData.preco}
                  onChange={handleInputChange}
                  fullWidth 
                  error={!!errors.preco}
                  helperText={errors.preco}
                  inputProps={{
                    inputMode: 'decimal',
                    pattern: '[0-9]*[.,]?[0-9]*'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  placeholder="Preço de Venda"
                  label="Preço de Venda"
                  name='precoVenda'
                  value={formData.precoVenda} 
                  onChange={handleInputChange}
                  fullWidth 
                  error={!!errors.precoVenda}
                  helperText={errors.precoVenda}
                  inputProps={{
                    inputMode: 'decimal',
                    pattern: '[0-9]*[.,]?[0-9]*'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type='date'
                  label='Data de Fabricação'
                  name='dataFabricacao'
                  value={formData.dataFabricacao}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dataFabricacao}
                  helperText={errors.dataFabricacao}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type='date'
                  label='Data de Validade'
                  name='validade'
                  value={formData.validade}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.validadev}
                  helperText={errors.validade}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel id='item-view-status-label'>Status</InputLabel>
                  <Select
                    label='Status'
                    id='item-view-status'
                    labelId='item-view-status-label'
                    name='status'
                    value={formData.status.toString()}
                    onChange={(e) =>
                      handleInputChange({
                        target: { name: e.target.name, value: parseInt(e.target.value) },
                      } as any)
                    }
                  >
                    <MenuItem value={0}>Ativo</MenuItem>
                    <MenuItem value={1}>Inativo</MenuItem>
                    <MenuItem value={2}>Em Falta</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Instruções de Uso/Armazenamento'
                  name='armazenamento'
                  multiline
                  rows={4}
                  value={formData.armazenamento}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Observações'
                  multiline
                  rows={4}
                  name='obs'
                  value={formData.obs}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
            <Button variant='outlined' color='error' size='large' onClick={handleEditClose} sx={{ mr: 4 }}>
                Cancelar
            </Button>
            <Button
                variant='outlined'
                onClick={() => {
                    if (selectedRowId) {
                        handleEditItem(selectedRowId);
                    } else {
                        handleAddItem({ formData } as any);
                    }
                }}
            >
                Salvar
            </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDetails}
        onClose={handleOpenDetailsClose}
        aria-labelledby="item-view-edit"
        aria-describedby="item-view-edit-description"
        sx={{ '& .MuiPaper-root': { 
          width: {
            xs: '90%',
            sm: '90%',
            md: '90%',
            lg: '80%',
            xl: '70%'
          },
          maxWidth: '900px', 
        } }}
      >
        <DialogTitle
          id="item-view-edit"
          sx={{
            display: 'flex',
            backgroundColor: '#e0e0e0ff',
            pl: 4,
            pt: 3,
            pb: 1
          }}
        >
          <Typography variant='h6' component='div' sx={{ marginBottom: 2, marginLeft: 4 }}>
            Detalhes
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            m: 3,
          }}
        >
          <Grid container spacing={3}>
            {[
              { label: 'Nome do produto', value: selectedRow?.nomeProduto },
              { label: 'Categoria', value: selectedRow?.categoria },
              { label: 'Unidade de Medida', value: selectedRow?.unidadeDeMedida },
              { label: 'Quantidade', value: selectedRow?.quantidade },
              { label: 'Preço', value: selectedRow?.preco },
              { label: 'Fornecedor', value: selectedRow?.fornecedor },
              { label: 'Fabricante', value: selectedRow?.fabricante },
              { label: 'Validade', value: formatDate(selectedRow?.validade) },
              { label: 'Data de Fabricação', value: formatDate(selectedRow?.dataFabricacao) },
              { label: 'Preço de Venda', value: selectedRow?.precoVenda },
              { label: 'Local de Estoque', value: selectedRow?.LocalEstoque },
              { label: 'Lote', value: selectedRow?.lote },
              { label: 'Armazenamento', value: selectedRow?.armazenamento },
              { label: 'Status', value: statusMap[selectedRow?.status as number] },
              { label: 'Observações', value: selectedRow?.obs },
              { label: 'Mínimo de Alerta', value: selectedRow?.minimoAlerta }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="body1">{item.value || '-'}</Typography>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button variant='outlined' size='large' onClick={handleOpenDetailsClose}>
            FECHAR
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openWithdrawal}
        onClose={handleEditCloseWithdrawal}
        aria-labelledby='item-view-edit'
        aria-describedby='item-view-edit-description'
        sx={{ '& .MuiPaper-root': { 
          width: {
            xs: '90%',
            sm: '90%',
            md: '90%',
            lg: '80%',
            xl: '70%'
          },
          maxWidth: '450px', 
        } }}
      >
        <DialogTitle
          id="item-view-edit"
          sx={{
            display: 'flex',
            backgroundColor: '#e0e0e0ff',
            pl: 4,
            pt: 3,
            pb: 1
          }}
        >
          <Typography variant='h6' component='div' sx={{ marginBottom: 2, marginLeft: 4 }}>
            Retirar Item do Estoque
          </Typography>
        </DialogTitle>
        
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          <DialogContentText variant='body2' id='item-view-edit-description' sx={{textAlign: 'center', pt: 4 }}>
            <h3>{nameWithdrawal}</h3>
            <span>Quantidade do estoque atual: {selectQ}</span>

            <InputLabel sx={{ p: 4 }} htmlFor='user-view-security-confirm-new-password'>Quantidade de retirada</InputLabel>
            <TextField
              type='number'
              value={qWithdrawal}
              onChange={(e) => setQWithdrawal(parseInt(e.target.value))}
              id='account-settings-upload-image'
            />
          </DialogContentText>

        </DialogContent>


        <DialogActions sx={{justifyContent: 'center'}}>
          <Button variant='outlined' color='error' sx={{ mr: 2 }} onClick={handleEditCloseWithdrawal}>
            Cancelar
          </Button>
          <Button variant='outlined' type='submit' onClick={() => handleWithdrawal(selectedRowId, qWithdrawal)}>
            Retirar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openConfirmWithdrawal}
        onClose={() => setOpenConfirmWithdrawal(false)}
        aria-labelledby="confirm-withdrawal-title"
        aria-describedby="confirm-withdrawal-description"
      >
        <DialogTitle sx={{
            display: 'flex',
            backgroundColor: '#e0e0e0ff',
            pl: 4,
            pt: 3,
            pb: 1
          }} id="confirm-withdrawal-title">
          Confirmação Necessária
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{mt: 5}} id="confirm-withdrawal-description">
            A quantidade a ser retirada ultrapassa o limite recomendado de estoque.  
            Deseja continuar mesmo assim?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setOpenConfirmWithdrawal(false)}>
            Cancelar
          </Button>
          <Button variant="outlined"  onClick={confirmWithdrawal}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAddStock}
        onClose={handleEditCloseAddStock}
        aria-labelledby='item-view-edit'
        aria-describedby='item-view-edit-description'
        sx={{ '& .MuiPaper-root': { 
          width: {
            xs: '90%',
            sm: '90%',
            md: '90%',
            lg: '80%',
            xl: '70%'
          },
          maxWidth: '450px', 
        } }}
      >
        <DialogTitle
          id="item-view-edit"
          sx={{
            display: 'flex',
            backgroundColor: '#e0e0e0ff',
            pl: 4,
            pt: 3,
            pb: 1
          }}
        >
          <Typography variant='h6' component='div' sx={{ marginBottom: 2, marginLeft: 4 }}>
            Adicionar Item do Estoque
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          <DialogContentText variant='body2' id='item-view-edit-description' sx={{textAlign: 'center', pt: 4 }}>
            <h3>{nameWithdrawal}</h3>
            <span>Quantidade do estoque atual: {selectQ}</span>

            <InputLabel sx={{ p: 4 }} htmlFor='user-view-security-confirm-new-password'>Quantidade</InputLabel>
            <TextField
              type='number'
              value={qWithdrawal}
              onChange={(e) => setQWithdrawal(parseInt(e.target.value))}
              id='account-settings-upload-image'
            />
          </DialogContentText>

        </DialogContent>


        <DialogActions sx={{justifyContent: 'center'}}>
          <Button variant='outlined' color='error' onClick={handleEditCloseAddStock}>
            Cancelar
          </Button>
          <Button variant='outlined' type='submit' sx={{ mr: 2 }} onClick={() => handleAddStock(selectedRowId, qWithdrawal)}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        maxWidth="xs"
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle id='alert-dialog-title' sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0ff', padding: '12px 24px', }}>Atenção!</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description' sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', paddingTop: '18px ' }}>
            Produto: {itemToDeleteName}
          </DialogContentText>
          <DialogContentText id='alert-dialog-description' sx={{ color: 'text.secondary', mb: 2 }}>
            Essa ação não poderá ser desfeita!
          </DialogContentText>
          <DialogContentText id='alert-dialog-description' sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            Confirma exclusão do registro?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color='primary' variant='outlined'>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

    </DatePickerWrapper>
  )
}

export default Stock