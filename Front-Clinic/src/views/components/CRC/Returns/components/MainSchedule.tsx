import { useContext } from 'react'
import ColumnSchedule from './ColumnSchedule'
import styles from '../style/schedule.module.css'
import { Stack, Button, Select, MenuItem } from '@mui/material'
import CadSalesModalSchedule from './CadScheduleModal'
import EditChanceModalSchedule from './EditChanceModalSchedule'
import { Status } from 'src/context/types'
import returnsContext from '../returnsContext'


export default function MainShedule({fetchData}: any) {
  const context = useContext(returnsContext)

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
      {/** gerar colunas de acordo com os status */}
      <div className={styles.grid_columns}>
        {context.statuses.map((status: Status) => (
          <ColumnSchedule
            key={status.name}
            name={status.name}
            label={status.label}

            // warning={status.warning}
            chances={context.chances}
          />
        ))}
      </div>
      <CadSalesModalSchedule
        open={context.showCadSales}
        fullWidth
        maxWidth='sm'
        closeDialog={() => context.setShowCadSales(false)}
        saveChance={context.saveChance}
        fetchData={fetchData}
      />
      <EditChanceModalSchedule
        open={context.showEditChanceModal}
        fullWidth
        maxWidth='md'
        closeDialog={() => context.setShowEditChanceModal(false)}
        fetchData={fetchData}
      />
    </>
  )
}
