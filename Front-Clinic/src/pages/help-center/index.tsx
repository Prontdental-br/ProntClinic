import { useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Third Party Components
import CardHelpCenter from './cardHelpCenter'

import initialVideos from './mocks/videos.json'

// ** Demo Components Imports

export interface CardVideoProps {
  id: number
  title: string
  subtitle: string
  idVideo: string
  titleModalVideo: string
  subTitleModalVideo: string
}

const HelpCenter = (data: CardVideoProps) => {
  const [infoVideos, setInfoVideos] = useState<CardVideoProps[]>(initialVideos)

  return (
    <Grid container spacing={6} className='match-height'>
      {infoVideos.map(videos => (
        <Grid key={videos.id} item md={4} sm={6} xs={12}>
          <CardHelpCenter data={videos} />
        </Grid>
      ))}
    </Grid>
  )
}

export default HelpCenter
