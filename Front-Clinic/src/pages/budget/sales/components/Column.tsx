import React, { useContext } from 'react'
import { useRef } from 'react'
import styles from '../style/sales.module.css'
import { Card, Box } from '@mui/material'
import { Typography } from '@mui/material'
import { Chance } from 'src/context/types'
import ChanceItem from './ChanceItem'
import salesContext from '../salesContext'
import api from 'src/@core/components/api-client'

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

export default function Column({ name, label, warning, chances }: Props) {
  const componentRef = useRef<HTMLDivElement>(null)
  const context = useContext(salesContext)

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
    console.log(event.dataTransfer?.getData('text/plain'))
    const data = event.dataTransfer?.getData('text/plain')
    const chance: Chance = context.chances?.find(
      (item: Chance) => item.id === data.replace(/\s/g, '')
    )

    if (chance) {
      console.log(name)
      chance.setNewStatus(name, label)
      context.forceUpdate()
      if(chance.type === 'opportunity')
        api.patch(`sales/${event.dataTransfer?.getData('text/plain')}`, { status: name })
      else
        api.patch(`budgets/status/${event.dataTransfer?.getData('text/plain')}`, { status: statusLabels[name] })
    }

  }

  function getColumnTotalAmount() {
    const total = chances
      ?.filter(item => item.status == name)
      .reduce((acc: number, item: Chance) => {
        return acc + (item.amount || 0)
      }, 0)

    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total || 0)
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
      <p style={{ marginTop: 0, marginBottom: '10px', fontWeight: '600', textAlign: 'left' }}>
        {getColumnTotalAmount()}
      </p>
      <Box className={styles.card_box} pt={3}>
        {chances
          ?.filter(item => item.status == name)
          .map((chanceItem: Chance, idx) => (
            <ChanceItem key={idx} chance={chanceItem} />
          ))}
        <p style={{ pointerEvents: 'none' }}>{warning}</p>
      </Box>
    </Card>
  )
}
