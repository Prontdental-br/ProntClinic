import { Card, FormLabel, Grid, MenuItem, Select } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import { useProsthesis } from 'src/context/ProsthesisContext'
import ChatKanbanBoard from 'src/views/pages/chat-settings/ChatKanbanBoard'
import ProsthesisKanbanBoard from 'src/views/pages/prosthesis/ProsthesisKanbanBoard'

function Prosthesis() {
  // const { filterTasksByPeriod } = useProsthesis();
  const [period, setPeriod] = React.useState<'all' | 'week' | 'month' | 'day'>('all')

  React.useEffect(() => {
    // filterTasksByPeriod(period);
  }, [period])

  return (
    <Grid container spacing={6}>
      {/* <Card style={{ width: '100%', padding: '20px', paddingBottom: '100px', marginTop: '10px' }}>
        <Card sx={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px' }}>
          <FormLabel sx={{ fontWeight: 600 }}>Período</FormLabel>
          <Select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
            <MenuItem value='all'>Todo período</MenuItem>
            <MenuItem value='week'>Dessa semana</MenuItem>
            <MenuItem value='month'>Desse mês</MenuItem>
            <MenuItem value='day'>Diário</MenuItem>
          </Select>
        </Card>
      </Card> */}

      <Box sx={{ mt: 6 }}>
        <ProsthesisKanbanBoard />
      </Box>
    </Grid>
  )
}

Prosthesis.aclAbilities = { action: 'read', subject: 'prosthesis' }

Prosthesis.requiredRole = 'admin'

Prosthesis.requiredPlan = 'P'
export default Prosthesis
