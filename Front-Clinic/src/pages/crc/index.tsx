import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { BirthdayPeople } from 'src/views/components/CRC/BirthdayPeople'
import { Schedules } from 'src/views/components/CRC/Schedules'
import { Budgets } from 'src/views/components/CRC/Budgets'
import { Deselections } from 'src/views/components/CRC/Deselections'
import { NonPayment } from 'src/views/components/CRC/NonPayment'
import { Fouls } from 'src/views/components/CRC/Fouls'
import api from 'src/@core/components/api-client'
import { useRouter } from 'next/router'
import { Returns } from 'src/views/components/CRC/Returns'

type SectionType =
  | 'aniversariantes'
  | 'agendamentos'
  | 'orcamentos'
  | 'faltas'
  | 'desmarcacoes'
  | 'inadimplencia'
  | null

function CRCPage() {
  const [activeSection, setActiveSection] = useState<SectionType>(null)
  const [periodo, setPeriodo] = useState<
    'day' | 'week' | 'month' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
  >('day')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const router = useRouter()

  const sections = [
    { key: 'aniversariantes', label: 'Aniversariantes', path: '/images/crc/1.png', component: <BirthdayPeople /> },
    { key: 'agendamentos', label: 'Agendamentos', path: '/images/crc/5.png', component: <Schedules /> },
    { key: 'orcamentos', label: 'Orçamentos em Aberto', path: '/images/crc/6.png', component: <Budgets /> },
    { key: 'faltas', label: 'Faltas', path: '/images/crc/3.png', component: <Fouls /> },
    { key: 'desmarcacoes', label: 'Desmarcações', path: '/images/crc/2.png', component: <Deselections /> },
    { key: 'inadimplencia', label: 'Inadimplência', path: '/images/crc/4.png', component: <NonPayment /> },
    { key: 'retornos', label: 'Retornos', path: '/images/crc/7.png', component: <Returns periodo={periodo} /> }
  ]

  useEffect(() => {
    if (router.query.section) {
      const sectionKey = router.query.section as SectionType
      if (sections.find(s => s.key === sectionKey)) {
        setActiveSection(sectionKey)
      }
    }
    if (router.query.periodo) {
      setPeriodo(router.query.periodo as typeof periodo)
    }
  }, [router.query.section, router.query.periodo])

  const fetchCounts = async () => {
    try {
      const { data } = await api.get('/crc/count')

      setCounts(data)
    } catch (error) {
      console.error('Erro ao buscar contagem CRC:', error)
    }
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  const renderContent = () => {
    if (!activeSection) return null

    return (
      <Box mt={4}>
        <Button
          onClick={() => {
            setActiveSection(null)
            router.push('/crc', undefined, { shallow: true }) // clean url
          }}
          variant='outlined'
        >
          ← Voltar
        </Button>

        <Box mt={5} sx={{ height: '72vh' }}>
          {sections.find(s => s.key === activeSection)?.component}
        </Box>
      </Box>
    )
  }

  return (
    <Box p={4}>
      <Typography variant='h4' gutterBottom>
        Central de Relacionamento ao Cliente
      </Typography>

      {!activeSection ? (
        <Grid container spacing={12}>
          {sections.map(section => (
            <Grid item xs={12} sm={6} md={4} key={section.key}>
              <Card elevation={3}>
                <CardContent>
                  <Box display='flex' justifyContent='center' mb={1}>
                    <img src={section.path} alt='imagem icone cards' width={45} />
                  </Box>
                  <Typography variant='h6' align='center'>
                    {section.label}
                  </Typography>
                  <Typography align='center' color='text.secondary' mt={1}>
                    Total de {section.label}: {counts[section.key] ?? '...'}
                  </Typography>
                  <Box display='flex' justifyContent='center' mt={2}>
                    <Button variant='contained' onClick={() => setActiveSection(section.key as SectionType)}>
                      Entrar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        renderContent()
      )}
    </Box>
  )
}

CRCPage.aclAbilities = { action: 'read', subject: 'crc' }

CRCPage.requiredRole = 'admin'

CRCPage.requiredPlan = 'P'
export default CRCPage
