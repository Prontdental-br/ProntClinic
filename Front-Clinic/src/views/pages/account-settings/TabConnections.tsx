import React, { useState } from 'react'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography
} from '@mui/material'

interface CaixaDataType {
  id: number
  name: string
  description: string
  active: boolean
}

const TabConnections: React.FC = () => {
  const [caixaData, setCaixaData] = useState<CaixaDataType[]>([
    {
      id: 1,
      name: 'CADEIRA 1',
      description: 'DESCRIÇÃO REFERENTE A CADEIRA 1',
      active: true
    },
    {
      id: 2,
      name: 'CADEIRA 2',
      description: 'DESCRIÇÃO REFERENTE A CADEIRA 2',
      active: true
    }
  ])
  const [openDialog, setOpenDialog] = useState(false)
  const [editData, setEditData] = useState<CaixaDataType | null>(null)

  const handleOpenDialog = (data?: CaixaDataType) => {
    setEditData(data || null)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleSave = (data: CaixaDataType) => {
    if (editData) {
      setCaixaData(caixaData.map(d => (d.id === editData.id ? data : d)))
    } else {
      setCaixaData([...caixaData, { ...data, id: Date.now() }])
    }
    handleCloseDialog()
  }

  const handleDelete = (id: number) => {
    setCaixaData(caixaData.filter(d => d.id !== id))
  }

  return (
    <Card>
      <CardHeader
        action={
          <Button variant='contained' onClick={() => handleOpenDialog()}>
            Adicionar
          </Button>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          {caixaData.map(data => (
            <Grid item xs={12} key={data.id}>
              <Card>
                <CardHeader title={data.name} />
                <CardContent>
                  <Typography variant='body2'>{data.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button variant='contained' onClick={() => handleOpenDialog(data)}>
                    Visualizar
                  </Button>
                  <Button color='error' onClick={() => handleDelete(data.id)}>
                    Deletar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      {openDialog && (
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{editData ? 'Editar Caixa' : 'Adicionar Cadeiras'}</DialogTitle>
          <DialogContent>
            <TextField label='Nome' defaultValue={editData?.name} />
            <TextField label='Descrição' defaultValue={editData?.description} />
            <FormControlLabel control={<Switch defaultChecked={editData?.active || false} />} label='Ativo' />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={() => {
                // Aqui você pode implementar o código para salvar os dados
                // Utilizei um exemplo simples para demonstrar
                handleSave({
                  id: editData?.id || Date.now(),
                  name: 'Novo Nome', // Substitua por dados reais
                  description: 'Nova Descrição', // Substitua por dados reais
                  active: true // Substitua por dados reais
                })
              }}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  )
}

export default TabConnections
