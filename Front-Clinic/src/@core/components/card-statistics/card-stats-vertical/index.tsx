// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types Imports
import { CardStatsVerticalProps } from 'src/@core/components/card-statistics/types'
import { CardHeader } from '@mui/material'
import OptionsMenu from '../../option-menu'
import { useState } from 'react'

const CardStatsVertical = (props: CardStatsVerticalProps) => {
  // ** Props
  const { title, color, icon, stats, chipText, trendNumber, trend = 'positive', handleDaysPanelClick } = props

  return (
    <Card>

      <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 6, width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <CustomAvatar skin='light' variant='rounded' color={color}>
            {icon}
          </CustomAvatar>
          <CardHeader
            title={title}
            action={
              <OptionsMenu
                options={[{ text: 'Hoje', onClick: () => handleDaysPanelClick ? handleDaysPanelClick(0) : {}},
                { text: 'Última Semana', onClick: () => handleDaysPanelClick ? handleDaysPanelClick(7) : {}},
                { text: 'Últimos 20 Dias', onClick: () => handleDaysPanelClick ? handleDaysPanelClick(20) : {}  },
                { text: 'Último Mês', onClick: () => handleDaysPanelClick ? handleDaysPanelClick(30) : {}  },
                { text: 'Último Ano', onClick: () => handleDaysPanelClick ? handleDaysPanelClick(365) : {}  },]}
                iconButtonProps={{ size: 'small', className: 'card-more-options' }}
              />
            } />

        </Box>
        <Typography variant='h6' sx={{ mb: 1 }}>
          {stats}
        </Typography>
        <CustomChip
          skin='light'
          size='small'
          label={chipText}
          color='secondary'
          sx={{ height: 20, fontWeight: 500, fontSize: '0.75rem', alignSelf: 'flex-start', color: 'text.secondary' }}
        />
      </CardContent>
    </Card>
  )
}

export default CardStatsVertical
