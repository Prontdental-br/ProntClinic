import React, { useContext } from 'react'
import { useRef } from 'react'
import styles from '../style/deselections.module.css'
import { Card, Box } from '@mui/material'
import { Typography } from '@mui/material'
import { Chance } from 'src/context/types'
import ChanceItem from './ChanceItemSchedule'
import api from 'src/@core/components/api-client'
import scheduleContext from '../deselectionsContext'

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
  'Desmarcado': 'lost',
  'Contato Realizado': 'in_progress',
  'Agendada': 'won'
}

const internalStatus = labelToStatus[label] || 'opened'
  
  const updatedChance = { ...oldChance, status: internalStatus }

  console.log(updatedChance);

  context.setChancesGrouped((prev: typeof context.chancesGrouped) => {
    const newGrouped = { ...prev }

    for (const groupKey of Object.keys(newGrouped)) {
      newGrouped[groupKey] = newGrouped[groupKey].filter((ch: any) => ch.id !== chanceId)
    }

    if (!newGrouped[label]) {
      newGrouped[label] = []
    }
    newGrouped[label].push(updatedChance)

    return newGrouped
  })

  const endpoint = '/crc/canceled'
  await api.patch(`${endpoint}/${updatedChance.id}`, {
    status: label
  })
}

  function getColumnTotalQuantity() {
    const total = chances?.reduce((acc, item) => acc + (item.quantity || 0), 0)

    return `Quantidade: ${total || 0}`
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
