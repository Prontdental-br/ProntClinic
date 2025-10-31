// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Types Imports
import { Button } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export type CardBudgetVerticalProps = {
  title: string
  imgSrc: string
  src?: string
  descriptionButton?: boolean
  // eslint-disable-next-line @typescript-eslint/ban-types
  onClick?: Function
}

const CardExamVertical = (props: CardBudgetVerticalProps) => {
  // ** Props
  const { title, imgSrc, src, onClick, descriptionButton = true } = props
  const router = useRouter()

  return (
    <Card>
      <CardContent
        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          {descriptionButton && (
            <Typography variant='body1' sx={{ mb: 1, fontWeight: 'bolder' }}>
              ORÇAMENTO
            </Typography>
          )}
        </Box>

          <img src={imgSrc} style={{width: '25%', height: '25%'}} alt='logo' />

          <br />

        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            if(onClick)
              onClick()
          }}
          sx={{
            maxWidth: {
              xs: '35vw',
              sm: '20vw',
              md: '13vw',
              lg: '12vw',
              xl: '19vw'
            }
          }}
        >
          {title}
        </Button>
      </CardContent>
    </Card>
  )
}

export default CardExamVertical
