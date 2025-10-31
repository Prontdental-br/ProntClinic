import { useContext, useRef } from 'react'
import { Chance } from 'src/context/types'
import styles from '../style/nonPayment.module.css'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import { Stack, Box } from '@mui/material'
import nonPaymentContext from '../nonPaymentContext'
import { CalendarMonthOutlined } from '@mui/icons-material'


//import html2canvas from 'html2canvas'

type Props = {
  chance: Chance
}

export default function ChanceItemSchedule({ chance }: Props) {
  const componentRef = useRef<HTMLElement>(null)
  const context = useContext(nonPaymentContext)

  function handleDragStart(event: React.DragEvent<HTMLDivElement>) {
    event.dataTransfer?.setData('text/plain', chance.id || '')
  }

  function handleClick() {
    context.handleEditChance(chance)
  }

  return (
    <Box
      component='article'
      mb={2}
      ref={componentRef}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={styles.chance_item}
      style={{ backgroundColor: context.getChanceStatusColor(chance, '99') }}
      draggable='true'
    >
      <div
        className={styles.chance_item_badge}
        style={{ backgroundColor: context.getChanceStatusColor(chance) }}
      >
        {chance.type === 'opportunity' ? <RocketLaunchIcon /> : <CalendarMonthOutlined />}
      </div>
      <Stack>
        <span style={{ color: '#fff', fontWeight: 'bold' }}>{chance.title}</span>
        <span>{chance.author}</span>
      <span>
  {chance.amount?.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })}
</span>
      </Stack>
    </Box>
  )
}
