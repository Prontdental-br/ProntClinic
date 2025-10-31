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
  src: string
  descriptionButton?: boolean
}

const CardBudgetVertical = (props: CardBudgetVerticalProps) => {
  // ** Props
  const { title, imgSrc, src, descriptionButton = true } = props
  const router = useRouter()

  const onSubmit = (path: string) => {
    router.push(path)
  }

  return (
    <Card>
      <CardContent
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}
      >
        <Box>
          {descriptionButton && (
            <Typography variant='body1' sx={{ mb: 1, fontWeight: 'bolder' }}>
              ORÇAMENTO
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            mb: 1
          }}
        >
          {/* <img src={imgSrc} height={86} width={61} alt='logo' /> */}
        </Box>

        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            onSubmit(src)
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

export default CardBudgetVertical
