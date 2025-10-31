// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

interface tableHeaderStockProps {
  value: string
  toggle: (id: string | number | null) => void
  print: () => void
  toggleWithdrawal: (id: string | number | null) => void
  handleFilter: (val: string) => void
}

const TableHeaderStock = (props: tableHeaderStockProps) => {
  const { handleFilter, toggle, value, print } = props

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'right' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size='small'
          value={value}
          sx={{ mr: 6, mb: 2 }}
          placeholder='Filtrar produto'
          onChange={e => handleFilter(e.target.value)}
        />

        <Button sx={{ mb: 2 }} style={{ marginRight: 12 }} onClick={() => toggle(null)} variant='contained'>
          + Adicionar estoque
        </Button>

        <Button sx={{ mb: 2 }} style={{ marginRight: 12 }} onClick={() => print()} variant='contained'>
          Imprimir estoque
        </Button>
      </Box>
    </Box>
  )
}

export default TableHeaderStock
