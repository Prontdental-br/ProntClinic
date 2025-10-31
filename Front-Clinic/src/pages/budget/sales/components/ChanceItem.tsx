import { useContext, useRef } from 'react'
import { Chance } from 'src/context/types'
import styles from '../style/sales.module.css'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import salesContext from '../salesContext'
import { Stack, Box } from '@mui/material'

//import html2canvas from 'html2canvas'

type Props = {
  chance: Chance
}

export default function ChanceItem({ chance }: Props) {
  const componentRef = useRef<HTMLElement>(null)
  const context = useContext(salesContext)

  function handleDragStart(event: React.DragEvent<HTMLDivElement>) {
    event.dataTransfer?.setData('text/plain', (chance.id || ''))

    // html2canvas(componentRef.current as HTMLElement).then(canvas => {
    //   const dataURL = canvas.toDataURL()
    //   const img = new Image()
    //   img.src = dataURL
    //   img.onload = () => {
    //     event.dataTransfer?.setDragImage(img, 20, 20)
    //   }
    // })
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
      <div className={styles.chance_item_badge} style={{ backgroundColor: context.getChanceStatusColor(chance) }}>
        {chance.type == 'opportunity' ? <RocketLaunchIcon /> : <AttachMoneyIcon />}
      </div>
      <Stack>
        <span style={{ color: '#fff', fontWeight: 'bold' }}>{chance.title}</span>
        <span>{chance.author}</span>
        <span>{chance.getAmount()}</span>
      </Stack>
    </Box>
  )
}
