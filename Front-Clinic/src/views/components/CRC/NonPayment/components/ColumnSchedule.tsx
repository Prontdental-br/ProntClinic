import React, { useContext } from 'react'
import { useRef } from 'react'
import styles from '../style/nonPayment.module.css'
import { Card, Box } from '@mui/material'
import { Typography } from '@mui/material'
import { Chance } from 'src/context/types'
import ChanceItem from './ChanceItemSchedule'
import api from 'src/@core/components/api-client'
import scheduleContext from '../nonPaymentContext'

type Props = {
  name: string
  label: string
  warning?: string
  chances?: Array<Chance>
}

const statusLabels: any = {
  'opened': 'O',
  'in_progress': 'A',
  'won': 'P',
  'lost': 'R'
}

export default function ColumnSchedule({ name, label, warning, chances }: Props) {
  const componentRef = useRef<HTMLDivElement>(null)
  const context = useContext(scheduleContext)

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    componentRef.current?.classList.add(styles.column_item_drag_over)
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    componentRef.current?.classList.remove(styles.column_item_drag_over)
  }

 async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault()
  componentRef.current?.classList.remove(styles.column_item_drag_over)

  const chanceId = event.dataTransfer?.getData('text/plain')?.trim()
  if (!chanceId) return

  const oldChance = context.findChanceById(chanceId)
  if (!oldChance) return

  const labelToStatus: Record<string, 'opened' | 'in_progress' | 'won' | 'lost'> = {
    'Parcela Vencida': 'opened',
    'Contato Realizado': 'in_progress',
    'Renegociação': 'won'
  }

  const newStatus = labelToStatus[label] || 'opened'
  const updatedChance = { ...oldChance, status: newStatus }

  context.setChances((prev: any) => {
  
    const updatedList = prev
      .filter((chance: any) => chance.id !== chanceId)
      .concat(updatedChance)

    return updatedList
  })

  try {
    await api.patch(`/transactions/status/${updatedChance.id}`, {
      status: newStatus
    })
  } catch (err) {
    console.error('Erro ao atualizar status da transação:', err)
  }
}

  function getColumnTotalQuantity() {
    const total = chances?.reduce((acc, item) => acc + (item.quantity || 0), 0)

    return `Quantidade: ${total || 0}`
  }

 function getColumnTotalAmount() {
  const filtered = chances?.filter(item => item.status === name) || [];

  const total = filtered.reduce((acc: number, item: Chance) => {
    const amount = Number(item.amount);
    
return acc + (isNaN(amount) ? 0 : amount);
  }, 0);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(total);
}

  return (
    <Card
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      component='div'
      ref={componentRef}
      className={styles.column_item}
    >
      <Typography variant='h6'>{label}</Typography>
      <p
        style={{
          marginTop: 0,
          marginBottom: '10px',
          fontWeight: '600',
          textAlign: 'left'
        }}
      >
        {getColumnTotalQuantity()}
      </p>
      <p   style={{
          marginTop: 0,
          marginBottom: '10px',
          fontWeight: '600',
          textAlign: 'left'
        }}>
        {getColumnTotalAmount()}
      </p>
      <Box className={styles.card_box} pt={3}>
        {chances
          ?.map((chanceItem: Chance, idx) => (
            <ChanceItem key={idx} chance={chanceItem} />
          ))}
        <p style={{ pointerEvents: 'none' }}>{warning}</p>
      </Box>
    </Card>
  )
}
