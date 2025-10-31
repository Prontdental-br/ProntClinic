/* eslint-disable prefer-const */
import { Button, Card, Grid } from '@mui/material'
import React, { useState } from 'react'
import CardHelpCenter from '../help-center/cardHelpCenter';

import initialVideos from '../help-center/mocks/videosProntChat.json';
import { CardVideoProps } from '../help-center';

function Marketing() {
  const goToProntChat = () => {
    window.open('https://app.prontchat.com.br/login', '_blank')?.focus();
  }

  const [infoVideos, setInfoVideos] = useState<CardVideoProps[]>(initialVideos)


  return (
    <Card sx={{ padding: '24px', height: '100%' }}>
      <Grid width={'fit-content'} display={'flex'} flexDirection={'column'} position={'relative'}>
        <Grid position={'absolute'} right={'0'} color={'white'} sx={{ backgroundColor: '#787EFF' }}  border={'1px solid transparent'} borderRadius={'12px'} padding={'6px 12px'}>
          <span>Premium</span>
        </Grid>
        <img src="/images/logos/pront-chat-alt.png" style={{ height: '15em' }} alt="Logo Pront Chat" />
        <Button variant='outlined' onClick={goToProntChat}>Entrar</Button>
      </Grid>


      <Grid container spacing={6} className='match-height' style={{ marginTop: '1.5em' }}>
      {infoVideos.map(videos => (
        <Grid key={videos.id} item md={4} sm={6} xs={12}>
          <CardHelpCenter data={videos} />
        </Grid>
      ))}
    </Grid>
    </Card>
  )
}

export default Marketing