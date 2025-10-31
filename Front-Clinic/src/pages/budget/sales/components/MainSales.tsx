import { useContext } from 'react'
import Column from './Column'
import styles from '../style/sales.module.css'
import { Stack, Button, Select, MenuItem } from '@mui/material'
import CadSalesModal from './CadSalesModal'
import EditChanceModal from './EditChanceModal'
import { Status } from 'src/context/types'
import salesContext from '../salesContext'

export default function MainSales({fetchData}: any) {
  const context = useContext(salesContext)

  return (
    <>
      <Stack direction='row-reverse' spacing={2} mb={4}>
        {/*<Button onClick={() => context.setShowCadSales(true)} color='success' variant='contained'>
          Nova oportunidade
        </Button>*/}
        <Select value={context.filter} onChange={e => context.setFilter(e.target.value)}>
          <MenuItem value='all'>Todo período</MenuItem>
          <MenuItem value='week'>Dessa semana</MenuItem>
          <MenuItem value='month'>Desse mês</MenuItem>
          <MenuItem value='daily'>Desse dia</MenuItem>
        </Select>
      </Stack>
    
      <div className={styles.grid_columns}>
        {context.statuses.map((status: Status) => (
          <Column
            key={status.name}
            name={status.name}
            label={status.label}

            // warning={status.warning}
            chances={context.chances}
          />
        ))}
      </div>
      <CadSalesModal
        open={context.showCadSales}
        fullWidth
        maxWidth='sm'
        closeDialog={() => context.setShowCadSales(false)}
        saveChance={context.saveChance}
        fetchData={fetchData}
      />
      <EditChanceModal
        open={context.showEditChanceModal}
        fullWidth
        maxWidth='md'
        closeDialog={() => context.setShowEditChanceModal(false)}
        fetchData={fetchData}
      />
    </>
  )
}
