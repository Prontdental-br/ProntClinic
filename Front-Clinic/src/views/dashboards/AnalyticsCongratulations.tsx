// ** React Imports
import { ReactElement, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import YouTubeIcon from '@mui/icons-material/YouTube';

// import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import OptionsMenu from 'src/@core/components/option-menu'
import ModalWithGrid from 'src/views/components/modalBugetOpen'

// ** API
import api from '../../@core/components/api-client'
import { Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select } from '@mui/material'
import YouTube from 'react-youtube'

interface SaleDataType {
  stats: string
  title: string
  color: ThemeColor
  icon: ReactElement
}

interface Props {
  reportsTypes: string[]
  changeSelectedReportType: (value: string) => void
  selectedReportType: string
  generateReport: () => void
}

const AnalyticsCongratulations = ({ reportsTypes, changeSelectedReportType, selectedReportType, generateReport }: Props) => {
  // ** Hook
  // const theme = useTheme()
  const [filterDaysPanel, setFilterDaysPanel] = useState<number>()
  const [openModal, setOpenModal] = useState(false)
  const [openModalVideo, setOpenModalVideo] = useState(false)
  const [overdueDebt, setOverdueDebt] = useState<SaleDataType>({
    stats: 'R$ 0.00',
    color: 'error',
    title: 'Debitos em atraso',
    icon: <Icon icon='mdi:currency-usd' />
  })
  const [openBudget, setOpenBudget] = useState<SaleDataType>({
    stats: 'R$ 0.00',
    color: 'info',
    title: 'Orçamentos em aberto',
    icon: <Icon icon='mdi:list-box-outline' />
  })

    const toggleVideo = () => {
    setOpenModalVideo(true);
  };

  const handleClose = () => {
    setOpenModalVideo(false);
  };

  useEffect(() => {
    api
      .get('/transactions/search/overdue/' + filterDaysPanel)
      .then(response => {
        if (response.data && response.data.length && response.data[0].total) {
          setOverdueDebt({
            stats: 'R$ ' + response.data[0].total,
            color: 'error',
            title: 'Debitos em atraso',
            icon: <Icon icon='mdi:currency-usd' />
          })
        } else {
          setOverdueDebt({
            stats: 'R$ 0.00',
            color: 'error',
            title: 'Debitos em atraso',
            icon: <Icon icon='mdi:currency-usd' />
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }, [filterDaysPanel])

  useEffect(() => {
    console.log(filterDaysPanel)
    api
      .get('/budgets/totalallopen/' + filterDaysPanel)
      .then(response => {
        console.log('response.data',response.data);
        if (response.data) {
          setOpenBudget({
            stats: 'R$ ' + ((response.data.total - (response.data.discount || 0)) || 0),
            color: 'info',
            title: 'Orçamentos em aberto',
            icon: <Icon icon='mdi:list-box-outline' />
          })
        } else {
          setOpenBudget({
            stats: 'R$ 0.00',
            color: 'info',
            title: 'Orçamentos em aberto',
            icon: <Icon icon='mdi:list-box-outline' />
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }, [filterDaysPanel])

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleDaysPanelClick = (days: number) => {
    setFilterDaysPanel(days)
  }

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
  };

  return (
    <>
      <ModalWithGrid open={openModal} onClose={handleCloseModal} />

      <Card sx={{ position: 'relative' }}>
        <CardHeader
          sx={{ pb: 1.0 }}
          title='Painel Geral Financeiro'
          titleTypographyProps={{ variant: 'h6' }}

          // action={
          //   <OptionsMenu
          //     options={[
          //       {
          //         text: 'Últimos 20 Dias',
          //         menuItemProps: {
          //           onClick: () => {
          //             handleDaysPanelClick(20)
          //           }
          //         }
          //       },
          //       {
          //         text: 'Últimos 30 dias',
          //         menuItemProps: {
          //           onClick: () => {
          //             handleDaysPanelClick(30)
          //           }
          //         }
          //       },
          //       {
          //         text: 'Último Ano',
          //         menuItemProps: {
          //           onClick: () => {
          //             handleDaysPanelClick(365)
          //           }
          //         }
          //       }
          //     ]}
          //     iconButtonProps={{ size: 'small', className: 'card-more-options' }}
          //   />
          // }
          subheader={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                '& svg': { color: 'success.main' }
              }}
            >
              <Typography variant='caption' sx={{ mr: 1.5 }}>
                Total 1.5k orçamentos
              </Typography>
              <Typography variant='subtitle2' sx={{ color: 'success.main' }}>
                +18%
              </Typography>
              <Icon icon='mdi:chevron-up' fontSize={20} />
            </Box>
          }
        />

         <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Button
            sx={{ display: 'flex', alignItems: 'center' }}
            onClick={() => toggleVideo()}
           
          >
            <YouTubeIcon color='error' />
            VÍDEOS
          </Button>
        </Box>

       <CardContent sx={{ p: theme => `${theme.spacing(2.75, 7.5)} !important` }}>
    <Grid container spacing={12}>
    {/* Orçamentos em Aberto */}
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <CustomAvatar skin='light' variant='rounded' color={openBudget.color} sx={{ mr: 4 }}>
          {openBudget.icon}
        </CustomAvatar>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            {openBudget.stats}
          </Typography>
          <Typography variant='subtitle2'>{openBudget.title}</Typography>
          <Typography>
            <Button size='medium' variant='contained' color='primary' onClick={handleOpenModal}>
              Ver
            </Button>
          </Typography>
        </Box>
      </Box>
    </Grid>

    {/* Resumo Diário - Alinhado à Direita */}
    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Box sx={{ width: 260, display: 'flex', flexDirection: 'column' }}>
        <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
          Selecione seu Resumo
        </Typography>
        <Select
          sx={{ height: 36, mb: 1 }}
          value={selectedReportType}
          onChange={(event) => changeSelectedReportType(event.target.value)}
          fullWidth
        >
          {reportsTypes.map(element => (
            <MenuItem key={element} value={element}>
              {element}
            </MenuItem>
          ))}
        </Select>
        <Typography variant='subtitle2' sx={{ mb: 2 }}>
          Acesse seu resumo e saiba como foi seu dia em números
        </Typography>
        <Button
          size='small'
          variant='contained'
          color='primary'
          onClick={generateReport}
          sx={{ width: '100%', height: 36 }}
        >
          Acessar
        </Button>
      </Box>
    </Grid>
  </Grid>
</CardContent>
      </Card>

        <Dialog open={openModalVideo} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Assistir Vídeo</DialogTitle>
        <DialogContent>
          <YouTube videoId={'hMeQ8uX3Z3U'} opts={opts} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AnalyticsCongratulations
