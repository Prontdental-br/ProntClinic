// MUI Imports
import Grid from '@mui/material/Grid'

// Types Imports

import HorizontalWithBorder from 'src/@core/layouts/components/card-statistics/HorizontalWithBorder'
import { CardStatsHorizontalWithBorderProps } from 'src/types/apps/widgetTypes'

// Components Imports


const LogisticsStatisticsCard = ({ data }: { data?: CardStatsHorizontalWithBorderProps[] }) => {
  return (
    data && (
      <Grid container spacing={6}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <HorizontalWithBorder {...item} />
          </Grid>
        ))}
      </Grid>
    )
  )
}

export default LogisticsStatisticsCard
