// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { MouseEventHandler } from 'react';

interface tableHeaderProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onClick: ()=>void;
}

const TableHeaderAnamnese = (props: tableHeaderProps) => {
  const { onClick } = props

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'right' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button sx={{ mb: 2 }} style={{ marginRight: 12 }} onClick={onClick} variant='contained'>
          Adicionar
        </Button>
      </Box>
    </Box>
  )
}

export default TableHeaderAnamnese
