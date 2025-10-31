// ** React Imports
import { ReactElement, useState, useEffect, SyntheticEvent } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import { styled, Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'
import CircularProgress from '@mui/material/CircularProgress'
import YouTubeIcon from '@mui/icons-material/YouTube';

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { PricingPlanType } from 'src/@core/components/plan-details/types'

// ** Demo Tabs Imports
import TabAccount from 'src/views/pages/account-settings/TabAccount'
import TabBilling from 'src/views/pages/account-settings/TabBilling'
import TabSecurity from 'src/views/pages/account-settings/TabSecurity'
import TabConnections from 'src/views/pages/account-settings/TabConnections'
import TabNotifications from 'src/views/pages/account-settings/TabNotifications'
import TabImportPatients from 'src/views/pages/account-settings/TabImportPatients'
import { ChatConversation } from './ChatConversation'
import { ChatOportunity } from './ChatOportunity'
import ChatConnectWhatsApp from './ChatConnectWhatsApp'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import YouTube from 'react-youtube'

// import TabCreateAgent from './TabCreateAgent'
// import TabYourBusiness from './TabYourBusiness'


const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 38,
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: {
      minWidth: 130
    }
  }
}))

const Chat = ({ tab }: { tab: string;  }) => {
  // ** State
  const [activeTab, setActiveTab] = useState<string>(tab)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState(false);

  // ** Hooks
  const router = useRouter()
  const hideText = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');

  const handleChange = (event: SyntheticEvent, value: string) => {
    setIsLoading(true)
    router.push(`/chat/${value.toLowerCase()}`).then(() => setIsLoading(false))
  }

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  
  
     const toggleVideo = () => {
      setOpenModal(true); 
    };
  
    const handleClose = () => {
      setOpenModal(false); 
    };
  
     const opts = {
      height: '390',
      width: '100%', 
      playerVars: {
        autoplay: 1,
      },
    };

  const tabContentList: { [key: string]: ReactElement } = {
    conversation: <ChatConversation />,
    oportunity: <ChatOportunity />,
    'connect-whatsapp': <ChatConnectWhatsApp />,
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TabContext value={activeTab}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
  <TabList
    variant='scrollable'
    scrollButtons='auto'
    onChange={handleChange}
    aria-label='customized tabs example'
  >
    <Tab
      value='conversation'
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
          <Icon icon='mdi:face-agent' />
          {!hideText && 'Conversas'}
        </Box>
      }
    />
    <Tab
      value='oportunity'
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
          <Icon icon='mdi:handshake-outline' />
          {!hideText && 'Oportunidades'}
        </Box>
      }
    />
    {userData?.planType !== 'S' && (
      <Tab
        value='connect-whatsapp'
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
            <Icon icon='mdi:whatsapp' />
            {!hideText && 'Conectar WhatsApp'}
          </Box>
        }
      />
    )}
  </TabList>

      {/* Botão do YouTube */}
        <Button sx={{ mb: 2, display: 'flex', alignItems: 'center' }} onClick={() => toggleVideo()}>
          <YouTubeIcon color='error' />
          VÍDEOS
        </Button>
    </Box>

            </Grid>
            <Grid item xs={12}>
              {isLoading ? (
                <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <CircularProgress sx={{ mb: 4 }} />
                  <Typography>Loading...</Typography>
                </Box>
              ) : (
                <TabPanel sx={{ p: 0 }} value={activeTab}>
                  {tabContentList[activeTab]}
                </TabPanel>
              )}
            </Grid>
          </Grid>
        </TabContext>

        
      </Grid>

      <Dialog open={openModal} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Assistir Vídeo</DialogTitle>
        <DialogContent>
          <YouTube opts={opts} videoId={'iGDgcWpl9qw'} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default Chat