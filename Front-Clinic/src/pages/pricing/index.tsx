'use client'

// ** React Imports
import { useState, ChangeEvent, useEffect, useMemo } from 'react'

// ** Next Imports
import { GetStaticProps, InferGetStaticPropsType } from 'next/types'

// ** MUI Imports
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import MuiCardContent, { CardContentProps } from '@mui/material/CardContent'

// ** Third Party Imports
import axios from 'axios'

// ** Types
import { PricingDataType } from 'src/@core/components/plan-details/types'

// ** Demo Imports
import PricingPlans from 'src/views/pages/pricing/PricingPlans'
import PricingHeader from 'src/views/pages/pricing/PricingHeader'
import { Title } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import api from 'src/@core/components/api-client'

// ** Styled Components
const CardContent = styled(MuiCardContent)<CardContentProps>(({ theme }) => ({
  padding: `${theme.spacing(20, 36)} !important`,
  [theme.breakpoints.down('xl')]: {
    padding: `${theme.spacing(20)} !important`
  },
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.spacing(10, 5)} !important`
  }
}))

const Pricing = ({ apiData, apiDataPartners }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [plan, setPlan] = useState<'monthly' | 'annually'>('monthly')
  const [accountPlanType, setAccountPlanType] = useState<'E' | 'P' | null>(null)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { data } = await api.get('/accounts/me')
        setAccountPlanType(data.planType)
      } catch (error) {
        console.error('Erro ao buscar conta:', error)
      }
    }

    fetchAccount()
  }, [])

  const planosComMarcacao = useMemo(() => {
    if (!apiData?.pricingPlans) return []

    const planos = apiData.pricingPlans.slice(1, 4)

    return planos.map((p: any, index: number) => {
      const isCurrent = (accountPlanType === 'E' && index === 0) || (accountPlanType === 'P' && index === 1)

      return {
        ...p,
        popularPlan: isCurrent,
        active: isCurrent ? false : true
      }
    })
  }, [apiData, accountPlanType])

  return (
    <Card>
      <CardContent>
        <Typography variant='h4' sx={{ color: 'primary.main', textAlign: 'center', pb: '2rem' }}>
          Preços e Planos
        </Typography>

        <Typography variant='body2' sx={{ textAlign: 'center', pb: '1rem', width: '70%', margin: 'auto' }}>
          Todos os planos incluem ferramentas e recursos avançados para impulsionar sua clínica. Escolha o melhor plano
          para atender às suas necessidades
        </Typography>

        <Box sx={{ mb: '3rem' }} />

        <PricingPlans plan={plan} data={planosComMarcacao} />
      </CardContent>
    </Card>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await axios.get('/pages/pricing')
  const resPartners = await axios.get('/pages/partners')

  const apiData: PricingDataType = res.data
  const apiDataPartners: PricingDataType = resPartners.data

  return {
    props: {
      apiData,
      apiDataPartners
    }
  }
}

export default Pricing
